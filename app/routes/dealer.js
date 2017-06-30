// app/routes/dealer.js

const
  _                   = require('../lib/lodashExt')
  , fs                = require('fs')
  , path              = require('path')
  , moment            = require('moment')
  , sequelize         = require('sequelize')
  , winston           = require('winston')
;

module.exports = function(app, controllers, log) {
  // Dealer Info READ
  app.get('/dealer/:dealerID', function(req, res, next) {
    let dealer = new models.Dealer(dbconn, log);
    let data = dealer.model.findById(dealerID);

    req.hasData = true;
    req.data = {
      message: 'It works!'
    }
    next();
  });

  // Dealer Info UPDATE
  app.put('/dealer/:dealerID', function(req, res, next) {
    let dealer = new models.Dealer(dbconn, log);
    let data = dealer.model.findById(dealerID);

    req.hasData = true;
    req.data = {
      message: 'It works!'
    }
    next();
  });

  // Dealer Vehicles READ (*)
  app.get('/dealer/:dealerID/vehicles', function(req, res, next) {
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

  // Dealer Specific Vehicle READ
  app.get('/dealer/:dealerID/vehicle/:vehicleID', function(req, res, next) {
    let vehicle = new models.Vehicle(dbconn, log);
    let data = vehicle.model.findById(req.params.vehicleID);

    req.hasData = true;
    req.data = {
      message: 'It works!'
    }
  });

  // Dealer Config READ
  app.get('/dealer/:dealerID/config', function(req, res, next) {
    let dealer = new models.Dealer(dbconn, log);
    let data = dealer.model.findById(dealerID);

    req.hasData = true;
    req.data = {
      message: 'It works!'
    }
  });
}
