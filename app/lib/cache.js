// app/lib/cache.js

// Dependencies
const
  _                 = require('./lodashExt')
  , fs              = require('fs')
  , redis           = require('redis')
  , bluebird        = require('bluebird')
;

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

class Cache {
  constructor(config) {
    if (_.isUnset(config)) throw Error('No configuration was passed when loading Cache library');
    this.cacheConfig = config.cache;
    this.creds = config.credentials.redis;
    this.cache = redis.createClient(this.creds.port, this.creds.host, this.cacheConfig);
  }

  get(key) {
    return this.cache.getAsync(key); // returns a Promise
  }

  set(key, value) {
    return this.cache.setAsync(key, value); // returns a Promise
  }

  // Clear the Redis Cache
  clear() {
    return this.cache.flushdbAsync(); // returns a Promise
  }

  close() {
    if (_.hasValue(config)) this.cache.quit();
  }
}

module.exports = Cache;
