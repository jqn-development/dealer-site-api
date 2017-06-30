// app/controllers/vehicle.js

const
  _                   = require('../lib/lodashExt')
  , fs                = require('fs')
  , path              = require('path')
  , moment            = require('moment')
  , sequelize         = require('sequelize')
  , winston           = require('winston')
  , reqCheck          = require('../lib/reqCheck')
;

class VehicleController {
  constructor(dbconn, models, log) {
    this.log = log;
    this.model = new models.Vehicle(dbconn, log).model;
  }

  read(req, res, next) {
    if (!reqCheck(req)) {
      // Get the vehicle ID from the params or form body
      // Or the dealerID from the authenticated request
      let vehicleID = req.headers.vehicleid || req.body.vehicleID || req.params.vehicleID;
      let dealerID = req.headers.dealerid || req.body.dealerID || req.dealerID;

      // Check Required parameters
      let reqParams = [];
      // Missing parameters
      if (_.isUnset(vehicleID)) reqParams.push('vehicleID');
      if (_.isUnset(dealerID)) reqParams.push('dealerID');
      if (reqParams.length > 0) {
        // We have missing parameters, report the error
        req.hasError = true;
        req.respCode = 400003;
        // Return an error below
        next(`Required parameters [${reqParams}] are missing from this request.`);
        return;
      }
      // TODO: Do validation on params (SQL Injection)
      this.model.findById(vehicleID)
        .then((vehicle) => {
          if (!vehicle) {
            req.hasError = true;
            req.respCode = 400002;
            next(`The 'vehicleID': '${vehicleID}' does not exist.`);
          } else {
            // Check that the dealerID passed matches the dealerID of the vehicle
            // Return an 'unauthorized' error if it doesn't match
            if (vehicle.dealerID == dealerID) {
              req.hasData = true;
              req.data = vehicle;
              next()
            } else {
              req.hasError = true;
              req.respCode = 400001;
              // Return an error below
              next('The \'dealerID\' passed is invalid for this vehicle.');
            }
          }
        })
        .catch((err) => {
          req.hasError = true;
          req.respCode = 500000;
          next(err);
        });
    } else {
      next();
    }
  }

  list(req, res, next) {
    if (!reqCheck(req)) {
      // Get the dealer ID from the params or form body
      // Or the dealerID from the authenticated request
      let page = req.body.page || req.headers.page ||  req.params.page;
      let limit = req.body.limit || req.headers.limit;
      let dealerID = req.headers.dealerid || req.body.dealerID || req.dealerID;
      let offset;

      // Set Defaults
      page = (page < 1) ? 1 : (page || 1);        // Default to the first page and remove values under 1
      limit = (limit < 1) ? 1 : (limit || 100);   // Default to a limit of 100 rows
      offset = limit * (page - 1);                // Calculate the offset

      // Check Required parameters
      let reqParams = [];
      // Missing parameters
      if (_.isUnset(dealerID)) reqParams.push('dealerID');
      if (reqParams.length > 0) {
        // We have missing parameters, report the error
        req.hasError = true;
        req.respCode = 400003;
        // Return an error below
        next(`Required parameters [${reqParams}] are missing from this request.`);
        return;
      }
      this.log.debug("Made it here -- A");
      // TODO: Do validation on params (SQL Injection)
      let options = {
        where: {
          dealerID: dealerID
        },
        order: 'listingDate DESC',
        limit: limit
      }
      this.log.debug("Made it here -- A");
      if (_.hasValue(page)) options.offest = offset;
      this.log.debug("Made it here -- A");
      this.model.findAll(options)
        .then((vehicles) => {
          this.log.debug("Made it here -- A");
          req.hasData = true;
          if (!vehicles) {
            req.data = {};
            req.count = 0;
          }
          else {
            req.data = vehicles;
            req.count = vehicles.length;
          }
          next();
        })
        .catch((err) => {
          this.log.error("What is this error? " + JSON.stringify(err));
          req.hasError = true;
          req.respCode = 500001;
          next(err);
        });
    } else {
      next();
    }
  }
}

module.exports = VehicleController;
