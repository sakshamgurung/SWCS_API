const mongoose = require("mongoose");
const ApiError = require("../error/ApiError");
const _ = require("lodash");
const { checkTransactionResults, checkForWriteErrors } = require("../utilities/errorUtil");
const { calWasteCondition, calCurrentAmtInKg } = require("../utilities/wasteUtil");
const { mongooseToPlainObjectArray } = require("../utilities/converter");

const Subscription = require("../models/common/subscription");
const CustomerUsedGeoObject = require("../models/customers/customerUsedGeoObject");
const CompanyDetail = require("../models/companies/companyDetail");
const CustomerDetail = require("../models/customers/customerDetail");
const StaffLogin = require("../models/staff/staffLogin");
const WasteDump = require("../models/customers/wasteDump");
const Notification = require("../models/common/notification");
const Schedule = require("../models/customers/schedule");
const Track = require("../models/companies/geoObjectTrack");
const vehicle = require("../models/companies/vehicle");
const staff = require("../models/staff/staffLogin");
const GraphData = require("../models/graph/graphData");

class SubscriptionServices {
	constructor() {
		this.subscription = undefined;
		this.result = undefined;
		this.transactionResults = undefined;
		this.graph = undefined;
	}

	async createNewSubscription(subscriptionData) {
		this.subscription = new Subscription(subscriptionData);
		const subscriptionResult = await this.subscription.save();

		// logs
		const totalVehicle = await vehicle.find({ companyId: subscriptionData.companyId }).count();
		const totalStaff = await staff.find({ companyId: subscriptionData.companyId }).count();
		const subs = await Subscription.find({ companyId: subscriptionData.companyId }).count();
		console.log(" Staff : Vehicle : Subs : From sub : ", totalStaff, totalVehicle, subs);
		this.graph = new GraphData({ companyId: subscriptionData.companyId, subscribers: subs, staff: totalStaff, vehicle: totalVehicle });

		const logResult = await this.graph.save();
		this.result = await { subscriptionResult, logResult };
		return this.result;
	}

	async getAllSubscriber(companyId, query) {
		const result = await Subscription.find({ $and: [{ companyId }, query] }).populate("customerId", "-password -token");
		this.result = mongooseToPlainObjectArray(result);

		for (let doc of this.result) {
			const res = await CustomerDetail.find({ customerId: doc.customerId._id });
			doc.customerDetail = res[0];
		}

		return this.result;
	}
	async getAllSubscription(customerId, query) {
		const result = await Subscription.find({ $and: [{ customerId }, query] }).populate("companyId", "email mobileNo");
		this.result = mongooseToPlainObjectArray(result);

		for (let doc of this.result) {
			const res = await CompanyDetail.find({ companyId: doc.companyId._id }, "companyName companyType companyImage");
			doc.companyDetail = res[0];
		}
		return this.result;
	}

	async deleteSubscriptionById(id, data) {
		const session = await mongoose.startSession();
		try {
			this.transactionResults = await session.withTransaction(async () => {
				const { customerId, companyId } = await Subscription.findById(id, {}, { session });

				const cugo = await CustomerUsedGeoObject.findByRef("customerId", customerId, {}, {}, session);
				if (!_.isEmpty(cugo)) {
					const trackToUpdate = _.remove(cugo[0].usedTrack, (o) => o.companyId == companyId);

					//delete schedule of customer for this company
					if (!_.isEmpty(trackToUpdate)) {
						const { trackId } = trackToUpdate[0];
						const track = await Track.findById(trackId, { workId: 1 }, { session });
						const { workId } = track;

						await Schedule.deleteOne({ workId, customerId }, { session });

						//check if there is any schedule for given work id
						const allSchedule = await Schedule.findByRef("workId", workId, {}, { _id: 1 }, session);
						if (_.isEmpty(allSchedule)) {
							//notifiy no schedule of given work and check track
						}
					}

					if (_.isEmpty(cugo[0].usedTrack)) {
						await CustomerUsedGeoObject.findByIdAndDelete(cugo[0]._id, { session });
					} else {
						const { usedTrack } = cugo[0].usedTrack;
						await CustomerUsedGeoObject.findByIdAndUpdate(cugo[0]._id, { usedTrack }, { session });
					}
				}

				//delete uncollected wasteDump of customer
				const removeWasteDump = await WasteDump.findByRef("customerId", customerId, { isCollected: false, companyId }, {}, session);
				let trackToUpdate = [];
				for (let wd of removeWasteDump) {
					if (wd.geoObjectType == "track") {
						trackToUpdate.push(wd.geoObjectId);
					}
					await WasteDump.findByIdAndDelete(wd._id, { session });
				}

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

				//delete notification
				await Notification.bulkWrite(
					[
						{
							deleteMany: {
								filter: {
									$or: [
										{ "from.role": "company", "from.id": companyId, "to.role": "customer", "to.id": customerId },
										{
											"from.role": "customer",
											"from.id": customerId,
											"to.role": "company",
											"to.id": companyId,
										},
									],
								},
							},
						},
					],
					{ session }
				);

				const tempStaffLogin = await StaffLogin.findByRef("companyId", companyId, {}, { _id: 1 }, session);
				await Notification.bulkWrite(
					tempStaffLogin.map((doc) => ({
						deleteMany: {
							filter: {
								$or: [
									{ "from.role": "staff", "from.id": doc._id, "to.role": "customer", "to.id": customerId },
									{ "from.role": "customer", "from.id": customerId, "to.role": "staff", "to.id": doc._id },
								],
							},
						},
					})),
					{ session }
				);

				//delete subscription
				await Subscription.findByIdAndDelete(id, { session });
			});

			return checkTransactionResults(this.transactionResults, "status", "Subscription delete transaction failed");
		} catch (e) {
			throw ApiError.serverError("Subscription delete transaction abort due to error: " + e.message);
		} finally {
			session.endSession();
		}
	}
}

exports.SubscriptionServices = SubscriptionServices;
