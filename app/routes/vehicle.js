// app/routes/vehicle.js

const
  _                   = require('../lib/lodashExt')
  , fs                = require('fs')
  , path              = require('path')
  , moment            = require('moment')
  , sequelize         = require('sequelize')
  , winston           = require('winston')
;

module.exports = function(app, dbconn, models, log) {

  // Vehicles READ (*)
  app.get('/vehicle/*', function(req, res, next) {
    let vehicle = new models.Vehicle(dbconn, log);
    let data = vehicle.model.findAll({
      where: {
        dealerID: req.params.dealerID
      }
    });

    req.hasData = true;
    req.data = {
      message: 'It works!'
    }
    next();
  });

  // Vehicles READ (*)
  app.get('/vehicle/*/:page', function(req, res, next) {
    let vehicle = new models.Vehicle(dbconn, log);
    let data = vehicle.model.findAll({
      where: {
        dealerID: req.params.dealerID
      }
    });

    req.hasData = true;
    req.data = {
      message: 'It works!'
    }
    next();
  });

  // Vehicle READ
  app.get('/vehicle', function(req, res, next) {
    let vehicle = new models.Vehicle(dbconn, log);
    let data = vehicle.model.findById(req.params.vehicleID);

    req.hasData = true;
    req.data = {
      message: 'It works!'
    }
  });

  // Vehicle READ
  app.get('/vehicle/:vehicleID', function(req, res, next) {
    let vehicle = new models.Vehicle(dbconn, log);
    let data = vehicle.model.findById(req.params.vehicleID);

    req.hasData = true;
    req.data = {
      message: 'It works!'
    }
  });
}
