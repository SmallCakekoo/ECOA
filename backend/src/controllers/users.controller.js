import {
  listUsers,
  getUser,
  createUser,
  updateUserProfile,
  removeUser,
  listUserPlants,
} from "../services/users.service.js";

export const UsersController = {
  list: (req, res) => listUsers(req, res),
  get: (req, res) => getUser(req, res),
  create: (req, res) => createUser(req, res),
  update: (req, res) => updateUserProfile(req, res),
  remove: (req, res) => removeUser(req, res),
  listPlants: (req, res) => listUserPlants(req, res),
};

export default UsersController;
