// app/lib/lodashExt.js

let
  _                 = require('lodash')
;

let isUnset = (obj) => {
  return (_.isNull(obj) || _.isUndefined(obj));
}

let hasValue = (obj) => {
  return !(_.isUnset(obj));
}

let implies = (a, b) => {
  return (!a || b);
}

_.mixin({'isUnset': isUnset});
_.mixin({'hasValue': hasValue});
_.mixin({'implies': implies});

module.exports = _;
