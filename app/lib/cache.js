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
    this.cache = null;
    this.logger = logger;
  }

  // Returns a promise that signifies when the connection to the cache is ready
  connect() {
    this.cache = redis.createClient(this.creds.port, this.creds.host, this.cacheConfig);
    return new Promise((resolve, reject) => {
      this.cache.on('connect', () => {
        this.logger.info('Cache Connected');
        this.isConnected = true;
        resolve(this.cache);
      });
      this.cache.on('error', (err) => {
        reject(err);
      });
    });
  }

  get(key) {
    if (this.isConnected) return this.cache.getAsync(key); // returns a Promise
    else throw (new Error('Cache is not connected'));
  }

  set(key, value) {
    if (this.isConnected) return this.cache.setAsync(key, value); // returns a Promise
    else throw (new Error('Cache is not connected'));
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
    if (this.isConnected) return this.cache.flushdbAsync(); // returns a Promise
    else throw (new Error('Cache is not connected'));
  }

  close() {
    let p;
    if (this.isConnected) {
      this.cache.quit();
      p = new Promise((resolve, reject) => {
        this.cache.on('end', () => {
          this.logger.info('Cache Closed');
          this.isConnected = false;
          resolve(this.cache);
        });
        this.cache.on('error', (err) => {
          reject(err);
        });
      });
    } else {
      p = new Promise((resolve, reject) => {
        reject('Cache connection is not active');
      });
    }
    return p;
  }
}

module.exports = Cache;
