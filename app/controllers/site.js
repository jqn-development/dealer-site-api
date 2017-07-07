// app/controllers/site.js

const
  _                   = require('../lib/lodashExt')
  , fs                = require('fs')
  , path              = require('path')
  , moment            = require('moment')
  , sequelize         = require('sequelize')
  , winston           = require('winston')
  , reqCheck          = require('../lib/reqCheck')
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
  constructor(dbconn, models, log) {
    this.log = log;
    this.model = new models.Vehicle(dbconn, log).model;
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
