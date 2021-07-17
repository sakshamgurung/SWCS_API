const { ScheduleServices } = require("../service/scheduleServices");
const ApiError = require("../error/ApiError");

class ScheduleController {
	async getAllSchedule(request, response, next) {
		try {
			const customerId = request.params.id;
			const { query } = request;

			const scheduleServices = new ScheduleServices();
			const result = await scheduleServices.getAllSchedule(customerId, query);

			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Schedule Error: " + error.message);
			}
			throw error;
		}
	}

	async getScheduleById(request, response, next) {
		try {
			const scheduleId = request.params.id;

			const scheduleServices = new ScheduleServices();
			const result = await scheduleServices.getScheduleById(scheduleId);

			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Schedule Error: " + error.message);
			}
			throw error;
		}
	}

	async getScheduleByRef(request, response, next) {
		try {
			const { ref, id } = request.params;
			const { query } = request;

			const scheduleServices = new ScheduleServices();
			const result = await scheduleServices.getScheduleByRef(ref, id, query);

			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Schedule by ref Error: " + error.message);
			}
			throw error;
		}
	}
}

exports.ScheduleController = ScheduleController;
