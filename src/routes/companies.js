const express = require('express');
const router = express.Router();
const {CompanyController} = require('../controllers/companyController');
const catchAsync = require('../error/catchAsync');

router.post('/companies', catchAsync( new CompanyController().createNewCompany ));
router.get('/companies/:type',catchAsync( new CompanyController().getAllCompany));
router.get('/companies/:type/:id',catchAsync( new CompanyController().getCompanyById));
router.put('/companies/:type/:id',catchAsync( new CompanyController().updateCompanyById));
router.delete('/companies/:id',catchAsync( new CompanyController().deleteCompanyById));
module.exports = router;