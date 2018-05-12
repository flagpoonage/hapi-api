const Hapi = require('hapi');
const Routes = require('./routes');
const loadMiddleware = require

const server = Hapi.server({
  host: 'localhost',
  port: '8000'
});

async function loadRoutes () {
  server.route(Routes);
}

async function start () {
  try {
    await server.start();
  }
  catch (exception) {
    console.error('An exception occured', exception);
    process.exit(1);
  }

  console.info('API service started', server.info);
}