// app/lib/respCodes.js

let codes = {
  [200000]: {
    'summary': 'OK',
    'message': '',
    'status': 200,
  },
  [400000]: {
    'summary': 'Bad Request',
    'message': 'The request is malformed.',
    'status': 400,
  },
  [401000]: {
    'summary': 'Unauthorized',
    'message': 'The credentials provided are unknown.',
    'status': 401,
  },
  [403000]: {
    'summary': 'Forbidden',
    'message': 'The credentials provided are not authorized for this request',
    'status': 403,
  },
  [404000]: {
    'summary': 'Not Found',
    'message': 'The requested resource does not exist or you are not authorized to access it.',
    'status': 404,
  },
  [500001]: {
    'summary': 'General Server Error',
    'message': 'A fatal error has occurred on the server.',
    'status': 500
  }
}

module.exports = codes;
