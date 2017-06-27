// app/models/customer.js

const
  _                 = require('../lib/lodashExt')
  , fs                = require('fs')
  , moment            = require('moment')
  , sequelize         = require('sequelize')
  , logger            = require('../lib/logger')
;

class Customer {
  constructor(dbconn, logger) {
    this.dbconn = dbconn;
    this.logger = logger;

    this.model = dbconn.conn.define('customer', {
        customerID:         { type: sequelize.CHAR(36), allowsNulls: false, validate: { isUUID: 4 }, primaryKey: true },
        oldClientID:        { type: sequelize.INTEGER(11), allowsNulls: true },
        dealerID:           { type: sequelize.INTEGER(11), allowsNulls: false },
        email:              { type: sequelize.STRING(255), allowsNulls: true, defaultValue: null },
        firstName:          { type: sequelize.STRING(100), allowsNulls: true },
        middleName:         { type: sequelize.STRING(100), allowsNulls: true },
        lastName:           { type: sequelize.STRING(100), allowsNulls: true },
        address:            { type: sequelize.STRING(255), allowsNulls: true },
        address2:           { type: sequelize.STRING(255), allowsNulls: true, defaultValue: null },
        city:               { type: sequelize.STRING(100), allowsNulls: true },
        regionCode:         { type: sequelize.STRING(3), allowsNulls: true },
        postalCode:         { type: sequelize.STRING(10), allowsNulls: true },
        phone:              { type: sequelize.STRING(15), allowsNulls: true },
        phoneExt:           { type: sequelize.STRING(20), allowsNulls: true },
        phoneCountryCode:   { type: sequelize.STRING(4), allowsNulls: true, defaultValue: 1 },
        phoneType:          { type: sequelize.STRING(10), allowsNulls: true },
        sms:                { type: sequelize.STRING(15), allowsNulls: true },
        smsCountryCode:     { type: sequelize.STRING(4), allowsNulls: true, defaultValue: 1 }
      }, {
        timestamps: true,
        createdAt: 'created',
        updatedAt: 'lastUpdated',
        freezeTableName: true
      }
    );
  }
}

module.exports = Customer;
