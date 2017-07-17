// app/routes/admin.js

const
  _                   = require('../lib/lodashExt')
;

module.exports = function(app, controllers, log) {

  // admin Create API Key
  app.post('/admin/createAPIKey', controllers.AdminController.createAPIKey.bind(controllers.AdminController));

  // admin Create Site
  app.post('/admin/createSite', controllers.AdminController.createSite.bind(controllers.AdminController));
  app.post('/admin/createSite/:dealerID', controllers.AdminController.createSite.bind(controllers.AdminController));

  // admin Update Site
  app.post('/admin/updateSite', controllers.AdminController.updateSite.bind(controllers.AdminController));
  app.post('/admin/updateSite/:siteID', controllers.AdminController.updateSite.bind(controllers.AdminController));

  // admin Delete Site
  app.post('/admin/deleteSite', controllers.AdminController.deleteSite.bind(controllers.AdminController));
  app.post('/admin/deleteSite/:siteID', controllers.AdminController.deleteSite.bind(controllers.AdminController));

  // admin Get Permission
  app.post('/admin/getPermissions', controllers.AdminController.getPermissions.bind(controllers.AdminController));

  // admin flush cache
  app.post('/admin/flushCache', controllers.AdminController.flushCache.bind(controllers.AdminController));

  // admin Permissions assignment
  app.post('/admin/grantSitePermissions', controllers.AdminController.grantSitePermissions.bind(controllers.AdminController));
  app.post('/admin/revokeSitePermissions', controllers.AdminController.revokeSitePermissions.bind(controllers.AdminController));

  // Catch any other /admin requests that do not match
  app.get('/admin/*', controllers.StubController.action.bind(controllers.StubController));
}
