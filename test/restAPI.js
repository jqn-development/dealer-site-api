// test/restAPI.js

let
  request             = require('supertest')
  , test              = require('unit.js')
  , assert            = require('assert')
  , config            = require('../config/config')
  , Logger            = require('../app/lib/logger')
  , uuidAPIKey        = require('uuid-apikey')
;

// These credentials only exist in the development DB
let badTestCreds = {
  apiKey: 'M9RJQ9J-ZG2MWFH-GRGRP8A-9A9SEQQ',
  secret: 'ZEM0H3A-W9TBS2P-37EBAPQ'
}

let testCreds = {
  apiKey: 'M9RJQ9J-ZG2MWFH-GRGRP8A-9A9SEQQ',
  secret: 'ZEM0H3A-W9TBS2P-37EBAPQ'
}

let superTestCreds = {};
let testDealer = -1;
let testVehicle = -1;

describe('REST Endpoint Tests', () => {
  let Server, server, svr, log, results, targetSiteID;
  process.env.NODE_ENV = 'production';  // Set the environment to testing
  before(async() => {
    Server = require('../app/server');

    log = new Logger(config).log;

    // Inject testing credentials into config object
    config.credentials.aws = require(__dirname + '/../config/aws.test.credentials.json');
    config.credentials.mysql = require(__dirname + '/../config/mysql.test.credentials.json');
    config.credentials.redis = require(__dirname + '/../config/redis.test.credentials.json');
    // Run on a different port to prevent collisions when testing locally
    config.server.port = 8888;
    server = new Server(config, log);
    server.init();
    svr = server.server;

    // Add dealer and vehicle test data to database so can test updating
    results = await server.dbconn.conn.query('INSERT INTO dealer (dealerID, dealerName, address, city, regionCode, postalCode, phone) VALUES (-1, \'Test Dealer\', \'1234 Winding Way\', \'Broomfield\', \'CO\', \'81234\', \'8005551234\')', { type: server.dbconn.conn.QueryTypes.INSERT });
    results = await server.dbconn.conn.query(
      'INSERT INTO vehicle (vehicleID, dealerID, stockNumber, vin, year, make, model, mileage, vehicleType) VALUES ' +
      '(-1, -1, \'A\', \'A\', 2017, \'Honda\', \'Indifference\', 10, \'Space Wagon\'),' +
      '(-2, -1, \'B\', \'B\', 2017, \'Ford\', \'Exorbitant\', 10, \'Space Wagon\'),' +
      '(-3, -1, \'C\', \'C\', 2017, \'Chrysler\', \'Mediocrity\', 10, \'Space Wagon\'),' +
      '(-4, -1, \'D\', \'D\', 2017, \'Dodge\', \'Breakdown\', 10, \'Space Wagon\'),' +
      '(-5, -1, \'E\', \'E\', 2017, \'Hyundai\', \'Thrifty\', 10, \'Space Wagon\'),' +
      '(-6, -1, \'F\', \'F\', 2017, \'Jeep\', \'Nationalism\', 10, \'Space Wagon\'),' +
      '(-7, -1, \'G\', \'G\', 2017, \'Range Rover\', \'Escapism\', 10, \'Space Wagon\'),' +
      '(-8, -1, \'H\', \'H\', 2017, \'BMW\', \'Entitlement\', 10, \'Space Wagon\'),' +
      '(-9, -1, \'I\', \'I\', 2017, \'Mini\', \'Mote\', 10, \'Sub-Compact\'),' +
      '(-10, -1, \'J\', \'J\', 2017, \'SaaB\', \'Sorrow\', 10, \'Space Wagon\'),' +
      '(-11, -1, \'K\', \'K\', 2017, \'Telsa\', \'Futuristic\', 10, \'Space Wagon\'),' +
      '(-12, -1, \'L\', \'L\', 2017, \'Nissan\', \'Nihlism\', 10, \'Space Wagon\'),' +
      '(-13, -1, \'M\', \'M\', 2017, \'Toyota\', \'Prion Disease\', 10, \'Space Wagon\'),' +
      '(-14, -1, \'N\', \'N\', 2017, \'Suburu\', \'Settlement\', 10, \'Space Wagon\'),' +
      '(-15, -1, \'O\', \'O\', 2017, \'Lincoln\', \'Island\', 10, \'Space Wagon\'),' +
      '(-16, -1, \'P\', \'P\', 2017, \'Daiwoo\', \'Indeterminate\', 10, \'Space Wagon\'),' +
      '(-17, -1, \'Q\', \'Q\', 2017, \'Lexus\', \'Nouveau Riche\', 10, \'Space Wagon\'),' +
      '(-18, -1, \'R\', \'R\', 2017, \'Kia\', \'Soulless\', 10, \'Space Wagon\'),' +
      '(-19, -1, \'S\', \'S\', 2017, \'Buick\', \'Irregular\', 10, \'Space Wagon\'),' +
      '(-20, -1, \'T\', \'T\', 2017, \'Mercedes\', \'Billfold\', 10, \'Space Wagon\')'
      , { type: server.dbconn.conn.QueryTypes.INSERT });

  });
  after(async () => {
    // Cleanup Test Data
    results = await server.dbconn.conn.query('DELETE FROM vehicle WHERE vehicleID < 1', { type: server.dbconn.conn.QueryTypes.DELETE });
    results = await server.dbconn.conn.query('DELETE FROM dealer WHERE dealerID < 1', { type: server.dbconn.conn.QueryTypes.DELETE });

    server.close();
  })

  it('server load', () => {
    test.assert(server instanceof Server);
  })

  // =============================================================
  // Root Controller Tests
  // =============================================================
  describe('Root Controller', () => {
    it('check root (/site/) w/o authorization', (done) => {
      request(svr)
        .get('/site/')
        .expect(401, done);
    });
    it('check root (/site/) w/ authorization', (done) => {
      request(svr)
        .get('/site/')
        .query({ apiKey: badTestCreds.apiKey })
        .expect(200, done);
    });
  })

  // =============================================================
  // Admin Pre-Tests
  // =============================================================
  describe('Admin Controller Pre-Tests', () => {
    before(async() => {
      // Retrieve the primary key for testing
      let results = await server.dbconn.conn.query('SELECT apiKey, secretKey FROM acl WHERE aclID = 1 LIMIT 1', { type: server.dbconn.conn.QueryTypes.SELECT });
      if (results) {
        superTestCreds.apiKey = uuidAPIKey.toAPIKey(results[0].apiKey);
        superTestCreds.secret = results[0].secretKey;
      }
    });

    it('check createAPIKey POST (/site/admin/createAPIKey', (done) => {
      request(svr)
        .post('/site/admin/createAPIKey')
        .send({ apiKey: superTestCreds.apiKey, secret: superTestCreds.secret })
        .set('Content-Type', 'application/json')
        .then((res) => {
          // set targetAPIKey for delete
          testCreds.apiKey = res.body.data.apiKey;
          testCreds.secret = res.body.data.secretKey;
          assert(res.status == 200);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
    it('check createSite POST (/site/admin/createSite)', (done) => {
      request(svr)
        .post('/site/admin/createSite')
        .send({ apiKey: superTestCreds.apiKey, secret: superTestCreds.secret, targetAPIKey: testCreds.apiKey, dealerID: testDealer, baseDomainURL: 'example.com' })
        .then((res) => {
          targetSiteID = res.body.data.siteID;
          assert(res.status == 200)
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
    it('check updateSite POST (/site/admin/updateSite)', (done) => {
      request(svr)
        .post('/site/admin/updateSite')
        .send({ apiKey: superTestCreds.apiKey, secret: superTestCreds.secret, siteID: targetSiteID, title: 'Test Site' })
        .expect(200, done);
    });
    it('check grantSitePermissions POST (/site/admin/grantSitePermissions)', (done) => {
      request(svr)
        .post('/site/admin/grantSitePermissions')
        .send({ apiKey: superTestCreds.apiKey, secret: superTestCreds.secret, targetAPIKey: testCreds.apiKey, siteID: targetSiteID })
        .expect(200, done);
    });
    it('check getPermissions POST (/site/admin/getPermissions)', (done) => {
      request(svr)
        .post('/site/admin/getPermissions')
        .send({ apiKey: superTestCreds.apiKey, secret: superTestCreds.secret })
        .expect(200, done);
    });
  });

  // =============================================================
  // Dealer Controller Tests
  // =============================================================
  describe('Dealer Controller', () => {
    it('check dealer GET (/site/dealer) w/o dealerID', (done) => {
      request(svr)
        .get('/site/dealer')
        .query({ apiKey: testCreds.apiKey })
        .expect(400, done);
    });
    it('check dealer GET (/site/dealer) w/ dealerID', (done) => {
      request(svr)
        .get('/site/dealer')
        .query({ apiKey: testCreds.apiKey, dealerID: testDealer })
        .expect(200, done);
    });
  });

  // =============================================================
  // Vehicle Controller Tests
  // =============================================================
  describe('Vehicle Controller', () => {
    it('check dealer GET (/site/vehilce/all) w/o dealerID', (done) => {
      request(svr)
        .get('/site/vehicle/all')
        .query({ apiKey: testCreds.apiKey })
        .expect(400, done);
    });
    it('check dealer GET (/site/vehilce/all) w/ dealerID', (done) => {
      request(svr)
        .get('/site/vehicle/all')
        .query({ apiKey: testCreds.apiKey, dealerID: testDealer })
        .then((res) => {
          assert(res.status == 200 && res.body.count == 20);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
    it('check dealer GET (/site/vehilce/all) w/ dealerID and limit', (done) => {
      request(svr)
        .get('/site/vehicle/all')
        .query({ apiKey: testCreds.apiKey, dealerID: testDealer, limit: 10 })
        .then((res) => {
          assert(res.status == 200 && res.body.count == 10);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
    it('check dealer GET (/site/vehicle) w/ vehicleID w/o dealerID', (done) => {
      request(svr)
        .get('/site/vehicle')
        .query({ apiKey: testCreds.apiKey, vehicleID: testVehicle })
        .expect(400, done);
    });
    it('check dealer GET (/site/vehicle) w/ vehicleID w/ wrong dealerID', (done) => {
      request(svr)
        .get('/site/vehicle')
        .query({ apiKey: testCreds.apiKey, dealerID: testDealer + 1, vehicleID: testVehicle })
        .expect(403, done);
    });
    it('check dealer GET (/site/vehicle) w/ vehicleID', (done) => {
      request(svr)
        .get('/site/vehicle')
        .query({ apiKey: testCreds.apiKey, dealerID: testDealer, vehicleID: testVehicle })
        .expect(200, done);
    });
  });

  // =============================================================
  // Site (Config) Controller Tests
  // =============================================================
  describe('Site Controller', () => {
    it('check config GET (/site/config) w/ mismatched APIKey/SiteID', (done) => {
      request(svr)
        .get('/site/config')
        .query({ apiKey: badTestCreds.apiKey, siteID: targetSiteID })
        .expect(403, done);
    });
    it('check config GET (/site/config) w/ good APIKey/SiteID', (done) => {
      request(svr)
        .get('/site/config')
        .query({ apiKey: testCreds.apiKey, siteID: targetSiteID })
        .then((res) => {
          assert(res.status == 200 && res.body.data.title == 'Test Site');
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
    it('check config PUT (/site/config) w/ wrong security context', (done) => {
      request(svr)
        .put('/site/config')
        .send({ apiKey: testCreds.apiKey, siteID: targetSiteID, title: 'New Site' })
        .expect(403, done);
    });
    it('check config PUT (/site/config)', (done) => {
      request(svr)
        .put('/site/config')
        .send({ apiKey: testCreds.apiKey, secret: testCreds.secret, siteID: targetSiteID, title: 'New Site' })
        .expect(200, done);
    });
    it('check config GET (/site/config) updated info', (done) => {
      request(svr)
        .get('/site/config')
        .query({ apiKey: testCreds.apiKey, siteID: targetSiteID })
        .then((res) => {
          assert(res.status == 200 && res.body.data.title == 'New Site');
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  // =============================================================
  // Field Controller Tests
  // =============================================================
  describe('Field Controller', () => {
    // TODO: Test - Add Field routes
    it('check field POST (/site/field) w/ wrong security context', (done) => {
      request(svr)
        .post('/site/field')
        .send({ apiKey: testCreds.apiKey, dealerID: testDealer, fieldLabel: 'TestField' })
        .expect(403, done);
    });
    it('check field POST (/site/field)', (done) => {
      request(svr)
        .post('/site/field')
        .send({ apiKey: testCreds.apiKey, secret: testCreds.secret, dealerID: testDealer, fieldLabel: 'TestField' })
        .expect(200, done);
    });
    it('check field GET (/site/field/all) w/ mismatched APIKey/DealerID', (done) => {
      request(svr)
        .get('/site/field/all')
        .query({ apiKey: badTestCreds.apiKey, dealerID: testDealer })
        .expect(403, done);
    });
    it('check field GET (/site/field/all) w/ good APIKey/DealerID', (done) => {
      request(svr)
        .get('/site/field/all')
        .query({ apiKey: testCreds.apiKey, dealerID: testDealer })
        .expect(200, done);
    });
    it('check field GET (/site/field) w/ mismatched APIKey/DealerID', (done) => {
      request(svr)
        .get('/site/field')
        .query({ apiKey: badTestCreds.apiKey, dealerID: testDealer, fieldLabel: 'TestField' })
        .expect(403, done);
    });
    it('check field GET (/site/field) w/ good APIKey/DealerID', (done) => {
      request(svr)
        .get('/site/field')
        .query({ apiKey: testCreds.apiKey, dealerID: testDealer, fieldLabel: 'TestField' })
        .expect(200, done);
    });
    it('check field PUT (/site/field) w/ wrong security context', (done) => {
      request(svr)
        .put('/site/field')
        .send({ apiKey: testCreds.apiKey, dealerID: testDealer, fieldLabel: 'TestField', textContent: 'Test' })
        .expect(403, done);
    });
    it('check field PUT (/site/field)', (done) => {
      request(svr)
        .put('/site/field')
        .send({ apiKey: testCreds.apiKey, secret: testCreds.secret, dealerID: testDealer, fieldLabel: 'TestField', textContent: 'Test' })
        .expect(200, done);
    });
    it('check field GET (/site/field) updated info', (done) => {
      request(svr)
        .get('/site/field')
        .query({ apiKey: testCreds.apiKey, dealerID: testDealer, fieldLabel: 'TestField' })
        .then((res) => {
          assert(res.status == 200 && res.body.data.textContent == 'Test')
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
    it('check field DELETE (/site/config) w/ wrong security context', (done) => {
      request(svr)
        .delete('/site/field')
        .send({ apiKey: testCreds.apiKey, dealerID: testDealer, fieldLabel: 'TestField' })
        .expect(403, done);
    });
    it('check field DELETE (/site/config)', (done) => {
      request(svr)
        .delete('/site/field')
        .send({ apiKey: testCreds.apiKey, secret: testCreds.secret, dealerID: testDealer, fieldLabel: 'TestField' })
        .expect(200, done);
    });
  });

  // =============================================================
  // Admin Post-Tests
  // =============================================================
  describe('Admin Controller Post-Tests', () => {
    it('check revokeSitePermissions POST (/site/admin/revokeSitePermissions)', (done) => {
      request(svr)
        .post('/site/admin/revokeSitePermissions')
        .send({ apiKey: superTestCreds.apiKey, secret: superTestCreds.secret, targetAPIKey: testCreds.apiKey, siteID: targetSiteID})
        .set('Content-Type', 'application/json')
        .expect(200, done);
    });
    it('check deleteSite POST (/site/admin/deleteSite)', (done) => {
      request(svr)
        .post('/site/admin/deleteSite')
        .send({ apiKey: superTestCreds.apiKey, secret: superTestCreds.secret, siteID: targetSiteID})
        .set('Content-Type', 'application/json')
        .expect(200, done);
    });
    // Delete created API Key
    it('check deleteAPIKey POST (/site/admin/deleteAPIKey)', (done) => {
      request(svr)
        .post('/site/admin/createAPIKey')
        .send({ apiKey: superTestCreds.apiKey, secret: superTestCreds.secret, targetAPIKey: testCreds.apiKey })
        .set('Content-Type', 'application/json')
        .expect(200, done);
    });
    it('check flushCache POST (/site/admin/flushCache)', (done) => {
      request(svr)
        .post('/site/admin/flushCache')
        .send({ apiKey: superTestCreds.apiKey, secret: superTestCreds.secret })
        .expect(200, done);
    });
  });

});
