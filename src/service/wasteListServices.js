const mongoose = require("mongoose");
const ApiError = require("../error/ApiError");
const _ = require("lodash");
const { checkTransactionResults, checkForWriteErrors } = require("../utilities/errorUtil");
const { calWasteCondition, calCurrentAmtInKg } = require("../utilities/wasteUtil");

const WasteList = require("../models/companies/wasteList");
const WasteDump = require("../models/customers/wasteDump");
const Track = require("../models/companies/geoObjectTrack");

class WasteListServices {
	constructor() {
		this.wasteList = undefined;
		this.result = undefined;
		this.transactionResults = undefined;
	}

	async createNewWasteList(wasteListData) {
		this.wasteList = new WasteList(wasteListData);
		this.result = await this.wasteList.save();
		return this.result;
	}

	async getAllWasteList(companyId, query) {
		this.result = await WasteList.find({ $and: [{ companyId }, query] }).populate("wasteCatalogId");
		return this.result;
	}

	async getWasteListById(id) {
		this.result = await WasteList.findById(id).populate("wasteCatalogId");
		return this.result;
	}

	async getWasteListByRef(ref, id, query) {
		this.result = await WasteList.findByRef(ref, id, query).populate("wasteCatalogId");
		return this.result;
	}

	async updateWasteListById(id, updateData) {
		this.result = await WasteList.findByIdAndUpdate(id, updateData);
		return checkForWriteErrors(this.result, "status", "Waste list update failed");
	}

	async deleteWasteListById(id, updateData) {
		const { wasteDump } = updateData;
		const session = await mongoose.startSession();
		try {
			this.transactionResults = session.withTransaction(async () => {
				const tempWasteDump = WasteDump.findByRef("wasteListId", id, { isCollected: false }, {}, session);
				if (wasteDump.remapping) {
					//remapping
					const { newWasteListId } = wasteDump;
					for (let wd of tempWasteDump) {
						const dumpedWate = wd.dumpedWate;
						for (let dw of dumpedWate) {
							if (dw.wasteListId == id) {
								dw.wasteListId = newWasteListId;
							}
						}
						await WasteDump.findByIdAndUpdate(wd._id, { dumpedWate }, { session });
					}
				} else {
					//removing or update waste dump
					const trackToUpdate = [];

					for (let wd of tempWasteDump) {
						const dumpedWate = wd.dumpedWate;
						if (wd.geoObjectType == "track") {
							trackToUpdate.push(wd.geoObjectId);
						}
						_.remove(dumpedWate, (dw) => dw.wasteListId == id);
						if (dumpedWate.length == 0) {
							await WasteDump.findByIdAndDelete(wd._id, { session });
						} else {
							await WasteDump.findByIdAndUpdate(wd._id, { dumpedWate }, { session });
						}
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
				}
			});

			return checkTransactionResults(this.transactionResults, "status", "Waste list delete transaction failed");
		} catch (e) {
			throw ApiError.serverError("Waste list delete transaction abort due to error: " + e.message);
		} finally {
			session.endSession();
		}
	}
}

exports.WasteListServices = WasteListServices;
