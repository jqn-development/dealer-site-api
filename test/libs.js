// test/libs.js

let
  _                   = require('../app/lib/lodashExt')
  , test              = require('unit.js')
  , assert            = require('assert')
  , config            = require('../config/config')

  , DBConn            = require('../app/lib/dbconn')
  , Cache             = require('../app/lib/cache')
  , Logger            = require('../app/lib/logger')
  , ReqUtils          = require('../app/lib/reqUtils')
;

let req = {
  hasData: true
};

let libTest = { reqUtils: null, logger: null, cache: null, dbconn: null };

describe('Library Tests', () => {
  before(() => {
    // Inject testing credentials into config object
    config.credentials.aws = require(__dirname + '/../config/aws.test.credentials.json');
    config.credentials.mysql = require(__dirname + '/../config/mysql.test.credentials.json');
    config.credentials.redis = require(__dirname + '/../config/redis.test.credentials.json');
  });

  after(() => {
    if (_.hasValue(libTest.dbconn)) {
      libTest.dbconn.close();
    }
  });

  // ========================================================================
  // Request Utilties
  // ========================================================================
  describe('Request Utilities', () => {
    before(() => {
      libTest.reqUtils = new ReqUtils(req);
    });

    it('constructor', () => {
      test.assert(libTest.reqUtils instanceof ReqUtils);
    });

    // TODO: Test - Request Utilities
    it('hasResponse');
    it('setError');
    it('setData');
    it('checkAuthContext');
    it('checkSitePermissions');
    it('retrieveParams');
    it('hasRequiredParams');
    it('compileRequiredParams');
    it('handleDefaults');
    it('validateParams');
    it('handleRequest')
  });

  // ========================================================================
  // Logger Wrapper
  // ========================================================================
  describe('Logger Wrapper', () => {
    before(() => {
      libTest.logger = new Logger(config);
    });

    it('constructor', () => {
      test.assert(libTest.logger instanceof Logger);
    });

    it('log functions', () => {
      test.assert(typeof libTest.logger.log.log === 'function');
    })
  });

  // ========================================================================
  // Database Connection Wrapper
  // ========================================================================
  describe('Database Connection Wrapper', () => {
    before(() => {
      libTest.dbconn = new DBConn(config, libTest.logger.log);
    });

    it('constructor', () => {
      test.assert(libTest.dbconn instanceof DBConn);
    });

    it('establish connection', (done) => {
      libTest.dbconn.connect()
        .then(() => {
          test.assert(libTest.dbconn.isConnected);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
    it('close', () => {
      libTest.dbconn.close();
      test.assert(!libTest.dbconn.isConnected);
    });
  });

  // ========================================================================
  // Redis Cache Wrapper
  // ========================================================================
  describe('Redis Cache Wrapper', () => {
    let testObj;
    before(async () => {
      libTest.cache = await new Cache(config, libTest.logger.log);
      testObj = { where: { dealerID: -1, offset: 0, limit: 20, table: 'vehicle'}};
    });

    it('constructor', () => {
      test.assert(libTest.cache instanceof Cache);
    });

    it('connect', (done) => {
      libTest.cache.connect()
        .then(() => {
          test.assert(libTest.cache.isConnected);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('set', (done) => {
      libTest.cache.set('TestKey', 'TestValue')
        .then(() => {
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
    it('get', (done) => {
      libTest.cache.get('TestKey')
        .then((reply) => {
          test.assert(reply == 'TestValue');
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
    it('calcObjKey', () => {
      let key = libTest.cache.calcObjKey(testObj);
      test.assert(key == '60965b195653656d4fa58c65b96776ea796f97365bf18c255d2d89f5fd36e2dc');
    });
    it('oset', (done) => {
      libTest.cache.oset(testObj, JSON.stringify(testObj))
        .then(() => {
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
    it('oget', (done) => {
      libTest.cache.oget(testObj)
        .then((reply) => {
          test.assert(reply == JSON.stringify(testObj));
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
    it('close', (done) => {
      libTest.cache.close()
       .then(() => {
         test.assert(!libTest.cache.isConnected);
         done();
       })
       .catch((err) => {
         done(err);
       })
    });
  });

});
