const AuthController = require('./controllers/auth');
const UsersController = require('./controllers/users');

module.exports = [
  {
    method: 'GET',
    path: '/auth',
    handler: (request, h) => {
      return {
        message: 'Successfully authenticated'
      };
    }
  },
  {
    method: 'GET',
    path: '/public',
    options: {
      auth: false
    },
    handler: (request, h) => {
      return {
        message: 'No authentication required'
      };
    }
  }
].concat(
  AuthController.getRoutes(),
  UsersController.getRoutes()
);