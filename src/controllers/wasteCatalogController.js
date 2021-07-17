const { WasteCatalogServices } = require("../service/wasteCatalogServices");
const ApiError = require("../error/ApiError");

class WasteCatalogController {
	async createNewWasteCatalog(request, response, next) {
		try {
			const { body } = request;

			const wasteCatalogServices = new WasteCatalogServices();
			const result = await wasteCatalogServices.createNewWasteCatalog(body);

			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Waste catalog Error: " + error.message);
			}
			throw error;
		}
	}

	async getAllWasteCatalog(request, response, next) {
		try {
			const { query } = request;

			const wasteCatalogServices = new WasteCatalogServices();
			const result = await wasteCatalogServices.getAllWasteCatalog(query);

			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Waste catalog Error: " + error.message);
			}
			throw error;
		}
	}

	async getWasteCatalogById(request, response, next) {
		try {
			const id = request.params.id;

			const wasteCatalogServices = new WasteCatalogServices();
			const result = await wasteCatalogServices.getWasteCatalogById(id);

			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Waste catalog Error: " + error.message);
			}
			throw error;
		}
	}

	async updateWasteCatalogById(request, response, next) {
		try {
			const id = request.params.id;
			const updateData = request.body;

			const wasteCatalogServices = new WasteCatalogServices();
			const { statusCode, status } = await wasteCatalogServices.updateWasteCatalogById(id, updateData);

			response.status(statusCode).send(status);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Waste catalog Error: " + error.message);
			}
			throw error;
		}
	}

	async deleteWasteCatalogById(request, response, next) {
		try {
			const id = request.params.id;
			const { body } = request;

			const wasteCatalogServices = new WasteCatalogServices();
			const result = await wasteCatalogServices.deleteWasteCatalogById(id, body);
			const { statusCode } = result;

			response.status(statusCode).json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Waste catalog Error: " + error.message);
			}
			throw error;
		}
	}
}

exports.WasteCatalogController = WasteCatalogController;
