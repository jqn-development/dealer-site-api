// app/models/dealer.js

const
  _                 = require('../lib/lodashExt')
  , fs                = require('fs')
  , moment            = require('moment')
  , sequelize         = require('sequelize')
  , logger            = require('../lib/logger')
;

class Dealer {
  constructor(dbconn, logger) {
    this.dbconn = dbconn;
    this.logger = logger;

    this.model = dbconn.conn.define('dealer', {
        dealerID:                       { type: sequelize.INTEGER(11), allowsNulls: false, primaryKey: true },
        dealerName:                     { type: sequelize.STRING(70), allowsNulls: false },
        address:                        { type: sequelize.STRING(255), allowsNulls: false },
        city:                           { type: sequelize.STRING(100), allowsNulls: false },
        regionCode:                     { type: sequelize.STRING(3), allowsNulls: false },
        postalCode:                     { type: sequelize.STRING(10), allowsNulls: false },
        phone:                          { type: sequelize.STRING(15), allowsNulls: false },
        phoneExt:                       { type: sequelize.STRING(20), allowsNulls: true },
        phoneCountryCode:               { type: sequelize.STRING(4), allowsNulls: false, defaultValue: 1 },
        fax:                            { type: sequelize.STRING(15), allowsNulls: true },
        faxExt:                         { type: sequelize.STRING(20), allowsNulls: true },
        faxCountryCode:                 { type: sequelize.STRING(4), allowsNulls: false, defaultValue: 1 },
        email:                          { type: sequelize.STRING(255), allowsNulls: true },
        websitePhone:                   { type: sequelize.STRING(15), allowsNulls: true },
        websitePhoneExt:                { type: sequelize.STRING(20), allowsNulls: true },
        websitePhoneCountryCode:        { type: sequelize.STRING(4), allowsNulls: false, defaultValue: 1 },
        websiteEmail:                   { type: sequelize.STRING(255), allowsNulls: true },
        contactFirstName:               { type: sequelize.STRING(100), allowsNulls: true },
        contactLastName:                { type: sequelize.STRING(100), allowsNulls: true },
        contactTitle:                   { type: sequelize.STRING(50), allowsNulls: true },
        contactDirectLine:              { type: sequelize.STRING(15), allowsNulls: true },
        contactDirectLineExt:           { type: sequelize.STRING(20), allowsNulls: true },
        contactDirectLineCountryCode:   { type: sequelize.STRING(4), allowsNulls: false, defaultValue: 1 },
        docAndHandlingFee:              { type: sequelize.INTEGER(11), allowsNulls: false, defaultValue: 0 }
      }, {
        timestamps: true,
        createdAt: 'created',
        updatedAt: 'lastUpdated',
        freezeTableName: true
      }
    );
  }
}

module.exports = Dealer;
