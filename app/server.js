// Dependencies
const
  _                 = require('lodash'),
  fs                = require('fs'),
  http              = require('http'),
  https             = require('https'),
  moment            = require('moment'),
  uuid              = require('uuid'),
  test              = require('unit.js'),
  logger            = require('./lib/logger'),

  aws               = require('aws-sdk'),
  dynamo            = require('dynamodb'),

  express           = require('express'),
  bodyParser        = require('body-parser'),

  config            = require('../config/config')
;

let app = express();  // Setup Express
let port = config.server.port || 8080;  // Configure the port number
let router;
let log;

// Handles the logic when the '/' endpoint is touched
function root(req, res) {
  res.json({
    message: 'It works!'
  });
}

function setupLogging() {
  log = new logger(config).log;
}

function main() {
  setupLogging();

  // configure app to use bodyParser()
  // this will let us get the data from a POST
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // Create the router and routes for the API
  router = express.Router();

  // Test Root Route
  router.get('/', root);

  // TODO: More Routes here

  // Setup the base server application
  app.use('/site', router);

  // Start the server
  app.listen(port)
  log.info('Listening on port ' + port);
}


main();
