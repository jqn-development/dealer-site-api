// app/routes/index.js

const
  _                   = require('../lib/lodashExt')
  , fs                = require('fs')
  , path              = require('path')
  , moment            = require('moment')
  , sequelize         = require('sequelize')
  , winston           = require('winston')
;

module.exports = function(app, dbconn, models, log) {
  app.get('/dealer/:dealerID/vehicles', function(req, res) {
    let V = new models.Vehicle(dbconn, log)
    let data = V.model.findAll({
      where: {
        dealerID: req.params.dealerID
      }
    });
    res.json({
      message: 'It works!',
      callID: req.callID
    });
  });

  app.get('/dealer/:dealerID/vehicle/:vehicleID', function(req, res) {
    let V = new models.Vehicle(dbconn, log)
    let data = V.model.findById(req.params.vehicleID);

    res.json({
      message: 'It works!',
      callID: req.callID
    });
  });
}
