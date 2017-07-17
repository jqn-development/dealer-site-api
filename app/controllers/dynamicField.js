// app/controllers/field.js

const
  _                   = require('../lib/lodashExt')
  , ReqUtils          = require('../lib/reqUtils')
  , uuidv4            = require('uuid/v4')
;

/**
 * @example
 * let fieldController = new FieldController(dbconn, models, cache, logger)
 */
class DynamicFieldController {
  /**
   * @param {DBConn} dbconn - Database connection object.
   * @param {!Object} models - The object containing all the models.
   * @param {!Object} cache - The object containing all the cache library
   * @param {Logger} log - The output logger.
   */
  constructor(dbconn, models, cache, log) {
    this.log = log;
    this.model = new models.DynamicField(dbconn, log).model;
  }

  read(req, res, next) {
    let reqUtils = new ReqUtils(req);

    reqUtils.handleRequest({
      params: {
        fieldLabel: { type: 'string', source: ['params', 'body', 'headers', 'query'], required: true },
        dealerID: { type: 'int', source: ['body', 'headers', 'query'], required: true },
      },
      security: { client: true }
    },
    (req, res, next) => {
      let options = { where: { fieldLabel: req.locals.fieldLabel, dealerID: req.locals.dealerID } };
      this.model.findOne({ options })
      .then((field) => {
        if (!field) {
          reqUtils.setError(400002);
          next(`The field with label:'${req.locals.fieldLabel}' belonging to the 'dealerID': ${req.locals.dealerID} does not exist.`);
        } else {
          reqUtils.setData(field.dataValues);
          next()
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
      },
      security: { client: true }
    },
    (req, res, next) => {
      let options = {
        where: {
          dealerID: req.locals.dealerID
        },
        order: [['fieldLabel','ASC']],  // This MUST be a nested array
        table: 'dynamicField'
      };
      this.model.findAll({ options })
      .then((fields) => {
        if (!fields) {
          reqUtils.setData({});
          req.count = 0;
        }
        else {
          reqUtils.setData(fields);
          req.count = fields.length;
        }
        next();
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
        fieldLabel: { type: 'string', source: ['params', 'body', 'headers', 'query'], required: true },
        dealerID: { type: 'int', source: ['body', 'headers', 'query'], required: true },
        newFieldLabel: { type: 'string', source: ['body', 'headers', 'query'] },
        imageURL: { type: 'url', source: ['body', 'headers', 'query'] },
        textContent: { type: 'string', source: ['body', 'headers', 'query'] }
      },
      security: { server: true }
    },
    (req, res, next) => {
      let obj = _.omit(req.locals, ['newFieldLabel']);
      if (_.hasValue(req.locals.newFieldLabel)) obj.fieldLabel = req.locals.newFieldLabel;
      let options = { where: { fieldLabel: req.locals.fieldLabel, dealerID: req.locals.dealerID } };
      this.model.update(obj, options)
      .then((field) => {
        if (!field) {
          reqUtils.setError(400002);
          next(`The field with label:'${req.locals.fieldLabel}' belonging to the 'dealerID': ${req.locals.dealerID} does not exist.`);
        } else {
          reqUtils.setData(field.dataValues);
          next();
        }
      })
      .catch((err) => {
        reqUtils.setError(500001);
        next(err);
      });
    }, next, res);
  }

  create(req, res, next) {
    let reqUtils = new ReqUtils(req);

    reqUtils.handleRequest({
      params: {
        fieldLabel: { type: 'string', source: ['params', 'body', 'headers', 'query'], required: true },
        dealerID: { type: 'int', source: ['body', 'headers', 'query'], required: true },
        imageURL: { type: 'url', source: ['body', 'headers', 'query'] },
        textContent: { type: 'string', source: ['body', 'headers', 'query'] }
      },
      security: { server: true }
    },
    (req, res, next) => {
      let fieldID = uuidv4();
      let obj = req.locals;
      obj.dynamicFieldID = fieldID;
      this.model.create(obj)
      .then((field) => {
        if (!field) {
          reqUtils.setError(500002);
          next(`The new dynamic field could not be created.`);
        } else {
          reqUtils.setData(field.dataValues);
          next();
        }
      })
      .catch((err) => {
        reqUtils.setError(500001);
        next(err);
      });
    }, next, res);
  }

  delete(req, res, next) {
    let reqUtils = new ReqUtils(req);

    reqUtils.handleRequest({
      params: {
        fieldLabel: { type: 'string', source: ['params', 'body', 'headers', 'query'], required: true },
        dealerID: { type: 'int', source: ['body', 'headers', 'query'], required: true },
      },
      security: { server: true }
    },
    (req, res, next) => {
      let options = { where: { fieldLabel: req.locals.fieldLabel, dealerID: req.locals.dealerID } };
      this.model.destroy(options)
      .then((field) => {
        if (!field) {
          reqUtils.setError(400002);
          next(`The field with label:'${req.locals.fieldLabel}' belonging to the 'dealerID': ${req.locals.dealerID} could not be found to delete.`);
        } else {
          reqUtils.setData({ message: `Field with label:'${req.locals.fieldLabel}' belonging to the 'dealerID': ${req.locals.dealerID} was deleted.` });
          next();
        }
      })
      .catch((err) => {
        reqUtils.setError(500001);
        next(err);
      });
    }, next, res);
  }
}

module.exports = DynamicFieldController;
