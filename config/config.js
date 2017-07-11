module.exports = {
  'server': {
    'port': 8080,
  },
  'logging': { // Logging Configuration
    'logDir': './logs',
    'options': {
        'json': false,
        'maxsize': '10000000',
        'maxFiles': '10',
        'level': 'silly'
    }
  },
  'credentials': {
    'aws': require(__dirname + '/aws.credentials.json'),
    'mysql': require(__dirname + '/mysql.credentials.json'),
    'redis': require(__dirname + '/redis.credentials.json')
  },
  'db': {
    'pool': {
      'max': 30,
      'min': 1,
      'idle': 10000
    }
  },
  'cache': {
    'ttl': 5
  }
}
