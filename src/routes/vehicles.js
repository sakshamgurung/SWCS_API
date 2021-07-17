const express = require("express");
const router = express.Router();
const { VehicleController } = require("../controllers/vehicleController");
const catchAsync = require("../error/catchAsync");

const vehicleController = new VehicleController();

router.post("/companies/vehicles", catchAsync(vehicleController.createNewVehicle));
router.get("/companies/:id/vehicles", catchAsync(vehicleController.getAllVehicle));
router.get("/vehicles/:id", catchAsync(vehicleController.getVehicleById));
//r: companyId
router.get("/vehicles/:ref/:id", catchAsync(vehicleController.getVehicleByRef));
router.put("/vehicles/:id", catchAsync(vehicleController.updateVehicleById));
router.delete("/vehicles/:id", catchAsync(vehicleController.deleteVehicleById));
module.exports = router;
