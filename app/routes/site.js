// app/routes/site.js

const
  _                   = require('../lib/lodashExt')
;

module.exports = function(app, controllers, log) {

  // config READ
  app.get('/config', controllers.SiteController.read.bind(controllers.SiteController));
  app.get('/config/:siteID', controllers.SiteController.read.bind(controllers.SiteController));

  // config UPDATE
  app.put('/config', controllers.SiteController.update.bind(controllers.SiteController));
  app.put('/config/:siteID', controllers.SiteController.update.bind(controllers.SiteController));

}
