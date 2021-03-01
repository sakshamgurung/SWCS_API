const express = require('express');
const router = express.Router();
const {CustomerController} = require('../controllers/customerController');
const catchAsync = require('../error/catchAsync');

router.post('/customers',catchAsync( new CustomerController().createNewCustomer ));
router.get('/customers/:type',catchAsync( new CustomerController().getAllCustomerInIdArray));
router.get('/customers/:type/:id',catchAsync( new CustomerController().getCustomerById));
router.put('/customers/:type/:id',catchAsync( new CustomerController().updateCustomerById));
router.delete('/customers/:id',catchAsync( new CustomerController().deleteCustomerById));
module.exports = router;