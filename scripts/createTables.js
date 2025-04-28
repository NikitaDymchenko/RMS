import 'dotenv/config';                      // подгрузка .env
import { createTables } from '../src/loader/tableCreator.js';
import { logInfo, logError } from '../src/utils/logging.js';

;(async () => {
  try {
    logInfo('🚀 Start creating replica tables…');
    await createTables();
    logInfo('🎉 All tables created successfully.');
    process.exit(0);
  } catch (err) {
    logError('⛔ Failed to create tables', err);
    process.exit(1);
  }
})();