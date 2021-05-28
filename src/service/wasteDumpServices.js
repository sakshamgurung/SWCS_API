const mongoose = require("mongoose");
const _ = require("lodash");
const ApiError = require("../error/ApiError");
const { checkForWriteErrors } = require("../utilities/errorUtil");

const WasteDump = require("../models/customers/wasteDump");
const Track = require("../models/companies/geoObjectTrack");
const Zone = require("../models/companies/geoObjectZone");
const CustomerUsedGeoObject = require("../models/customers/customerUsedGeoObject");

const { calWasteCondition, calCurrentAmtInKg } = require("../utilities/wasteUtil");

class WasteDumpServices {
	constructor() {
		this.wasteDump = undefined;
		this.customerUsedGeoObject = undefined;
		this.result = undefined;
		this.transactionResults = undefined;
	}

	async createNewWasteDump(wasteDumpData) {
		this.result = {};
		const session = await mongoose.startSession();

		try {
			this.transactionResults = await session.withTransaction(async () => {
				let currentAmount = 0;
				const { customerId, companyId, geoObjectType, geoObjectId, dumpedWaste } = wasteDumpData;

				if (geoObjectType == "track") {
					const tempCustomerUsedGeoObject = await CustomerUsedGeoObject.findByRef("customerId", customerId, {}, {}, session);

					//creating new customerUsedGeoObject
					if (_.isEmpty(tempCustomerUsedGeoObject)) {
						const newCustomerUsedGeoObject = {
							customerId,
							usedTrack: [{ companyId, trackId: geoObjectId }],
						};

						this.customerUsedGeoObject = new CustomerUsedGeoObject(newCustomerUsedGeoObject);
						this.result.customerUsedGeoObject = await this.customerUsedGeoObject.save({ session });
					} else {
						const { usedTrack } = tempCustomerUsedGeoObject[0];
						const cugoId = tempCustomerUsedGeoObject[0]._id;
						const isCompanyTrackInUse = _.filter(usedTrack, (o) => o.companyId == companyId);

						//first time using this company geoObject
						if (_.isEmpty(isCompanyTrackInUse)) {
							console.log("first time using company geoObject cugo \n");
							usedTrack.push({ companyId, trackId: geoObjectId });
							await CustomerUsedGeoObject.findByIdAndUpdate(cugoId, { usedTrack }, { session });
						} else {
							throw ApiError.badRequest("track in use already. Can update dumped waste data");
						}
					}
					const tempWasteDump = await WasteDump.findByRef("geoObjectId", geoObjectId, { isCollected: false }, { dumpedWaste: 1 }, session);

					for (let wd of tempWasteDump) {
						for (let dw of wd.dumpedWaste) {
							currentAmount = calCurrentAmtInKg(currentAmount, dw.amountUnit, dw.amount);
						}
					}

					for (let dw of dumpedWaste) {
						currentAmount = calCurrentAmtInKg(currentAmount, dw.amountUnit, dw.amount);
					}

					const tempTrack = await Track.findById(geoObjectId, { wasteLimit: 1 }, { session });
					const wasteCondition = calWasteCondition(currentAmount, tempTrack.wasteLimit);
					await Track.findByIdAndUpdate(geoObjectId, { wasteCondition }, { session });
				}

				this.wasteDump = new WasteDump(wasteDumpData);
				this.result.wasteDump = await this.wasteDump.save({ session });
			});

			if (this.transactionResults) {
				return this.result;
			} else {
				throw ApiError.serverError("New waste dump transaction failed");
			}
		} catch (e) {
			throw ApiError.serverError("New waste dump transaction abort due to error: " + e.message);
		} finally {
			session.endSession();
		}
		//send nontification to company if wasteCondition is high
	}

	async getWasteDumpById(id) {
		this.result = await WasteDump.findById(id).populate({
			path: "dumpedWaste.wasteListId",
			populate: {
				path: "wasteCatalogId",
				//select:"wasteType wasteName",
				model: "WasteCatalog",
			},
		});
		return this.result;
	}

	async getWasteDumpByRef(ref, id, query) {
		this.result = await WasteDump.findByRef(ref, id, query).populate({
			path: "dumpedWaste.wasteListId",
			populate: {
				path: "wasteCatalogId",
				//select:"wasteType wasteName",
				model: "WasteCatalog",
			},
		});
		return this.result;
	}

	async updateWasteDumpById(id, updateData) {
		const session = await mongoose.startSession();
		try {
			this.transactionResults = await session.withTransaction(async () => {
				const { customerId, geoObjectId, dumpedWaste, isCollected } = updateData;

				if (!_.isEmpty(geoObjectId) && !_.isEmpty(dumpedWaste) && isCollected == false) {
					let currentAmount = 0;
					const tempWasteDump = await WasteDump.findByRef("geoObjectId", geoObjectId, { isCollected: false }, { dumpedWaste: 1 }, session);
					for (let wd of tempWasteDump) {
						for (let dw of wd.dumpedWaste) {
							currentAmount = calCurrentAmtInKg(currentAmount, dw.amountUnit, dw.amount);
						}
					}

					for (let dw of dumpedWaste) {
						currentAmount = calCurrentAmtInKg(currentAmount, dw.amountUnit, dw.amount);
					}
					const tempTrack = await Track.findById(geoObjectId, { wasteLimit: 1 }, { session });
					const wasteCondition = calWasteCondition(currentAmount, tempTrack.wasteLimit);
					await Track.findByIdAndUpdate(geoObjectId, { wasteCondition }, { session });
					await WasteDump.findByIdAndUpdate(id, updateData, { session });
				} else if (isCollected == true) {
					const archiveTrack = await Track.findById(geoObjectId, {}, { session });
					const archiveZone = await Zone.find({ companyId: archiveTrack.companyId }, {}, { session });
					updateData.archive = {
						trackPoints: archiveTrack.trackPoints,
						zonePoints: archiveZone.zonePoints,
					};

					const tempCugo = await CustomerUsedGeoObject.findByRef("customerId", customerId, {}, {}, session);
					const usedTrack = tempCugo[0].usedTrack;
					const cugoId = tempCugo[0]._id;
					_.remove(usedTrack, (ut) => ut.trackId == geoObjectId);
					if (usedTrack.length == 0) {
						await CustomerUsedGeoObject.findByIdAndDelete(cugoId, { session });
					} else {
						await CustomerUsedGeoObject.findByIdAndUpdate(cugoId, { usedTrack });
					}

					await WasteDump.findByIdAndUpdate(id, updateData, { session });
				}
			});

			if (this.transactionResults) {
				return checkForWriteErrors({}, "status", "Waste Dump update failed");
			} else {
				throw ApiError.serverError("Waste dump update transaction failed");
			}
		} catch (e) {
			throw ApiError.serverError("Waste dump update transaction abort due to error: " + e.message);
		} finally {
			session.endSession();
		}
	}

	async deleteWasteDumpById(id, updateData) {
		const session = await mongoose.startSession();
		try {
			this.transactionResults = await session.withTransaction(async () => {
				const deleteWasteDump = await WasteDump.findById(id, {}, { session });
				const { customerId, geoObjectId, dumpedWaste } = deleteWasteDump;

				//current condition of geo object
				let currentAmount = 0;
				const tempWasteDump = await WasteDump.findByRef("geoObjectId", geoObjectId, { isCollected: false }, { dumpedWaste: 1 }, session);
				for (let wd of tempWasteDump) {
					for (let dw of wd.dumpedWaste) {
						currentAmount = calCurrentAmtInKg(currentAmount, dw.amountUnit, dw.amount);
					}
				}

				for (let dw of dumpedWaste) {
					dw.amount = -dw.amount;
					currentAmount = calCurrentAmtInKg(currentAmount, dw.amountUnit, dw.amount);
				}

				const tempTrack = await Track.findById(geoObjectId, { wasteLimit: 1 }, { session });
				const wasteCondition = calWasteCondition(currentAmount, tempTrack.wasteLimit);
				await Track.findByIdAndUpdate(geoObjectId, { wasteCondition }, { session });

				//customer used geo object
				const tempCugo = await CustomerUsedGeoObject.findByRef("customerId", customerId, {}, {}, session);
				const usedTrack = tempCugo[0].usedTrack;
				const cugoId = tempCugo[0]._id;
				_.remove(usedTrack, (ut) => ut.trackId == geoObjectId);
				if (usedTrack.length == 0) {
					await CustomerUsedGeoObject.findByIdAndDelete(cugoId, { session });
				} else {
					await CustomerUsedGeoObject.findByIdAndUpdate(cugoId, { usedTrack });
				}

				await WasteDump.findByIdAndDelete(id, { session });
			});

			if (this.transactionResults) {
				return checkForWriteErrors({}, "status", "Waste Dump delete failed");
			} else {
				throw ApiError.serverError("Waste dump delete transaction failed");
			}
		} catch (e) {
			throw ApiError.serverError("Waste dump delete transaction abort due to error: " + e.message);
		} finally {
			session.endSession();
		}
	}
}

exports.WasteDumpServices = WasteDumpServices;
