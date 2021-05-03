const mongoose = require("mongoose");
const ApiError = require("../error/ApiError");
const _ = require("lodash");
const { checkTransactionResults, checkForWriteErrors } = require("../utilities/errorUtil");

const StaffGroup = require("../models/staff/staffGroup");
const Work = require("../models/common/work");
const StaffDetail = require("../models/staff/staffDetail");
const CustomerRequest = require("../models/common/customerRequest");

class StaffGroupServices {
	constructor() {
		this.staffGroup = undefined;
		this.result = undefined;
		this.transactionResults = undefined;
	}

	async createNewStaffGroup(staffGroupData) {
		const session = await mongoose.startSession();
		try {
			this.transactionResults = await session.withTransaction(async () => {
				this.staffGroup = new StaffGroup(staffGroupData);
				this.result = await this.staffGroup.save({ session });

				const { staffId } = staffGroupData;
				for (let id of staffId) {
					const result = await StaffDetail.updateByRef("staffId", id, { staffGroupId: this.result._id }, session);
					checkForWriteErrors(result, "none", "Staff detail update failed for staff group");
				}
			});

			if (this.transactionResults) {
				return this.result;
			} else {
				throw ApiError.serverError("New staff group transaction failed");
			}
		} catch (e) {
			throw ApiError.serverError("New staff group transaction abort due to error: " + e.message);
		} finally {
			session.endSession();
		}
	}

	async getAllStaffGroup(companyId, query) {
		this.result = await StaffGroup.find({ $and: [{ companyId }, query] })
			.populate("companyId", "email mobileNo")
			.populate("staffId", "email mobileNo");
		return this.result;
	}

	async getStaffGroupById(id) {
		this.result = await StaffGroup.findById(id).populate("companyId", "email mobileNo").populate("staffId", "email mobileNo");
		return this.result;
	}

	async getStaffGroupByRef(ref, id, query) {
		this.result = await StaffGroup.findByRef(ref, id, query).populate("companyId", "email mobileNo").populate("staffId", "email mobileNo");
		return this.result;
	}

	async updateStaffGroupById(id, updateData) {
		if (updateData.hasOwnProperty("isReserved")) {
			throw ApiError.badRequest("isReserved can't be modified from here");
		}
		const session = await mongoose.startSession();
		try {
			this.transactionResults = await session.withTransaction(async () => {
				const prevStaffGroupData = await StaffGroup.findById(id, { staffId: 1 }, { session });
				const { staffId } = prevStaffGroupData;
				const deletedGroupMember = _.difference(staffId, updateData.staffId);
				const addedGroupMember = _.difference(updateData.staffId, staffId);

				if (deletedGroupMember.length > 0) {
					for (let gm of deletedGroupMember) {
						this.result = await StaffDetail.findOneAndUpdate({ staffId: gm }, { staffGroupId: "" }, { session });
						checkForWriteErrors(this.result, "none", "Staff group update failed");
					}
				}

				if (addedGroupMember.length > 0) {
					for (let gm of addedGroupMember) {
						this.result = await StaffDetail.findOneAndUpdate({ staffId: gm }, { staffGroupId: id }, { session });
						checkForWriteErrors(this.result, "none", "Staff group update failed");
					}
				}
				console.log("deleted gm", deletedGroupMember);
				console.log("added gm", addedGroupMember);
				this.result = await StaffGroup.findByIdAndUpdate(id, updateData, { session });
				checkForWriteErrors(this.result, "none", "Staff group update failed");
			});

			return checkTransactionResults(this.transactionResults, "status", "Staff group update transaction failed");
		} catch (e) {
			throw ApiError.serverError("Staff group update transaction abort due to error: " + e.message);
		} finally {
			session.endSession();
		}
	}

	async deleteStaffGroupById(id, updateData) {
		const session = await mongoose.startSession();
		try {
			this.transactionResults = await session.withTransaction(async () => {
				//removing deleted staffGroupId from the staffDetail collection
				const tempStaffDetail = await StaffDetail.findByRef("staffGroupId", id, {}, session);
				for (let sd of tempStaffDetail) {
					this.result = await StaffDetail.findByIdAndUpdate(sd._id, { staffGroupId: "" }, { session });
					checkForWriteErrors(this.result, "none", "Staff group delete failed");
				}

				//removing deleted staffgroup from the work collection's staffGroupId field
				this.result = await Work.updateByRef("staffGroupId", id, { staffGroupId: "" }, session);
				checkForWriteErrors(this.result, "none", "Staff group delete failed");

				//removing deleted staffgroup from the customerRequest collection's staffGroupId field
				this.result = await CustomerRequest.updateByRef("staffGroupId", id, { staffGroupId: "" }, session);
				checkForWriteErrors(this.result, "none", "Staff group delete failed");

				this.result = await StaffGroup.findByIdAndDelete(id, { session });
				checkForWriteErrors(this.result, "none", "Staff group delete failed");

				//notify group member
			});

			return checkTransactionResults(this.transactionResults, "status", "Staff group delete transaction failed");
		} catch (e) {
			throw ApiError.serverError("Staff group delete transaction abort due to error: " + e.message);
		} finally {
			session.endSession();
		}
	}
}

exports.StaffGroupServices = StaffGroupServices;
