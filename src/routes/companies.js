const express = require('express');
const router = express.Router();
const {CompanyController} = require('../controllers/companyController');
const catchAsync = require('../error/catchAsync');

const companyController = new CompanyController();

router.post('/companies', catchAsync( companyController.newCompanyInfo ));
router.get('/companies/:type',catchAsync( companyController.getAllCompany));//type: company, company-detail, company-service-detail
router.get('/companies/:type/:id',catchAsync( companyController.getCompanyById));
//type:company-detail, company-service-detail
//ref:companyId
router.get('/companies/:type/:ref/:id',catchAsync(companyController.getCompanyByRef));
router.put('/companies/:type/:id',catchAsync( companyController.updateCompanyById));
router.delete('/companies/:id',catchAsync( companyController.deleteCompanyById));
module.exports = router;