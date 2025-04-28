import { sendWebhook as slackWebhook } from './webhook.js';
export function logInfo(msg){ console.log(msg); }
export function logError(msg, err){ console.error(msg, err); slackWebhook({ text: `❌ ${msg}: ${err.message||err}` }); }
export { slackWebhook as sendWebhook };