const express = require("express");
const router = express.Router();
const { NotificationController } = require("../controllers/notificationController");
const catchAsync = require("../error/catchAsync");

const notificationController = new NotificationController();
router.get("/:role/:id/notifications", catchAsync(notificationController.getAllNotification)); //role: company, staff, customer
router.get("/notifications/:id", catchAsync(notificationController.getNotificationById));
router.delete("/notifications/:id", catchAsync(notificationController.deleteNotificationById));
module.exports = router;
