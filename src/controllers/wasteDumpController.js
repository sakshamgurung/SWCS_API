const { WasteDumpServices } = require("../service/wasteDumpServices");
const ApiError = require("../error/ApiError");

class WasteDumpController {
	async createNewWasteDump(request, response, next) {
		try {
			const { body } = request;

			const wasteDumpServices = new WasteDumpServices();
			const result = await wasteDumpServices.createNewWasteDump(body);

			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Waste dump object Error: " + error.message);
			}
			throw error;
		}
	}

	async getWasteDumpById(request, response, next) {
		try {
			const wasteDumpId = request.params.id;

			const wasteDumpServices = new WasteDumpServices();
			const result = await wasteDumpServices.getWasteDumpById(wasteDumpId);

			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Waste dump object Error: " + error.message);
			}
			throw error;
		}
	}

	async getWasteDumpByRef(request, response, next) {
		try {
			const { ref, id } = request.params;
			const { query } = request;

			const wasteDumpServices = new WasteDumpServices();
			const result = await wasteDumpServices.getWasteDumpByRef(ref, id, query);

			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Waste dump by ref Error: " + error.message);
			}
			throw error;
		}
	}

	async updateWasteDumpById(request, response, next) {
		try {
			const wasteDumpId = request.params.id;
			const { body } = request;

			const wasteDumpServices = new WasteDumpServices();
			const { statusCode, status } = await wasteDumpServices.updateWasteDumpById(wasteDumpId, body);

			response.status(statusCode).send(status);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Waste dump object Error: " + error.message);
			}
			throw error;
		}
	}

	async deleteWasteDumpById(request, response, next) {
		try {
			const wasteDumpId = request.params.id;
			const { body } = request;

			const wasteDumpServices = new WasteDumpServices();
			const result = await wasteDumpServices.deleteWasteDumpById(wasteDumpId, body);
			const { statusCode } = result;

			response.status(statusCode).json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Waste dump object Error: " + error.message);
			}
			throw error;
		}
	}
}

exports.WasteDumpController = WasteDumpController;
