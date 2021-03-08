const express = require('express');
const router = express.Router();
const {CustomerRequestController} = require('../controllers/customerRequestController');
const catchAsync = require('../error/catchAsync');

router.post('/customers/customer-requests',catchAsync( new CustomerRequestController().createNewCustomerRequest));//id not used
router.get('/:role/:id/customer-requests',catchAsync( new CustomerRequestController().getAllCustomerRequest));//role:company, customer, staff id: company,customer, staff_group
router.get('/customer-requests/:id',catchAsync( new CustomerRequestController().getCustomerRequestById));
router.put('/customer-requests/:id',catchAsync( new CustomerRequestController().updateCustomerRequestById));
router.delete('/customer-requests/:id',catchAsync( new CustomerRequestController().deleteCustomerRequestById));
module.exports = router;