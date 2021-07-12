const { WorkServices } = require("../service/workServices");
const ApiError = require("../error/ApiError");

class WorkController {
	async createNewWork(request, response, next) {
		try {
			const { body } = request;

			const workServices = new WorkServices();
			const result = await workServices.createNewWork(body);

			response.json(result);
		} catch (error) {
			throw ApiError.serverError("Work Error: " + error.message);
		}
	}

	async getAllWork(request, response, next) {
		try {
			const { role, id } = request.params;
			const { query } = request;

			const workServices = new WorkServices();
			const result = await workServices.getAllWork(role, id, query);

			response.json(result);
		} catch (error) {
			throw ApiError.serverError("Work Error: " + error.message);
		}
	}

	async getWorkById(request, response, next) {
		try {
			const workId = request.params.id;

			const workServices = new WorkServices();
			const result = await workServices.getWorkById(workId);

			response.json(result);
		} catch (error) {
			throw ApiError.serverError("Work Error: " + error.message);
		}
	}

	async getWorkByRef(request, response, next) {
		try {
			const { ref, id } = request.params;
			const { query } = request;

			const workServices = new WorkServices();
			const result = await workServices.getWorkByRef(ref, id, query);

			response.json(result);
		} catch (error) {
			throw ApiError.serverError("Work by ref Error: " + error.message);
		}
	}

	async updateWorkById(request, response, next) {
		try {
			const workId = request.params.id;
			const { body } = request;

			const workServices = new WorkServices();
			const { statusCode, status } = await workServices.updateWorkById(workId, body);

			response.status(statusCode).send(status);
		} catch (error) {
			throw ApiError.serverError("Work Error: " + error.message);
		}
	}

	async deleteWorkById(request, response, next) {
		try {
			const workId = request.params.id;
			const { body } = request;

			const workServices = new WorkServices();
			const result = await workServices.deleteWorkById(workId, body);
			const { statusCode } = result;

			response.status(statusCode).json(result);
		} catch (error) {
			throw ApiError.serverError("Work Error: " + error.message);
		}
	}
}

exports.WorkController = WorkController;
