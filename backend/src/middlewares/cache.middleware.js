const { getRedisClient } = require('../shared/redis');

const cache = (durationInSeconds = 300) => {
    return async (req, res, next) => {
        const redisClient = getRedisClient();

        // If Redis isn't initialized or running, silently bypass cache
        if (!redisClient) {
            return next();
        }

        const key = `__express__${req.originalUrl || req.url}`;

        try {
            const cachedBody = await redisClient.get(key);
            if (cachedBody) {
                console.log(`⚡ Cache Hit: ${key}`);
                const data = JSON.parse(cachedBody);
                return res.status(200).json(data);
            }

            console.log(`🐌 Cache Miss: ${key}`);
            
            // Override res.json to capture the response body before sending it
            const originalJson = res.json.bind(res);
            res.json = (body) => {
                // Only cache successful responses (HTTP 2xx)
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    redisClient.set(key, JSON.stringify(body), 'EX', durationInSeconds)
                        .catch(err => console.error('Redis Set Error:', err));
                }
                originalJson(body);
            };

            next();
        } catch (error) {
            console.error('Redis Cache Middleware Error:', error);
            // On failure, bypass cache
            next();
        }
    };
};

module.exports = cache;
