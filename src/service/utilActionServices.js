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
					case "companyServicesAndStatus": {
						const { customerId, companyId } = verificationData;
						const tempResult = { subscription: "active", subscriptionLoc: "active", oneTime: "active" };

						let result = await CustomerRequest.find({ customerId, companyId }, "requestType requestStatus", { session });

						for (let doc of result) {
							const { requestType, requestStatus, _id } = doc;
							switch (requestType) {
								case "subscription": {
									if (requestStatus == "pending") {
										tempResult.subscription = "pending";
										tempResult.subscriptionLoc = "deactive";
										tempResult.subscriptionRequestId = _id;
									}
									break;
								}
								case "subscription with location": {
									if (requestStatus == "pending") {
										tempResult.subscription = "deactive";
										tempResult.subscriptionLoc = "pending";
										tempResult.subscriptionLocRequestId = _id;
									}
									break;
								}
								case "one time": {
									tempResult.oneTime = requestStatus;
									tempResult.oneTimeRequestId = _id;
									break;
								}
								default: {
									tempResult.subscription = "active";
									tempResult.subscriptionLoc = "active";
									tempResult.oneTime = "active";
								}
							}
							//doc.requestStatus //"pending", "accepted", "assigned", "finished"
							//doc.requestType //"subscription", "subscription with location", "one time"
						}

						if (tempResult.subscription == "active") {
							const result2 = await Subscription.find({ customerId, companyId }, {}, { session });
							if (!_.isEmpty(result2)) {
								tempResult.subscription = "unsubscribe";
								tempResult.subscriptionLoc = "deactive";
								tempResult.subscriptionId = result2[0]._id;
							}
						}

						this.result.companyServicesAndStatus = tempResult;
						break;
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
