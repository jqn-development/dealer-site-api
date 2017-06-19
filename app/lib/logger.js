// Dependencies
const
  _                 = require('lodash'),
  fs                = require('fs'),
  moment            = require('moment'),
  winston           = require('winston'),

  aws               = require('aws-sdk'),
  winstonCloudWatch = require('winston-cloudwatch')
;

class Logger {
  constructor(config) {
    this.logDir = config.server.logDir || './logs';

    this.log = new (winston.Logger) ({
      exitOnError: false,
      formatter: this.formatter,
      transports: [
        new (winston.transports.Console) ({
          formatter: this.formatter
        }),
        /* Add CloudWatch Loggging
        new (winstonCloudWatch) ({
          logGroupName: '',
          logStreamName: ''
        }),
        */
        new (winston.transports.File) ({
          filename: this.logDir + '/info.log',
          name: 'info-log',
          level: 'info',
          formatter: this.formatter
        }),
        new (winston.transports.File) ({
          filename: this.logDir + '/error.log',
          name: 'error-log',
          level: 'error',
          formatter: this.formatter
        })
      ]
    });
  }

  formatter(options) {
    return `${new Date().toISOString()} [${options.level.toUpperCase()}]: ${options.message}`;
  }
}

module.exports = Logger;
