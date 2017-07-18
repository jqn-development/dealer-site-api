// app/routes/dynamicField.js

const
  _                   = require('../lib/lodashExt')
;

module.exports = function(app, controllers, log) {

  // Field READ (*)
  app.get('/field/all', controllers.DynamicFieldController.list.bind(controllers.DynamicFieldController));

  // Field READ
  app.get('/field', controllers.DynamicFieldController.read.bind(controllers.DynamicFieldController));
  app.get('/field/:fieldLabel', controllers.DynamicFieldController.read.bind(controllers.DynamicFieldController));

  // Field UPDATE
  app.put('/field', controllers.DynamicFieldController.update.bind(controllers.DynamicFieldController));
  app.put('/field/:fieldLabel', controllers.DynamicFieldController.update.bind(controllers.DynamicFieldController));

  // Field CREATE
  app.post('/field', controllers.DynamicFieldController.create.bind(controllers.DynamicFieldController));
  app.post('/field/:fieldLabel', controllers.DynamicFieldController.create.bind(controllers.DynamicFieldController));

  // Field DELETE
  app.delete('/field', controllers.DynamicFieldController.delete.bind(controllers.DynamicFieldController));
  app.delete('/field/:fieldLabel', controllers.DynamicFieldController.delete.bind(controllers.DynamicFieldController));


}
