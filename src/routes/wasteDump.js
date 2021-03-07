const express = require('express');
const router = express.Router();
const {WasteDumpController} = require('../controllers/wasteDumpController');
const catchAsync = require('../error/catchAsync');

router.post('/customers/waste-dump',catchAsync( new WasteDumpController().createNewWasteDump ));// id not used
router.get('/:ref/:id/waste-dump',catchAsync( new WasteDumpController().getAllWasteDump));// ref: company-id, customer-id
router.get('/waste-dump/:id',catchAsync( new WasteDumpController().getWasteDumpById));
router.put('/waste-dump/:id',catchAsync( new WasteDumpController().updateWasteDumpById));
router.delete('/waste-dump/:id',catchAsync( new WasteDumpController().deleteWasteDumpById));
module.exports = router;