const express = require('express');
const router = express.Router();
const {CustomerRequestController} = require('../controllers/customerRequestController');
const catchAsync = require('../error/catchAsync');

router.post('/customers/:id/customer-requests',catchAsync( new CustomerRequestController().createNewCustomerRequest));
router.get('/:role/customer-requests',catchAsync( new CustomerRequestController().getAllCustomerRequest));
router.get('/customer-requests/:id',catchAsync( new CustomerRequestController().getCustomerRequestById));
router.put('/customer-requests/:id',catchAsync( new CustomerRequestController().updateCustomerRequestById));
router.delete('/customer-requests/:id',catchAsync( new CustomerRequestController().deleteCustomerRequestById));
module.exports = router;