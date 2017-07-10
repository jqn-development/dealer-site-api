// app/controllers/auth.js

const
  _                   = require('../lib/lodashExt')
  , uuidAPIKey        = require('uuid-apikey')
  , ReqUtils          = require('../lib/reqUtils')
;

/**
 * @example
 * let authController = new AuthController(dbconn, models, logger)
 */
class AuthController {
  /**
   * @param {DBConn} dbconn - Database connection object.
   * @param {!Object} models - The object containing all the models.
   * @param {Logger} log - The output logger.
   */
  constructor(dbconn, models, log) {
    this.log = log;
    this.acl = new models.ACL(dbconn, log);
    this.model = this.acl.model;
    this.modelACLSite = this.acl.modelACLSite;
  }

  hasAPIKey(req) {
    req.apiKey = req.body.apiKey || req.headers.apikey || req.query.apiKey;
    return _.hasValue(req.apiKey);
  }

  hasSecret(req) {
    req.secretKey = req.body.secret || req.headers.secret; // || req.query.secret; No secret in query string for security
    return _.hasValue(req.secretKey);
  }

  hasSiteID(req) {
    req.siteID = req.body.siteID || req.headers.siteid || req.query.siteID;
    return _.hasValue(req.siteID);
  }

  authenticateRequest(req, res, next) {
    let reqUtils = new ReqUtils(req);

    req.securityContext = {
      client: false,
      server: false,
      super: false
    };

    this.log.debug('Authenticating Request');

    try {
      // Check that an API Key has been provided
      if (!this.hasAPIKey(req)) {
        // No API Key -- 401 Unauthorized
        reqUtils.setError(401000);
        next(`An API Key is required for access. Please provide an API Key and try again.`);
        return;
      }

      // API Key is provided, check that API Key is good
      if (!uuidAPIKey.isAPIKey(req.apiKey)) {
        // Bad API Key -- 401 Unauthorized
        reqUtils.setError(401001);
        next(`The API Key provided is invalid.`);
        return;
      }
      req.apiUUID = uuidAPIKey.toUUID(req.apiKey);

      // Lookup the API Key in the database

      // TODO: Add Redis caching here, these responses need to be very fast
      // alternatively, add a lookup array that persists and the data is pulled from
      this.model.findOne({
          where: { apiKey: req.apiUUID }
        })
        .then((acl) => {
          if (!acl) {
            // The API Key could not be found
            reqUtils.setError(401001);
            next(`The API Key provided is invalid.`);
          } else {
            // Set Client Security context
            req.acl = acl;

            // Check Server Sec context
            if (this.hasSecret(req)) {
              // Check that secret key matches the ACL
              if (acl.secretKey !== req.secretKey) {
                // The Secret is invalid
                reqUtils.setError(401001);
                next(`The secret provided is invalid.`);
                return;
              } else {
                // Set the server side context
                req.securityContext.server = true;

                // Set the super admin context
                if (acl.isSuperAdmin) req.securityContext.super = true;

                // TODO: Get Sites/Dealers Permissions?
                //if ()
              }
            }

            // Set the client side context
            req.securityContext.client = true;
            next();
          }
        })
        .catch((err) => {
          reqUtils.setError(500001);
          next(err);
        });
    } catch (err) {
      reqUtils.setError(500001);
      next(err);
    }
  }
}

module.exports = AuthController;
