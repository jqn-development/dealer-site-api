// app/models/siteConfig.js

const
  _                 = require('lodash')
  , fs                = require('fs')
  , moment            = require('moment')
  , sequelize         = require('sequelize')
  , logger            = require('../lib/logger')
;

class SiteConfig {
  constructor(dbconn, logger) {
    this.dbconn = dbconn;
    this.logger = logger;

    this.model = dbconn.conn.define('siteConfig', {
        dealerID:               { type: sequelize.INTEGER(11), allowsNulls: false },
        siteID:                 { type: sequelize.CHAR(36), allowsNulls: false, validate: { isUUID: 4 } },
        secretKey:              { type: sequelize.STRING(48), allowsNulls: false },
        baseDomainURL:          { type: sequelize.STRING(255), allowsNulls: false },
        title:                  { type: sequelize.TEXT, allowsNulls: true },
        keywords:               { type: sequelize.TEXT, allowsNulls: true },
        description:            { type: sequelize.TEXT, allowsNulls: true },
        priceLabelRetailNew:    { type: sequelize.STRING(100), allowsNulls: true },
        priceLabelRetailUsed:   { type: sequelize.STRING(100), allowsNulls: true },
        priceLabelInternetNew:  { type: sequelize.STRING(100), allowsNulls: true },
        priceLabelInternetUsed: { type: sequelize.STRING(100), allowsNulls: true },
        bookLabel:              { type: sequelize.STRING(100), allowsNulls: true },
        supressStockPhotos:     { type: sequelize.BOOLEAN, allowsNulls: false, defaultValue: 0 }  
      }, {
        timestamps: true,
        createdAt: 'created',
        updatedAt: 'lastUpdate'
      }
    );
  }
}

module.exports = SiteConfig;
