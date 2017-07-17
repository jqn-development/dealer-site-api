// app/lib/reqUtils.js

const
  _                   = require('./lodashExt')
  , validate          = require('./validate')
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

  checkAuthContext(options, req) {
    req = req || this.req;
    // Set defaults where empty
    options = _.merge({
                  super: false,
                  signed: false,
                  server: false,
                  client: false
                }, options);

    let secCon = req.securityContext;
    // Aggregate all the options and test equality with the security context
    return (_.implies(options.super, secCon.super)) && (_.implies(options.signed, secCon.signed)) &&
           (_.implies(options.server, secCon.server)) && (_.implies(options.client, secCon.client));
  }

  // Checks the current request (connected ACL and passed siteID/dealerID (if it exists))
  checkSitePermissions(req) {
    req = req || this.req;
    let test = true;
    // Only test this if the ACL is not a super user
    if (!req.securityContext.super) {
      // If has a siteID as a part of the request
      let siteTest = true;
      let dealerTest = true;
      if (_.hasValue(req.locals.siteID)) {
        siteTest = false;
        for (let site of req.acl.sites) {
          siteTest = siteTest || (req.locals.siteID == site.siteID);
        }
      }
      // If has a dealerID as a part of the request
      if (_.hasValue(req.locals.dealerID)) {
        dealerTest = false;
        for (let site of req.acl.sites) {
          dealerTest = dealerTest || (req.locals.dealerID == site.dealerID);
        }
      }
      test = (siteTest && dealerTest);
    }
    return test;
  }

  hasRequiredParams(params) {
    // Check Required parameters
    params = params || {};
    let reqParams = [];
    let current;
    for (let key in params) {
      current = params[key];
      if (_.isUnset(params[key])) reqParams.push(key);
    }
    return reqParams;
  }

  compileRequiredParams(params) {
    // Compile required parameters into a check array
    params = params || {};
    let reqParams = {};
    let optParams = {};
    let current;
    for (let key in params) {
      current = params[key];
      if (current.required) {
        reqParams[key] = current.value;
      } else {
        optParams[key] = current.default;
      }
    }
    return { required: reqParams, optional: optParams };
  }

  // Looks for keys in the req.locals, if they are not set then it sets a default value
  handleDefaults(params, req) {
    let current;
    for (let key in params) {
      current = params[key];
      // Check if the default is a function
      if (typeof current === 'function') {
        let v = current(req.handler[key].value);
        req.handler[key].value = req.locals[key] = v;
      } else {
        // Only set default if the value is unset
        if (_.isUnset(req.handler[key].value)) {
          req.handler[key].value = req.locals[key] = current;
        }
      }
    }
  }

  // Expects an object containing the value and types for each named key
  // e.g. { dealerID: { value: 100, type: 'int' } }
  // Returns the array of non-matching values
  validateParams(params) {
    let test = [];
    let current;
    for (let key in params) {
      current = params[key];
      // Only validate when a value is present
      if ((current.value) && !validate(current.value, current.type, current.options )) {
        current.key = key;
        test.push(current);
      }
    }
    return test;
  }

  retrieveParams(params, req) {
    req = req || this.req;
    req.handler = params;
    req.locals = {};
    let current;
    for (let key in params) {
      current = params[key];
      let value;
      for (let source of current.source)
      {
        // Go through the possible sources in the request
        value = value || (source === 'headers'?req[source][key.toLowerCase()]:req[source][key]);
      }
      req.handler[key].value = req.locals[key] = value;
    }
  }

  // Expects an object containing paramater and security information
  // e.g. { params: {
  //          dealerID: { type: 'int', required: true, source: ['params', 'body', 'headers', 'query'] },
  //          limit: { type: 'int', required: false, source: ['params', 'body', 'headers', 'query'], default: (v) => { return Number((v < 1) ? 1 : (v || 1));} },
  //          page: { type: 'int', required: false, source: ['params', 'body', 'headers', 'query'], default: 1 }
  //        },
  //        security: { super: true, server: true, client: true }
  //      }
  handleRequest(params, f, next, res, req) {
    req = req || this.req;
    // Check if this has already been handled
    if (!this.hasResponse(req)) {
      // AuthContext Check
      if (!this.checkAuthContext(params.security, req)) {
          // Unauthorized user
          this.setError(403000, req);
          next(`The API Provided is not authorized to access this resource`);
          return;
      }
      // Logic to get parameters
      this.retrieveParams(params.params, req);

      // Compile optional/required params
      let sepParams = this.compileRequiredParams(req.handler);
      // Check Required params
      let reqParams = this.hasRequiredParams(sepParams.required);
      if (reqParams.length > 0) {
        // We have missing parameters, report the error
        this.setError(400003, req);
        // Return an error below
        next(`Required parameters [${reqParams}] are missing from this request.`);
        return;
      }

      // Site Permissions Check
      if (!this.checkSitePermissions(req)) {
          // Unauthorized user
          this.setError(403000, req);
          next(`The API Provided is not authorized to access this resource`);
          return;
      }

      // Set default values for optional params
      this.handleDefaults(sepParams.optional, req);

      // Validate params
      let invalidParams = this.validateParams(req.handler);
      if (invalidParams.length > 0) {
        // We have invalid paramaters, report the error
        this.setError(400004, req);
        // Return an error below
        let err = 'The parameter(s) ';
        let c = 0;
        for (let value of invalidParams) {
          if (c > 0) err =  err + ', ';
          err += `'${value.key}' should be type '${value.type}'`;
          c += 1;
        }
        err += '.';
        next(err);
        return;
      }

      // Run closure function
      try {
        f(req, res, next);
      } catch(err) {
        this.setError(500001, req);
        next(err);
      }
    } else {
      next();
    }
  }
}

module.exports = ReqUtils;
