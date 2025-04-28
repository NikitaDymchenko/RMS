export const tablesConfig = [
  {
    name: 'time_spent',
    sourceDatabase: process.env.LIVEDIGITAL_CH_HOST,
    sourceSchema: 'analytics_prod',
    sourceTable: 'time_spent',
    prefix: 'test'|| '',
    targetSchema: 'ClickHouse',
    ddl: `
CREATE TABLE IF NOT EXISTS \${prefix}_\${sourceTable} (
  accountId String,
  spaceId String,
  roomId String,
  clientUniqueId String,
  participantId String,
  participantRole String,
  startTimestamp DateTime('UTC'),
  finishTimestamp DateTime('UTC'),
  timestamp DateTime('UTC'),
  duration UInt32,
  callId String
) ENGINE = MergeTree
PARTITION BY toYYYYMM(timestamp)
ORDER BY (toDate(timestamp), accountId, spaceId, roomId)
`  
  },
  {
    name: 'network_metrics',
    sourceDatabase: process.env.LIVEDIGITAL_CH_HOST,
    sourceSchema: 'analytics_prod',
    sourceTable: 'network_metrics',
    prefix: 'test'|| '',
    targetSchema: 'ClickHouse',
    ddl: `
CREATE TABLE IF NOT EXISTS \${prefix}_\${sourceTable} (
  jitter Int32,
  rtt Int32,
  packetLoss Int32,
  mos Float32,
  streams Int32,
  direction Enum8('inbound' = 1, 'outbound' = 2),
  clientUniqueId String,
  roomId String,
  spaceId String,
  callId String,
  appId String,
  channelId String,
  peerId String,
  ip String,
  node String,
  city String,
  region String,
  country String,
  timestamp DateTime('UTC'),
  created_at DateTime('UTC'),
  bitrate Float32
) ENGINE = MergeTree
PARTITION BY toYYYYMM(timestamp)
ORDER BY (toDate(timestamp), country, region)
`  
  },
  {
    name: 'metrics',
    sourceDatabase: process.env.LIVEDIGITAL_CH_HOST,
    sourceSchema: 'analytics_prod',
    sourceTable: 'metrics',
    prefix: 'test'|| '',
    targetSchema: 'ClickHouse',
    ddl: `
CREATE TABLE IF NOT EXISTS \${prefix}_\${sourceTable} (
  callId String,
  roomId String,
  spaceId String,
  participantId String,
  externalUserId String,
  externalMeetingId String,
  userId String,
  userName String,
  email String,
  phone String,
  reactionsCount Int64,
  chatMessagesCount Int32,
  onlineDuration Int32,
  onlineDurationWithActiveTab Int32,
  activeMicrophoneDuration Int32,
  activeCameraDuration Int32,
  referer String,
  deviceType String,
  deviceModel String,
  platform String,
  platformVersion String,
  browser String,
  browserVersion String,
  timestamp DateTime('Europe/London'),
  clientUniqueId String,
  thumbUpCount Int32,
  thumbDownCount Int32,
  heartCount Int32,
  fireCount Int32,
  ip String,
  roomType String,
  planAlias String,
  isBreakoutRoom Bool,
  playbackId String,
  playbackEventId String,
  playbackEventSessionId String,
  playbackType Nullable(Enum8('webinar' = 1, 'conference' = 2, 'record' = 3)),
  project String DEFAULT 'livedigital',
  utmSource String,
  utmMedium String,
  utmCampaign String,
  utmContent String,
  utmTerm String,
  role String,
  version String
) ENGINE = MergeTree
PARTITION BY toYYYYMM(timestamp)
ORDER BY (callId, toDate(timestamp), roomId, participantId)
SETTINGS index_granularity = 8192
`  
  },
  {
    name: 'feedbacks',
    sourceDatabase: process.env.LIVEDIGITAL_CH_HOST,
    sourceSchema: 'analytics_prod',
    sourceTable: 'feedbacks',
    prefix: 'test'|| '',
    targetSchema: 'ClickHouse',
    ddl: `
CREATE TABLE IF NOT EXISTS \${prefix}_\${sourceTable} (
  project String,
  accountId String,
  spaceId String,
  roomId String,
  roomType String,
  planAlias String,
  clientUniqueId String,
  userId String,
  userRole String,
  participantId String,
  callId String,
  ip String,
  deviceType String,
  deviceModel String,
  platform String,
  platformVersion String,
  browser String,
  browserVersion String,
  timestamp DateTime('UTC'),
  score Int32,
  soundWithDelay Bool,
  noParticipantsSound Bool,
  noMySoundForParticipants Bool,
  echo Bool,
  frequentSoundInterruption Bool,
  otherAudioIssue String,
  noVideoAndAudioSync Bool,
  myCameraDidNotWork Bool,
  noParticipantsVideo Bool,
  lowParticipantsVideoQuality Bool,
  frequentVideoInterruption Bool,
  otherVideoIssue String,
  demoWithFreezes Bool,
  lowDemoVideoQuality Bool,
  demoSwitchingOnFailure Bool,
  noParticipantsDemo Bool,
  noMyDemoForParticipants Bool,
  otherDemoIssue String,
  otherIssues String
) ENGINE = MergeTree
PARTITION BY toYYYYMM(timestamp)
ORDER BY (accountId, toDate(timestamp), clientUniqueId)
SETTINGS index_granularity = 8192
`  
  },
  {
    name: 'calls',
    sourceDatabase: 'mongo',
    sourceSchema: 'moodhood',
    sourceTable: 'calls',
    prefix: '',
    targetSchema: 'ClickHouse',
    ddl: `
CREATE TABLE IF NOT EXISTS Mongo.calls (
  _id String,
  participantCount Int32,
  totalParticipantCount String,
  roomId String,
  active UInt8,
  startedAt DateTime,
  finishedAt DateTime,
  isBreakOutRoom UInt8,
  planAlias String,
  roomType String
) ENGINE = MergeTree
ORDER BY (_id)
`  
  }
];