// app/routes/index.js

const
  _                 = require('lodash')
  , fs                = require('fs')
  , path              = require('path')
  , moment            = require('moment')
  , sequelize         = require('sequelize')
  , winston           = require('winston')
;

/*
 * This iterates through all .js files in the routes folder and loads them in
 * the Express (`app`) application. The purpose of this is to separate each of
 * the routing logic for each of the models into its own file for easier
 * maintainability of the code.
 *
 * The `app` is passed in through a paired `require('thisLib')(app)` statement
 * inside the host code.
 */
function loadRoutes(app, log, models) {
  log.info("Loading Routes...");
  fs.readdirSync(__dirname)
    .filter(function(file) {
      return (file.substr(-3) === '.js') && (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
      let name = file.substr(0, file.indexOf('.'));
      log.info(`Loading Route: '${name}'`);
      require(path.join(__dirname, file))(app, log, models);
    });
}

module.exports = loadRoutes;
