// app/controllers/admin.js

const
  _                   = require('../lib/lodashExt')
  , uuidAPIKey        = require('uuid-apikey')
  , secretKey         = require('secret-key')
  , ReqUtils          = require('../lib/reqUtils')
;

/**
 * @example
 * let adminController = new AdminController(dbconn, models, logger)
 */
class AdminController {
  /**
   * @param {DBConn} dbconn - Database connection object.
   * @param {!Object} models - The object containing all the models.
   * @param {Logger} log - The output logger.
   */
  constructor(dbconn, models, cache, log) {
    this.log = log;
    this.cache = cache;
    this.model = new models.ACL(dbconn, log).model;
    this.modelSite = new models.Site(dbconn,log).model;
  }

  createAPIKey(req, res, next) {
    let reqUtils = new ReqUtils(req);

    if (!reqUtils.hasResponse()) {

      // Context and Auth Check
      if (!reqUtils.checkAuth({super: true, server: true})) {
          // Unauthorized user
          reqUtils.setError(403000);
          next(`The API Provided is not authorized to access this resource`);
          return;
      }

      // Get Parameters

      // Check Required parameters
      let reqParams = reqUtils.hasRequiredParams({});
      if (reqParams.length > 0) {
        // We have missing parameters, report the error
        reqUtils.setError(400003);
        // Return an error below
        next(`Required parameters [${reqParams}] are missing from this request.`);
        return;
      }

      // TODO: Add parameter validation and SQL Injection checking where needed
      try {
        let apiKey = uuidAPIKey.create();
        let secret = secretKey.create(apiKey.apiKey);
        let obj = {
          apiKey: apiKey.uuid,
          secretKey: secret.secret,
          secretIV: secret.iv,
          secretTimestamp: secret.timestamp,
          isSuperAdmin: false,
          isDeleted: false
        }
        this.model.create(obj)
        .then((acl) => {
          if (!acl) {
            reqUtils.setError(500002);
            next(`The new API Key could not be created.`);
          } else {
            acl.id = acl.apiKey;
            acl.apiKey = uuidAPIKey.toAPIKey(acl.id);
            reqUtils.setData(_.pick(acl, ['id', 'apiKey', 'secretKey', 'lastUpdated', 'created']));
            next();
          }
        })
        .catch((err) => {
          reqUtils.setError(500002);
          next(err);
        });
      } catch (err) {
        reqUtils.setError(500001);
        next(err);
      }
    } else {
      next();
    }
  }

  createSite(req, res, next) {

  }

  flushCache(req, res, next) {
    let reqUtils = new ReqUtils(req);

    reqUtils.handleRequest({
      params: {},
      security: { super: true, server: true }
    },
    (req, res, next) => {
      this.cache.clear()
      .then((result) => {
        if (!result) {
          reqUtils.setError(500003);
          next(`An unknown error on the cache server occurred.`);
        } else {
          reqUtils.setData({message: "OK"});
          next();
        }
      })
      .catch((err) => {
        reqUtils.setError(500003);
        next(err);
      });
    }, next, res);
  }
}

module.exports = AdminController;
