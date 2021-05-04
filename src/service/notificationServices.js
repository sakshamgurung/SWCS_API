const mongoose = require("mongoose");
const _ = require("lodash");
const ApiError = require("../error/ApiError");
const { checkForWriteErrors } = require("../utilities/errorUtil");

const Notification = require("../models/common/notification");
const CompanyLogin = require("../models/companies/companyLogin");
const StaffLogin = require("../models/staff/staffLogin");
const CustomerLogin = require("../models/customers/customerLogin");
const SuperAdmin = require("../models/superadmin/superadmin");

class NotificationServices {
	constructor() {
		this.notification = undefined;
		this.result = undefined;
		this.transactionResults = undefined;
	}

	async getAllNotification(role, id, query) {
		const session = await mongoose.startSession();
		try {
			this.transactionResults = await session.withTransaction(async () => {
				this.result = await Notification.findAll(role, id, query, {}, session);

				for (let doc of this.result) {
					const modelType = doc.from.role;
					if (modelType == "company") {
						const loginInfo = await CompanyLogin.findById(doc.from.id, { email: 1, mobileNo: 1 }, { session });
						doc.message.data.email = loginInfo.email;
						doc.message.data.mobileNo = loginInfo.mobileNo;
					} else if (modelType == "staff") {
						const loginInfo = await StaffLogin.findById(doc.from.id, { email: 1, mobileNo: 1 }, { session });
						doc.message.data.email = loginInfo.email;
						doc.message.data.mobileNo = loginInfo.mobileNo;
					} else if (modelType == "customer") {
						const loginInfo = await CustomerLogin.findById(doc.from.id, { email: 1, mobileNo: 1 }, { session });
						doc.message.data.email = loginInfo.email;
						doc.message.data.mobileNo = loginInfo.mobileNo;
					} else if (modelType == "superadmin") {
						const loginInfo = await SuperAdmin.findById(doc.from.id, { email: 1 }, { session });
						doc.message.data.email = loginInfo.email;
					}
				}
			});

			if (this.transactionResults) {
				return this.result;
			} else {
				throw ApiError.serverError("Notification transaction failed");
			}
		} catch (e) {
			throw ApiError.serverError("Notification transaction abort due to error: " + e.message);
		} finally {
			session.endSession();
		}
	}

	async getNotificationById(id) {
		this.result = await Notification.findById(id);
		return this.result;
	}

	async deleteNotificationById(id, updateData) {
		this.result = await Notification.findByIdAndDelete(id);
		return checkForWriteErrors(this.result, "status", "Notification delete failed");
	}
}

exports.NotificationServices = NotificationServices;
