const { CustomerUsedGeoObjectServices } = require("../service/customerUsedGeoObjectServices");
const ApiError = require("../error/ApiError");

class CustomerUsedGeoObjectController {
	async getCustomerUsedGeoObjectById(request, response, next) {
		try {
			const customerUsedGeoObjectId = request.params.id;

			const customerUsedGeoObjectServices = new CustomerUsedGeoObjectServices();
			const result = await customerUsedGeoObjectServices.getCustomerUsedGeoObjectById(customerUsedGeoObjectId);

			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Customer used geo object Error: " + error.message);
			}
			throw error;
		}
	}

	async getCustomerUsedGeoObjectByRef(request, response, next) {
		try {
			const { ref, id } = request.params;
			const { query } = request;

			const customerUsedGeoObjectServices = new CustomerUsedGeoObjectServices();
			const result = await customerUsedGeoObjectServices.getCustomerUsedGeoObjectByRef(ref, id, query);

			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Customer used geoObject by ref Error: " + error.message);
			}
			throw error;
		}
	}
}

exports.CustomerUsedGeoObjectController = CustomerUsedGeoObjectController;
