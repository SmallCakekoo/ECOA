import {
  listPlants,
  getPlant,
  createPlant,
  updatePlantProfile,
  updatePlantMetrics,
  removePlant,
  assignAccessory,
} from "../services/plants.service.js";

export const PlantsController = {
  list: (req, res) => listPlants(req, res),
  get: (req, res) => getPlant(req, res),
  create: (req, res) => createPlant(req, res),
  update: (req, res) => updatePlantProfile(req, res),
  updateMetrics: (req, res) => updatePlantMetrics(req, res),
  remove: (req, res) => removePlant(req, res),
  assignAccessory: (req, res) => assignAccessory(req, res),
};

export default PlantsController;
