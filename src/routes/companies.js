const express = require('express');
const router = express.Router();
const {CompanyController} = require('../controllers/companyController');
const catchAsync = require('../error/catchAsync');

router.post('/companies', catchAsync( new CompanyController().newCompanyInfo ));
router.get('/companies/:type',catchAsync( new CompanyController().getAllCompany));//type: company, company-detail, company-service-detail
router.get('/companies/:type/:id',catchAsync( new CompanyController().getCompanyById));
router.put('/companies/:type/:id',catchAsync( new CompanyController().updateCompanyById));
router.delete('/companies/:id',catchAsync( new CompanyController().deleteCompanyById));
module.exports = router;