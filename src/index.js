import 'dotenv/config';
import { sendWebhook, logInfo } from './utils/logging.js';
import { createTables } from './loader/tableCreator.js';
import { initialSync } from './sync/initialSync.js';
import { schemaMonitor } from './schemaMonitor.js';
import { startChangeListener } from './listener/mongoChangeStream.js';
import { startWorker } from './worker/worker.js';

(async () => {
  logInfo('Service starting...');
  sendWebhook({ text: 'Service starting' });

  // 0) Ensure all replica tables exist
  logInfo('Creating replica tables...');
  await createTables();
  logInfo('Replica tables ensured');
  sendWebhook({ text: 'Replica tables ensured' });

  // 1) Full initial sync of call statuses
  logInfo('Running initial sync of call statuses...');
  await initialSync();
  logInfo('Initial sync completed');

  // 2) Schema change monitoring (optional)
  logInfo('Checking schema drift...');
  await schemaMonitor();
  logInfo('Schema monitor completed');

  // 3) Start real-time ingestion
  logInfo('Starting ChangeStream listener...');
  startChangeListener();
  logInfo('ChangeStream listener started');

  logInfo('Starting worker for metrics ingestion...');
  startWorker();
  logInfo('Worker started');
})();