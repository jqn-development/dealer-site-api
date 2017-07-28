// app/routes/utils.js

const
  _                   = require('../lib/lodashExt')
;

module.exports = function(app, controllers, log) {

  // util READ
  app.get('/util/*', controllers.StubController.action.bind(controllers.StubController));

}
