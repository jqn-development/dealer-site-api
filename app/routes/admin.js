// app/routes/admin.js

const
  _                   = require('../lib/lodashExt')
  , fs                = require('fs')
  , path              = require('path')
  , moment            = require('moment')
  , sequelize         = require('sequelize')
  , winston           = require('winston')
;

module.exports = function(app, controllers, log) {

  // admin Create API Key
  app.post('/admin/createAPIKey', controllers.AdminController.createAPIKey.bind(controllers.AdminController));

  // admin Create siteConfig
  app.post('/admin/createSite', controllers.AdminController.createAPIKey.bind(controllers.AdminController));
}
