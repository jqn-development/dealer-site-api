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
  hasData: false,
  params: { paramVar: 1234, resetValue: -2, badValidation: 'abcd'},
  body: { bodyVar: '1234', multiVar: 'abcd' },
  headers: { headervar: '1234' },
  query: { queryVar: '1234', multiVar: '1234', wrongSrcVar: '1234' }
};

let reqParams = {
  paramVar: { type: 'int', required: true, source: ['params'] },
  bodyVar: { type: 'string', required: true, source: ['body'] },
  headerVar: { type: 'string', required: true, source: ['headers'] },
  queryVar: { type: 'string', required: true, source: ['query'] },
  multiVar: { type: 'string', required: true, source: ['body', 'query']},
  wrongSrcVar: { type: 'string', required: false, source: ['body']},
  defaultVar: { type: 'string', required: false, source: ['body'], default: 'qwerty'},
  resetValue: { type: 'int', required: false, source: ['params'], default: (v) => { return Number((v < 1) ? 1 : (v || 1)) }},
  badValidation: { type: 'int', required: true, source: ['params']},
  missingRequiredVar: { type: 'string', required: true, source: ['body']}
}

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
    let sepParams;
    before((done) => {
      libTest.reqUtils = new ReqUtils(req);
      done();
    });

    it('constructor', () => {
      test.assert(libTest.reqUtils instanceof ReqUtils);
    });
    it('setError', () => {
      libTest.reqUtils.setError(12345);
      test.assert(req.hasError && req.respCode == 12345);
      req.hasError = false;
      req.respCode = null;
    });
    it('setData', () => {
      libTest.reqUtils.setData({ message: 'OK'});
      test.assert(req.hasData && req.data.message == 'OK');
      req.data = null;
    });
    it('hasResponse', () => {
      test.assert(libTest.reqUtils.hasResponse());
    });
    it('checkAuthContext', () => {
      req.securityContext = { super: false, signed: false, server: false, client: false };
      test.assert(!libTest.reqUtils.checkAuthContext({ super: true }));
      test.assert(!libTest.reqUtils.checkAuthContext({ signed: true }));
      test.assert(!libTest.reqUtils.checkAuthContext({ server: true }));
      test.assert(!libTest.reqUtils.checkAuthContext({ client: true }));
      req.securityContext.client = true;
      test.assert(!libTest.reqUtils.checkAuthContext({ super: true }));
      test.assert(!libTest.reqUtils.checkAuthContext({ signed: true }));
      test.assert(!libTest.reqUtils.checkAuthContext({ server: true }));
      test.assert(libTest.reqUtils.checkAuthContext({ client: true }));
      req.securityContext.client = false;
      req.securityContext.server = true;
      test.assert(!libTest.reqUtils.checkAuthContext({ super: true }));
      test.assert(!libTest.reqUtils.checkAuthContext({ signed: true }));
      test.assert(libTest.reqUtils.checkAuthContext({ server: true }));
      test.assert(!libTest.reqUtils.checkAuthContext({ client: true }));
      req.securityContext.server = false;
      req.securityContext.signed = true;
      test.assert(!libTest.reqUtils.checkAuthContext({ super: true }));
      test.assert(libTest.reqUtils.checkAuthContext({ signed: true }));
      test.assert(!libTest.reqUtils.checkAuthContext({ server: true }));
      test.assert(!libTest.reqUtils.checkAuthContext({ client: true }));
      req.securityContext.signed = false;
      req.securityContext.super = true;
      test.assert(libTest.reqUtils.checkAuthContext({ super: true }));
      test.assert(!libTest.reqUtils.checkAuthContext({ signed: true }));
      test.assert(!libTest.reqUtils.checkAuthContext({ server: true }));
      test.assert(!libTest.reqUtils.checkAuthContext({ client: true }));
    });
    it('checkSitePermissions', () => {
      req.acl = { sites: [ {siteID: -1, dealerID: -1} ] };
      test.assert(libTest.reqUtils.checkSitePermissions()); // This should be true with the super bit set
      req.securityContext.super = false;
      req.locals = { siteID: null, dealerID: null };
      test.assert(libTest.reqUtils.checkSitePermissions()); // This should be true because no siteID or dealerID is set
      req.locals = { siteID: 1, dealerID: null };
      test.assert(!libTest.reqUtils.checkSitePermissions()); // This should be false because siteID does not match
      req.locals = { siteID: null, dealerID: 1 };
      test.assert(!libTest.reqUtils.checkSitePermissions()); // This should be false because dealerID does not match
      req.locals = { siteID: -1, dealerID: null };
      test.assert(libTest.reqUtils.checkSitePermissions()); // This should be true because the siteID matches
      req.locals = { siteID: null, dealerID: -1 };
      test.assert(libTest.reqUtils.checkSitePermissions()); // This should be true because dealerID matches
      req.locals = {};
    });
    it('retrieveParams', () => {
      libTest.reqUtils.retrieveParams(reqParams);  // This should move all the values to the req.locals
      test.assert(_.hasValue(req.locals));
      test.assert(_.hasValue(req.handler));
    });
    it('checking value retrieval from params', () => {
      test.assert(_.hasValue(req.locals.paramVar) && req.locals.paramVar == 1234);
    });
    it('checking value retrieval from body', () => {
      test.assert(_.hasValue(req.locals.bodyVar) && req.locals.bodyVar == '1234');
    });
    it('checking value retrieval from header', () => {
      test.assert(_.hasValue(req.locals.headerVar) && req.locals.headerVar == '1234');
    });
    it('checking value retrieval from query', () => {
      test.assert(_.hasValue(req.locals.queryVar) && req.locals.queryVar == '1234');
    });
    it('checking value retrieval priority where variable can come from multiple sources', () => {
      test.assert(_.hasValue(req.locals.multiVar) && req.locals.multiVar == 'abcd');
    });
    it('checking that value that is not in the correct source is not retrieved', () => {
      test.assert(!_.hasValue(req.locals.wrongSrcVar));
    });
    it('checking that missing value is not retrieved', () => {
      test.assert(!_.hasValue(req.locals.missingRequiredVar));
    });
    it('compileRequiredParams', () => {
      sepParams = libTest.reqUtils.compileRequiredParams(req.handler);
      test.assert(_.hasValue(sepParams));
      test.assert(_.hasValue(sepParams.required));
      test.assert(_.hasValue(sepParams.optional));
    });
    it('hasRequiredParams', () => {
      let required = libTest.reqUtils.hasRequiredParams(sepParams.required);
      test.assert(required.length == 1); // There should be 1 missing parameter
    });
    it('handleDefaults', () => {
      libTest.reqUtils.handleDefaults(sepParams.optional);
      test.assert(_.hasValue(req.locals.resetValue) && req.locals.resetValue == 1);
      test.assert(_.hasValue(req.locals.defaultVar) && req.locals.defaultVar == 'qwerty');
    });
    it('validateParams', () => {
      let invalidParams = libTest.reqUtils.validateParams(req.handler);
      test.assert(invalidParams.length > 0); // There should be at least 1 missing parameter
    });
    it('handleRequest', (done) => {
      libTest.reqUtils.handleRequest({
        params: reqParams,
        security: { super: true }
      },
      (req,res,next) => {
        test.assert(_.hasValue(req.locals));
        done();
      }, done);
    });
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
