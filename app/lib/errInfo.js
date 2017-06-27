// app/lib/errors.js

let errors = {
  [404000]: {
    'summary': 'Not Found',
    'message': 'The resource requested does not exist or you are not authorized to access it.',
    'status': 404,
  },
  [500001]: {
    'summary': 'General Server Error',
    'message': 'A fatal error has occurred on the server.',
    'status': 500
  }
}

module.exports = errors;
