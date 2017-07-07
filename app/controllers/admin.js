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
  constructor(dbconn, models, log) {
    this.log = log;
    this.model = new models.ACL(dbconn, log).model;
  }

  createAPIKey(req, res, next) {
    let reqUtils = new ReqUtils(req);

    if (!reqUtils.hasResponse()) {
      // TODO: Context and Auth Check
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

      // TODO: Do validation on params (SQL Injection)
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

}

module.exports = AdminController;
