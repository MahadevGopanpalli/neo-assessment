const UserService = require('../services/userService');

class UserController {
  async register(req, res) {
    try {
      const data = await UserService.createUser(req.body);
      res.send({ status: data.status, msg: data.msg, data: data.data });
    } catch (error) {
      res.send({ status: 1, msg: error.message, data: {} });
    }
  }

  async getAllNormal(req, res) {
    try {
      const { page, size, sortBy, order } = req.query;
      const data = await UserService.getAllNormal(Number(page),Number(size),sortBy,Number(order));
      res.send({ status: data.status, msg: data.msg, data: data.data });
    } catch (error) {
      res.send({ status: 1, msg: error.message, data: {} });
    }
  }

  async getAll(req, res) {
    try {
      const data = await UserService.getAllUsers(req.body);
      res.send({ status: data.status, msg: data.msg, data: data.data });
    } catch (error) {
      res.send({ status: 1, msg: error.message, data: {} });
    }
  }

  async getById(req, res) {
    try {
      const data = await UserService.getUserById(req.params.id);
      res.send({ status: data.status, msg: data.msg, data: data.data });
    } catch (error) {
      res.send({ status: 1, msg: error.message, data: {} });
    }
  }

  async update(req, res) {
    try {
      const data = await UserService.updateUser(req.params.id, req.body);
      res.send({ status: data.status, msg: data.msg, data: data.data });
    } catch (error) {
      res.send({ status: 1, msg: error.message, data: {} });
    }
  }

  async delete(req, res) {
    try {
      const data = await UserService.deleteUser(req.params.id);
      res.send({ status: data.status, msg: data.msg, data: data.data });
    } catch (error) {
      res.send({ status: 1, msg: error.message, data: {} });
    }
  }
}

module.exports = new UserController();
