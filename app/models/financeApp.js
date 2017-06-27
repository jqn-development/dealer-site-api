// app/models/financeApp.js

const
  _                 = require('../lib/lodashExt')
  , fs                = require('fs')
  , moment            = require('moment')
  , sequelize         = require('sequelize')
  , logger            = require('../lib/logger')
;

class FinanceApp {
  constructor(dbconn, logger) {
    this.dbconn = dbconn;
    this.logger = logger;

    this.model = dbconn.conn.define('financeApp', {
        leadID:                   { type: sequelize.CHAR(36), allowsNulls: false, validate: { isUUID: 4 } },
        dob:                      { type: sequelize.STRING(50), allowsNulls: false },
        ssn:                      { type: sequelize.STRING(50), allowsNulls: false },
        driversLicenseNumber:     { type: sequelize.STRING(50), allowsNulls: false },
        driversLicenseState:      { type: sequelize.STRING(50), allowsNulls: true },
        driversLicenseExpiration: { type: sequelize.STRING(50), allowsNulls: false },
        jobEmployer:              { type: sequelize.STRING(70), allowsNulls: true },
        jobEmployerPhone:         { type: sequelize.STRING(15), allowsNulls: true },
        jobEmployerPhoneExt:      { type: sequelize.STRING(20), allowsNulls: true },
        jobTitle:                 { type: sequelize.STRING(50), allowsNulls: true },
        jobMonthlyIncome:         { type: sequelize.INTEGER(11), allowsNulls: true },
        jobEmploymentLength:      { type: sequelize.STRING(50), allowsNulls: true },
        lastJobEmployer:          { type: sequelize.STRING(70), allowsNulls: true },
        lastJobEmployerPhone:     { type: sequelize.STRING(15), allowsNulls: true },
        lastJobEmployerPhoneExt:  { type: sequelize.STRING(20), allowsNulls: true },
        lastJobTitle:             { type: sequelize.STRING(50), allowsNulls: true },
        lastJobMonthlyIncome:     { type: sequelize.INTEGER(11), allowsNulls: true },
        lastJobEmploymentLength:  { type: sequelize.STRING(50), allowsNulls: true },
        otherIncome:              { type: sequelize.INTEGER(11), allowsNulls: true },
        otherIncomeSource:        { type: sequelize.STRING(250), allowsNulls: true },
        housingRentOwn:           { type: sequelize.STRING(5), allowsNulls: true },
        housingMonthlyPayment:    { type: sequelize.INTEGER(11), allowsNulls: true },
        housingResidencyLength:   { type: sequelize.STRING(50), allowsNulls: true }
      }, {
        timestamps: true,
        createdAt: 'created',
        updatedAt: 'lastUpdate'
      }
    );
  }
}

module.exports = FinanceApp;
