import fs from 'fs';
import path from 'path';
import { getMongoClient } from './config/config.js';
import { inferMongoType } from './utils/dateUtils.js';
import { sendWebhook, logInfo, logError } from './utils/logging.js';

const EXPECTED_PATH = path.resolve(process.cwd(), 'expectedSchema.json');

export async function schemaMonitor() {
  try {
    logInfo('Checking Mongo.calls schema drift');
    const client = getMongoClient(); await client.connect();
    const doc = await client.db(process.env.MONGO_DB).collection('calls').findOne({});
    await client.close();
    if (!doc) return;

    const current = Object.fromEntries(Object.entries(doc).map(([k, v]) => [k, inferMongoType(v)]));
    let expected = {};
    if (!fs.existsSync(EXPECTED_PATH)) {
      fs.writeFileSync(EXPECTED_PATH, JSON.stringify(current, null, 2));
      logInfo('Initialized expectedSchema.json');
      await sendWebhook({ text: '📄 Created expectedSchema.json for schema monitoring.' });
      return;
    }
    expected = JSON.parse(fs.readFileSync(EXPECTED_PATH, 'utf-8'));
    const added = Object.keys(current).filter(k => !(k in expected));
    const removed = Object.keys(expected).filter(k => !(k in current));
    const changed = Object.keys(current).filter(k => expected[k] && expected[k] !== current[k]);

    if (added.length || removed.length || changed.length) {
      logInfo('Schema changes detected');
      const lines = ['⚠️ Mongo.calls schema drift:'];
      if (added.length) lines.push(`➕ Added: ${added.join(', ')}`);
      if (removed.length) lines.push(`➖ Removed: ${removed.join(', ')}`);
      if (changed.length) lines.push(`♻️ Changed: ${changed.map(k => `${k}(${expected[k]}→${current[k]})`).join(', ')}`);
      lines.push('⛔ Ignore until expectedSchema.json is updated.');
      const msg = lines.join('\n');
      await sendWebhook({ text: msg });
      logInfo(msg);
    } else {
      logInfo('No schema changes');
    }
  } catch (err) {
    logError('schemaMonitor error', err);
  }
}