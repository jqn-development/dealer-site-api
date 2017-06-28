// app/controllers/vehicle.js

const
  _                   = require('../lib/lodashExt')
  , fs                = require('fs')
  , path              = require('path')
  , moment            = require('moment')
  , sequelize         = require('sequelize')
  , winston           = require('winston')
;

class VehicleController {
  constructor(models, log) {
    this.models = models;
    this.log = log;
  }
}

module.exports = VehicleController;
