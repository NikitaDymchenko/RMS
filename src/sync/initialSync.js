import { getMongoClient } from '../config/config.js';
import { loadCallStatus } from '../loader/statusLoader.js';
import { queue } from '../queue/queue.js';
import { logInfo, logError } from '../utils/logging.js';

export async function initialSync() {
  logInfo('📦 Initial sync start');
  const client = getMongoClient();
  await client.connect();
  logInfo('Connected to MongoDB for initial sync');

  const coll = client.db(process.env.MONGO_DB).collection('calls');
  const calls = await coll.find({}).toArray();
  logInfo(`🔄 Found ${calls.length} calls for initial sync`);

  for (const doc of calls) {
    try {
      logInfo(`Replicating status for call ${doc._id}`);
      await loadCallStatus(doc);
      if (!doc.active) {
        logInfo(`Call ${doc._id} is inactive, enqueueing for metrics`);
        queue.enqueue({ callId: doc._id.toString() });
      }
    } catch (err) {
      logError(`Error in initialSync for ${doc._id}`, err);
    }
  }

  await client.close();
  logInfo('✅ Initial sync done');
}