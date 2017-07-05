// app/models/vehicle.js

const
  _                   = require('../lib/lodashExt')
  , fs                = require('fs')
  , moment            = require('moment')
  , sequelize         = require('sequelize')
  , logger            = require('../lib/logger')
;

class Vehicle {
  constructor(dbconn, logger) {
    this.dbconn = dbconn;
    this.logger = logger;

    this.model = dbconn.conn.define('vehicle', {
        vehicleID:                { type: sequelize.INTEGER(11), allowsNulls: false, primaryKey: true },
        dealerID:                 { type: sequelize.INTEGER(11), allowsNulls: false },
        stockNumber:              { type: sequelize.STRING(50), allowsNulls: false },
        vin:                      { type: sequelize.STRING(20), allowsNulls: false },
        year:                     { type: sequelize.INTEGER(4), allowsNulls: false },
        make:                     { type: sequelize.STRING(30), allowsNulls: false },
        model:                    { type: sequelize.STRING(30), allowsNulls: false },
        series:                   { type: sequelize.STRING(40), allowsNulls: true, defaultValue: '' },
        trim:                     { type: sequelize.STRING(40), allowsNulls: true, defaultValue: '' },
        mileage:                  { type: sequelize.INTEGER(11), allowsNulls: false },
        vehicleType:              { type: sequelize.STRING(40), allowsNulls: false },
        vehicleCondition:         { type: sequelize.STRING(100), allowsNulls: true, defaultValue: '' },
        tagLine:                  { type: sequelize.STRING(80), allowsNulls: true, defaultValue: '' },
        body:                     { type: sequelize.STRING(100), allowsNulls: true, defaultValue: '' },
        engine:                   { type: sequelize.STRING(100), allowsNulls: true, defaultValue: '' },
        transmission:             { type: sequelize.STRING(100), allowsNulls: true, defaultValue: '' },
        colorExterior:            { type: sequelize.STRING(50), allowsNulls: true, defaultValue: '' },
        colorInterior:            { type: sequelize.STRING(100), allowsNulls: true, defaultValue: '' },
        drive:                    { type: sequelize.STRING(100), allowsNulls: true, defaultValue: '' },
        fuel:                     { type: sequelize.STRING(30), allowsNulls: true, defaultValue: '' },
        brakes:                   { type: sequelize.STRING(100), allowsNulls: true, defaultValue: '' },
        seats:                    { type: sequelize.STRING(100), allowsNulls: true, defaultValue: '' },
        options:                  { type: sequelize.TEXT, allowsNulls: true, defaultValue: '' },
        description:              { type: sequelize.TEXT, allowsNulls: true, defaultValue: '' },
        warranty:                 { type: sequelize.TEXT, allowsNulls: true, defaultValue: '' },
        isNew:                    { type: sequelize.BOOLEAN, allowsNulls: false, defaultValue: 0 },
        isCPO:                    { type: sequelize.BOOLEAN, allowsNulls: false, defaultValue: 0 },
        priceRetail:              { type: sequelize.INTEGER(11), allowsNulls: false },
        priceInternet:            { type: sequelize.INTEGER(11), allowsNulls: false },
        priceWholesale:           { type: sequelize.INTEGER(11), allowsNulls: false },
        bookValue:                { type: sequelize.INTEGER(11), allowsNulls: false },
        imageMainURL:             { type: sequelize.STRING(255), allowsNulls: true, defaultValue: '' },
        imageMainThumbURL:        { type: sequelize.STRING(255), allowsNulls: true, defaultValue: '' },
        imageStockPhotoURL:       { type: sequelize.STRING(255), allowsNulls: true, defaultValue: '' },
        images:                   { type: sequelize.TEXT, allowsNulls: true, defaultValue: '' },
        imageCount:               { type: sequelize.INTEGER(11), allowsNulls: false, defaultValue: 0 },
        isSiteSpecial:            { type: sequelize.BOOLEAN, allowsNulls: false, defaultValue: 0 },
        hasSpecialFinancing:      { type: sequelize.BOOLEAN, allowsNulls: false, defaultValue: 0 },
        carfaxIsSingleOwner:      { type: sequelize.BOOLEAN, allowsNulls: false, defaultValue: 0 },
        carfaxURL:                { type: sequelize.STRING(255), allowsNulls: true, defaultValue: '' },
        geoLocLatitude:           { type: sequelize.DECIMAL(15,12), allowsNulls: true, defaultValue: null },
        geoLocLongitude:          { type: sequelize.DECIMAL(15,12), allowsNulls: true, defaultValue: null },
        geoLocAddress:            { type: sequelize.STRING(255), allowsNulls: true, defaultValue: '' },
        geoLocCity:               { type: sequelize.STRING(100), allowsNulls: true, defaultValue: '' },
        geoLocRegionCode:         { type: sequelize.STRING(3), allowsNulls: true, defaultValue: '' },
        geoLocPostalCode:         { type: sequelize.STRING(10), allowsNulls: true, defaultValue: '' }
      }, {
        timestamps: true,
        createdAt: 'listingDate',
        updatedAt: 'lastUpdated',
        freezeTableName: true
      }
    );
  }
}

module.exports = Vehicle;
