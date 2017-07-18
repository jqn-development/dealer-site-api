// app/lib/dbconn.js

// Dependencies
const
  _                 = require('./lodashExt')
  , fs                = require('fs')
  , moment            = require('moment')
  , mysql             = require('mysql2')
  , sequelize         = require('sequelize')
;


class DBConn {

  constructor(config, logger) {
    this.log = logger;
    this.dbconf = config.db;
    this.creds = config.credentials.mysql;
    this.isConnected = false;
    // Setup sequelize connection
    this.conn = new sequelize(this.creds.dbname, this.creds.user, this.creds.pass, {
      host: this.creds.host,
      port: this.creds.port,
      dialect: 'mysql',
      pool: this.dbconf.pool,
      logging: logger.info
    });
  }

  connect() {
    this.log.info('Testing connection...');
    return this.conn.authenticate()
      .then(() => {
        this.log.info('Connection has been established successfully.');
        this.isConnected = true;
      })
      .catch(err => {
        this.log.error('Unable to connect to the database:', err);
      });
  }

  close() {
    // Close the connection to the database
    this.conn.close();
    this.isConnected = false;
  }
}

module.exports = DBConn;
