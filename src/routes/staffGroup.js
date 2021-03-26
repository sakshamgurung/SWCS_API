const express = require('express');
const router = express.Router();
const {StaffGroupController} = require('../controllers/staffGroupController');
const catchAsync = require('../error/catchAsync');

const staffGroupController = new StaffGroupController();

router.post('/companies/staff-group',catchAsync( staffGroupController.createNewStaffGroup) );// id not used
router.get('/companies/:id/staff-group',catchAsync( staffGroupController.getAllStaffGroup));
router.get('/staff-group/:id',catchAsync( staffGroupController.getStaffGroupById));
//ref: companyId, staffId
router.get('/staff-group/:ref/:id',catchAsync( staffGroupController.getStaffGroupByRef));
router.put('/staff-group/:id',catchAsync( staffGroupController.updateStaffGroupById));
router.delete('/staff-group/:id',catchAsync( staffGroupController.deleteStaffGroupById));
module.exports = router;