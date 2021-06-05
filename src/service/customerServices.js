const _ = require("lodash");
const mongoose = require("mongoose");
const ApiError = require("../error/ApiError");
const { checkTransactionResults, checkForWriteErrors } = require("../utilities/errorUtil");
const { calWasteCondition, calCurrentAmtInKg } = require("../utilities/wasteUtil");

const CustomerLogin = require("../models/customers/customerLogin");
const CustomerDetail = require("../models/customers/customerDetail");
const CustomerRequest = require("../models/common/customerRequest");
const CustomerUsedGeoObject = require("../models/customers/customerUsedGeoObject");
const WasteDump = require("../models/customers/wasteDump");
const Track = require("../models/companies/geoObjectTrack");
const Subscription = require("../models/common/subscription");
const Schedule = require("../models/customers/schedule");
const Notification = require("../models/common/notification");

class CustomerServices {
	constructor() {
		this.customerDetail = undefined;
		this.result = undefined;
		this.transactionResults = undefined;
	}

	async newCustomerInfo(customerDetail) {
		const session = await mongoose.startSession();
		try {
			this.transactionResults = await session.withTransaction(async () => {
				this.result = {};
				const { customerId } = customerDetail;

				this.customerDetail = new CustomerDetail(customerDetail);
				this.result.customerDetail = await this.customerDetail.save({ session });

				await CustomerLogin.findByIdAndUpdate(customerId, { firstTimeLogin: false }, { session });
			});

			if (this.transactionResults) {
				return this.result;
			} else {
				throw ApiError.serverError("New customer info transaction failed");
			}
		} catch (e) {
			throw ApiError.serverError("New customer info transaction failed");
		} finally {
			session.endSession();
		}
	}

	async getAllCustomerInIdArray(customerInfoType, idArray, query) {
		if (customerInfoType == "customer-detail") {
			this.result = await CustomerDetail.findAllInIdArray(idArray, query, "-__v").populate("customerId", "email mobileNo");
		} else {
			throw ApiError.badRequest("customerInfoType not found!!!");
		}
		return this.result;
	}

	async getCustomerById(customerInfoType, id) {
		//type "customer" only for auth user
		if (customerInfoType == "customer") {
			this.result = await CustomerLogin.findById(id);
		} else if (customerInfoType == "customer-detail") {
			this.result = await CustomerDetail.find({ customerId: id }, "-__v").populate("customerId", "email mobileNo");
		} else {
			throw ApiError.badRequest("customerInfoType not found!!!");
		}
		return this.result;
	}

	async getCustomerByRef(customerInfoType, ref, id, query) {
		if (customerInfoType == "customer-detail") {
			this.result = await CustomerDetail.findByRef(ref, id, query, "-__v").populate("customerId", "email mobileNo");
		} else {
			throw ApiError.badRequest("customerInfoType not found!!!");
		}
		return this.result;
	}

	async updateCustomerById(customerInfoType, id, updateData) {
		if (customerInfoType == "customer") {
			this.result = await CustomerLogin.findByIdAndUpdate(id, updateData);
		} else if (customerInfoType == "customer-detail") {
			this.result = await CustomerDetail.findByIdAndUpdate(id, updateData);
		} else {
			throw ApiError.badRequest("customerInfoType not found!!!");
		}
		return checkForWriteErrors(this.result, "status", "Customer update failed");
	}

	async deleteCustomerById(id, updateData) {
		const session = await mongoose.startSession();
		try {
			//update geoObject waste condition
			this.transactionResults = await session.withTransaction(async () => {
				const trackToUpdate = [];
				const tempWasteDump = await WasteDump.findByRef("customerId", id, {}, {}, session);
				const archiveWasteDump = _.remove(tempWasteDump, (o) => {
					if (o.isCollected == true) {
						return true;
					} else {
						if (o.geoObjectType == "track") {
							trackToUpdate.push(o.geoObjectId);
						}
					}
				});

				const opWD = tempWasteDump.map((doc) => ({
					deleteOne: {
						filter: { _id: doc._id },
					},
				}));

				const opAWD = archiveWasteDump.map((doc) => ({
					updateOne: {
						filter: { _id: doc._id },
						update: { customerId: "" },
					},
				}));

				await WasteDump.bulkWrite([...opWD, ...opAWD], { session });

				trackToUpdate = _.uniq(trackToUpdate);
				for (let tid of trackToUpdate) {
					let currentAmount = 0;
					const tempWasteDump = await WasteDump.findByRef("geoObjectId", tid, { isCollected: false }, { dumpedWaste: 1 }, session);

					for (let wd of tempWasteDump) {
						for (let dw of wd.dumpedWaste) {
							currentAmount = calCurrentAmtInKg(currentAmount, dw.amountUnit, dw.amount);
						}
					}

					const tempTrack = await Track.findById(tid, { wasteLimit: 1 }, { session });
					const wasteCondition = calWasteCondition(currentAmount, tempTrack.wasteLimit);
					await Track.findByIdAndUpdate(tid, { wasteCondition }, { session });
				}

				await CustomerRequest.deleteByRef("customerId", id, session);
				await Notification.deleteByRole("customer", id, {}, session);
				await Subscription.deleteByRef("customerId", id, session);
				await Schedule.deleteByRef("customerId", id, session);
				await CustomerUsedGeoObject.deleteByRef("customerId", id, session);
				await CustomerLogin.findByIdAndDelete(id, { session });
				await CustomerDetail.findByIdAndDelete(id, { session });
			});

			return checkTransactionResults(this.transactionResults, "status", "Customer delete transaction failed");
		} catch (e) {
			throw ApiError.serverError("Customer delete transaction abort due to error: " + e.message);
		} finally {
			session.endSession();
		}
	}
}

exports.CustomerServices = CustomerServices;
