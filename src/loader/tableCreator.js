import { clickhouseReplicaClient } from '../config/config.js';
import { tablesConfig } from '../config/tables.js';
import { logInfo, logError } from '../utils/logging.js';

export async function createTables() {
  for (const tbl of tablesConfig) {
    // Build schema-qualified target table name
    const tableName = `${tbl.targetSchema}.${tbl.prefix ? tbl.prefix + '_' : ''}${tbl.sourceTable}`;

    // Replace placeholder in DDL with actual schema-qualified name
    const ddl = tbl.ddl.replace(
      /CREATE TABLE IF NOT EXISTS \$\{prefix\}_\$\{sourceTable\}/,
      `CREATE TABLE IF NOT EXISTS ${tableName}`
    );

    logInfo(`Creating table: ${tableName}`);
    try {
      await clickhouseReplicaClient.query({ query: ddl });
      logInfo(`✅ Table ${tableName} created or already exists`);
    } catch (err) {
      logError(`Failed to create table ${tableName}`, err);
      throw err;
    }
  }
}