// test/restAPI.js

let
  request             = require('supertest')
  , test              = require('unit.js')
  , assert            = require('assert')
  , config            = require('../config/config')
;

// These credentials only exist in the development DB
let testCreds = {
  apiKey: 'M9RJQ9J-ZG2MWFH-GRGRP8A-9A9SEQQ',
  secret: 'ZEM0H3A-W9TBS2P-37EBAPQ'
}

describe('REST Endpoint Tests', () => {
  let Server, server, svr;
  process.env.NODE_ENV = 'production';            // Set the environment to testing
  before(() => {
    Server = require('../app/server');

    // Inject testing credentials into config object
    config.credentials.aws = require(__dirname + '/../config/aws.test.credentials.json');
    config.credentials.mysql = require(__dirname + '/../config/mysql.test.credentials.json');
    config.credentials.redis = require(__dirname + '/../config/redis.test.credentials.json');
    server = new Server(config);
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
      .query({ apiKey: testCreds.apiKey, dealerID: 100 })
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
      .query({ apiKey: testCreds.apiKey, dealerID: 100 })
      .expect(200, done)
      .expect((res) => { res.body.count = 100; });
  });
  it('check dealer GET (/site/vehilce/all) w/ dealerID and limit', (done) => {
    request(svr)
      .get('/site/vehicle/all')
      .query({ apiKey: testCreds.apiKey, dealerID: 100, limit: 10 })
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
      .query({ apiKey: testCreds.apiKey, dealerID: 101 })
      .expect(400, done);
  });
  it('check dealer GET (/site/vehicle) w/ vehicleID', (done) => {
    request(svr)
      .get('/site/vehicle/1995479')
      .query({ apiKey: testCreds.apiKey, dealerID: 100 })
      .expect(200, done);
  });

  // TODO: Add Admin routes
  // TODO: Add Site (Config) routes
  // TODO: Add dealer test data to database so can test updating
  // TODO: Add vehicle test data to database so can test pulling a single vehicle

});
