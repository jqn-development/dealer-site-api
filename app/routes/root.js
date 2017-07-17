// app/routes/root.js

const
  _                   = require('../lib/lodashExt')
;

module.exports = function(app, controllers, log) {

  // Handles the logic when the '/' endpoint is touched
  app.get('/', controllers.RootController.handleRoot);

}
