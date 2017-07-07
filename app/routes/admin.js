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

  // admin Create Site
  //app.post('/admin/createSite', controllers.AdminController.createAPIKey.bind(controllers.AdminController));
  //app.post('/admin/createSite/:dealerID', controllers.AdminController.createAPIKey.bind(controllers.AdminController));

  // admin Delete Site
  //app.post('/admin/deleteSite', controllers.AdminController.createAPIKey.bind(controllers.AdminController));
  //app.post('/admin/deleteSite/:dealerID', controllers.AdminController.createAPIKey.bind(controllers.AdminController));

  // admin flush cache
  //app.post('/admin/flushCache', controllers.AdminController.createAPIKey.bind(controllers.AdminController));

  // admin Permissions assignment
  //app.post('/admin/grantSitePermissions', controllers.AdminController.createAPIKey.bind(controllers.AdminController));
  //app.post('/admin/revokeSitePermissions', controllers.AdminController.createAPIKey.bind(controllers.AdminController));

}
