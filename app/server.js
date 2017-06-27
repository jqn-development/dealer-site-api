// server.js

// Dependencies
const
  _                   = require('./lib/lodashExt')
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
let server = {};

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
  }

  /* ****************************************************************************
   *  Server Shutdown Logic
   * ***************************************************************************/
  handleSIGTERM() {
   this.close(15);
  }

  handleSIGINT() {
    this.close(2);
  }

  close(code) {
    let sigCode;
    if (_.isUnset(code)) code = 0;
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
    if (_.hasValue(server)) this.server.close();
    process.exit(code);
  }

  /* ****************************************************************************
   *  Middleware functions
   * ***************************************************************************/
   sendError(err, req, res) {
     let code = req.errorCode || 500001;
     let error = errInfo[code];
     let errorBlock = {
       errorStatus: error.status,
       errorCode: code,
       errorMsg: error.message,
       callID: req.callID
     };
     if (_.hasValue(err)) errorBlock.error = JSON.stringify(err);
     res.status(error.status);
     res.send(errorBlock);
   }

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
    if (_.isUnset(req.errorCode) ) req.errorCode = 500001;
    this.sendError(err, req, res);
  }

  handle404Error(req, res, next) {
    req.errorCode = 404000;
    this.sendError(null, req, res);
  }

  sendStatus(req, res) {

  }

  /* ****************************************************************************
   *  Server Initialization Logic
   * ***************************************************************************/
  init() {
    // Setup graceful exit for SIGTERM and SIGINT
    process.on('SIGTERM', this.handleSIGTERM.bind(this));
    process.on('SIGINT', this.handleSIGINT.bind(this));

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
    // The 'bind' statements are there to preserve the context
    app.use(this.attachCallID.bind(this));
    app.use(this.authenticateRequest.bind(this));
    app.use(this.logRequest.bind(this));
    app.use(this.logErrors.bind(this));
    app.use(this.clientErrorHandler.bind(this));
    //app.use(this.errorHandler);

    app.use('/site', this.router);   // Setup the base server application

    require('./routes')(this.router, this.dbconn, Models, this.log);   // load routes

    app.use(this.handle404Error.bind(this));

    // Start the server
    this.server = app.listen(this.port)
    this.log.info('Listening on port ' + this.port);
  }
}

if (require.main === module) {
  // Invoked from Command Line
  server = new Server(config);
  server.init();
} else {
  // Invoked through requires include
  module.exports = Server;
}
