const express = require('express');
const router = express.Router();
const {StaffController} = require('../controllers/staffController');
const catchAsync = require('../error/catchAsync');

const staffController = new StaffController();

router.post('/companies/staff',catchAsync( staffController.newStaffInfo ));//id not used
router.get('/companies/:id/staff/:type',catchAsync( staffController.getAllStaff));//type: staff, staff-detail
router.get('/staff/:type/:id',catchAsync( staffController.getStaffById));
//type: staff, staff-detail
//ref for staff: companyId
//ref for staff-detail: companyId, staffId, staffGroupId
router.get('/staff/:type/:ref/:id',catchAsync( staffController.getStaffByRef));
router.put('/staff/:type/:id',catchAsync( staffController.updateStaffById));
router.delete('/staff/:id',catchAsync( staffController.deleteStaffById));
//password reset
//login session
module.exports = router;