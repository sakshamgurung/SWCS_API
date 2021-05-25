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
			doc.companyDetail = res[0];
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
			doc.companyDetail = res[0];
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
					let result = await CustomerRequest.findByIdAndUpdate(id, updateData, { session });
					checkForWriteErrors(result, "none", "Customer request update error");
				} else if (requestStatus == "pending" && updateData.requestStatus == "denied") {
					//delete the request send notification
					let result = await CustomerRequest.findByIdAndDelete(id, { session });
					checkForWriteErrors(result, "none", "Customer request update error");
				} else if (requestStatus == "pending" && updateData.requestStatus == "accepted") {
					if (requestType == "subscription" || requestType == "subscription with location") {
						const newSubData = { companyId, customerId };
						await Subscription.create(newSubData, { session });

						let result = await CustomerRequest.findByIdAndDelete(id, { session });
						checkForWriteErrors(result, "none", "Customer request update error");
					} else if (requestType == "one time") {
						let result = await CustomerRequest.findByIdAndUpdate(id, { requestStatus: "accepted" }, { session });
						checkForWriteErrors(result, "none", "Customer request update error");
					}
				} else if (requestStatus == "accepted") {
					const { staffGroupId, vehicleId } = updateData;
					if (updateData.requestStatus == "assigned" && _.isEmpty(staffGroupId) && _.isEmpty(vehicleId)) {
						throw ApiError.badRequest("staff group or vehicle not assigned for one-time task.");
					}

					if (prevCustomerRequest.staffGroupId != staffGroupId) {
						const tempStaffGroup = await StaffGroup.findById(staffGroupId, { isReserved: 1 }, { session });
						if (tempStaffGroup.isReserved) {
							throw ApiError.badRequest("staff group is reserved.");
						}

						this.result = await StaffGroup.findByIdAndUpdate(staffGroupId, { isReserved: true }, { session });
						checkForWriteErrors(this.result, "none", "Customer request update error");
						this.result = await StaffGroup.findByIdAndUpdate(prevCustomerRequest.staffGroupId, { isReserved: false }, { session });
						checkForWriteErrors(this.result, "none", "Customer request update error");
					}

					if (prevCustomerRequest.vehicleId != vehicleId) {
						const tempVehicle = await Vehicle.findById(vehicleId, { isReserved: 1 }, { session });
						if (tempVehicle.isReserved) {
							throw ApiError.badRequest("vehicle is reserved.");
						}

						this.result = await Vehicle.findByIdAndUpdate(vehicleId, { isReserved: true }, { session });
						checkForWriteErrors(this.result, "none", "Customer request update error");
						this.result = await Vehicle.findByIdAndUpdate(prevCustomerRequest.vehicleId, { isReserved: false }, { session });
						checkForWriteErrors(this.result, "none", "Customer request update error");
					}

					if (updateData.requestStatus == "assigned") {
						const newSchedule = {
							customerId,
							customerRequestId: id,
						};
						await Schedule.create(newSchedule, { session });
					}

					this.result = await CustomerRequest.findByIdAndUpdate(id, updateData, { session });
					checkForWriteErrors(this.result, "none", "Customer request update error");

					//send notification to driver
				} else if (requestStatus == "assigned" && updateData.requestStatus == "finished") {
					const { staffGroupId } = updateData;
					//delete schedule
					this.result = await Schedule.deleteByRef("customerRequestId", id, session);
					checkForWriteErrors(this.result, "none", "Customer request update error");
					//free staffGroup
					this.result = await StaffGroup.findByIdAndUpdate(staffGroupId, { isReserved: false }, { session });
					checkForWriteErrors(this.result, "none", "Customer request update error");
					//delete customerRequest
					this.result = await CustomerRequest.findByIdAndDelete(id, { session });
					checkForWriteErrors(this.result, "none", "Customer request update error");
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
				const { requestStatus, requestType, customerId, companyId, staffGroupId } = tempCustomerRequestId;

				if (requestStatus == "accepted") {
					if (requestType == "subscription" || requestType == "subscription with location") {
						//delete subscription
						const tempSubscription = await Subscription.findAllSubscription(customerId, {}, session);
						const deleteSubscription = _.remove(tempSubscription, (s) => s.companyId == companyId);
						this.result = await Subscription.deleteById(deleteSubscription[0]._id, session);
						checkForWriteErrors(this.result, "none", "Customer request delete error");
					}
				} else if (requestStatus == "assigned") {
					//delete schedule
					this.result = await Schedule.deleteByRef("customerRequestId", id, session);
					checkForWriteErrors(this.result, "none", "Customer request delete error");
					//free staffGroup
					this.result = await StaffGroup.findByIdAndUpdate(staffGroupId, { isReserved: false }, { session });
					checkForWriteErrors(this.result, "none", "Customer request delete error");
				}
				//delete customerRequest
				this.result = await CustomerRequest.findByIdAndDelete(id, { session });
				checkForWriteErrors(this.result, "none", "Customer request delete error");
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
