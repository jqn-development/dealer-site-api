module.exports = {
  'server': {
    'port': 8080,
  },
  'logging': { // Logging Configuration
    'logDir': './logs',
  },
  'credentials': __dirname + '/config/aws.credentials.json'
}
