const mongoose = require("mongoose");
const _ = require("lodash");

const ApiError = require("../error/ApiError");
const { checkTransactionResults, checkForWriteErrors } = require("../utilities/errorUtil");
const { customerRequestServerToClient, customerRequestArrayServerToClient } = require("../utilities/geoObjectUtil");

const Subscription = require("../models/common/subscription");
const CustomerRequest = require("../models/common/customerRequest");
const CompanyDetail = require("../models/companies/companyDetail");
const Schedule = require("../models/customers/schedule");
const StaffGroup = require("../models/staff/staffGroup");
const Vehicle = require("../models/companies/vehicle");
const { sendToAll } = require("../utilities/notificationUtil");

class CustomerRequestServices {
	constructor() {
		this.customerRequest = undefined;
		this.result = undefined;
		this.transactionResults = undefined;
	}

	async createNewCustomerRequest(customerRequestData) {
		customerRequestData.requestStatus = "pending";
		this.customerRequest = new CustomerRequest(customerRequestData);
		this.result = await this.customerRequest.save();
		return this.result;
	}

	async getAllCustomerRequest(role, id, query) {
		this.result = await CustomerRequest.findAll(role, id, query)
			.populate("companyId", "email mobileNo")
			.populate("customerId", "email mobileNo")
			.populate("staffGroupId")
			.populate("vehicleId");
		this.result = customerRequestArrayServerToClient(this.result);

		for (let doc of this.result) {
			const res = await CompanyDetail.find({ companyId: doc.companyId._id }, "companyName companyType companyImage");
			if (res.length != 0) {
				doc.companyDetail = res[0];
			}
		}

		return this.result;
	}

	async getCustomerRequestById(id) {
		this.result = await CustomerRequest.findById(id)
			.populate("companyId", "email mobileNo")
			.populate("customerId", "email mobileNo")
			.populate("staffGroupId")
			.populate("vehicleId");
		this.result = customerRequestServerToClient(this.result);

		return this.result;
	}

	async getCustomerRequestByRef(ref, id, query) {
		this.result = await CustomerRequest.findByRef(ref, id, query)
			.populate("companyId", "email mobileNo")
			.populate("customerId", "email mobileNo")
			.populate("staffGroupId")
			.populate("vehicleId");
		this.result = customerRequestArrayServerToClient(this.result);

		for (let doc of this.result) {
			const res = await CompanyDetail.find({ companyId: doc.companyId._id }, "companyName companyType companyImage");
			if (res.length != 0) {
				doc.companyDetail = res[0];
			}
		}

		return this.result;
	}

	async updateCustomerRequestById(id, updateData) {
		const session = await mongoose.startSession();
		try {
			this.transactionResults = await session.withTransaction(async () => {
				const prevCustomerRequest = await CustomerRequest.findById(id, {}, { session });
				const { companyId, customerId, requestStatus, requestType } = prevCustomerRequest;

				if (requestStatus == "pending" && updateData.requestStatus == "pending") {
					await CustomerRequest.findByIdAndUpdate(id, updateData, { session });
				} else if (requestStatus == "pending" && updateData.requestStatus == "denied") {
					await CustomerRequest.findByIdAndDelete(id, { session });
					const customerIdArray = [customerId];
					//notify
					if (customerIdArray.length != 0) {
						const custLogin = await CustomerLogin.findAllInIdArray(
							customerIdArray,
							{ "token.mobileDevice": { $exists: true, $ne: [] } },
							"token",
							session
						);

						const uuidArray = [];
						for (let cl of custLogin) {
							if (cl.token.mobileDevice) {
								for (let md of cl.token.mobileDevice) {
									uuidArray.push(md.uuid);
								}
							}
						}

						let from = { role: "company", id: companyId },
							targetCollection = {},
							title,
							body,
							data;

						targetCollection = {};
						title = "Request denied";
						body = `Request: is denied.`;
						data = { status: "requestAccepted" };

						await sendToAll(from, "customer", customerIdArray, uuidArray, targetCollection, title, body, data, session);
					}
				} else if (requestStatus == "pending" && updateData.requestStatus == "accepted") {
					if (requestType == "subscription" || requestType == "subscription with location") {
						const newSubData = { companyId, customerId };
						await Subscription.create([newSubData], { session });

						await CustomerRequest.findByIdAndDelete(id, { session });
					} else if (requestType == "one time") {
						const newSchedule = {
							customerId,
							customerRequestId: id,
						};
						await Schedule.create([newSchedule], { session });
						await CustomerRequest.findByIdAndUpdate(id, { requestStatus: "accepted" }, { session });
					}
					const customerIdArray = [customerId];
					//notify
					if (customerIdArray.length != 0) {
						const custLogin = await CustomerLogin.findAllInIdArray(
							customerIdArray,
							{ "token.mobileDevice": { $exists: true, $ne: [] } },
							"token",
							session
						);

						const uuidArray = [];
						for (let cl of custLogin) {
							if (cl.token.mobileDevice) {
								for (let md of cl.token.mobileDevice) {
									uuidArray.push(md.uuid);
								}
							}
						}
						let from = { role: "company", id: companyId },
							targetCollection = {},
							title,
							body,
							data;
						if (requestType == "subscription" || requestType == "subscription with location") {
							title = "Subscription request accepted";
							body = `Your subscription request is accepted.Check your subscription list.`;
							data = { status: "subscribed" };
						} else {
							targetCollection = { name: "customerRequests", id };
							title = "Request accepted";
							body = `Request: ${workTitle} is accepted. Check your schedule.`;
							data = { status: "requestAccepted" };
						}
						await sendToAll(from, "customer", customerIdArray, uuidArray, targetCollection, title, body, data, session);
					}
				} else if (requestStatus == "accepted" && updateData.requestStatus == "finished") {
					await Schedule.deleteByRef("customerRequestId", id, session);
					await CustomerRequest.findByIdAndDelete(id, { session });
				}
			});

			return checkTransactionResults(this.transactionResults, "status", "Customer request update transaction failed");
		} catch (e) {
			throw ApiError.serverError("Customer request update transaction abort due to error: " + e.message);
		} finally {
			session.endSession();
		}
	}

	async deleteCustomerRequestById(id, updateData) {
		const session = await mongoose.startSession();
		try {
			this.transactionResults = await session.withTransaction(async () => {
				const tempCustomerRequestId = await CustomerRequest.findById(id, {}, { session });
				const { requestStatus } = tempCustomerRequestId;

				if (requestStatus == "accepted") {
					await Schedule.deleteByRef("customerRequestId", id, session);
				}
				await CustomerRequest.findByIdAndDelete(id, { session });
			});

			return checkTransactionResults(this.transactionResults, "status", "Customer request delete transaction failed");
		} catch (e) {
			throw ApiError.serverError("Customer request delete transaction abort due to error: " + e.message);
		} finally {
			session.endSession();
		}
	}
}

exports.CustomerRequestServices = CustomerRequestServices;
