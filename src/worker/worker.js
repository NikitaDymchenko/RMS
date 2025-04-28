import { queue } from '../queue/queue.js';
import { loadCallData } from '../loader/clickhouseLoader.js';
import { logInfo, logError } from '../utils/logging.js';

const BATCH_SIZE = +process.env.BATCH_SIZE || 50;
const BATCH_INTERVAL_MS = +process.env.BATCH_INTERVAL_MS || 5000;

export async function startWorker() {
  logInfo('Worker starting...');
  let buffer = [];
  let timer = null;

  async function flush() {
    const batch = [...new Set(buffer)];
    buffer = [];
    logInfo(`Flushing batch of ${batch.length} callIds`);
    try {
      await loadCallData(batch);
      logInfo(`✅ Batch processed: ${batch.length} callIds`);
    } catch (err) {
      logError('Worker flush error', err);
    }
  }

  queue.process(async ({ callId }) => {
    logInfo(`Queue received callId ${callId}`);
    buffer.push(callId);
    if (buffer.length >= BATCH_SIZE) {
      clearTimeout(timer);
      await flush();
    } else if (!timer) {
      timer = setTimeout(async () => { await flush(); timer = null; }, BATCH_INTERVAL_MS);
    }
  });
  logInfo('Worker listening to queue');
}