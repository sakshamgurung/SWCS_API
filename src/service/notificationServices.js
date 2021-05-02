const Notification = require("../models/common/notification");
const ApiError = require("../error/ApiError");
const { checkForWriteErrors } = require("../utilities/errorUtil");

class NotificationServices {
	constructor() {
		this.notification = undefined;
		this.result = undefined;
	}

	async getAllNotification(role, id, query) {
		this.result = await Notification.findAll(role, id, query);
		return this.result;
	}

	async getNotificationById(id) {
		this.result = await Notification.findById(id);
		return this.result;
	}

	async deleteNotificationById(id, updateData) {
		this.result = await Notification.findByIdAndDelete(id);
		return checkForWriteErrors(
			this.result,
			"status",
			"Notification delete failed"
		);
	}
}

exports.NotificationServices = NotificationServices;
