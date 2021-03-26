const express = require('express');
const router = express.Router();
const {GeoObjectController} = require('../controllers/geoObjectController');
const catchAsync = require('../error/catchAsync');

const geoObjectController = new GeoObjectController();

//@route POST 
//@desc add geo-object track
//@access
router.post('/companies/geo-objects/:type',catchAsync( geoObjectController.createNewGeoObject ));//zone, track
router.get('/companies/:id/geo-objects/:type',catchAsync( geoObjectController.getAllGeoObject));
router.get('/geo-objects/:type/:id',catchAsync( geoObjectController.getGeoObjectById));
//type: zone, track
//ref for zone: companyId
//ref for track: companyId, workId
router.get('/geo-objects/:type/:ref/:id',catchAsync( geoObjectController.getGeoObjectByRef));
router.put('/geo-objects/:type/:id',catchAsync( geoObjectController.updateGeoObjectById));
router.delete('/geo-objects/:type/:id',catchAsync( geoObjectController.deleteGeoObjectById));
module.exports = router;