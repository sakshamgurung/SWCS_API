const mongoose = require("mongoose");
const _ = require("lodash");
const { checkTransactionResults, checkForWriteErrors } = require("../utilities/errorUtil");
const { mongooseToPlainObjectArray } = require("../utilities/converter");

const Work = require("../models/common/work");
const Schedule = require("../models/customers/schedule");
const CustomerUsedGeoObject = require("../models/customers/customerUsedGeoObject");
const CompanyDetail = require("../models/companies/companyDetail");
const StaffGroup = require("../models/staff/staffGroup");
const Vehicle = require("../models/companies/vehicle");
const Track = require("../models/companies/geoObjectTrack");
const CustomerLogin = require("../models/customers/customerLogin");
const { sendToAll } = require("../utilities/notificationUtil");
const ApiError = require("../error/ApiError");

class WorkServices {
	constructor() {
		this.work = undefined;
		this.result = undefined;
		this.transactionResults = undefined;
	}

	async createNewWork(workData) {
		this.result = {};
		const session = await mongoose.startSession();
		try {
			this.transactionResults = await session.withTransaction(async () => {
				const { geoObjectTrackId, staffGroupId, vehicleId } = workData;

				const tempStaffGroup = await StaffGroup.findById(staffGroupId, { isReserved: 1 }, { session });
				const tempVehicle = await Vehicle.findById(vehicleId, { isReserved: 1 }, session);

				if (tempStaffGroup.isReserved) {
					throw ApiError.badRequest("staff group already reserved.");
				}

				if (tempVehicle.isReserved) {
					throw ApiError.badRequest("vehicle already reserved.");
				}

				// reserving staffgroup and vehicle
				let result = await StaffGroup.findByIdAndUpdate(staffGroupId, { isReserved: true }, { session });
				checkForWriteErrors(result, "none", "New work failed");

				result = await Vehicle.findByIdAndUpdate(vehicleId, { isReserved: true }, session);
				checkForWriteErrors(result, "none", "New work failed");

				// creating new work
				this.work = new Work(workData);
				this.result.work = await this.work.save({ session });
				const workId = this.result.work._id;

				/**
				 * work ref in track
				 * use for...of rather than forEach because forEach will throw error inside from different context
				 * */
				if (!_.isEmpty(geoObjectTrackId)) {
					for (let tid of geoObjectTrackId) {
						result = await Track.findByIdAndUpdate(tid, { workId }, { session });
						checkForWriteErrors(result, "none", "New work failed");
					}
				}
			});

			if (this.transactionResults) {
				return this.result;
			} else {
				throw ApiError.serverError("New work transaction failed");
			}
		} catch (e) {
			throw ApiError.serverError("New work transaction abort due to error: " + e.message);
		} finally {
			session.endSession();
		}
	}

	async getAllWork(role, id, query) {
		this.result = await Work.findAll(role, id, query)
			.populate("companyId", "email mobileNo")
			.populate("staffGroupId", "groupName")
			.populate("vehicleId", "plateNo")
			.populate("geoObjectTrackId", "trackName");

		this.result = mongooseToPlainObjectArray(this.result);

		for (let w of this.result) {
			const { companyId } = w;
			const companyDetail = await CompanyDetail.find({ companyId: companyId._id });
			if (!_.isEmpty(companyDetail)) {
				w.companyDetail = companyDetail[0];
			}
		}

		return this.result;
	}

	async getWorkById(id) {
		this.result = await Work.findById(id)
			.populate("companyId", "email mobileNo")
			.populate("staffGroupId", "groupName")
			.populate("vehicleId", "plateNo")
			.populate("geoObjectTrackId", "trackName");

		if (!_.isEmpty(this.result)) {
			this.result = this.result.toObject();
			const { companyId } = this.result;
			const companyDetail = await CompanyDetail.find({ companyId: companyId._id }, "companyName companyId");
			if (!_.isEmpty(companyDetail)) {
				this.result.companyDetail = companyDetail[0];
			}
		}

		return this.result;
	}

	async getWorkByRef(ref, id, query) {
		this.result = await Work.findByRef(ref, id, query)
			.populate("companyId", "email mobileNo")
			.populate("staffGroupId", "groupName")
			.populate("vehicleId", "plateNo")
			.populate("geoObjectTrackId", "trackName");

		this.result = mongooseToPlainObjectArray(this.result);

		for (let w of this.result) {
			const { companyId } = w;
			const companyDetail = await CompanyDetail.find({ companyId: companyId._id });
			if (!_.isEmpty(companyDetail)) {
				w.companyDetail = companyDetail[0];
			}
		}

		return this.result;
	}

	async updateWorkById(id, updateData) {
		const session = await mongoose.startSession();
		try {
			this.transactionResults = await session.withTransaction(async () => {
				const prevWork = await Work.findById(id, {}, { session });
				const { companyId, workTitle, workStatus, geoObjectTrackId, staffGroupId, vehicleId } = prevWork;

				if (workStatus == "unconfirmed" && updateData.workStatus == "unconfirmed") {
					if (updateData.hasOwnProperty("staffGroupId") && staffGroupId != updateData.staffGroupId) {
						//reserving new staffgroup
						const tempStaffGroup = await StaffGroup.findById(updateData.staffGroupId, { isReserved: 1 }, { session });

						if (tempStaffGroup.isReserved) {
							throw ApiError.badRequest("staff group already reserved.");
						}

						await StaffGroup.findByIdAndUpdate(updateData.staffGroupId, { isReserved: true }, { session });

						//free previous staffgroup
						await StaffGroup.findByIdAndUpdate(staffGroupId, { isReserved: false }, { session });
					}

					if (updateData.hasOwnProperty("vehicleId") && vehicleId != updateData.vehicleId) {
						//reserving new vehicle
						const tempVehicle = await Vehicle.findById(updateData.vehicleId, { isReserved: 1 }, { session });

						if (tempVehicle.isReserved) {
							throw ApiError.badRequest("staff group already reserved.");
						}

						await Vehicle.findByIdAndUpdate(updateData.vehicleId, { isReserved: true }, { session });

						//free previous vehicle
						await Vehicle.findByIdAndUpdate(vehicleId, { isReserved: false }, { session });
					}
					if (updateData.hasOwnProperty("geoObjectTrackId")) {
						const deletedTrackId = _.difference(geoObjectTrackId, updateData.geoObjectTrackId);
						const addedTrackId = _.difference(updateData.geoObjectTrackId, geoObjectTrackId);

						if (deletedTrackId.length > 0) {
							for (let t of deletedTrackId) {
								await Track.findByIdAndUpdate(t, { $unset: { workId: 1 } }, { session });
							}
						}
						if (addedTrackId.length > 0) {
							for (let t of addedTrackId) {
								await Track.findByIdAndUpdate(t, { workId: id }, { session });
							}
						}
					}

					await Work.findByIdAndUpdate(id, updateData, { session });
					//notify staffGroupId after deleting work
				} else if (workStatus == "unconfirmed" && updateData.workStatus == "confirmed") {
					const customerIdArray = [];
					const trackId = await Track.findByRef("workId", id, {}, { _id: 1, companyId: 1 }, session);
					for (let t of trackId) {
						const tempCustomerUsedGeoObject = await CustomerUsedGeoObject.findByRef("usedTrack.trackId", t._id, {}, { customerId: 1 }, session);
						for (let cugo of tempCustomerUsedGeoObject) {
							const { customerId } = cugo;
							customerIdArray.push(customerId);
						}
					}

					await Schedule.bulkWrite(
						customerIdArray.map((customerId) => ({
							insertOne: {
								document: {
									customerId,
									workId: id,
								},
							},
						})),
						{ session }
					);

					//notify
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

					const from = { role: "company", id: companyId };
					const targetCollection = { name: "works", id };
					const title = "New work is confirmed";
					const body = `New work: ${workTitle} is confirmed for your area. Check your schedule for pickup date and time.`;
					const data = { status: "workConfirmed" };
					await sendToAll(from, "customer", customerIdArray, uuidArray, targetCollection, title, body, data, session);

					await Work.findByIdAndUpdate(id, { workStatus: "confirmed" }, { session });
				} else if (workStatus == "confirmed" && updateData.workStatus == "on progress") {
					const customerIdArray = [];
					const trackId = await Track.findByRef("workId", id, {}, { _id: 1, companyId: 1 }, session);
					for (let t of trackId) {
						const tempCustomerUsedGeoObject = await CustomerUsedGeoObject.findByRef("usedTrack.trackId", t._id, {}, { customerId: 1 }, session);
						for (let cugo of tempCustomerUsedGeoObject) {
							const { customerId } = cugo;
							customerIdArray.push(customerId);
						}
					}

					//notify
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

					const from = { role: "company", id: companyId };
					const targetCollection = { name: "works", id };
					const title = "Work is under progress";
					const body = `Work: ${workTitle} is under progress in your area. Check your schedule for pickup date and time.`;
					const data = { status: "workOnProgress" };
					await sendToAll(from, "customer", customerIdArray, uuidArray, targetCollection, title, body, data, session);

					await Work.findByIdAndUpdate(id, { workStatus: "on progress" }, { session });
				} else if (workStatus == "on progress" && updateData.workStatus == "finished") {
					const trackId = await Track.findByRef("workId", id, {}, { _id: 1 }, session);
					for (let t of trackId) {
						const tempCustomerUsedGeoObject = await CustomerUsedGeoObject.findByRef("usedTrack.trackId", t._id, {}, {}, session);
						for (let cugo of tempCustomerUsedGeoObject) {
							_.remove(cugo.usedTrack, (o) => o.trackId == t._id);
							if (_.isEmpty(cugo.usedTrack)) {
								await CustomerUsedGeoObject.findByIdAndDelete(cugo._id, { session });
							} else {
								const { customerId, usedTrack } = cugo;
								await CustomerUsedGeoObject.updateByRef("customerId", customerId, { usedTrack }, session);
							}
						}
						await Track.findByIdAndUpdate(t._id, { $unset: { workId: 1 } }, { session });
					}

					await Schedule.deleteByRef("workId", id, session);
					await Work.findByIdAndUpdate(id, { workStatus: "finished" }, { session });
				}
			});
			return checkTransactionResults(this.transactionResults, "status", "Work update transaction failed");
		} catch (e) {
			throw ApiError.serverError("Work update transaction abort due to error: " + e.message);
		} finally {
			session.endSession();
		}
	}

	async deleteWorkById(id, updateData) {
		//delete ref also
		const session = await mongoose.startSession();
		try {
			this.transactionResults = await session.withTransaction(async () => {
				const tempWork = await Work.findById(id, {}, { session });
				const { staffGroupId, vehicleId } = tempWork;

				//deleting work ref from schedule
				await Schedule.deleteByRef("workId", id, session);

				//deleting work ref from geoObjectTrack
				const tempTrack = await Track.findByRef("workId", id, {}, { _id: 1 }, session);
				for (let t of tempTrack) {
					await Track.findByIdAndUpdate(t._id, { $unset: { workId: 1 } }, { session });
				}

				//free vehicle
				await StaffGroup.findByIdAndUpdate(staffGroupId, { isReserved: false }, { session });

				//free staffgroup
				await Vehicle.findByIdAndUpdate(vehicleId, { isReserved: false }, session);

				await Work.findByIdAndDelete(id, { session });
			});

			return checkTransactionResults(this.transactionResults, "status", "Work delete transaction failed");
		} catch (e) {
			throw ApiError.serverError("Work delete transaction abort due to error: " + e.message);
		} finally {
			session.endSession();
		}
	}
}

exports.WorkServices = WorkServices;
