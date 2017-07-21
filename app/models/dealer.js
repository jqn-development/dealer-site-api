// app/models/dealer.js

const
  _                   = require('../lib/lodashExt')
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
        countryCode:                    { type: sequelize.STRING(3), allowsNulls: false, defaultValue: 'US' },
        phone:                          { type: sequelize.STRING(15), allowsNulls: false },
        phoneExt:                       { type: sequelize.STRING(20), allowsNulls: true },
        phoneCountryCode:               { type: sequelize.STRING(4), allowsNulls: false, defaultValue: 1 },
        fax:                            { type: sequelize.STRING(15), allowsNulls: true },
        faxCountryCode:                 { type: sequelize.STRING(4), allowsNulls: false, defaultValue: 1 },
        contactEmail:                   { type: sequelize.STRING(255), allowsNulls: true },
        serviceEmail:                   { type: sequelize.STRING(255), allowsNulls: true },
        contactFirstName:               { type: sequelize.STRING(100), allowsNulls: true },
        contactLastName:                { type: sequelize.STRING(100), allowsNulls: true },
        contactTitle:                   { type: sequelize.STRING(50), allowsNulls: true },
        contactDirectLine:              { type: sequelize.STRING(15), allowsNulls: true },
        contactDirectLineExt:           { type: sequelize.STRING(20), allowsNulls: true },
        contactDirectLineCountryCode:   { type: sequelize.STRING(4), allowsNulls: false, defaultValue: 1 },
        docAndHandlingFee:              { type: sequelize.INTEGER(11), allowsNulls: false, defaultValue: 0 },
        bookLabel:                      { type: sequelize.STRING(100), allowsNulls: true }

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
