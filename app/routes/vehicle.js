// app/routes/vehicle.js

const
  _                   = require('../lib/lodashExt')
;

module.exports = function(app, controllers, log) {

  // Vehicles READ (*)
  app.get('/vehicle/all', controllers.VehicleController.list.bind(controllers.VehicleController));
  app.get('/vehicle/all/:page', controllers.VehicleController.list.bind(controllers.VehicleController));
  app.get('/vehicle/all/:page/:limit', controllers.VehicleController.list.bind(controllers.VehicleController));

  // Vehicle READ
  app.get('/vehicle', controllers.VehicleController.read.bind(controllers.VehicleController));
  app.get('/vehicle/:vehicleID', controllers.VehicleController.read.bind(controllers.VehicleController));

}
