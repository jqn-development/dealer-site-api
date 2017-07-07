// app/controllers/admin.js

const
  _                   = require('../lib/lodashExt')
  , reqCheck          = require('../lib/reqCheck')
  , uuidAPIKey        = require('uuid-apikey')
  , secretKey         = require('secret-key')
;

class AdminController {
  constructor(dbconn, models, log) {
    this.log = log;
    this.model = new models.ACL(dbconn, log).model;
  }

  createAPIKey(req, res, next) {
    if (!reqCheck(req)) {
      // TODO: Context and Auth Check
      // Get Parameters

      // Check Required parameters
      let reqParams = [];
      // Missing parameters
      //if (_.isUnset(dealerID)) reqParams.push('dealerID');
      if (reqParams.length > 0) {
        // We have missing parameters, report the error
        req.hasError = true;
        req.respCode = 400003;
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
            req.hasError = true;
            req.respCode = 500002;
            next(`The new API Key could not be created.`);
          } else {
            req.hasData = true;
            acl.id = acl.apiKey;
            acl.apiKey = uuidAPIKey.toAPIKey(acl.id);
            req.data = _.pick(acl, ['id', 'apiKey', 'secretKey', 'lastUpdated', 'created']);
            next();
          }
        })
        .catch((err) => {
          req.hasError = true;
          req.respCode = 500002;
          next(err);
        });
      } catch (err) {
        req.hasError = true;
        req.respCode = 500001;
        next(err);
      }
    } else {
      next();
    }
  }


}

module.exports = AdminController;
