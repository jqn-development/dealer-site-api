// app/lib/validate.js

const
  _                   = require('./lodashExt')
  , validator         = require('validator')
  , uuidAPIKey        = require('uuid-apikey')
;

function validate(value, type, options) {
  let test = true;
  switch(type) {
    case 'int':
      test = validator.isInt(value.toString(), options);
      break;
    case 'float':
      test = validator.isFloat(value.toString(), options);
      break;
    case 'boolean':
      test = validator.isBoolean(value.toString());
      break;
    case 'email':
      test = validator.isEmail(value.toString(), options);
      break;
    case 'currency':
      test = validator.isCurrency(value.toString(), options);
      break;
    case 'uuid':
      test = validator.isUUID(value.toString());
      break;
    case 'url':
      test.validator.isURL(value.toString(), options);
      break;
    case 'fqdn':
      test = validator.isFQDN(value.toString(), options);
      break;
    case 'apikey':
      test = uuidAPIKey.isAPIKey(value.toString());
      break;
    case 'string':
    case 'any':
    default:
      break;
  }
  return test;
}

module.exports = validate;
