const { UtilActionServices } = require("../service/utilActionServices");
const ApiError = require("../error/ApiError");

class UtilActionController {
	async verify(request, response, next) {
		try {
			const { body } = request;

			const utilActionServices = new UtilActionServices();
			const result = await utilActionServices.verify(body);

			response.json(result);
		} catch (error) {
			throw ApiError.serverError("Util Action Error: " + error.message);
		}
	}
}
exports.UtilActionController = UtilActionController;
