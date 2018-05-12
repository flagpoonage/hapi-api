const BaseController = require('./base');
const db = require('../database');
const squel = require('../squel');
const Baboom = require('baboom');
const bcrypt = require('bcrypt');
const uuid = require('uuid/v4');

class AuthController extends BaseController {

  getRoutes () {
    return [
      this.makeRoute('POST', '/login', false, this.login),
      this.makeRoute('DELETE', '/logout', false, this.logout)
    ];
  }

  async login (request, h) {
    let { username, password } = request.payload || {};

    if (!username || !password) {
      throw Baboom.unauthorized({
        message: 'Missing username or password'
      });
    }

    let user;

    try {
      [user] = await db.query(
        squel.select()
          .from('users')
          .where('username = ?', username)
          .toString()
      );
    }
    catch (exception) {
      throw Baboom.internal(exception);
    }

    if (!user) {
      throw Baboom.unauthorized({
        message: 'Invalid username or password'
      });
    }

    let result = await bcrypt.compare(password, user.password);

    if (!result) {
      throw Baboom.unauthorized({
        message: 'Invalid username or password'
      });
    }
    
    let token = await this.createToken(user.id);

    return token;
  }

  async createToken (user_id) {
    const access_token = uuid(),
          refresh_token = uuid(),
          current_time = new Date().getTime(),
          access_expiry = new Date(current_time + (1000 * 60 * 60 * 24 * 7)), // 7 Days
          refresh_expiry = new Date(current_time + (1000 * 60 * 60 * 24 * 14)); // 14 days

    try {
      let [result] = await db.query(
        squel.insert()
          .into('tokens')
          .set('access_token', access_token)
          .set('refresh_token', refresh_token)
          .set('user_id', user_id)
          .set('access_expiry', access_expiry)
          .set('refresh_expiry', refresh_expiry)
          .toString()
      );

      return result;
    }
    catch (exception) {
      throw Baboom.internal(exception);
    }
  }

  async logout (request, h) {
    // TODO: Implementation
    throw Baboom.notImplemented('The logout method has not been implemented!');
  }

};

module.exports = new AuthController();