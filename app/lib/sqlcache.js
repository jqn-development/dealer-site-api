// app/lib/sqlcache.js

// Dependencies
const
  _                 = require('./lodashExt')
;


class SQLCache {
  constructor(dbconn, model, cache) {
    this.dbconn = dbconn;
    this.model = model;
    this.cache = cache;
    this.table = model.modelName;
  }

  // 1. Build Object for Key
  // 2. Search Cache for Key
  // 3. If exists, return data from Cache
  // 4. if does not exist retrieve data from DB
  // 4.1 Store data in cache
  // 5 return data
  // This probably gets tricky with the promises, we probably need to return a promise

  findById(id) {

  }

  findOne(options) {

  }

  findAll(options) {

  }

  find(options) {

  }

  query(options) {

  }
}
