const { VehicleServices } = require("../service/vehicleServices");
const ApiError = require("../error/ApiError");

class VehicleController {
	async createNewVehicle(request, response, next) {
		try {
			const { body } = request;

			const vehicleServices = new VehicleServices();
			const result = await vehicleServices.createNewVehicle(body);

			response.json(result);
		} catch (error) {
			throw ApiError.serverError("Vehicle Error: " + error.message);
		}
	}

	async getAllVehicle(request, response, next) {
		try {
			const companyId = request.params.id;
			const { query } = request;

			const vehicleServices = new VehicleServices();
			const result = await vehicleServices.getAllVehicle(companyId, query);

			response.json(result);
		} catch (error) {
			throw ApiError.serverError("Vehicle Error: " + error.message);
		}
	}

	async getVehicleById(request, response, next) {
		try {
			const vehicleId = request.params.id;

			const vehicleServices = new VehicleServices();
			const result = await vehicleServices.getVehicleById(vehicleId);

			response.json(result);
		} catch (error) {
			throw ApiError.serverError("Vehicle Error: " + error.message);
		}
	}

	async getVehicleByRef(request, response, next) {
		try {
			const { ref, id } = request.params;
			const { query } = request;

			const vehicleServices = new VehicleServices();
			const result = await vehicleServices.getVehicleByRef(ref, id, query);

			response.json(result);
		} catch (error) {
			throw ApiError.serverError("Vehicle by ref Error: " + error.message);
		}
	}

	async updateVehicleById(request, response, next) {
		try {
			const vehicleId = request.params.id;
			const { body } = request;

			const vehicleServices = new VehicleServices();
			const { statusCode, status } = await vehicleServices.updateVehicleById(vehicleId, body);

			response.status(statusCode).send(status);
		} catch (error) {
			throw ApiError.serverError("Vehicle Error: " + error.message);
		}
	}

	async deleteVehicleById(request, response, next) {
		try {
			const vehicleId = request.params.id;

			const vehicleServices = new VehicleServices();
			const result = await vehicleServices.deleteVehicleById(vehicleId);
			const { statusCode } = result;

			response.status(statusCode).json(result);
		} catch (error) {
			throw ApiError.serverError("Vehicle Error: " + error.message);
		}
	}
}

exports.VehicleController = VehicleController;
