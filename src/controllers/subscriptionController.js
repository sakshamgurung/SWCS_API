const { SubscriptionServices } = require("../service/subscriptionServices");
const ApiError = require("../error/ApiError");

class SubscriptionController {
	//for customer
	async createNewSubscription(request, response, next) {
		try {
			const { body } = request;

			const subscriptionServices = new SubscriptionServices();
			const result = await subscriptionServices.createNewSubscription(body);

			response.json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Subscription Error: " + error.message);
			}
			throw error;
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
			if (error.statusCode == 500) {
				throw ApiError.serverError("Subscription Error: " + error.message);
			}
			throw error;
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
			if (error.statusCode == 500) {
				throw ApiError.serverError("Subscription Error: " + error.message);
			}
			throw error;
		}
	}
	//for customer
	async deleteSubscriptionById(request, response, next) {
		try {
			const subscriptionId = request.params.id;
			const { body } = request;

			const subscriptionServices = new SubscriptionServices();
			const result = await subscriptionServices.deleteSubscriptionById(subscriptionId, body);
			const { statusCode } = result;

			response.status(statusCode).json(result);
		} catch (error) {
			if (error.statusCode == 500) {
				throw ApiError.serverError("Subscription Error: " + error.message);
			}
			throw error;
		}
	}
}

exports.SubscriptionController = SubscriptionController;
