import { getMongoClient } from '../config/config.js';
import { queue } from '../queue/queue.js';
import { loadCallStatus } from '../loader/statusLoader.js';
import { loadResumeToken, saveResumeToken } from '../utils/resumeToken.js';
import { logInfo, logError } from '../utils/logging.js';

export async function startChangeListener() {
  logInfo('Connecting to MongoDB for ChangeStream...');
  const client = getMongoClient(); await client.connect();
  const coll = client.db(process.env.MONGO_DB).collection('calls');

  const resumeToken = loadResumeToken();
  const watchOptions = { fullDocument: 'updateLookup', ...(resumeToken && { resumeAfter: resumeToken }) };
  logInfo(`Starting ChangeStream ${resumeToken ? 'with resume token' : 'from now'}`);
  const changeStream = coll.watch([], watchOptions);

  changeStream.on('change', async change => {
    logInfo(`ChangeStream event for doc ${change.documentKey._id}`);
    try {
      const doc = change.fullDocument;
      await loadCallStatus(doc);
      logInfo(`Status replicated for call ${doc._id}`);
      if (!doc.active) {
        logInfo(`Call ${doc._id} completed, enqueueing metrics`);
        queue.enqueue({ callId: doc._id.toString() });
      }
      saveResumeToken(change._id);
      logInfo('Saved resume token');
    } catch (err) {
      logError('ChangeStream processing error', err);
    }
  });

  changeStream.on('error', err => {
    logError('ChangeStream error', err);
    process.exit(1);
  });
}
