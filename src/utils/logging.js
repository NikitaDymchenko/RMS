import { sendWebhook as slackWebhook } from './webhook.js';
import { VERBOSE } from '../config/config.js';

export function logInfo(msg) {
  console.log(`[INFO] ${msg}`);
}

export function logError(msg, err) {
  console.error(`[ERROR] ${msg}`, err);
  slackWebhook({ text: `❌ ${msg}: ${err.message || err}` });
}

// Новый debug-логгер, пишет только если VERBOSE=true
export function logDebug(msg) {
  if (VERBOSE) console.debug(`[DEBUG] ${msg}`);
}

export { slackWebhook as sendWebhook };
