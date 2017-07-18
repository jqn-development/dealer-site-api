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
  [400001]: {
    'summary': 'Data Validation Mismatch',
    'message': 'The validation parameters for this request are invalid for the data requested.',
    'status': 400,
  },
  [400002]: {
    'summary': 'Non-Existant Record',
    'message': 'The record requested does not exist.',
    'status': 400,
  },
  [400003]: {
    'summary': 'Missing Parameters',
    'message': 'The request is missing required parameters.',
    'status': 400,
  },
  [400004]: {
    'sumary': 'Invalid Paramaters',
    'message': 'The request paramaters incorrect, a different data type was expected.',
    'status': 400,
  },
  [400005]: {
    'sumary': 'Removed Record',
    'message': 'The record requested was delete and no longer exists.',
    'status': 400,
  },
  [401000]: {
    'summary': 'Unauthorized',
    'message': 'This request is not authorized.',
    'status': 401,
  },
  [401001]: {
    'summary': 'Unauthorized',
    'message': 'The credentials provided are unknown.',
    'status': 401,
  },
  [403000]: {
    'summary': 'Forbidden',
    'message': 'The credentials provided are not authorized for this request',
    'status': 403,
  },
  [403001]: {
    'summary': 'Forbidden',
    'message': 'Cannot target the same API Key used to make this request',
    'status': 403,
  },
  [404000]: {
    'summary': 'Not Found',
    'message': 'The requested resource does not exist or you are not authorized to access it.',
    'status': 404,
  },
  [500000]: {
    'summary': 'Could Not Connect',
    'message': 'The server connection timed out',
    'status': 500
  },
  [500001]: {
    'summary': 'General Server Error',
    'message': 'A fatal error has occurred on the server.',
    'status': 500
  },
  [500002]: {
    'summary': 'Database Error',
    'message': 'A fatal error has occurred on the database',
    'status': 500
  },
  [500003]: {
    'summary': 'Cache Error',
    'message': 'A fatal error has occurred on the caching server',
    'status': 500
  }
}

module.exports = codes;
