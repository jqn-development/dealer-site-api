// app/lib/logger.js

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
    let transports = [
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
    ];

    // Add cloudwatch logging when in production
    if (process.env.NODE_ENV === 'production') {
      transports.push(
        new (winstonCloudWatch) ({
          level: 'info',
          awsAccessKeyId: config.credentials.aws.accessKeyId,
          awsSecretKey: config.credentials.aws.secretAccessKey,
          awsRegion: config.credentials.aws.region,
          logGroupName: config.cloudwatch.logGroupName,
          logStreamName: config.cloudwatch.logStreamName,
          messageFormatter: this.formatter
        })
      );
    }

    // Optimization -- Add console logging if not in production
    if ((process.env.NODE_ENV !== 'production') && (process.env.NODE_ENV !== 'test')) {
      transports.push(
        new (winston.transports.Console) ({
          formatter: this.formatter
        })
      );
    }

    this.options = {
      exitOnError: false,
      formatter: this.formatter,
      transports: transports
    };
    // Merge options from config into this object
    this.option = _.assign(this.options, config.logging.options);
    this.log = new (winston.Logger) (this.options);
  }

  formatter(options) {
    return `${new Date().toISOString()} [${options.level.toUpperCase()}]: ${options.message}`;
  }

  logError(endpoint, errInfo) {
    this.log.error(`${endpoint} --- ${JSON.stringify(errInfo)}`);
  }
}

module.exports = Logger;
