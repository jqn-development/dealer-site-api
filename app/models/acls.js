// app/models/acls.js

const
  _                   = require('../lib/lodashExt')
  , sequelize         = require('sequelize')
  , logger            = require('../lib/logger')
;


class ACL {
  constructor(dbconn, logger) {
    this.dbconn = dbconn;
    this.logger = logger;

    this.model = dbconn.conn.define('acl', {
        aclID:              { type: sequelize.INTEGER(11), primaryKey: true, autoIncrement: true },
        apiKey:             { type: sequelize.CHAR(36), allowsNulls: false, validate: { isUUID: 4 } },
        secretKey:          { type: sequelize.STRING(23), allowsNulls: false },
        secretIV:           { type: sequelize.CHAR(36), allowsNulls: false, validate: { isUUID: 4 } },
        secretTimestamp:    { type: sequelize.BIGINT(20), allowsNulls: false },
        isSuperAdmin:       { type: sequelize.BOOLEAN, allowsNulls: false, defaultValue: false },
        isDeleted:          { type: sequelize.BOOLEAN, allowsNulls: false, defaultValue: false }
      }, {
        timestamps: true,
        createdAt: 'created',
        updatedAt: 'lastUpdated',
        freezeTableName: true
      }
    );

    this.modelACLSite = dbconn.conn.define('acl_sites', {
        aclID:              { type: sequelize.INTEGER(11), allowsNulls: false, primaryKey: true },
        siteID:             { type: sequelize.CHAR(36), allowsNulls: false, validate: { isUUID: 4 } },
      }, {
        timestamps: false,
        freezeTableName: true
      }
    );

    // Import the Dealer information from the mapping table
    //this.modelSite = new SiteModel(dbconn, logger).model;

    this.model.hasMany(this.modelACLSite, { foreignKey: 'aclID' });

    //this.modelSites.hasOne(this.modelSite, { foreignKey: 'siteID'});
  }
}

module.exports = ACL;
