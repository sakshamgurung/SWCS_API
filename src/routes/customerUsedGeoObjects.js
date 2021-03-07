const express = require('express');
const router = express.Router();
const {CustomerUsedGeoObjectController} = require('../controllers/customerUsedGeoObjectController');
const catchAsync = require('../error/catchAsync');

router.get('/customers/:id/customer-used-geo-objects',catchAsync( new CustomerUsedGeoObjectController().getCustomerUsedGeoObjectByRef));
router.get('/customer-used-geo-objects/:id',catchAsync( new CustomerUsedGeoObjectController().getCustomerUsedGeoObjectById));
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