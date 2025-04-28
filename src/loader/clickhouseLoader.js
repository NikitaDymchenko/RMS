import { createClient } from '@clickhouse/client';
import { tablesConfig } from '../config/tables.js';
import { clickhouseReplicaClient } from '../config/config.js';
import { logInfo, logError } from '../utils/logging.js';
import dotenv from 'dotenv';

dotenv.config();
function buildUrl(host, secure) { return `${secure?'https':'http'}://${host}`; }

export async function loadCallData(callIds) {
  logInfo(`Loading metrics for calls [${callIds.join(', ')}]`);
  for (const tbl of tablesConfig.filter(t => t.name !== 'calls')) {
    const prodClient = createClient({ url: buildUrl(tbl.sourceDatabase, process.env.REPLICA_CH_SECURE === 'true'), username: process.env.REPLICA_CH_USER, password: process.env.REPLICA_CH_PASSWORD });
    const src = `${tbl.sourceSchema}.${tbl.sourceTable}`;
    const tgt = `${tbl.targetSchema}.${tbl.prefix}_${tbl.sourceTable}`;
    const query = `SELECT * FROM ${src} WHERE callId IN (${callIds.map(id => `'${id}'`).join(',')})`;
    logInfo(`Executing query on prod: ${query}`);
    try {
      const res = await prodClient.query({ query, format: 'JSONEachRow' });
      const rows = await res.json();
      logInfo(`Fetched ${rows.length} rows from ${src}`);
      if (rows.length) {
        logInfo(`Inserting into replica table ${tgt}`);
        await clickhouseReplicaClient.insert({ table: tgt, values: rows, format: 'JSONEachRow' });
        logInfo(`✅ Inserted ${rows.length} rows into ${tgt}`);
      }
    } catch (err) {
      logError(`Error replicating table ${tbl.sourceTable}`, err);
    } finally {
      await prodClient.close();
    }
  }
}