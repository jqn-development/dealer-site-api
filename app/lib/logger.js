// Dependencies
const
  _                 = require('./lodashExt')
  , fs                = require('fs')
  , moment            = require('moment')
  , winston           = require('winston')

  , aws               = require('aws-sdk')
  , winstonCloudWatch = require('winston-cloudwatch')
;

class Logger {
  constructor(config) {
    this.logDir = config.logging.logDir || './logs';
    this.options = {
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
    };
    // Merge options from config into this object
    this.option = _.assign(this.options, config.logging.options);
    this.log = new (winston.Logger) (this.options);
  }

  formatter(options) {
    return `${new Date().toISOString()} [${options.level.toUpperCase()}]: ${options.message}`;
  }
}

module.exports = Logger;
