// src/loader/tableCreator.js
import { clickhouseReplicaClient, getMongoClient } from '../config/config.js';
import { createClient } from '@clickhouse/client';
import { tablesConfig } from '../config/tables.js';
import { logInfo, logError, logDebug } from '../utils/logging.js';
import { inferMongoType } from '../utils/dateUtils.js';  // <-- импортиим

/**
 * Создаёт ClickHouse-клиент к исходной базе
 */
function getSourceClient(host, secure, user, pass) {
  const protocol = secure === 'true' ? 'https' : 'http';
  const url = `${protocol}://${host}`;
  logDebug(`[tableCreator] Connect to source CH: ${url} as ${user}`);
  return createClient({ url, username: user, password: pass });
}

export async function createTables() {
  logInfo('— createTables() start');

  for (const tbl of tablesConfig) {
    logDebug(`Config '${tbl.name}': enabled=${tbl.enabled}, source=${tbl.source}`);
    if (!tbl.enabled) {
      logInfo(`🛑 Skipping '${tbl.name}' (disabled)`);
      continue;
    }

    let ddl;

    // 1) Mongo-DDL: автоматическая генерация по sample-документу
    if (tbl.source === 'mongo') {
      logInfo(`🔧 Generating DDL for Mongo collection '${tbl.sourceTable}'`);
      const mongo = getMongoClient();
      await mongo.connect();
      const sample = await mongo
        .db(process.env.MONGO_DB)
        .collection(tbl.sourceTable)
        .findOne({});
      await mongo.close();

      // Инференс типа каждого поля
      const cols = Object.entries(sample)
        .map(([k, v]) => `  ${k} ${inferMongoType(v)}`)
        .join(',\n');

      ddl = (
        `CREATE TABLE IF NOT EXISTS ${tbl.targetSchema}.${tbl.sourceTable} (\n` +
        cols +
        `\n) ENGINE = MergeTree\nORDER BY (_id)`
      );
    }

    // 2) ClickHouse-DDL: либо авто-ген, либо статичное
    else {
      logInfo(`🔧 Generating DDL for ClickHouse table '${tbl.sourceTable}'`);
      if (tbl.autoGenerateDDL) {
        const src = getSourceClient(
          tbl.sourceDatabase,
          process.env.REPLICA_CH_SECURE,
          process.env.LIVEDIGITAL_CH_USER,
          process.env.LIVEDIGITAL_CH_PASSWORD
        );

        const q = `
          SELECT name, type
            FROM system.columns
           WHERE database='${tbl.sourceSchema}'
             AND table='${tbl.sourceTable}'
           ORDER BY position
        `;
        logDebug(`[tableCreator] Metadata query: ${q.trim()}`);
        const result = await src.query({ query: q, format: 'JSON' });
        const { data } = await result.json();
        await src.close();

        const cols = data.map(c => `  ${c.name} ${c.type}`).join(',\n');
        const base = `${tbl.prefix || ''}${tbl.sourceTable}`;
        const qual = `${tbl.targetSchema}.${base}`;
        ddl = (
          `CREATE TABLE IF NOT EXISTS ${qual} (\n` +
          cols +
          `\n) ENGINE = MergeTree\n` +
          `PARTITION BY toYYYYMM(timestamp)\n` +
          `ORDER BY (${data[0].name})`
        );
      } else {
        logInfo(`Using static DDL for '${tbl.sourceTable}'`);
        const base = `${tbl.prefix || ''}${tbl.sourceTable}`;
        const qual = `${tbl.targetSchema}.${base}`;
        ddl = tbl.ddl.replace(
          /CREATE TABLE IF NOT EXISTS \${prefix}_\$\{sourceTable\}/,
          `CREATE TABLE IF NOT EXISTS ${qual}`
        );
      }
    }

    // 3) Выполняем DDL в реплике
    logInfo(`📋 Executing DDL for '${tbl.name}':\n${ddl}`);
    try {
      await clickhouseReplicaClient.query({ query: ddl });
      logInfo(`✅ Table '${tbl.name}' ready`);
    } catch (err) {
      logError(`Failed to create '${tbl.name}'`, err);
      throw err;
    }
  }

  logInfo('— createTables() done');
}
