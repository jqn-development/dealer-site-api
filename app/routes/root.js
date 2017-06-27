// app/routes/root.js

const
  _                 = require('../lib/lodashExt')
  , fs                = require('fs')
  , path              = require('path')
  , moment            = require('moment')
  , sequelize         = require('sequelize')
  , winston           = require('winston')
;

module.exports = function(app, dbconn, models, log) {

  // Handles the logic when the '/' endpoint is touched
  app.get('/', function(req, res) {
    res.json({
      message: 'It works!'
      , callID: req.callID
    });
  });
}
