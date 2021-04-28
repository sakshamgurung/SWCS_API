const mongoose = require("mongoose");
const ApiError = require("../error/ApiError");
const _ = require("lodash");
const { checkTransactionResults, checkForWriteErrors } = require("../utilities/errorUtil");

const Subscription = require("../models/common/subscription");
const CustomerUsedGeoObject = require("../models/customers/customerUsedGeoObject");
const WasteDump = require("../models/customers/wasteDump");
const Notification = require("../models/common/notification");
const Schedule = require("../models/customers/schedule");
const Track = require("../models/companies/geoObjectTrack");
const vehicle = require("../models/companies/vehicle");
const staff = require("../models/staff/staffLogin");
const graphData = require("../models/graph/graphData");

class SubscriptionServices {
	constructor() {
		this.subscription = undefined;
		this.result = undefined;
		this.transactionResults = undefined;
		this.graph = undefined;
	}

	async createNewSubscription(subscriptionData) {
		this.subscription = new Subscription(subscriptionData);
		this.result = await this.subscription.save();

		// logs
		const totalVehicle = await vehicle.find({ companyId: subscriptionData.companyId }).count();
		const totalStaff = await staff.find({ companyId: subscriptionData.companyId }).count();
		const subs = await Subscription.find({ companyId: subscriptionData.companyId }).count();
		console.log(" Staff : Vehicle : Subs : From sub : ", totalStaff, totalVehicle, subs);
		this.graph = new graphData({ companyId: subscriptionData.companyId, subscribers: subs, staff: totalStaff, vehicle: totalVehicle });

		const logResult = await this.graph.save();
		this.result = await { ...this.result, logResult };
		return this.result;
	}

	async getAllSubscriber(companyId, query) {
		this.result = await Subscription.find({ $and: [{ companyId }, query] }).populate("customerId");
		return this.result;
	}
	async getAllSubscription(customerId, query) {
		this.result = await Subscription.find({ $and: [{ customerId }, query] });
		return this.result;
	}

	//delete the subscription and its information and references
	async deleteSubscriptionById(id, updateData) {
		const session = await mongoose.startSession();
		try {
			this.transactionResults = await session.withTransaction(async () => {
				const { customerId, companyId } = updateData;

				const tempCustomerUsedGeoObject = await CustomerUsedGeoObject.findByRef("customerId", customerId, {}, {}, session);

				if (!_.isEmpty(tempCustomerUsedGeoObject)) {
					const updateUsedTrack = _.remove(tempCustomerUsedGeoObject[0].usedTrack, (o) => o.companyId == companyId);

					//delete schedule
					if (!_.isEmpty(updateUsedTrack)) {
						const { trackId } = updateUsedTrack[0];
						const tempTrack = await Track.findById(trackId, { workId: 1 }, { session });
						const { workId } = tempTrack[0];

						//delete schedule
						const tempSchedule = await Schedule.findByRef("customerId", customerId, {}, {}, session);
						const removeSchedule = _.remove(tempSchedule, (o) => o.workId == workId);
						if (!_.isEmpty(removeSchedule)) {
							this.result = await Schedule.findByIdAndDelete(removeSchedule[0]._id, { session });
							checkForWriteErrors(this.result, "none", "Subscription delete failed");
						}

						//check if there is any schedule for work id
						const allSchedule = await Schedule.findByRef("workId", workId, {}, { _id: 1 }, session);
						if (_.isEmpty(allSchedule)) {
							//notifiy no schedule of given work and check track
						}
					}

					const customerUsedGeoObjectId = tempCustomerUsedGeoObject[0]._id;

					if (_.isEmpty(tempCustomerUsedGeoObject[0].usedTrack)) {
						//delete customerUsedGeoObject
						this.result = await CustomerUsedGeoObject.findByIdAndDelete(customerUsedGeoObjectId, { session });
						checkForWriteErrors(this.result, "none", "Subscription delete failed");
					} else {
						//update customerUsedGeoObject
						const { usedTrack } = tempCustomerUsedGeoObject[0].usedTrack;
						this.result = await CustomerUsedGeoObject.findByIdAndUpdate(customerUsedGeoObjectId, { usedTrack }, { session });
						checkForWriteErrors(this.result, "none", "Subscription delete failed");
					}
				}

				//delete isCollected==false wasteDump
				const tempWasteDump = await WasteDump.findByRef("customerId", customerId, {}, { companyId: 1, isCollected: 1 }, session);
				const removeWasteDump = _.remove(tempWasteDump, (o) => o.companyId == companyId && o.isCollected == false);
				for (let wd of removeWasteDump) {
					this.result = await WasteDump.findByIdAndDelete(wd._id, { session });
					checkForWriteErrors(this.result, "none", "Subscription delete failed");
				}

				//delete notification from company
				const tempNotification = await Notification.findAll("customer", customerId, {}, { from: 1 }, session);
				const removeNotification = _.remove(tempNotification, (o) => o.from.role == "company" && o.from.id == companyId);
				for (let n of removeNotification) {
					this.result = await Notification.findByIdAndDelete(n._id, { session });
					checkForWriteErrors(this.result, "none", "Subscription delete failed");
				}

				//delete subscription
				this.result = await Subscription.findByIdAndDelete(id, { session });
				checkForWriteErrors(this.result, "none", "Subscription delete failed");
			});
			s;

			return checkTransactionResults(this.transactionResults, "status", "Subscription delete transaction failed");
		} catch (e) {
			throw ApiError.serverError("Subscription delete transaction abort due to error: " + e.message);
		} finally {
			session.endSession();
		}
	}
}

exports.SubscriptionServices = SubscriptionServices;
