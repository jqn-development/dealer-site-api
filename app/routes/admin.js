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
  app.post('/admin/createSite', controllers.StubControler.action.bind(controllers.StubControler));
  app.post('/admin/createSite/:dealerID', controllers.StubControler.action.bind(controllers.StubControler));

  // admin Delete Site
  app.post('/admin/deleteSite', controllers.StubControler.action.bind(controllers.StubControler));
  app.post('/admin/deleteSite/:dealerID', controllers.StubControler.action.bind(controllers.StubControler));

  // admin flush cache
  app.post('/admin/flushCache', controllers.StubControler.action.bind(controllers.StubControler));

  // admin Permissions assignment
  app.post('/admin/grantSitePermissions', controllers.StubControler.action.bind(controllers.StubControler));
  app.post('/admin/revokeSitePermissions', controllers.StubControler.action.bind(controllers.StubControler));

}
