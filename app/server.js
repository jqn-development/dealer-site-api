// app/server.js

// Dependencies
const
  _                   = require('./lib/lodashExt')
  , http              = require('http')
  , https             = require('https')
  , moment            = require('moment')
  , uuidv4            = require('uuid/v4')

  , express           = require('express')
  , bodyParser        = require('body-parser')

  , DBConn            = require('./lib/dbconn')
  , respCodes         = require('./lib/respCodes')
  , Cache             = require('./lib/cache')
;

let server = {};

/**
 * @class Server
 * @classdesc Server Class
 */
class Server {
  constructor(config, log) {
    this.app = express();  // Setup Express
    this.server = {};
    this.config = config;
    // Set the default port number
    this.port = config.server.port || 8080;  // Configure the port number
    this.isActive = false;

    this.log = log;
    this.dbconn = null;
    this.cache = null;

    this.router = {};
    this.models = {};
    this.controllers = {};
    // TODO: Add Timeout error handling
  }

  // ****************************************************************************
  //  Server Shutdown Logic
  // ***************************************************************************/
  close() {
    // Perform gracful shutdown here
    if (_.hasValue(this.cache)) {
      this.log.debug(`Closing connection to Redis Cache`);
      this.cache.close()
      .then(() => {})
      .catch((err) => {});
    }

    if (_.hasValue(this.dbconn)) {
      this.log.debug(`Closing connection to Database`);
      this.dbconn.close();
    }

    if (_.hasValue(this.server)) {
      this.log.debug(`Shutting down HTTP listener`);
      this.server.close();
    }
    this.isActive = false;
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
      timestamp: req.timestamp,
      ip: req.ip,
      ipForwarding: req.ips
    };
    if (_.hasValue(req.data)) respBlock.data = req.data;
    if (_.hasValue(req.count)) respBlock.count = req.count;
    if (_.hasValue(req.error)) respBlock.error = req.error;

    res.status(respInfo.status);
    res.send(respBlock);
  }

  attachCallID(req, res, next) {
    // Generate CallID attach to the request object
    let now = moment();
    req.callID = uuidv4();
    req.time = now.format() + "Z";
    req.timestamp = now.format('x');
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
    this.log.error(req);
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
    this.setupDBConnection();
    this.setupCache();
    this.setupServer(this.app);
    this.isActive = true;
  }

  setupDBConnection() {
    this.dbconn = new DBConn(this.config, this.log);
    this.dbconn.connect();
  }

  setupCache() {
    this.cache = new Cache(this.config, this.log);
    this.cache.connect();
  }

  setupServer(app) {
    this.log.debug('Starting server');

    // configure app to use bodyParser()
    // this will let us get the data from a POST
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    // Create the router and routes for the API
    this.router = express.Router();

    // Load models
    this.models = require('./models')(this.log);

    // Load controllers
    this.controllers = require('./controllers')(this.dbconn, this.models, this.cache, this.log);

    // bind middleware to use for all requests
    // The 'bind' statements are there to preserve the scope of this class
    app.use(this.attachCallID.bind(this));
    app.use(this.controllers.AuthController.authenticateRequest.bind(this.controllers.AuthController));

    // Setup the base server application namespace, if it has one
    // This is '/site' in local testing
    app.use(this.config.server.namespace, this.router);

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
    this.log.debug('Listening on port ' + this.port);
  }
}

module.exports = Server;
