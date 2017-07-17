// app/controllers/site.js

const
  _                   = require('../lib/lodashExt')
  , ReqUtils          = require('../lib/reqUtils')
;

/**
 * @example
 * let siteController = new SiteController(dbconn, models, logger)
 */
class SiteController {
  /**
   * @param {DBConn} dbconn - Database connection object.
   * @param {!Object} models - The object containing all the models.
   * @param {Logger} log - The output logger.
   */
  constructor(dbconn, models, cache, log) {
    this.log = log;
    this.model = new models.Site(dbconn, log).model;
  }

  read(req, res, next) {
    let reqUtils = new ReqUtils(req);

    reqUtils.handleRequest({
      params: {
        siteID: { type: 'uuid', source: ['params', 'body', 'headers', 'query'], required: true },
      },
      security: { client: true }
    },
    (req, res, next) => {
      let obj = req.locals;
      this.model.findById(req.locals.siteID)
      .then((site) => {
        if (!site) {
          reqUtils.setError(400002);
          next(`The 'siteID': '${req.locals.siteID}' does not exist.`);
        } else {
          if (site.dataValues.isDeleted) {
            // Error
            reqUtils.setError(400005);
            next(`The 'siteID': '${req.locals.siteID}' was removed.`);
          } else {
            reqUtils.setData(_.omit(site.dataValues, ['isDeleted']));
            next()
          }
        }
      })
      .catch((err) => {
        reqUtils.setError(500001);
        next(err);
      });
    }, next, res);
  }

  update(req, res, next) {
    let reqUtils = new ReqUtils(req);

    reqUtils.handleRequest({
      params: {
        siteID: { type: 'uuid', source: ['params', 'body', 'headers', 'query'], required: true },
        //dealerID: { type: 'int', source: ['body', 'headers', 'query'], },         // Do not allow the dealerID to be updated on client side
        //baseDomainURL: { type: 'fqdn', source: ['body', 'headers', 'query'] },    // Do not allow the baseDomainURL to be updated on client side
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
      security: { server: true }
    },
    (req, res, next) => {
      let obj = req.locals;
      this.model.update(obj, { where: { siteID: req.locals.siteID, isDeleted: false } } )
      .then((site) => {
        if (!site) {
          reqUtils.setError(400002);
          next(`The 'siteID': '${req.locals.siteID}' does not exist.`);
        } else {
          reqUtils.setData(_.omit(site.dataValues, ['isDeleted']));
          next();
        }
      })
      .catch((err) => {
        reqUtils.setError(500001);
        next(err);
      });
    }, next, res);
  }

}

module.exports = SiteController;
