const express = require('express');
const router = express.Router();
const {VehicleController} = require('../controllers/vehicleController');
const catchAsync = require('../error/catchAsync');

router.post('/companies/vehicles',catchAsync( new VehicleController().createNewVehicle ));
router.get('/companies/:id/vehicles',catchAsync( new VehicleController().getAllVehicle));
router.get('/vehicles/:id',catchAsync( new VehicleController().getVehicleById));
router.put('/vehicles/:id',catchAsync( new VehicleController().updateVehicleById));
router.delete('/vehicles/:id',catchAsync( new VehicleController().deleteVehicleById));
module.exports = router;