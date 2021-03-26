const express = require('express');
const router = express.Router();
const {WasteListController} = require('../controllers/wasteListController');
const catchAsync = require('../error/catchAsync');

const wasteListController = new WasteListController();

router.post('/companies/waste-list',catchAsync( wasteListController.createNewWasteList ));
router.get('/companies/:id/waste-list',catchAsync( wasteListController.getAllWasteList));
router.get('/waste-list/:id',catchAsync( wasteListController.getWasteListById));
//ref: companyId, wasteCatalogId
router.get('/waste-list/:ref/:id',catchAsync( wasteListController.getWasteListByRef));
router.put('/waste-list/:id',catchAsync( wasteListController.updateWasteListById));
router.delete('/waste-list/:id',catchAsync( wasteListController.deleteWasteListById));
module.exports = router;