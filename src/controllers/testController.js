const { TestServices } = require("../service/testServices");
const ApiError = require("../error/ApiError");

class TestController {
	async cleanTestEntries(request, response, next) {
		try {
			const { body } = request;

			const testServices = new TestServices();
			const result = await testServices.cleanTestEntries(body);
			const { statusCode } = result;

			response.status(statusCode).json(result);
		} catch (error) {
			throw ApiError.serverError("TestController Error: " + error.message);
		}
	}
}

exports.TestController = TestController;
