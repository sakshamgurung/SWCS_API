const express = require("express");
const router = express.Router();
const catchAsync = require("../error/catchAsync");
const { CompanyController } = require("../controllers/companyController");

const companyController = new CompanyController();

router.get("/company/graphdata/:id", catchAsync(companyController.getGraphDataByCompanyId));

module.exports = router;
