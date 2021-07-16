const { AdminServices } = require("../service/adminServices");
const ApiError = require("../error/ApiError");

class AdminController {
	async getGraphDataByAdminId(request, response, next) {
		try {
			// const adminId = request.params.id;
			// console.log(" adminId1 ", adminId);
			const adminServices = new AdminServices();
			const result = await adminServices.getAdminGraphData();
			response.json(result);
		} catch (error) {
			throw ApiError.serverError("Graph Error: " + error.message);
		}
	}
}

exports.AdminController = AdminController;
