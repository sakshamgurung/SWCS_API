const express = require('express');
const router = express.Router();
const {ScheduleController} = require('../controllers/scheduleController');
const catchAsync = require('../error/catchAsync');

router.post('/customers/:id/schedules',catchAsync( new ScheduleController().createNewSchedule));
router.get('/customers/:id/schedules',catchAsync( new ScheduleController().getAllSchedule));
router.get('/schedules/:id',catchAsync( new ScheduleController().getScheduleById));
router.put('/schedules/:id',catchAsync( new ScheduleController().updateScheduleById));
router.delete('/schedules/:id',catchAsync( new ScheduleController().deleteScheduleById));
module.exports = router;