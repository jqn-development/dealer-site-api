// app/controllers/dealer.js

const
  _                   = require('../lib/lodashExt')
  , fs                = require('fs')
  , path              = require('path')
  , reqCheck          = require('../lib/reqCheck')
;

class DealerController {
  constructor(dbconn, models, log) {
    this.log = log;
    this.model = new models.Vehicle(dbconn, log).model;
  }
}

module.exports = DealerController;
