const express = require('express');
const router = express.Router();
const {StaffController} = require('../controllers/staffController');
const catchAsync = require('../error/catchAsync');

router.post('/companies/staff',catchAsync( new StaffController().newStaffInfo ));//id not used
router.get('/companies/:id/staff/:type',catchAsync( new StaffController().getAllStaff));//type: staff, staff-detail
router.get('/staff/:type/:id',catchAsync( new StaffController().getStaffById));
router.put('/staff/:type/:id',catchAsync( new StaffController().updateStaffById));
router.delete('/staff/:id',catchAsync( new StaffController().deleteStaffById));
//password reset
//login session
module.exports = router;