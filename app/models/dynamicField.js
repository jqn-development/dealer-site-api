// app/models/dynamicField.js

const
  _                   = require('../lib/lodashExt')
  , sequelize         = require('sequelize')
  , logger            = require('../lib/logger')
;


class DynamicField {
  constructor(dbconn, logger) {
    this.dbconn = dbconn;
    this.logger = logger;

    this.model = dbconn.conn.define('dynamicField', {
        dynamicFieldID:   { type: sequelize.CHAR(36), allowsNulls: false, validate: { isUUID: 4 } },
        // oldFieldID:       { type: sequelize.INTEGER(11), allowsNulls: true, defaultValue: null },
        dealerID:         { type: sequelize.INTEGER(11), allowsNulls: false, primaryKey: true },
        fieldLabel:       { type: sequelize.STRING(100), allowsNulls: false, primaryKey: true },
        imageURL:         { type: sequelize.STRING(255), allowsNulls: true, defaultValue: null, validate: { isURL: true } },
        textContent:      { type: sequelize.TEXT, allowsNulls: true, defaultValue: '' }
      }, {
        timestamps: true,
        createdAt: 'created',
        updatedAt: 'lastUpdated',
        freezeTableName: true
      }
    );
  }
}

module.exports = DynamicField ;
