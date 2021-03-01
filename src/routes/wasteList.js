const express = require('express');
const router = express.Router();
const {WasteListController} = require('../controllers/wasteListController');
const catchAsync = require('../error/catchAsync');

router.post('/companies/:id/waste-list',catchAsync( new WasteListController().createNewWasteList ));
router.get('/companies/:id/waste-list',catchAsync( new WasteListController().getAllWasteList));
router.get('/waste-list/:id',catchAsync( new WasteListController().getWasteListById));
router.put('/waste-list/:id',catchAsync( new WasteListController().updateWasteListById));
router.delete('/waste-list/:id',catchAsync( new WasteListController().deleteWasteListById));
module.exports = router;