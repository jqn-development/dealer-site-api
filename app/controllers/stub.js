// app/controllers/site.js

const
  _                   = require('../lib/lodashExt')
  , ReqUtils          = require('../lib/reqUtils')
;

/**
 * @example
 * let stubController = new StubController(dbconn, models, logger)
 */
class StubController {
  /**
   * @param {DBConn} dbconn - Database connection object.
   * @param {!Object} models - The object containing all the models.
   * @param {Logger} log - The output logger.
   */
  constructor(dbconn, models, log) {
    this.log = log;
  }

  action(req, res, next) {
    let reqUtils = new ReqUtils(req);

    if (!reqUtils.hasResponse()) {
      reqUtils.setData({});
      next();
    }
  }
}

module.exports = StubController;
