const mongoose = require("mongoose");
const _ = require("lodash");

const ApiError = require("../error/ApiError");
const { checkTransactionResults, checkForWriteErrors } = require("../utilities/errorUtil");
const CustomerRequest = require("../models/common/customerRequest");
const Subscription = require("../models/common/subscription");

class UtilActionServices {
	constructor() {
		this.result = undefined;
		this.transactionResults = undefined;
	}

	async verify(verificationData) {
		const session = await mongoose.startSession();
		try {
			this.transactionResults = await session.withTransaction(async () => {
				this.result = {};
				const { type } = verificationData;

				switch (type) {
					case "usedCompanyServices": {
						const { customerId, companyId } = verificationData;
						this.result.usedCompanyServices = {};

						let result = await Subscription.find({ customerId, companyId }, {}, { session });
						_.isEmpty(result) ? (this.result.usedCompanyServices.subscription = false) : (this.result.usedCompanyServices.subscription = true);

						if (this.result.usedCompanyServices.subscription == false) {
							result = await CustomerRequest.find({ customerId, companyId, requestType: "subscription" }, {}, { session });
							_.isEmpty(result) ? (this.result.usedCompanyServices.subscription = false) : (this.result.usedCompanyServices.subscription = true);
						}

						result = await CustomerRequest.find({ customerId, companyId, requestType: "subscription with location" }, {}, { session });
						_.isEmpty(result) ? (this.result.usedCompanyServices.subscriptionLoc = false) : (this.result.usedCompanyServices.subscriptionLoc = true);

						result = await CustomerRequest.find({ customerId, companyId, requestType: "one time" }, {}, { session });
						_.isEmpty(result) ? (this.result.usedCompanyServices.oneTime = false) : (this.result.usedCompanyServices.oneTime = true);
					}
				}
			});

			if (this.transactionResults) {
				return this.result;
			} else {
				throw ApiError.serverError("verify util action transaction failed");
			}
		} catch (e) {
			throw ApiError.serverError("verify util action transaction abort due to error: " + e.message);
		} finally {
			session.endSession();
		}
	}
}

exports.UtilActionServices = UtilActionServices;
