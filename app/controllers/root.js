// app/controllers/root.js

const
  _                   = require('../lib/lodashExt')
  , fs                = require('fs')
  , path              = require('path')
  , reqCheck          = require('../lib/reqCheck')
;

class RootController {
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
