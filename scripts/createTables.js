#!/usr/bin/env node
import 'dotenv/config';
import { createTables } from '../src/loader/tableCreator.js';
import { logInfo, logError } from '../src/utils/logging.js';

;(async () => {
  logInfo('🚀 [script] Start creating replica tables…');
  try {
    await createTables();
    logInfo('🎉 [script] All tables created successfully.');
    process.exit(0);
  } catch (err) {
    logError('⛔ [script] Failed to create tables', err);
    process.exit(1);
  }
})();
