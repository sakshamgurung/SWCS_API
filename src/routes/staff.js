const express = require('express');
const router = express.Router();
const {StaffController} = require('../controllers/staffController');
const catchAsync = require('../error/catchAsync');

router.post('/companies/:id/staff',catchAsync( new StaffController().createNewStaff ));
router.get('/companies/:id/staff/:type',catchAsync( new StaffController().getAllStaff));
router.get('/staff/:type/:id',catchAsync( new StaffController().getStaffById));
router.put('/staff/:type/:id',catchAsync( new StaffController().updateStaffById));
router.delete('/staff/:id',catchAsync( new StaffController().deleteStaffById));
module.exports = router;