try {
  require('../config');
}
catch (exception) {
  console.error('Unable to load configuration file');
  process.exit(1);
}

const Hapi = require('hapi');
const Routes = require('./routes');
const Baboom = require('baboom');
const Boom = require('boom');
const dbpool = require('./database');
const { Pool } = require('pg');

Baboom.addTransform((payload, error) => {
  
  if (payload) {
    delete payload.message;
  
    return {
      code: error.output.statusCode,
      message: error.output.payload.message,
      payload: payload
    }
  }
  else {
    return new Boom(null, {
      statusCode: error.output.statusCode
    }).output.payload;
  }

});

const server = Hapi.server({
  host: 'localhost',
  port: '8000'
});

async function start () {
  try {
    await server.register(require('./authentication'));

    console.log('Connection pool', dbpool.constructor === Pool);

    server.auth.strategy('dbtoken', 'token', {
      connection_pool: dbpool,
      encryption_key: 'secret key'
    });

    server.auth.default('dbtoken');

    await server.route(Routes);
    await server.start();
  }
  catch (exception) {
    console.error('An exception occured', exception);
    process.exit(1);
  }

  console.info('API service started', server.info);
};

start();