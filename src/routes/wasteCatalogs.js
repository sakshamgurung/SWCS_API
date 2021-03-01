const express = require('express');
const router = express.Router();
const {WasteCatalogController} = require('../controllers/wasteCatalogController');
const catchAsync = require('../error/catchAsync');

router.post('/waste-catalogs',catchAsync( new WasteCatalogController().createNewWasteCatalog ));
router.get('/waste-catalogs',catchAsync( new WasteCatalogController().getAllWasteCatalog));
router.get('/waste-catalogs/:id',catchAsync( new WasteCatalogController().getWasteCatalogById));
router.put('/waste-catalogs/:id',catchAsync( new WasteCatalogController().updateWasteCatalogById));
router.delete('/waste-catalogs/:id',catchAsync( new WasteCatalogController().deleteWasteCatalogById));
module.exports = router;