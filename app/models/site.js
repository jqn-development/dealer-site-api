// app/models/site.js

const
  _                   = require('../lib/lodashExt')
  , sequelize         = require('sequelize')
  , logger            = require('../lib/logger')
;


class Site {
  constructor(dbconn, logger) {
    this.dbconn = dbconn;
    this.logger = logger;

    this.model = dbconn.conn.define('site', {
        siteID:                 { type: sequelize.CHAR(36), allowsNulls: false, validate: { isUUID: 4 }, primaryKey: true },
        dealerID:               { type: sequelize.INTEGER(11), allowsNulls: false },
        baseDomainURL:          { type: sequelize.STRING(255), allowsNulls: false },
        title:                  { type: sequelize.TEXT, allowsNulls: true },
        keywords:               { type: sequelize.TEXT, allowsNulls: true },
        description:            { type: sequelize.TEXT, allowsNulls: true },
        priceLabelRetailNew:    { type: sequelize.STRING(100), allowsNulls: true },
        priceLabelRetailUsed:   { type: sequelize.STRING(100), allowsNulls: true },
        priceLabelInternetNew:  { type: sequelize.STRING(100), allowsNulls: true },
        priceLabelInternetUsed: { type: sequelize.STRING(100), allowsNulls: true },
        bookLabel:              { type: sequelize.STRING(100), allowsNulls: true },
        suppressStockPhotos:    { type: sequelize.BOOLEAN, allowsNulls: false, defaultValue: 0 },
        isDeleted:              { type: sequelize.BOOLEAN, allowsNulls: false, defaultValue: 0 }
      }, {
        timestamps: true,
        createdAt: 'created',
        updatedAt: 'lastUpdated',
        freezeTableName: true
      }
    );
  }
}

module.exports = Site;
