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
  app.post('/admin/createSite', controllers.StubController.action.bind(controllers.StubController));
  app.post('/admin/createSite/:dealerID', controllers.StubController.action.bind(controllers.StubController));

  // admin Delete Site
  app.post('/admin/deleteSite', controllers.StubController.action.bind(controllers.StubController));
  app.post('/admin/deleteSite/:dealerID', controllers.StubController.action.bind(controllers.StubController));

  // admin flush cache
  app.post('/admin/flushCache', controllers.AdminController.flushCache.bind(controllers.AdminController));

  // admin Permissions assignment
  app.post('/admin/grantSitePermissions', controllers.StubController.action.bind(controllers.StubController));
  app.post('/admin/revokeSitePermissions', controllers.StubController.action.bind(controllers.StubController));

}
