const BaseController = require('./base');
const db = require('../database');
const Joi = require('joi');
const Baboom = require('baboom');
const squel = require('squel');
const bcrypt = require('bcrypt');

const schema = {
  create: Joi.object().keys({
    name: Joi.string().required(),
    username: Joi.string().min(8).max(20).required(),
    password: Joi.string().min(8).required(),
    email: Joi.string().required()
  })
};

class UsersController extends BaseController {

  getRoutes () {
    return [
      this.makeRoute('POST', '/users', false, this.create),
      this.makeRoute('GET', '/users', true, this.list),
      this.makeRoute('GET', '/users/{id}', true, this.find),
      this.makeRoute('PUT', '/users', true, this.update)
    ];
  }

  async update (request, h) {

  }

  async find (request, h) {

  }

  async list (request, h) {

  }

  async create (request, h) {
    let user, password;

    try {
      user = await schema.create.validate(request.payload);
    }
    catch (exception) {
      console.log('Validation error', exception);
      return Baboom.badData(exception);
    }

    try {
      password = await bcrypt.hash(user.password, 10);
    }
    catch (exception) {
      console.log('Unable to encrypt password', exception);
      throw Baboom.internal(exception);
    }

    try {
      let result = await db.query(
        squel.insert()
          .into('users')
          .set('username', user.username)
          .set('password', password)
          .set('email', user.email)
          .set('name', user.name)
          .toString()
      );

      return result[0];
    }
    catch (exception) {
      console.error('Unable to create user in database', exception);
      throw Baboom.internal(exception);
    }
  }

}

module.exports = new UsersController();