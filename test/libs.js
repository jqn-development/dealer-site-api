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
  , validate          = require('../app/lib/validate')
;

let req = {
  hasData: false,
  params: { paramVar: 1234, resetValue: -2, badValidation: 'abcd'},
  body: { bodyVar: '1234', multiVar: 'abcd' },
  headers: { headervar: '1234' },
  query: { queryVar: '1234', multiVar: '1234', wrongSrcVar: '1234' }
};

// TODO: Add a test case with a bad validation but a default value function
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
    // Load AWS credentials from environment, if they can't be found then use the values in the file
    config.credentials.aws.accessKeyId = process.env.AWS_ACCESS_KEY || config.credentials.aws.accessKeyId;
    config.credentials.aws.secretAccessKey = process.env.AWS_SECRET_KEY || config.credentials.aws.secretAccessKey;
    config.credentials.aws.region = process.env.AWS_REGION || config.credentials.aws.region;
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
      req.hasData = false;
      req.securityContext.super = true;
      libTest.reqUtils.handleRequest({
        params: _.omit(reqParams, ['badValidation', 'missingRequiredVar']),
        security: { super: true }
      },
      (r,res,next) => {
        test.assert(_.hasValue(r.locals));
      }, done);
      done();
    });
    it('handleRequest with thrown error', (done) => {
      req.hasData = false;
      req.securityContext.super = true;
      libTest.reqUtils.handleRequest({
        params: _.omit(reqParams, ['badValidation', 'missingRequiredVar']),
        security: { super: true }
      },
      (r,res,next) => {
        throw new Error('This is an error');
      }, (err) => {
        test.assert(req.respCode == 500001);
      });
      done();
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

  // ========================================================================
  // Validator Wrapper
  // ========================================================================
  describe('Validator Wrapper', () => {
    it('validate int (good)', () => {
      test.assert(validate('1234', 'int'));
    });
    it('validate int (bad)', () => {
      test.assert(!validate('qwer', 'int'));
    });
    it('validate float (good)', () => {
      test.assert(validate('12.34e03', 'float'));
    });
    it('validate float (bad)', () => {
      test.assert(!validate('qwer', 'float'));
    });
    it('validate boolean (good)', () => {
      test.assert(validate('true', 'boolean'));
    });
    it('validate boolean (bad)', () => {
      test.assert(!validate('qwer', 'boolean'));
    });
    it('validate email (good)', () => {
      test.assert(validate('test@example.com', 'email'));
    });
    it('validate email (bad)', () => {
      test.assert(!validate('qwer', 'email'));
    });
    it('validate currency (good)', () => {
      test.assert(validate('$12.34', 'currency'));
    });
    it('validate currency (bad)', () => {
      test.assert(!validate('qwer', 'currency'));
    });
    it('validate uuid (good)', () => {
      test.assert(validate('60212ca3-9208-4d62-a338-68c7e53145e4', 'uuid'));
    });
    it('validate uuid (bad)', () => {
      test.assert(!validate('qwer', 'uuid'));
    });
    it('validate url (good)', () => {
      test.assert(validate('http://example.com/', 'url'));
    });
    it('validate url (bad)', () => {
      test.assert(!validate('qwer', 'url'));
    });
    it('validate fqdn (good)', () => {
      test.assert(validate('example.com', 'fqdn'));
    });
    it('validate fqdn (bad)', () => {
      test.assert(!validate('qwer', 'fqdn'));
    });
    it('validate apikey (good)', () => {
      test.assert(validate('C0GJS8Z-J844TRH-MCW6HHW-WMRMBS4', 'apikey'));
    });
    it('validate apikey (bad)', () => {
      test.assert(!validate('qwer', 'apikey'));
    });
  });

});
