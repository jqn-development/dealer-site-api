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

_.mixin({'isUnset': isUnset});
_.mixin({'hasValue': hasValue});

module.exports = _;
