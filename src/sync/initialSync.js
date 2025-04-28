// src/sync/initialSync.js
import { clickhouseReplicaClient, getMongoClient } from '../config/config.js';
import { loadCallStatus } from '../loader/statusLoader.js';
import { queue } from '../queue/queue.js';
import { logInfo, logError } from '../utils/logging.js';
import { ObjectId } from 'mongodb';

export async function initialSync() {
  logInfo('📦 Initial sync start');

  // 1) Определяем точку последней обработки
  let since = new Date(0);
  try {
    const res = await clickhouseReplicaClient.query({
      query: `SELECT max(startedAt) AS last FROM Mongo.calls`,
      format: 'JSON'
    });
    const json = await res.json();
    const last = json.data[0]?.last;
    if (last) since = new Date(last);
  } catch (err) {
    logError('Fetch last startedAt', err);
  }
  logInfo(`🔍 Sync since ${since.toISOString()}`);

  // 2) Загрузить новые звонки
  const mongo = getMongoClient();
  await mongo.connect();
  const coll = mongo.db(process.env.MONGO_DB).collection('calls');

  const newCalls = await coll.find({ startedAt: { $gt: since } }).toArray();
  logInfo(`🔄 Found ${newCalls.length} new calls since last sync`);
  for (const doc of newCalls) {
    try {
      await loadCallStatus(doc);
      if (!doc.active) queue.enqueue({ callId: doc._id.toString() });
    } catch (err) {
      logError(`Error syncing new call ${doc._id}`, err);
    }
  }

  // 3) Отловить упущенные завершения
  let activeIds = [];
  try {
    const r2 = await clickhouseReplicaClient.query({
      query: `SELECT _id FROM Mongo.calls WHERE active=1`,
      format: 'JSON'
    });
    const j2 = await r2.json();
    activeIds = j2.data.map(r => r._id);
  } catch (err) {
    logError('Fetch active callIds', err);
  }

  if (activeIds.length) {
    const finished = await coll
      .find({
        _id: { $in: activeIds.map(id => new ObjectId(id)) },
        active: false
      })
      .toArray();
    logInfo(`⏱ Detected ${finished.length} calls completed while down`);
    for (const doc of finished) {
      try {
        await loadCallStatus(doc);
        queue.enqueue({ callId: doc._id.toString() });
      } catch (err) {
        logError(`Error syncing missed call ${doc._id}`, err);
      }
    }
  }

  await mongo.close();
  logInfo('✅ Initial sync done');
}
