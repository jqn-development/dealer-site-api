// app/controllers/index.js

const
  _                 = require('lodash')
  , fs                = require('fs')
  , path              = require('path')
;

let controllers = {};

/*
 * This iterates through all .js files in the routes folder and loads them in
 * to the `controllers`` object. The purpose of this is to separate each of
 * the controller logics into its own file class for easie maintainability of the code.
 *
 * The `controller` object is returned to the paired `require('thisLib')` statement
 * inside the host code.
 */

module.exports = (dbconn, models, log) => {
   log.info("Loading controllers...");
   fs.readdirSync(__dirname)
     .filter(function(file) {
       return (file.substr(-3) === '.js') && (file.indexOf(".") !== 0) && (file !== "index.js");
     })
     .forEach(function(file) {
       cls = require(path.join(__dirname, file));
       log.info(`Loading controller: '${cls.name}'`);
       controllers[cls.name] = new cls(dbconn, models, log);
     });
   return controllers;
 }
