const BaseController = require('./base');
const db = require('../database');

class UsersController extends BaseController {

  getRoutes () {
    return [
      this.makeRoute('POST', '/users', false, this.create),
      this.makeRoute('GET', '/users', true, this.list),
      this.makeRoute('GET', '/users/{id}', true, this.find),
      this.makeRoute('PUT', '/users', true, this.update)
    ]
  }

  async update (request, h) {

  }

  async find (request, h) {

  }

  async list (request, h) {

  }

  async create (request, h) {

  }

}