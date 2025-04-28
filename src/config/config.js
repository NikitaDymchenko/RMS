import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { createClient } from '@clickhouse/client';

dotenv.config();

export const {
  MONGO_HOST,
  MONGO_DB,
  MONGO_USER,
  MONGO_PASS,
  MONGO_AUTH_SOURCE,
  REPLICA_CH_HOST,
  REPLICA_CH_SECURE,
  REPLICA_CH_USER,
  REPLICA_CH_PASSWORD
} = process.env;

export function getMongoClient() {
  const uri = `mongodb://${MONGO_USER}:${encodeURIComponent(MONGO_PASS)}@${MONGO_HOST}/${MONGO_DB}?authSource=${MONGO_AUTH_SOURCE}`;
  return new MongoClient(uri);
}

function buildCHUrl(host, secure = false) {
  const protocol = secure === 'true' ? 'https' : 'http';
  return `${protocol}://${host}`;
}

export const clickhouseReplicaClient = createClient({
  url: buildCHUrl(REPLICA_CH_HOST, REPLICA_CH_SECURE),
  username: REPLICA_CH_USER,
  password: REPLICA_CH_PASSWORD
});