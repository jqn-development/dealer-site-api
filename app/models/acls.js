// app/models/acls.js

const
  _                 = require('../lib/lodashExt')
  , fs                = require('fs')
  , moment            = require('moment')
  , sequelize         = require('sequelize')
  , logger            = require('../lib/logger')
;

class ACL {
  constructor(dbconn, logger) {
    this.dbconn = dbconn;
    this.logger = logger;

    this.model = dbconn.conn.define('acl', {
        aclID:              { type: sequelize.INTEGER(11), allowsNulls: false, primaryKey: true },
        apiKey:             { type: sequelize.CHAR(36), allowsNulls: false, validate: { isUUID: 4 } },
        secretKey:          { type: sequelize.STRING(48), allowsNulls: false },
        isSuperAdmin:       { type: sequelize.BOOLEAN, allowsNulls: false, defaultValue: false }
      }, {
        timestamps: true,
        createdAt: 'created',
        updatedAt: 'lastUpdated',
        freezeTableName: true
      }
    );

    this.modelsites = dbconn.conn.define('acl_siteConfig', {
        aclID:              { type: sequelize.INTEGER(11), allowsNulls: false, primaryKey: true },
        siteID:             { type: sequelize.CHAR(36), allowsNulls: false, validate: { isUUID: 4 } },
      }, {
        timestamps: false,
        freezeTableName: true
      }
    );

    this.model.hasMany(this.modelsites);
  }
}

module.exports = ACL;
