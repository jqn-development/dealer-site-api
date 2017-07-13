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
   constructor(dbconn, models, cache, log) {
    this.log = log;
    this.model = new models.Dealer(dbconn, log).model;
  }

  read(req, res, next) {
    let reqUtils = new ReqUtils(req);

    reqUtils.handleRequest({
      params: {
        dealerID: { type: 'int', source: ['params', 'body', 'headers', 'query'], required: true }
      },
      security: { client: true }
    },
    (req, res, next) => {
      this.model.findById(req.locals.dealerID)
      .then((dealer) => {
        if (!dealer) {
          reqUtils.setError(400002);
          next(`The 'dealerID': '${req.locals.dealerID}' does not exist.`);
        } else {
          reqUtils.setData(dealer);
          next();
        }
      })
      .catch((err) => {
        reqUtils.setError(500001);
        next(err);
      });
    }, next, res);
  }

  update(req, res, next) {
    let reqUtils = new ReqUtils(req);

    reqUtils.handleRequest({
      params: {
        dealerID: { type: 'int', source: ['params', 'body', 'headers', 'query'], required: true }
      },
      security: { server: true }
    },
    (req, res, next) => {
      // TODO: Dealer Update Logic
    }, next, res);
  }

}

module.exports = DealerController;
