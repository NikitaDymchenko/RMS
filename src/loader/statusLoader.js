import { clickhouseReplicaClient } from '../config/config.js';
import { formatDateTimeForClickHouse } from '../utils/dateUtils.js';
import { logInfo, logError } from '../utils/logging.js';

export async function loadCallStatus(doc) {
  const row = {
    _id: doc._id.toString(),
    participantCount: doc.participantsCount ?? 0,
    totalParticipantCount: String(doc.totalParticipantsCount ?? ''),
    roomId: doc.roomId || '',
    active: doc.active ? 1 : 0,
    startedAt: formatDateTimeForClickHouse(doc.startedAt),
    finishedAt: formatDateTimeForClickHouse(doc.finishedAt),
    isBreakOutRoom: doc.isBreakoutRoom ? 1 : 0,
    planAlias: doc.planAlias || '',
    roomType: doc.roomType || ''
  };
  logInfo(`Inserting status row for call ${row._id}`);
  try {
    await clickhouseReplicaClient.insert({ table: 'Mongo.calls', values: [row], format: 'JSONEachRow' });
    logInfo(`✅ Status row inserted for call ${row._id}`);
  } catch (err) {
    logError(`Failed to insert status for call ${row._id}`, err);
    throw err;
  }
}