const express = require('express');
const router = express.Router();
const {GeoObjectController} = require('../controllers/geoObjectController');
const catchAsync = require('../error/catchAsync');
//@route POST 
//@desc add geo-object track
//@access
router.post('/companies/:id/geo-objects/:type',catchAsync( new GeoObjectController().createNewGeoObject ));
router.get('/companies/:id/geo-objects/:type',catchAsync( new GeoObjectController().getAllGeoObject));
router.get('/geo-objects/:type/:id',catchAsync( new GeoObjectController().getGeoObjectById));
router.put('/geo-objects/:type/:id',catchAsync( new GeoObjectController().updateGeoObjectById));
router.delete('/geo-objects/:type/:id',catchAsync( new GeoObjectController().deleteGeoObjectById));
module.exports = router;