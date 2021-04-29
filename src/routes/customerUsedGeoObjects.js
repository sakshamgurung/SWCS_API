const express = require('express');
const router = express.Router();
const {CustomerUsedGeoObjectController} = require('../controllers/customerUsedGeoObjectController');
const catchAsync = require('../error/catchAsync');

const customerUsedGeoObjectController = new CustomerUsedGeoObjectController();

router.get('/customer-used-geo-objects/:id',catchAsync( customerUsedGeoObjectController.getCustomerUsedGeoObjectById));
//ref:customerId, usedTrack.trackId
router.get('/customer-used-geo-objects/:ref/:id',catchAsync( customerUsedGeoObjectController.getCustomerUsedGeoObjectByRef));
module.exports = router;
/**
 * auto created when
 *  customer dump waste in zone
 *  customer request for sub with point(loc)
 * auto deleted when
 *  collector pickup waste from zone
 * auto update when
 *  collector pickkup waste from point
 */