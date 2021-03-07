const express = require('express');
const router = express.Router();
const {NotificationController} = require('../controllers/notificationController');
const catchAsync = require('../error/catchAsync');

router.post('/notifications',catchAsync( new NotificationController().createNewNotification));
router.get('/:role/:id/notifications',catchAsync( new NotificationController().getAllNotification));//role: company, staff, customer
router.get('/notifications/:id',catchAsync( new NotificationController().getNotificationById));
router.delete('/notifications/:id',catchAsync( new NotificationController().deleteNotificationById));
module.exports = router;