// app/controllers/dealer.js

const
  _                   = require('../lib/lodashExt')
  , ReqUtils          = require('../lib/reqUtils')
;

/**
 * @example
 * let dealerController = new DealerController(dbconn, models, logger)
 */
class DealerController {
  /**
   * @param {DBConn} dbconn - Database connection object.
   * @param {!Object} models - The object containing all the models.
   * @param {Logger} log - The output logger.
   */
  constructor(dbconn, models, log) {
    this.log = log;
    this.model = new models.Dealer(dbconn, log).model;
  }

  read(req, res, next) {
    let reqUtils = new ReqUtils(req);

    if (!reqUtils.hasResponse()) {
      // Get the dealer ID from the params, form body, headers, query string, or session.
      let dealerID = req.params.dealerID || req.body.dealerID || req.headers.dealerid || req.query.dealerID || req.dealerID;

      // Check Required parameters
      let reqParams = reqUtils.hasRequiredParams({dealerID: dealerID});
      if (reqParams.length > 0) {
        // We have missing parameters, report the error
        reqUtils.setError(400003);
        // Return an error below
        next(`Required parameters [${reqParams}] are missing from this request.`);
        return;
      }

      // TODO: Add parameter validation and SQL Injection checking where needed


      try {
        this.model.findById(dealerID)
        .then((dealer) => {
          if (!dealer) {
            reqUtils.setError(400002);
            next(`The 'dealerID': '${dealerID}' does not exist.`);
          } else {
            reqUtils.setData(dealer);
            next();
          }
        })
        .catch((err) => {
          reqUtils.setError(500001);
          next(err);
        });
      } catch (err) {
        reqUtils.setError(500001);
        next(err);
      }
    } else {
      next();
    }
  }

  update(req, res, next) {
    let reqUtils = new ReqUtils(req);

    if (!reqUtils.hasResponse()) {
      // Get the dealer ID from the params, form body, headers, query string, or session.
      let dealerID = req.params.dealerID || req.body.dealerID || req.headers.dealerid || req.query.dealerID || req.dealerID;

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

      // TODO: Add parameter validation and SQL Injection checking where needed
      try {
        this.model.findById(dealerID)
        .then((dealer) => {
          if (!dealer) {
            req.hasError = true;
            req.respCode = 400002;
            next(`The 'dealerID': '${dealerID}' does not exist.`);
          } else {
            req.hasData = true;
            req.data = dealer;
            next();
          }
        })
        .catch((err) => {
          req.hasError = true;
          req.respCode = 500001;
          next(err);
        });
      } catch (err) {
        req.hasError = true;
        req.respCode = 500001;
        next(err);
      }
    } else {
      next();
    }
  }

}

module.exports = DealerController;
