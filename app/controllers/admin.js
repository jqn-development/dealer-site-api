// app/controllers/admin.js

const
  _                   = require('../lib/lodashExt')
  , uuidv4            = require('uuid/v4')
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
    this.acl = new models.ACL(dbconn, log);
    this.model = this.acl.model;
    this.modelACLSite = this.acl.modelACLSite;
    this.modelSite = new models.Site(dbconn,log).model;
  }

  // =======================================================
  //
  // =======================================================
  createAPIKey(req, res, next) {
    let reqUtils = new ReqUtils(req);

    reqUtils.handleRequest({
      params: {},
      security: { super: true, server: true }
    },
    (req, res, next) => {
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
          reqUtils.setData(_.pick(acl.dataValues, ['id', 'apiKey', 'secretKey', 'lastUpdated', 'created']));
          next();
        }
      })
      .catch((err) => {
        reqUtils.setError(500001);
        next(err);
      });
    }, next, res);
  }

  // =======================================================
  //
  // =======================================================
  createSite(req, res, next) {
    let reqUtils = new ReqUtils(req);

    reqUtils.handleRequest({
      params: {
        dealerID: { type: 'int', source: ['params', 'body', 'headers', 'query'], required: true },
        baseDomainURL: { type: 'fqdn', source: ['body', 'headers', 'query'], required: true },
        title: { type: 'string', source: ['body', 'headers', 'query'] },
        keywords: { type: 'string', source: ['body', 'headers', 'query'] },
        description: { type: 'string', source: ['body', 'headers', 'query'] },
        priceLabelRetailNew: { type: 'string', source: ['body', 'headers', 'query'] },
        priceLabelRetailUsed: { type: 'string', source: ['body', 'headers', 'query'] },
        priceLabelInternetNew: { type: 'string', source: ['body', 'headers', 'query'] },
        priceLabelInternetUsed: { type: 'string', source: ['body', 'headers', 'query'] },
        bookLabel: { type: 'string', source: ['body', 'headers', 'query'] },
        supressStockPhotos: { type: 'boolean', source: ['body', 'headers', 'query'], default: false },
      },
      security: { super: true, server: true }
    },
    (req, res, next) => {
      let siteID = uuidv4();
      let obj = req.locals;
      obj.siteID = siteID;
      this.modelSite.create(obj)
      .then((site) => {
        if (!site) {
          reqUtils.setError(500002);
          next(`The new site could not be created.`);
        } else {
          reqUtils.setData(site);
          next();
        }
      })
      .catch((err) => {
        reqUtils.setError(500001);
        next(err);
      });
    }, next, res);
  }

  // =======================================================
  //
  // =======================================================
  updateSite(req, res, next) {
    let reqUtils = new ReqUtils(req);

    reqUtils.handleRequest({
      params: {
        siteID: { type: 'uuid', source: ['params', 'body', 'headers', 'query'], required: true },
        dealerID: { type: 'int', source: ['body', 'headers', 'query'], },         // Do not allow the dealerID to be updated on client side
        baseDomainURL: { type: 'fqdn', source: ['body', 'headers', 'query'] },    // Do not allow the baseDomainURL to be updated on client side
        title: { type: 'string', source: ['body', 'headers', 'query'] },
        keywords: { type: 'string', source: ['body', 'headers', 'query'] },
        description: { type: 'string', source: ['body', 'headers', 'query'] },
        priceLabelRetailNew: { type: 'string', source: ['body', 'headers', 'query'] },
        priceLabelRetailUsed: { type: 'string', source: ['body', 'headers', 'query'] },
        priceLabelInternetNew: { type: 'string', source: ['body', 'headers', 'query'] },
        priceLabelInternetUsed: { type: 'string', source: ['body', 'headers', 'query'] },
        bookLabel: { type: 'string', source: ['body', 'headers', 'query'] },
        supressStockPhotos: { type: 'boolean', source: ['body', 'headers', 'query'], default: false },
      },
      security: { super: true, server: true }
    },
    (req, res, next) => {
      let obj = req.locals;
      this.modelSite.update(obj, { where: { siteID: req.local.siteID } } )
      .then((site) => {
        if (!site) {
          reqUtils.setError(500002);
          next(`The new site could not be created.`);
        } else {
          reqUtils.setData(site);
          next();
        }
      })
      .catch((err) => {
        reqUtils.setError(500001);
        next(err);
      });
    }, next, res);
  }

  // =======================================================
  //
  // =======================================================
  deleteSite(req, res, next) {
    let reqUtils = new ReqUtils(req);

    reqUtils.handleRequest({
      params: {
        siteID: { type: 'uuid', source: ['params', 'body', 'headers', 'query'], required: true }
      },
      security: { super: true, server: true }
    },
    (req, res, next) => {
      let obj = {};
      obj.isDeleted = true;
      this.modelSite.update(obj, { where: { siteID: req.locals.siteID} })
      .then((site) => {
        if (!site) {
          reqUtils.setError(500002);
          next(`The site ${req.locals.siteID} could not be deleted.`);
        } else {
          reqUtils.setData({ message: `Site (${req.locals.siteID}) was deleted.` });
          next();
        }
      })
      .catch((err) => {
        reqUtils.setError(500001);
        next(err);
      });
    }, next, res);
  }

  // =======================================================
  //
  // =======================================================
  grantSitePermissions(req, res, next) {
    let reqUtils = new ReqUtils(req);

    reqUtils.handleRequest({
      params: {
        siteID: { type: 'uuid', source: ['body', 'headers', 'query'], required: true },
        targetAPIKey: { type: 'apikey', source: ['body', 'headers', 'query'] }
      },
      security: { super: true, server: true }
    },
    (req, res, next) => {
      let key = req.acl.apiKey;
      if (_.hasValue(req.locals.targetAPIKey)) key = uuidAPIKey.toUUID(req.locals.targetAPIKey);
      this.model.find({ where: { apiKey: key }})
      .then((acl) => {
        if (!acl) {
          // The API Key could not be found
          reqUtils.setError(401001);
          next(`The API Key provided is invalid.`);
        } else {
          let obj = { aclID: acl.aclID, siteID: req.locals.siteID };
          this.modelACLSite.create(obj)
          .then((aclSite) => {
            reqUtils.setData({ message: 'Success' });
            next();
          })
          .catch((err) => {
            reqUtils.setError(500001);
            next(err);
          });
        }
      })
      .catch((err) => {
        reqUtils.setError(500001);
        next(err);
      });
    }, next, res);
  }

  // =======================================================
  //
  // =======================================================
  revokeSitePermissions(req, res, next) {
    let reqUtils = new ReqUtils(req);

    reqUtils.handleRequest({
      params: {
        siteID: { type: 'uuid', source: ['body', 'headers', 'query'], required: true },
        targetAPIKey: { type: 'apikey', source: ['body', 'headers', 'query'] }
      },
      security: { super: true, server: true }
    },
    (req, res, next) => {
      let key = req.acl.apiKey;
      if (_.hasValue(req.locals.targetAPIKey)) key = uuidAPIKey.toUUID(req.locals.targetAPIKey);
      this.model.find({ where: { apiKey: key }})
      .then((acl) => {
        if (!acl) {
          // The API Key could not be found
          reqUtils.setError(401001);
          next(`The API Key provided is invalid.`);
        } else {
          let options = { where: { aclID: acl.aclID, siteID: req.locals.siteID } };
          this.modelACLSite.destroy( options )
          .then((aclSite) => {
            reqUtils.setData({ message: 'Success' });
            next();
          })
          .catch((err) => {
            reqUtils.setError(500001);
            next(err);
          });
        }
      })
      .catch((err) => {
        reqUtils.setError(500001);
        next(err);
      });
    }, next, res);
  }


  // =======================================================
  //
  // =======================================================
  getPermissions(req, res, next) {
    let reqUtils = new ReqUtils(req);

    reqUtils.handleRequest({
      params: {},
      security: { super: true, server: true }
    },
    (req, res, next) => {
      reqUtils.setData(req.acl);
      next();
    }, next, res);
  }

  // =======================================================
  //
  // =======================================================
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
