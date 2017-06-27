// app/lib/dbconn.js

// Dependencies
const
  _                 = require('lodash')
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
    // Setup sequelize connection
    this.conn = new sequelize(this.creds.dbname, this.creds.user, this.creds.pass, {
      host: this.creds.host,
      port: this.creds.port,
      dialect: 'mysql',
      pool: this.dbconf.pool
    });
  }

  connect() {
    this.conn.authenticate()
      .then(() => {
        this.log.info('Connection has been established successfully.');
      })
      .catch(err => {
        this.log.error('Unable to connect to the database:', err);
      });
  }
}

module.exports = DBConn;
