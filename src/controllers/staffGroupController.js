const { StaffGroupServices } = require("../service/staffGroupServices");
const ApiError = require("../error/ApiError");

class StaffGroupController {
	async createNewStaffGroup(request, response, next) {
		try {
			const { body } = request;

			const staffGroupServices = new StaffGroupServices();
			const result = await staffGroupServices.createNewStaffGroup(body);

			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Staff group Error: " + error.message);
			}
			throw error;
		}
	}

	async getAllStaffGroup(request, response, next) {
		try {
			const companyId = request.params.id;
			const { query } = request;

			const staffGroupServices = new StaffGroupServices();
			const result = await staffGroupServices.getAllStaffGroup(companyId, query);

			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Staff group Error: " + error.message);
			}
			throw error;
		}
	}

	async getStaffGroupById(request, response, next) {
		try {
			const staffGroupId = request.params.id;

			const staffGroupServices = new StaffGroupServices();
			const result = await staffGroupServices.getStaffGroupById(staffGroupId);

			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Staff group Error: " + error.message);
			}
			throw error;
		}
	}

	async getStaffGroupByRef(request, response, next) {
		try {
			const { ref, id } = request.params;
			let { query } = request;

			const staffGroupServices = new StaffGroupServices();
			const result = await staffGroupServices.getStaffGroupByRef(ref, id, query);

			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Staff group by ref Error: " + error.message);
			}
			throw error;
		}
	}

	async updateStaffGroupById(request, response, next) {
		try {
			const staffGroupId = request.params.id;
			const { body } = request;

			const staffGroupServices = new StaffGroupServices();
			const { statusCode, status } = await staffGroupServices.updateStaffGroupById(staffGroupId, body);

			response.status(statusCode).send(status);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Staff group Error: " + error.message);
			}
			throw error;
		}
	}

	async deleteStaffGroupById(request, response, next) {
		try {
			const staffGroupId = request.params.id;

			const staffGroupServices = new StaffGroupServices();
			const result = await staffGroupServices.deleteStaffGroupById(staffGroupId);
			const { statusCode } = result;

			response.status(statusCode).json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Staff group Error: " + error.message);
			}
			throw error;
		}
	}
}

exports.StaffGroupController = StaffGroupController;
