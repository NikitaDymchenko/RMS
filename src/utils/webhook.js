// src/utils/webhook.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const url = process.env.WEBHOOK_URL;
export async function sendWebhook(msg) {
  if (!url) return;
  try { await axios.post(url, msg); console.log('Webhook sent'); }
  catch(err){ console.error('Webhook error', err); }
}