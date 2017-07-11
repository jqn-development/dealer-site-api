// test/index.js

let
  fs                = require('fs')
  , path              = require('path')
  , request           = require('supertest')
  , test              = require('unit.js')
  , assert            = require('assert')
  , config            = require('../config/config')
;

/*
 * This iterates through all .js files in the test folder and loads them in
 * the mocha test runner. The purpose of this is to allow for the separation of
 * unit tests based on the logic of each model for easier maintainability of the
 * unit test code.
 *
 */

console.log("Loading Tests...");
fs.readdirSync(__dirname)
  .filter(function(file) {
    return (file.substr(-3) === '.js') && (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    let name = file.substr(0, file.indexOf('.'));
    console.log(`Loading Test: '${name}'`);
    require(path.join(__dirname, file));
  });
