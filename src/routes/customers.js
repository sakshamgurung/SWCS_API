const express = require("express");
const router = express.Router();
const { CustomerController } = require("../controllers/customerController");
const catchAsync = require("../error/catchAsync");

const customerController = new CustomerController();

router.post("/customers", catchAsync(customerController.newCustomerInfo));
router.get("/customers/:type", catchAsync(customerController.getAllCustomerInIdArray)); //idArray[] of customer in body
router.get("/customers/:type/:id", catchAsync(customerController.getCustomerById));
//type:customer-detail
//r:customerId
router.get("/customers/:type/:ref/:id", catchAsync(customerController.getCustomerByRef));
router.put("/customers/:type/:id", catchAsync(customerController.updateCustomerById));
router.delete("/customers/:id", catchAsync(customerController.deleteCustomerById));
module.exports = router;
