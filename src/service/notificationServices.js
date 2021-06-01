const mongoose = require("mongoose");
const _ = require("lodash");
const ApiError = require("../error/ApiError");
const { checkForWriteErrors } = require("../utilities/errorUtil");
const { mongooseToPlainObjectArray } = require("../utilities/converter");

const Notification = require("../models/common/notification");
const CompanyLogin = require("../models/companies/companyLogin");
const CompanyDetail = require("../models/companies/companyDetail");
const Work = require("../models/common/work");
const CustomerRequest = require("../models/common/customerRequest");
const StaffLogin = require("../models/staff/staffLogin");
const StaffDetail = require("../models/staff/staffDetail");
const CustomerLogin = require("../models/customers/customerLogin");
const CustomerDetail = require("../models/customers/customerDetail");
const SuperAdmin = require("../models/superadmin/superadmin");

class NotificationServices {
	constructor() {
		this.notification = undefined;
		this.result = undefined;
		this.transactionResults = undefined;
	}

	async getAllNotification(role, id, query) {
		this.result = await Notification.findAll(role, id, query);
		this.result = mongooseToPlainObjectArray(this.result);

		for (let doc of this.result) {
			const fromRole = doc.from.role;

			if (fromRole == "company") {
				const loginInfo = await CompanyLogin.findById(doc.from.id, { email: 1, mobileNo: 1 });
				const { email, mobileNo } = loginInfo;

				const companyDetail = await CompanyDetail.find({ companyId: doc.from.id }, "companyName");
				const { companyName } = companyDetail[0];

				let addedData = {
					email,
					mobileNo,
					companyName,
				};

				if (doc.targetCollection && doc.targetCollection.name == "works") {
					const work = await Work.findById(doc.targetCollection.id, "workTitle workStatus");
					const { _id, workTitle, workStatus } = work;
					addedData = { ...addedData, workTitle, workStatus, workId: _id };
				} else if (doc.targetCollection && doc.targetCollection.name == "customerRequests") {
					const customerRequest = await CustomerRequest.findById(doc.targetCollection.id, "requestStatus ");
					const { _id, requestStatus } = customerRequest;
					addedData = { ...addedData, requestStatus, customerRequestId: _id };
				}

				doc.message.data = { ...doc.message.data, ...addedData };
			} else if (fromRole == "staff") {
				const loginInfo = await StaffLogin.findById(doc.from.id, { email: 1, mobileNo: 1 });
				const { email, mobileNo } = loginInfo;

				const staffDetail = await StaffDetail.find({ staffId: doc.from.id }, "name");
				const { name } = staffDetail[0];

				let addedData = {
					email,
					mobileNo,
					name: `${name.firstName} ${name.lastName}`,
				};

				if (doc.targetCollection.name == "works") {
					const work = await Work.findById(doc.targetCollection.id, "workTitle workStatus");
					const { _id, workTitle, workStatus } = work;
					addedData = { ...addedData, workTitle, workStatus, workId: _id };
				} else if (doc.targetCollection.name == "customerRequests") {
					const customerRequest = await CustomerRequest.findById(doc.targetCollection.id, "requestStatus ");
					const { _id, requestStatus } = customerRequest;
					addedData = { ...addedData, requestStatus, customerRequestId: _id };
				}

				doc.message.data = { ...doc.message.data, ...addedData };
			} else if (fromRole == "customer") {
				const loginInfo = await CustomerLogin.findById(doc.from.id, { email: 1, mobileNo: 1 });
				const { email, mobileNo } = loginInfo;

				const customerDetail = await CustomerDetail.find({ staffId: doc.from.id }, "contactName businessName");
				const { contactName, businessName } = customerDetail[0];

				let addedData = {
					email,
					mobileNo,
					contactName: `${contactName.firstName} ${contactName.lastName}`,
					businessName,
				};

				if (doc.targetCollection.name == "customerRequests") {
					const customerRequest = await CustomerRequest.findById(doc.targetCollection.id, "_id ");
					const { _id } = customerRequest;
					addedData = { ...addedData, customerRequestId: _id };
				}

				doc.message.data = { ...doc.message.data, ...addedData };
			} else if (fromRole == "superadmin") {
				const loginInfo = await SuperAdmin.findById(doc.from.id, { email: 1 });

				doc.message.data.email = loginInfo.email;
			}
		}
		return this.result;
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
