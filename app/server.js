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
  , DBConn            = require('./lib/dbconn')
  , respCodes         = require('./lib/respCodes')

  , config            = require('../config/config')
;

let server = {};

// ****************************************************************************
//  Server Class
// ***************************************************************************/
class Server {
  constructor(config) {
    this.app = express();  // Setup Express
    this.server = {};
    this.config = config;
    this.port = config.server.port || 8080;  // Configure the port number
    this.router = {};
    this.logger = {};
    this.log = {};
    this.dbconn = {};
    this.models = {};
    this.controllers = {};
    this.cli = false;
  }

  // ****************************************************************************
  //  Server Shutdown Logic
  // ***************************************************************************/
  handleSIGTERM() {
   this.close(15);
  }

  handleSIGINT() {
    this.close(2);
  }

  close(code) {
    let sigCode;
    code = code || 0;
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

    // Perform gracful shutdown here
    this.log.info(`Received exit code ${sigCode}, performing graceful shutdown`);
    if (_.hasValue(this.dbconn)) this.dbconn.close();     // Close DB Connection
    if (_.hasValue(this.server)) this.server.close();     // Close HTTP Server

    // Only end the process if this was started on the command line
    if (this.cli) {
      process.exit(code);
    }
  }

  // ****************************************************************************
  //  Middleware functions
  // ***************************************************************************/
  sendError(err, req, res) {
    let code = req.respCode || 500001;
    let error = respCodes[code];
    let errorBlock = {
      summary: error.summary,
      message: error.message,
    };
    if (_.hasValue(err)) errorBlock.details = err;
    req.hasError = true;
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
    if (_.hasValue(req.count)) respBlock.count = req.count;
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

  logRequest(req, res, next) {
    this.log.debug(`Received Request -- ${req.callID}`);
    this.log.info(req)
    next();
  }

  logErrors(err, req, res, next) {
    this.log.debug("Logging Errors");
    this.log.error(err);
    next(err);
  }

  errorHandler(err, req, res, next) {
    this.log.debug("Error Handler");
    if ( _.isUnset(req.respCode) ) req.respCode = 500001;
    this.sendError(err, req, res);
  }

  responseHandler(req, res, next) {
    this.log.debug("Response Handler");
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

  // ****************************************************************************
  // Server Initialization Logic
  // ***************************************************************************/
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
      console.log('Creating log folder');
      fs.mkdirSync(config.logging.logDir);
    }
    this.logger = new Logger(config);
    this.log = this.logger.log;
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
    this.controllers = require('./controllers')(this.dbconn, this.models, this.log);

    // bind middleware to use for all requests
    // The 'bind' statements are there to preserve the scope of this class
    app.use(this.attachCallID.bind(this));
    app.use(this.controllers.AuthController.authenticateRequest.bind(this.controllers.AuthController));

    // Setup the base server application namespace '/site'
    app.use('/site', this.router);

    // Load routes
    require('./routes')(this.router, this.controllers, this.log);

    // middleware for general handling of route responses
    app.use(this.logRequest.bind(this));
    app.use(this.logErrors.bind(this));
    app.use(this.errorHandler.bind(this));
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
  server.cli = true;
}

module.exports = Server;
