const express = require('express');
const router = express.Router();
const {StaffGroupController} = require('../controllers/staffGroupController');
const catchAsync = require('../error/catchAsync');

router.post('/companies/:id/staff-group',catchAsync( new StaffGroupController().createNewStaffGroup) );
router.get('/companies/:id/staff-group',catchAsync( new StaffGroupController().getAllStaffGroup));
router.get('/staff-group/:id',catchAsync( new StaffGroupController().getStaffGroupById));
router.put('/staff-group/:id',catchAsync( new StaffGroupController().updateStaffGroupById));
router.delete('/staff-group/:id',catchAsync( new StaffGroupController().deleteStaffGroupById));
module.exports = router;