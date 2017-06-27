// app/models/lead.js

const
  _                 = require('lodash')
  , fs                = require('fs')
  , moment            = require('moment')
  , sequelize         = require('sequelize')
  , logger            = require('../lib/logger')
;

class Lead {
  constructor(dbconn, logger) {
    this.dbconn = dbconn;
    this.logger = logger;

    this.model = dbconn.conn.define('lead', {
        leadID:           { type: sequelize.CHAR(36), allowsNulls: false, validate: { isUUID: 4 } },
        oldLeadID:        { type: sequelize.INTEGER(11), allowsNulls: true, defaultValue: null },
        customerID:       { type: sequelize.CHAR(36), allowsNulls: false, validate: { isUUID: 4 } },
        dealerID:         { type: sequelize.INTEGER(11), allowsNulls: true, defaultValue: null },
        vehicleID:        { type: sequelize.INTEGER(11), allowsNulls: true, defaultValue: null },
        vehicleLabel:     { type: sequelize.TEXT, allowsNulls: true },
        leadType:         { type: sequelize.STRING(100), allowsNulls: false },
        comments:         { type: sequelize.TEXT, allowsNulls: true },
        offer:            { type: sequelize.INTEGER(11), allowsNulls: true },
        tradeIn:          { type: sequelize.TEXT, allowsNulls: true },
        testDriveTime:    { type: sequelize.STRING(255), allowsNulls: true },
        callBackTime:     { type: sequelize.STRING(255), allowsNulls: true },
        isSpecialFinance: { type: sequelize.BOOLEAN, allowsNulls: false, defaultValue: 0 },
        isSaved:          { type: sequelize.BOOLEAN, allowsNulls: false, defaultValue: 0 },
        isRead:           { type: sequelize.BOOLEAN, allowsNulls: false, defaultValue: 0 },
        requestIP:        { type: sequelize.STRING(50), allowsNulls: false, validate: { isIP: true } }
      }, {
        timestamps: true,
        createdAt: 'created',
        updatedAt: 'lastUpdate'
      }
    );
  }
}

module.exports = Lead;
