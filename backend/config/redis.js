const Redis = require('ioredis');

// Security & Architecture Reasoning:
// Redis acts as the high-speed backend for BullMQ. In a honeypot scenario, 
// a sudden influx of automated probes (DoS) is highly likely. 
// Using Redis ensures we can ingest thousands of requests per second 
// and queue them for asynchronous processing without blocking the Express event loop.

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null, // Required by BullMQ to process jobs reliably
});

redisConnection.on('error', (err) => {
    console.error('Redis connection error. Ensure Redis container is running:', err);
});

module.exports = redisConnection;
