const { WasteListServices } = require("../service/wasteListServices");
const ApiError = require("../error/ApiError");

class WasteListController {
	async createNewWasteList(request, response, next) {
		try {
			const { body } = request;

			const wasteListServices = new WasteListServices();
			const result = await wasteListServices.createNewWasteList(body);

			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Waste list Error: " + error.message);
			}
			throw error;
		}
	}

	async getAllWasteList(request, response, next) {
		try {
			const companyId = request.params.id;
			const { query } = request;

			const wasteListServices = new WasteListServices();
			const result = await wasteListServices.getAllWasteList(companyId, query);

			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Waste list Error: " + error.message);
			}
			throw error;
		}
	}

	async getWasteListById(request, response, next) {
		try {
			const wasteListId = request.params.id;

			const wasteListServices = new WasteListServices();
			const result = await wasteListServices.getWasteListById(wasteListId);

			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Waste list Error: " + error.message);
			}
			throw error;
		}
	}

	async getWasteListByRef(request, response, next) {
		try {
			const { ref, id } = request.params;
			const { query } = request;

			const wasteListServices = new WasteListServices();
			const result = await wasteListServices.getWasteListByRef(ref, id, query);

			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Waste list by ref Error: " + error.message);
			}
			throw error;
		}
	}

	async updateWasteListById(request, response, next) {
		try {
			const wasteListId = request.params.id;
			const { body } = request;

			const wasteListServices = new WasteListServices();
			const { statusCode, status } = await wasteListServices.updateWasteListById(wasteListId, body);

			response.status(statusCode).send(status);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Waste list Error: " + error.message);
			}
			throw error;
		}
	}

	async deleteWasteListById(request, response, next) {
		try {
			const wasteListId = request.params.id;

			const wasteListServices = new WasteListServices();
			const result = await wasteListServices.deleteWasteListById(wasteListId);
			const { statusCode } = result;

			response.status(statusCode).json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Waste list Error: " + error.message);
			}
			throw error;
		}
	}
}

exports.WasteListController = WasteListController;
