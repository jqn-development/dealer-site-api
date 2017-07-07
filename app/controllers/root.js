// app/controllers/root.js

const
  _                   = require('../lib/lodashExt')
  , ReqUtils          = require('../lib/reqUtils')
;

/**
 * @example
 * let rootController = new RootController(dbconn, models, logger)
 */
class RootController {
  /**
   * @param {DBConn} dbconn - Database connection object.
   * @param {!Object} models - The object containing all the models.
   * @param {Logger} log - The output logger.
   */
  constructor(dbconn, models, log) {
    this.log = log;
  }

  handleRoot(req, res, next) {
    let reqUtils = new ReqUtils(req);

    if (!reqUtils.hasResponse()) {
      reqUtils.setData({ message: 'It works!' });
      next();
    } else {
      next();
    }
  }
}

module.exports = RootController;
