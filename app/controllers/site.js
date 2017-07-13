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
    // TODO: Do Site config read
    next();
  }

  update(req, res, next) {
    // TODO: Do Site config update
    next();
  }

}

module.exports = SiteController;
