const Redis = require('ioredis');

let redisClient = null;

const initRedis = () => {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl || redisUrl === 'YOUR_UPSTASH_REDIS_URL') {
        console.warn('⚠️ REDIS_URL is not set or is using placeholder. Caching will be bypassed.');
        return null;
    }

    try {
        redisClient = new Redis(redisUrl, {
            retryStrategy(times) {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            maxRetriesPerRequest: 3,
        });

        redisClient.on('connect', () => {
            console.log('✅ Connected to Redis (Upstash) successfully');
        });

        redisClient.on('error', (err) => {
            console.error('❌ Redis Client Error:', err.message);
        });
        
        return redisClient;
    } catch (error) {
        console.error('❌ Failed to initialize Redis:', error.message);
        return null;
    }
};

const getRedisClient = () => {
    return redisClient;
};

module.exports = { initRedis, getRedisClient };
