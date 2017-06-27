// app/routes/root.js

const
  _                 = require('lodash')
  , fs                = require('fs')
  , path              = require('path')
  , moment            = require('moment')
  , sequelize         = require('sequelize')
  , winston           = require('winston')
;

module.exports = function(app, log, models) {

  // Handles the logic when the '/' endpoint is touched
  app.get('/', function(req, res) {
    res.json({
      message: 'It works!'
      , callID: req.callID
    });
  });
}