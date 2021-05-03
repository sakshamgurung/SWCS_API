const express = require("express");
const router = express.Router();
const util = require("../utilities/notificationUtil");
const { NotificationController } = require("../controllers/notificationController");
const catchAsync = require("../error/catchAsync");

const notificationController = new NotificationController();
//router.post("/notify", catchAsync(util.notify));
router.get("/:role/:id/notifications", catchAsync(notificationController.getAllNotification)); //role: company, staff, customer
router.get("/notifications/:id", catchAsync(notificationController.getNotificationById));
router.delete("/notifications/:id", catchAsync(notificationController.deleteNotificationById));
module.exports = router;
