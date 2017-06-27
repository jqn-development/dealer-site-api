// server.js

// Dependencies
const
  _                   = require('lodash')
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
  , DBConn            = require('./lib/dbConn')
  , errInfo           = require('./lib/errInfo')

  , config            = require('../config/config')
;

let Models = {};

_.isUnset = (obj) => {
  return (_.isNull(obj) || _.isUndefined(obj));
}
_.isSet = (obj) => {
  return !(_.isUnset(obj));
}

/* ****************************************************************************
 *  Server Class
 * ***************************************************************************/
class Server {
  constructor(config) {
    this.app = express();  // Setup Express
    this.server = {};
    this.config = config;
    this.port = config.server.port || 8080;  // Configure the port number
    this.router = {};
    this.log = {};
    this.dbconn = {};

    // Setup graceful exit for SIGTERM and SIGINT
    process.on('SIGTERM', this.handleSIGTERM);
    process.on('SIGINT', this.handleSIGINT);
  }

  /* ****************************************************************************
   *  Server Shutdown Logic
   * ***************************************************************************/
  shutdown(code) {
    let sigCode;
    switch (code) {
      case 2:
        sigCode = 'SIGINT';
        break;
      case 15:
        sigCode = 'SIGTERM';
        break;
      default:
        sigCode = code;
        break;
    }
    this.log.info(`Received exit code ${sigCode}, performing graceful shutdown`);
    // TODO: Perform gracful shutdown here
    if (_.isSet(server)) server.close();
    process.exit(code);
  }

  handleSIGTERM() {
    this.shutdown(15);
  }

  handleSIGINT() {
    this.shutdown(2);
  }


  /* ****************************************************************************
   *  Middleware functions
   * ***************************************************************************/
  attachCallID(req, res, next) {
    // Generate CallID attach to the request object
    req.callID = uuidv4();
    next();
  }

  authenticateRequest(req, res, next) {
    // TODO: Parse the security information from the request and make sure the SecKey and siteID
    next();
  }

  logRequest(req, res, next) {
    // TODO: Parse the full request, make JSON object, and then log it
    this.log.info(`Received Request -- ${req.callID}`);
    next();
  }

  logErrors(err, req, res, next) {
    next(err);
  }

  clientErrorHandler(err, req, res, next) {
    next(err);
  }

  errorHandler(err, req, res, next) {
    if (_.isUnSet(req.errorCode) ) req.errorCode = 500001;
    this.sendError(err, req, res);
  }

  handle404Error(req, res, next) {
    req.errorCode = 404000;
    this.sendError(null, req, res);
  }

  sendError(err, req, res) {
    code = req.errorCode || 500001;
    error = errInfo[code];
    res.status(error.status);
    errorBlock = {
      errorStatus: error.status,
      errorCode: code,
      errorMsg: error.message,
      callID: req.callID
    };
    if (_.isSet(err)) errorBlock.error = JSON.stringify(err);
    res.send(errorBlock);
  }

  sendStatus(req, res) {

  }

  /* ****************************************************************************
   *  Server Initialization Logic
   * ***************************************************************************/
  init() {
    this.setupLogging();
    this.setupDBConnection();
    this.setupServer(this.app);
  }

  setupLogging() {
    // Create log folder if it does not already exist
    if (!fs.existsSync(config.logging.logDir)) {
      console.log('Creating log folder')
      fs.mkdirSync(config.logging.logDir);
    }
    this.log = new Logger(config).log;
  }

  setupDBConnection() {
    this.dbconn = new DBConn(this.config, this.log);
    this.dbconn.connect();
  }

  setupServer(app) {
    this.log.info('Starting server.');

    // configure app to use bodyParser()
    // this will let us get the data from a POST
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    // Create the router and routes for the API
    this.router = express.Router();

    // Load Models
    Models = require('./models')(this.log);          // load models

    // middleware to use for all requests
    app.use(this.attachCallID);
    app.use(this.authenticateRequest);
    app.use(this.logRequest);
    app.use(this.logErrors);
    app.use(this.clientErrorHandler);
    app.use(this.errorHandler);

    app.use('/site', this.router);   // Setup the base server application

    require('./routes')(this.router, this.log, Models);   // load routes

    app.use(this.handle404Error);

    // Start the server
    this.server = app.listen(this.port)
    this.log.info('Listening on port ' + this.port);
  }
}

if (require.main === module) {
  // Invoked from Command Line
  S = new Server(config);
  S.init();
} else {
  // Invoked through requires include
  module.exports = Server;
}
