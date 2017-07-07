// app/controllers/root.js

const
  _                   = require('../lib/lodashExt')
  , fs                = require('fs')
  , path              = require('path')
  , reqCheck          = require('../lib/reqCheck')
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
    if (!reqCheck(req)) {
      req.hasData = true;
      req.data = {
        message: 'It works!'
      }
      next();
    } else {
      next();
    }
  }
}

module.exports = RootController;
