const Boom = require('boom');
const Hoek = require('hoek');
const Joi = require('joi');
const { Pool } = require('pg');
const Baboom = require('baboom');
const squel = require('squel');
const CryptoJS = require('crypto-js');

const internals = {};

internals.implementation = (server, options) => {

  console.log('Options inbound', options);

  Hoek.assert(!!options, 'No options were provided to the token auth scheme');
  Hoek.assert(options.connection_pool, 'No connection pool was provided');
  Hoek.assert(options.encryption_key, 'No encryption key was provided');

  return {

    authenticate: async (request, h) => {

      const auth = request.headers.Authorization;

      // Check that the authorization header was provided.
      if (!auth) {
        throw Baboom.unauthorized({
          message: 'No access token was provided'
        });
      }

      const parts = auth.split(' ');

      // Validate that the authorization header is in the correct format: Bearer {token}
      if (parts[0] !== 'Bearer' || parts.length !== 2) {
        throw Baboom.unauthorized({
          message: 'Bad HTTP authentication header format',
          token: auth
        });
      }

      const cred_enc = Buffer.from(parts[1], 'base64');

      let cred_parts;

      // Decrypt the access token
      try {
        cred_parts = CryptoJS.AES.decrypt(cred_enc, options.encryption_key);
      }
      catch (exception) {
        throw Baboom.unauthorized({
          message: 'Invalid access token provided',
          token: auth
        });
      }

      // Split decrypted token, to time and token: {time} {token}
      let [time, token] = cred_parts.split(' ');

      time = Number(time);

      // Validate that time is a correct value.
      if (isNaN(time)) {
        throw Baboom.unauthorized({
          message: 'Token usage time could not be calculated correctly',
          token: token,
          time: time
        });
      }

      const current_time = new Date().getTime();

      // Check whether the generated token time was within the minute. This prevents replays
      if (current_time > time + 60000 || current_time < time) {
        throw Baboom.unauthorized({
          message: 'Token usage time has already expired, or is set in the future',
          current_time: current_time,
          time: time,
          token: token
        });
      }

      let query_results = null;

      // Fetch the token and account details from the database
      try {
        query_results = await connection_pool.query(
          squel.select()
            .from('tokens', 't')
            .from('users', 'u')
            .where('t.id = ?', token)
            .where('u.id = t.user_id')
        );
      }
      catch (ex) {
        throw Baboom.internal(ex);
      }

      // Check that the token exists.
      if (!query_results[0]) {
        throw Baboom.unauthorized({
          message: 'Invalid access token',
          token: token
        });
      }

      let expire_time = query_results[0].access_expiry.getTime();

      // Check that the token is not expired.
      if (current_time >= expire_time) {
        throw Baboom.unauthorized({
          message: 'Access token expired',
          token: token,
          expired_at: query_results[0].access_expiry
        });
      }

      return h.authenticated({ credentials: query_results });
    }
  }


};
exports.name = "Database Token Auth";
exports.register = server => {
  server.auth.scheme('token', internals.implementation);
}