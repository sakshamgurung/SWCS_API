const express = require('express');
const router = express.Router();
const {WasteCatalogController} = require('../controllers/wasteCatalogController');
const catchAsync = require('../error/catchAsync');

const wasteCatalogController = new WasteCatalogController();

router.post('/waste-catalogs',catchAsync( wasteCatalogController.createNewWasteCatalog ));
router.get('/waste-catalogs',catchAsync( wasteCatalogController.getAllWasteCatalog));
router.get('/waste-catalogs/:id',catchAsync( wasteCatalogController.getWasteCatalogById));
router.put('/waste-catalogs/:id',catchAsync( wasteCatalogController.updateWasteCatalogById));
router.delete('/waste-catalogs/:id',catchAsync( wasteCatalogController.deleteWasteCatalogById));
module.exports = router;