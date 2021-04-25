const { SubscriptionServices } = require("../service/subscriptionServices");
const ApiError = require("../error/ApiError");

class SubscriptionController {
	//for customer
	async createNewSubscription(request, response, next) {
		try {
			const { body } = request;

			const subscriptionServices = new SubscriptionServices();
			const result = await subscriptionServices.createNewSubscription(body);

			// console.log(" vehicles : staff : subs : from subscription ", totalVehicle, totalStaff, subs);

			response.json(result);
		} catch (error) {
			throw ApiError.serverError("Subscription Error: " + error.message);
		}
	}
	//for customer
	async getAllSubscription(request, response, next) {
		try {
			const customerId = request.params.id;
			const { query } = request;

			const subscriptionServices = new SubscriptionServices();
			const result = await subscriptionServices.getAllSubscription(customerId, query);

			response.json(result);
		} catch (error) {
			throw ApiError.serverError("Subscription Error: " + error.message);
		}
	}
	//for company
	async getAllSubscriber(request, response, next) {
		try {
			const companyId = request.params.id;
			const { query } = request;

			const subscriptionServices = new SubscriptionServices();
			const result = await subscriptionServices.getAllSubscriber(companyId, query);

			response.json(result);
		} catch (error) {
			throw ApiError.serverError("Subscription Error: " + error.message);
		}
	}
	//for customer
	async deleteSubscriptionById(request, response, next) {
		try {
			const subscriptionId = request.params.id;
			const { body } = request;

			const subscriptionServices = new SubscriptionServices();
			const { statusCode, status } = await subscriptionServices.deleteSubscriptionById(subscriptionId, body);

			response.status(statusCode).send(status);
		} catch (error) {
			throw ApiError.serverError("Subscription Error: " + error.message);
		}
	}
}

exports.SubscriptionController = SubscriptionController;
