// server.js

// Dependencies
const
  _                 = require('lodash')
  , fs                = require('fs')
  , http              = require('http')
  , https             = require('https')
  , moment            = require('moment')
  , uuidv4            = require('uuid/v4')
  , test              = require('unit.js')
  , crypto            = require('crypto')

  , express           = require('express')
  , bodyParser        = require('body-parser')

  , Logger            = require('./lib/logger')
  , DBConn            = require('./lib/dbconn')

  , config            = require('../config/config')
;

let Models = {};
let Routes = {};
let app = express();  // Setup Express

_.isUnset = (obj) => {
  return (_.isNull(obj) || _.isUndefined(obj));
}
_.isSet = (obj) => {
  return !(_.isUnset(obj));
}


let server;
let port = config.server.port || 8080;  // Configure the port number
let router;
let log;
let dbconn;

function handleSigterm() {
  shutdown(15);
}

function handleSigint() {
  shutdown(2);
}

function shutdown(code) {
  let sigCode = code;
  switch (code) {
    case 2:
      sigCode = 'SIGINT';
      break;
    case 15:
      sigCode = 'SIGTERM';
      break;
  }
  log.info(`Received exit code ${sigCode}, performing graceful shutdown`);
  // TODO: Perform gracful shutdown here
  if (_.isSet(server)) server.close();
  process.exit(code);
}

function setupLogging() {
  // Create log folder if it does not already exist
  if (!fs.existsSync(config.logging.logDir)) {
    console.log('Creating log folder')
    fs.mkdirSync(config.logging.logDir);
  }
  log = new Logger(config).log;
}

function setupDBConnection() {
  dbconn = new DBConn(config, log);
  dbconn.connect();
}

/* ****************************************************************************
 *  Middleware functions
 * ***************************************************************************/
function attachCallID(req, res, next) {
  // Generate CallID attach to the request object
  req.callID = uuidv4();
  next();
}

function authenticateRequest(req, res, next) {
  // TODO: Parse the security information from the request and make sure the SecKey and siteID
  next();
}

function logRequest(req, res, next) {
  // TODO: Parse the full request, make JSON object, and then log it
  log.info(`Received Request -- ${req.callID}`);
  next();
}

function logErrors(err, req, res, next) {
  next(err);
}

function clientErrorHandler(err, req, res, next) {
  next(err);
}

function errorHandler(err, req, res, next) {
  if (_.isUnSet(req.errorStatus) ) req.errorStatus = 500;
  if (_.isUnSet(req.errorCode) ) req.errorCode = 500001;
  sendError(err, req, res);
}

function handle404Error(req, res, next) {
  req.errorStatus = 404;
  req.errorCode = 404000;
  req.errorMsg = "The resource requested does not exist or you are not authorized to access it.";
  sendError(null, req, res);
}

function sendError(err, req, res) {
  res.status(req.errorStatus || 500);
  errorBlock = {
    errorStatus: req.errorStatus,
    errorCode: req.errorCode,
    errorMsg: req.errorMsg || "General Server Error",
    callID: req.callID
  };
  if (_.isSet(err)) errorBlock.error = JSON.stringify(err);
  res.send(errorBlock);
}

/* ****************************************************************************
 *  Main
 * ***************************************************************************/
function main() {
  setupLogging();
  setupDBConnection();

  // Setup graceful exit for SIGTERM and SIGINT
  process.on('SIGTERM', handleSigterm);
  process.on('SIGINT', handleSigint);

  log.info('Starting server.');

  // configure app to use bodyParser()
  // this will let us get the data from a POST
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // Create the router and routes for the API
  router = express.Router();

  // Load Models
  Models = require('./models')(log);     // load models

  // middleware to use for all requests
  app.use(attachCallID);
  app.use(authenticateRequest);
  app.use(logRequest);
  app.use(logErrors);
  app.use(clientErrorHandler);
  app.use(errorHandler);

  app.use('/site', router);   // Setup the base server application

  require('./routes')(router, log, Models);               // Load routes

  app.use(handle404Error);

  // Start the server
  server = app.listen(port)
  log.info('Listening on port ' + port);
}

main();
