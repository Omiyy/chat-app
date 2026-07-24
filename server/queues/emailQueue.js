const { Queue } = require('bullmq');
const IORedis = require('ioredis');

// If REDIS_URL is provided (like the Upstash URL), use it directly. 
// Otherwise, fallback to the individual host/port variables.
const connection = process.env.REDIS_URL 
  ? new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
  : {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
    };

const emailQueue = new Queue('emailQueue', {
  connection
});

module.exports = { emailQueue, connection };
