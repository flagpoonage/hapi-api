const Boom = require('boom');
const Bcrypt = require('bcrypt');
const Hoek = require('hoek');
const Joi = require('joi');
const { Pool } = require('pg');

const internals = {};

const database_schema = Joi.object().requiredKeys({
  
  host: Joi.string().required(),
  port: Joi.number().max(65535).required(),
  username: Joi.string.required(),
  password: Joi.string.password(),
  using: Joi.object().requiredKeys({
    
    name: Joi.string().required(),
    table: Joi.string.required(),
    username: Joi.string.required(),
    password: Joi.string.required(),
    credentials: Joi.array().items(Joi.string()).min(1).required()

  }).required()

}).required();


const connection_pool = new Pool();

internals.implementation = async (server, options) => {

  Hoek.assert(options, 'Missing token auth strategy options');
  Hoek.assert(options.store || options.database, 'Missing database or store in token auth strategy');

  if (options.database) {
    options.database = await database_schema.validate(options.database); 
    Hoek.assert(!store, 'You can not specify a store if you use a database connection');
  }
  else {
    options.store = await Joi.array().items(Joi.object()).validate(options.store);
  }

  if (options.database) {
    try {
      await connection_pool.connect({
        host: options.database.host
      });
    }
    catch (exception) {
      console.error('Error connecting to the authentication database');
      throw new Error('Unable to connect to authentication database');
    }
  }

  return {
    authenticate: async (request, h) => {

      const auth = request.headers.Authorization;

      if (!auth) {
        return Boom.unauthorized()
      }
      
    }
  }


};

exports.plugins = {
  register: server => {
    server.auth.scheme('token', internals.implementation);
    server.auth.default('token');
  }
};