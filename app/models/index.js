// app/models/index.js

const
  _                 = require('lodash')
  , fs                = require('fs')
  , path              = require('path')
;

let model = {};

/*
 * This iterates through all .js files in the routes folder and loads them in
 * to the `model`` object. The purpose of this is to separate each of
 * the model logics into its own file class for easie maintainability of the code.
 *
 * The `model` object is returned to the paired `require('thisLib')` statement
 * inside the host code.
 */

module.exports = (log) => {
  log.info("Loading data models...");
  fs.readdirSync(__dirname)
    .filter(function(file) {
      return (file.substr(-3) === '.js') && (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
      cls = require(path.join(__dirname, file));
      log.info(`Loading model: '${cls.name}'`);
      model[cls.name] = cls;
    });
  return model;
}
