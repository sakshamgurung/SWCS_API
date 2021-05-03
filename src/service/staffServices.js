const mongoose = require("mongoose");
const _ = require("lodash");
const ApiError = require("../error/ApiError");
const { checkTransactionResults, checkForWriteErrors } = require("../utilities/errorUtil");

const StaffLogin = require("../models/staff/staffLogin");
const StaffDetail = require("../models/staff/staffDetail");
const StaffGroup = require("../models/staff/staffGroup");
const Notification = require("../models/common/notification");

class StaffServices {
	constructor() {
		this.staffDetail = undefined;
		this.result = undefined;
		this.transactionResults = undefined;
	}

	async newStaffInfo(staffDetail) {
		const session = await mongoose.startSession();
		try {
			this.transactionResults = await session.withTransaction(async () => {
				this.result = {};
				const { staffId } = staffDetail;

				this.staffDetail = new StaffDetail(staffDetail);
				this.result.staffDetail = await this.staffDetail.save({ session });

				let result = await StaffLogin.findByIdAndUpdate(staffId, { firstTimeLogin: false }, { session });
				checkForWriteErrors(result, "none", "New staff info failed");
			});
			if (this.transactionResults) {
				return this.result;
			} else {
				throw ApiError.serverError("New staff info transaction failed");
			}
		} catch (e) {
			throw ApiError.serverError("New staff info transaction abort due to error: " + e.message);
		} finally {
			session.endSession();
		}
	}

	async getAllStaff(staffInfoType, companyId, query) {
		//type "staff" only for auth user
		if (staffInfoType == "staff") {
			this.result = await StaffLogin.find({ $and: [{ companyId }, query] });
		} else if (staffInfoType == "staff-detail") {
			console.log("companyId", companyId);
			this.result = await StaffDetail.find({ $and: [{ companyId }, query] })
				.populate("companyId", "email mobileNo")
				.populate("staffId", "email mobileNo");
			//staffGroupId gives error
		} else {
			throw ApiError.badRequest("staffInfoType not found!!!");
		}
		return this.result;
	}

	async getStaffById(staffInfoType, id) {
		//type "staff" only for auth user
		if (staffInfoType == "staff") {
			this.result = await StaffLogin.findById(id);
		} else if (staffInfoType == "staff-detail") {
			this.result = await StaffDetail.find({ staffId: id }).populate("companyId", "email mobileNo").populate("staffId", "email mobileNo");
		} else {
			throw ApiError.badRequest("staffInfoType not found!!!");
		}
		return this.result;
	}

	async getStaffByRef(staffInfoType, ref, id, query) {
		if (staffInfoType == "staff") {
			this.result = await StaffLogin.findByRef(ref, id, query);
		} else if (staffInfoType == "staff-detail") {
			this.result = await StaffDetail.findByRef(ref, id, query).populate("companyId", "email mobileNo").populate("staffId", "email mobileNo");
		} else {
			throw ApiError.badRequest("staffInfoType not found!!!");
		}
		return this.result;
	}

	async updateStaffById(staffInfoType, id, updateData) {
		if (staffInfoType == "staff") {
			this.result = await StaffLogin.findByIdAndUpdate(id, updateData);
		} else if (staffInfoType == "staff-detail") {
			this.result = await StaffDetail.findByIdAndUpdate(id, updateData);
		} else {
			throw ApiError.badRequest("staffInfoType not found!!!");
		}

		return checkForWriteErrors(this.result, "status", "Staff update failed");
	}

	//delete the staff and its information and references
	async deleteStaffById(id, updateData) {
		const session = await mongoose.startSession();
		try {
			this.transactionResults = await session.withTransaction(async () => {
				//removing deleted staff from the staffGroup collection's staffId field
				const tempStaffGroup = await StaffGroup.findByRef("staffId", id, {}, session);
				_.remove(tempStaffGroup[0].staffId, (o) => o == id);
				const staffGroupId = tempStaffGroup[0]._id;
				const staffId = tempStaffGroup[0].staffId;
				this.result = await StaffGroup.findByIdAndUpdate(staffGroupId, { staffId }, { session });
				checkForWriteErrors(this.result, "none", "Staff delete failed");

				//removing staff notification
				this.result = await Notification.deleteByRole("staff", id, {}, session);
				checkForWriteErrors(this.result, "none", "Staff delete failed");

				this.result = await StaffLogin.findByIdAndDelete(id, { session });
				checkForWriteErrors(this.result, "none", "Staff delete failed");
				this.result = await StaffDetail.findByIdAndDelete(id, { session });
				checkForWriteErrors(this.result, "none", "Staff delete failed");

				//notify groupMember about removed staff
			});

			return checkTransactionResults(this.transactionResults, "status", "Staff delete transaction failed");
		} catch (e) {
			throw ApiError.serverError("Staff delete transaction abort due to error: " + e.message);
		} finally {
			session.endSession();
		}
	}
}

exports.StaffServices = StaffServices;
