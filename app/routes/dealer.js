// app/routes/dealer.js

const
  _                   = require('../lib/lodashExt')
;

module.exports = function(app, controllers, log) {

  // Dealer READ
  app.get('/dealer', controllers.DealerController.read.bind(controllers.DealerController));
  app.get('/dealer/:dealerID', controllers.DealerController.read.bind(controllers.DealerController));

  // Dealer Update
  app.put('/dealer', controllers.DealerController.update.bind(controllers.DealerController));
  app.put('/dealer/:dealerID', controllers.DealerController.update.bind(controllers.DealerController));

}
