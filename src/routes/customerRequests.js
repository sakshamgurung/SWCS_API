const express = require('express');
const router = express.Router();
const {CustomerRequestController} = require('../controllers/customerRequestController');
const catchAsync = require('../error/catchAsync');

const customerRequestController = new CustomerRequestController();

router.post('/customers/customer-requests',catchAsync( customerRequestController.createNewCustomerRequest));//id not used
router.get('/:role/:id/customer-requests',catchAsync( customerRequestController.getAllCustomerRequest));//role:company, customer, staff id: company,customer, staff_group
router.get('/customer-requests/:id',catchAsync( customerRequestController.getCustomerRequestById));
//ref:companyId, customerId, staffGroupId, vehicleId
router.get('/customer-requests/:ref/:id',catchAsync( customerRequestController.getCustomerRequestByRef));
router.put('/customer-requests/:id',catchAsync( customerRequestController.updateCustomerRequestById));
router.delete('/customer-requests/:id',catchAsync( customerRequestController.deleteCustomerRequestById));
module.exports = router;