const { GeoObjectServices } = require("../service/geoObjectServices");
const ApiError = require("../error/ApiError");
const { geoObjectClientToServer } = require("../utilities/geoObjectUtil");

const _ = require("lodash");

class GeoObjectController {
	async createNewGeoObject(request, response, next) {
		try {
			const geoObjectType = request.params.type;
			let { body } = request;
			body = geoObjectClientToServer(body);
			const geoObjectServices = new GeoObjectServices();
			const result = await geoObjectServices.createNewGeoObject(geoObjectType, body);
			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Geo object Error: " + error.message);
			}
			throw error;
		}
	}

	async getAllGeoObject(request, response, next) {
		try {
			const geoObjectType = request.params.type;
			const companyId = request.params.id;
			const { query } = request;

			const geoObjectServices = new GeoObjectServices();
			const result = await geoObjectServices.getAllGeoObject(geoObjectType, companyId, query);

			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Geo object Error: " + error.message);
			}
			throw error;
		}
	}

	async getGeoObjectById(request, response, next) {
		try {
			const geoObjectType = request.params.type;
			const geoObjectId = request.params.id;

			const geoObjectServices = new GeoObjectServices();
			const result = await geoObjectServices.getGeoOjectById(geoObjectType, geoObjectId);

			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Geo object Error: " + error.message);
			}
			throw error;
		}
	}

	async getGeoObjectByRef(request, response, next) {
		try {
			const geoObjectType = request.params.type;
			const { ref, id } = request.params;
			const { query } = request;

			const geoObjectServices = new GeoObjectServices();
			const result = await geoObjectServices.getGeoOjectByRef(geoObjectType, ref, id, query);

			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Geo object by ref Error: " + error.message);
			}
			throw error;
		}
	}

	async updateGeoObjectById(request, response, next) {
		try {
			const geoObjectType = request.params.type;
			const geoObjectId = request.params.id;
			let { body } = request;
			body = geoObjectClientToServer(body);

			const geoObjectServices = new GeoObjectServices();
			const { statusCode, status } = await geoObjectServices.updateGeoObjectById(geoObjectType, geoObjectId, body);

			response.status(statusCode).send(status);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Geo object Error: " + error.message);
			}
			throw error;
		}
	}

	async deleteGeoObjectById(request, response, next) {
		try {
			const geoObjectType = request.params.type;
			const geoObjectId = request.params.id;

			const geoObjectServices = new GeoObjectServices();
			const result = await geoObjectServices.deleteGeoObjectById(geoObjectType, geoObjectId);
			const { statusCode } = result;

			response.status(statusCode).json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Geo object Error: " + error.message);
			}
			throw error;
		}
	}
}

exports.GeoObjectController = GeoObjectController;
