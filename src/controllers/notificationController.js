const { NotificationServices } = require("../service/notificationServices");
const ApiError = require("../error/ApiError");

class NotificationController {
	async getAllNotification(request, response, next) {
		try {
			const { role, id } = request.params;
			const { query } = request;

			const notificationServices = new NotificationServices();
			const result = await notificationServices.getAllNotification(role, id, query);

			response.json(result);
		} catch (error) {
			throw ApiError.serverError("Notification Error: " + error.message);
		}
	}

	async getNotificationById(request, response, next) {
		try {
			const notificationId = request.params.id;

			const notificationServices = new NotificationServices();
			const result = await notificationServices.getNotificationById(notificationId);

			response.json(result);
		} catch (error) {
			throw ApiError.serverError("Notification Error: " + error.message);
		}
	}

	async deleteNotificationById(request, response, next) {
		try {
			const notificationId = request.params.id;

			const notificationServices = new NotificationServices();
			const result = await notificationServices.deleteNotificationById(notificationId);
			const { statusCode } = result;

			response.status(statusCode).json(result);
		} catch (error) {
			throw ApiError.serverError("Notification Error: " + error.message);
		}
	}
}

exports.NotificationController = NotificationController;
