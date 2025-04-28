import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { createClient } from '@clickhouse/client';

export const {
  MONGO_HOST,
  MONGO_DB,
  MONGO_USER,
  MONGO_PASS,
  MONGO_AUTH_SOURCE,
  REPLICA_CH_HOST,
  REPLICA_CH_SECURE,
  REPLICA_CH_USER,
  REPLICA_CH_PASSWORD,
  VERBOSE_LOGGING = 'false'
} = process.env;

// Flag to control verbose debug logging
export const VERBOSE = VERBOSE_LOGGING === 'true';

export function getMongoClient() {
  if (VERBOSE) console.debug('[config] Creating MongoClient with', MONGO_HOST, MONGO_DB);
  const uri = `mongodb://${MONGO_USER}:${encodeURIComponent(MONGO_PASS)}@${MONGO_HOST}/${MONGO_DB}?authSource=${MONGO_AUTH_SOURCE}`;
  return new MongoClient(uri);
}

function buildCHUrl(host, secure=false) {
  const proto = secure==='true'?'https':'http';
  if (VERBOSE) console.debug('[config] ClickHouse URL:', proto, '://', host);
  return `${proto}://${host}`;
}

export const clickhouseReplicaClient = createClient({
  url: buildCHUrl(REPLICA_CH_HOST, REPLICA_CH_SECURE),
  username: REPLICA_CH_USER,
  password: REPLICA_CH_PASSWORD
});
  logInfo(`ChangeStream start ${resume?'resume':'new'}`);
  const cs=coll.watch([],opts);
  cs.on('change',async c=>{logInfo(`change ${c.documentKey._id}`);try{const doc=c.fullDocument;await loadCallStatus(doc);if(!doc.active)queue.enqueue({callId:doc._id.toString()});saveResumeToken(c._id);}catch(e){logError('cs',e);}});
  cs.on('error',e=>{logError('cs err',e);process.exit(1);});
}
