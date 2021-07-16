const express = require("express");
const router = express.Router();
const catchAsync = require("../error/catchAsync");
const { CompanyController } = require("../controllers/companyController");
const { AdminController } = require("../controllers/adminController");

const companyController = new CompanyController();
const adminController = new AdminController();

router.get("/company/graphdata/:id", catchAsync(companyController.getGraphDataByCompanyId));
router.get("/admin/graphdata", catchAsync(adminController.getGraphDataByAdminId));

module.exports = router;
