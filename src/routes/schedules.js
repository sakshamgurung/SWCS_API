const express = require('express');
const router = express.Router();
const {ScheduleController} = require('../controllers/scheduleController');
const catchAsync = require('../error/catchAsync');

router.get('/customers/:id/schedules',catchAsync( new ScheduleController().getAllSchedule));
router.get('/schedules/:id',catchAsync( new ScheduleController().getScheduleById));
module.exports = router;
/** 
 * auto created when 
 *  company confirmed work
 *  company accepts customer_request
 * auto deleted when 
 *  collector finished work
 *  collector finished customer_request
 *  company deletes confirmed work
 *  company deletes accepted request
 *  customer deletes accepted request
*/