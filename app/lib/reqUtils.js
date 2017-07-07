// app/lib/reqUtils.js

const
  _                   = require('./lodashExt')
;

// This class exists to move repeated functionality out of controllers to reduce
// repeated code
class ReqUtils {
  constructor(req) {
    this.req = req;
  }

  hasResponse(req) {
    req = req || this.req;
    return ((req) && ((req.hasData || req.hasError)));
  }

  hasRequiredParams(paramList) {
    // Check Required parameters
    paramList = paramList || {};
    let reqParams = [];
    for (let key in paramList) {
      if (_.isUnset(paramList[key])) reqParams.push(key);
    }
    return reqParams;
  }

  setError(code, req) {
    req = req || this.req;
    req.hasError = true;
    req.respCode = code;
  }

  setData(data, req) {
    req = req || this.req;
    req.hasData = true;
    req.data = data;
  }

}

module.exports = ReqUtils;
