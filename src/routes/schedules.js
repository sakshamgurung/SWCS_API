const express = require('express');
const router = express.Router();
const {ScheduleController} = require('../controllers/scheduleController');
const catchAsync = require('../error/catchAsync');

const scheduleController = new ScheduleController();

router.get('/customers/:id/schedules',catchAsync( scheduleController.getAllSchedule));
router.get('/schedules/:id',catchAsync( scheduleController.getScheduleById));
//ref:customerId, workId, customerRequestId
router.get('/schedules/:ref/:id',catchAsync( scheduleController.getScheduleByRef));
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