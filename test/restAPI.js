// test/restAPI.js

let
  request             = require('supertest')
  , test              = require('unit.js')
  , assert            = require('assert')
  , config            = require('../config/config')
  , Logger            = require('../app/lib/logger')
;

// These credentials only exist in the development DB
let testCreds = {
  apiKey: 'M9RJQ9J-ZG2MWFH-GRGRP8A-9A9SEQQ',
  secret: 'ZEM0H3A-W9TBS2P-37EBAPQ'
}

let testDealer = 100;

describe('REST Endpoint Tests', () => {
  let Server, server, svr, log;
  process.env.NODE_ENV = 'production';            // Set the environment to testing
  before(() => {
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
  });
  after(() => {
    server.close();
  })

  it('server load', () => {
    test.assert(server instanceof Server);
  })
  it('check root (/site/) w/o authorization', (done) => {
    request(svr)
      .get('/site/')
      .expect(401, done);
  });
  it('check root (/site/) w/ authorization', (done) => {
    request(svr)
      .get('/site/')
      .query({ apiKey: testCreds.apiKey })
      .expect(200, done);
  });
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
      .expect(200, done)
      .expect((res) => { res.body.count = 100; });
  });
  it('check dealer GET (/site/vehilce/all) w/ dealerID and limit', (done) => {
    request(svr)
      .get('/site/vehicle/all')
      .query({ apiKey: testCreds.apiKey, dealerID: testDealer, limit: 10 })
      .expect(200, done)
      .expect((res) => { res.body.count = 10; });
  });
  it('check dealer GET (/site/vehicle) w/ vehicleID w/o dealerID', (done) => {
    request(svr)
      .get('/site/vehicle/1995479')
      .query({ apiKey: testCreds.apiKey })
      .expect(400, done);
  });
  it('check dealer GET (/site/vehicle) w/ vehicleID w/ wrong dealerID', (done) => {
    request(svr)
      .get('/site/vehicle/1995479')
      .query({ apiKey: testCreds.apiKey, dealerID: testDealer + 1 })
      .expect(403, done);
  });
  it('check dealer GET (/site/vehicle) w/ vehicleID', (done) => {
    request(svr)
      .get('/site/vehicle/1995479')
      .query({ apiKey: testCreds.apiKey, dealerID: testDealer })
      .expect(200, done);
  });

  // TODO: Test - Add Admin routes
  // TODO: Test - Add Site (Config) routes
  // TODO: Test - Add Field routes
  // TODO: Test - Add dealer test data to database so can test updating
  // TODO: Test - Add vehicle test data to database so can test pulling a single vehicle

});
