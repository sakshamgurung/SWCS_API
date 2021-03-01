const express = require('express');
const router = express.Router();
const {CustomerUsedGeoObjectController} = require('../controllers/customerUsedGeoObjectController');
const catchAsync = require('../error/catchAsync');

router.post('/customers/:id/customer-used-geo-objects',catchAsync( new CustomerUsedGeoObjectController().createNewCustomerUsedGeoObject ));
router.get('/customers/:id/customer-used-geo-objects',catchAsync( new CustomerUsedGeoObjectController().getAllCustomerUsedGeoObject));
router.get('/customer-used-geo-objects/:id',catchAsync( new CustomerUsedGeoObjectController().getCustomerUsedGeoObjectById));
router.put('/customer-used-geo-objects/:id',catchAsync( new CustomerUsedGeoObjectController().updateCustomerUsedGeoObjectById));
router.delete('/customer-used-geo-objects/:id',catchAsync( new CustomerUsedGeoObjectController().deleteCustomerUsedGeoObjectById));
module.exports = router;