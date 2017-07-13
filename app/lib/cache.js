// app/lib/cache.js

// Dependencies
const
  _                 = require('./lodashExt')
  , fs              = require('fs')
  , redis           = require('redis')
  , bluebird        = require('bluebird')
  , crypto          = require('crypto')
;

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

class Cache {
  constructor(config, logger) {
    if (_.isUnset(config)) throw Error('No configuration was passed when loading Cache library');
    this.isConnected = false;
    this.cacheConfig = config.cache;
    this.creds = config.credentials.redis;
    this.cache = redis.createClient(this.creds.port, this.creds.host, this.cacheConfig);
    this.cache.on('ready', () => {
      logger.info('Cache Connected');
      this.isConnected = true;
    });
  }

  get(key) {
    return this.cache.getAsync(key); // returns a Promise
  }

  set(key, value) {
    return this.cache.setAsync(key, value); // returns a Promise
  }

  calcObjKey(objKey) {
    let str = JSON.stringify(objKey).replace(/\n/g,''); // Stringify JSON and flatten string
    return crypto.createHash('sha256').update(str).digest('hex');
  }

  oget(objKey) {
    let key = this.calcObjKey(objKey);
    return this.get(key);   // returns a Promise
  }

  oset(objKey, value) {
    let key = this.calcObjKey(objKey);
    return this.set(key, value);  // returns a Promise
  }

  // Clear the Redis Cache
  clear() {
    return this.cache.flushdbAsync(); // returns a Promise
  }

  close() {
    if (_.hasValue(this.cache)) this.cache.quit();
  }
}

module.exports = Cache;
