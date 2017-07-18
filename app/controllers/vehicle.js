// app/controllers/vehicle.js

const
  _                   = require('../lib/lodashExt')
  , ReqUtils          = require('../lib/reqUtils')
;

/**
 * @example
 * let vehicleController = new VehicleController(dbconn, models, logger)
 */
class VehicleController {
  /**
   * @param {DBConn} dbconn - Database connection object.
   * @param {!Object} models - The object containing all the models.
   * @param {Logger} log - The output logger.
   */
  constructor(dbconn, models, cache, log) {
    this.log = log;
    this.model = new models.Vehicle(dbconn, log).model;
  }

  read(req, res, next) {
    let reqUtils = new ReqUtils(req);

    reqUtils.handleRequest({
      params: {
        dealerID: { type: 'int', source: ['body', 'headers', 'query'], required: true },
        vehicleID: { type: 'int', source: ['params', 'body', 'headers', 'query'], required: true },
      },
      security: { client: true }
    },
    (req, res, next) => {
      this.model.findById(req.locals.vehicleID)
      .then((vehicle) => {
        if (!vehicle) {
          reqUtils.setError(400002);
          next(`The 'vehicleID': '${req.locals.vehicleID}' does not exist.`);
        } else {
          // Check that the dealerID passed matches the dealerID of the vehicle
          // Return an 'unauthorized' error if it doesn't match
          if (vehicle.dealerID == req.locals.dealerID) {
            vehicle.images = JSON.parse(vehicle.images);
            reqUtils.setData(vehicle);
            next()
          } else {
            reqUtils.setError(400001);
            // Return an error below
            next('The \'dealerID\' passed is invalid for this vehicle.');
          }
        }
      })
      .catch((err) => {
        reqUtils.setError(500001);
        next(err);
      });
    }, next, res);
  }

  list(req, res, next) {
    let reqUtils = new ReqUtils(req);

    reqUtils.handleRequest({
      params: {
        dealerID: { type: 'int', source: ['body', 'headers', 'query'], required: true },
        page: { type: 'int', source: ['params', 'body', 'headers', 'query'], required: false, default: (v) => { return Number((v < 1) ? 1 : (v || 1)) } },
        limit: { type: 'int', source: ['params', 'body', 'headers', 'query'], required: false, default: (v) => { return Number((v < 1) ? 1 : (v || 20)) } },
      },
      security: { client: true }
    },
    (req, res, next) => {
      let offset = req.locals.limit * (req.locals.page - 1);                        // Calculate the offset
      let options = {
        where: {
          dealerID: req.locals.dealerID
        },
        order: [['listingDate','DESC']],  // This MUST be a nested array
        offset: 0,
        limit: req.locals.limit,
        table: 'vehicle'
      };
      if (req.locals.page > 1) options.offset = offset;
      // TODO: Retrieve from cache
      // TODO: Add filters
      this.model.findAll(options)
      .then((vehicles) => {
        if (!vehicles) {
          reqUtils.setData({});
          req.count = 0;
        }
        else {
          reqUtils.setData(_.forEach(vehicles, (value) => {
            value.images = JSON.parse(value.images);
          }));
          req.count = vehicles.length;
        }
        next();
      })
      .catch((err) => {
        reqUtils.setError(500001);
        next(err);
      });
    }, next, res);
  }
}

module.exports = VehicleController;
