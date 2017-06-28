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
  , respCodes         = require('./lib/respCodes')

  , config            = require('../config/config')
;

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
    this.models = {};
    this.controllers = {};
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
    let code = req.respCode || 500001;
    let error = respCodes[code];
    let errorBlock = {
      summary: error.summary,
      message: error.message,
    };
    if (_.hasValue(err)) errorBlock.details = JSON.stringify(err);
    req.error = errorBlock;
    req.respCode = code;
    this.sendResponse(req,res);
  }

  sendResponse(req, res) {
    let code = req.respCode || 200000;
    let respInfo = respCodes[code];
    let respBlock = {
      respCode: code,
      status: respInfo.status,
      callID: req.callID,
      time: req.time,
      timestamp: req.timestamp
    };
    if (_.hasValue(req.data)) respBlock.data = req.data;
    if (_.hasValue(req.error)) respBlock.error = req.error;

    res.status(respInfo.status);
    res.send(respBlock);
  }

  attachCallID(req, res, next) {
    // Generate CallID attach to the request object
    req.callID = uuidv4();
    req.time = moment().format() + "Z";
    req.timestamp = moment().format('x');
    req.hasData = false;
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
    if ( _.isUnset(req.respCode) ) req.respCode = 500001;
    this.sendError(err, req, res);
  }

  responseHandler(req, res, next) {
    if ((req.hasData === true) && (_.hasValue(req.data))) {
      this.sendResponse(req, res);
    } else {
      next();
    }
  }

  handle404Error(req, res, next) {
    req.respCode = 404000;
    this.sendError(null, req, res);
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
    this.log.info('Starting server');

    // configure app to use bodyParser()
    // this will let us get the data from a POST
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    // Create the router and routes for the API
    this.router = express.Router();

    // Load models
    this.models = require('./models')(this.log);

    // Load controllers
    this.controllers = require('./controllers')(this.log);

    // bind middleware to use for all requests
    // The 'bind' statements are there to preserve the scope of this class
    app.use(this.attachCallID.bind(this));
    app.use(this.authenticateRequest.bind(this));
    app.use(this.logRequest.bind(this));
    app.use(this.logErrors.bind(this));
    app.use(this.clientErrorHandler.bind(this));
    app.use(this.errorHandler.bind(this));

    // Setup the base server application namespace '/site'
    app.use('/site', this.router);

    // Load routes
    require('./routes')(this.router, this.dbconn, this.models, this.log);

    // middleware for general handling of route responses
    app.use(this.responseHandler.bind(this));

    // middleware for no route (404) error
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
