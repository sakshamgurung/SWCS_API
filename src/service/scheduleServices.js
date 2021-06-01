const Schedule = require("../models/customers/schedule");
const CompanyDetail = require("../models/companies/companyDetail");

const { mongooseToPlainObjectArray } = require("../utilities/converter");

class ScheduleServices {
	constructor() {
		this.schedule = undefined;
		this.result = undefined;
	}

	async getAllSchedule(customerId, query) {
		this.result = await Schedule.find({ $and: [{ customerId }, query] })
			.populate("workId")
			.populate("customerRequestId", "companyId customerId requestStatus");
		this.result = mongooseToPlainObjectArray(this.result);

		for (let s of this.result) {
			if (s.hasOwnProperty("workId")) {
				const { companyId } = s.workId;
				const companyDetail = await CompanyDetail.find({ companyId }, "companyId companyName ");
				s.companyDetail = companyDetail[0];
			} else if (s.hasOwnProperty("customerRequestId")) {
				const { companyId } = s.customerRequestId;
				const companyDetail = await CompanyDetail.find({ companyId }, "companyId companyName ");
				s.companyDetail = companyDetail[0];
			}
		}

		return this.result;
	}

	async getScheduleById(id) {
		this.result = await Schedule.findById(id).populate("workId").populate("customerRequestId", "companyId customerId requestType requestStatus");
		this.result = mongooseToPlainObjectArray(this.result);

		for (let s of this.result) {
			if (s.hasOwnProperty("workId")) {
				const { companyId } = s.workId;
				const companyDetail = await CompanyDetail.find({ companyId }, "companyId companyName ");
				s.companyDetail = companyDetail[0];
			} else if (s.hasOwnProperty("customerRequestId")) {
				const { companyId } = s.customerRequestId;
				const companyDetail = await CompanyDetail.find({ companyId }, "companyId companyName ");
				s.companyDetail = companyDetail[0];
			}
		}

		return this.result;
	}

	async getScheduleByRef(ref, id, query) {
		this.result = await Schedule.findByRef(ref, id, query)
			.populate("workId")
			.populate("customerRequestId", "companyId customerId requestType requestStatus");
		this.result = mongooseToPlainObjectArray(this.result);

		for (let s of this.result) {
			if (s.hasOwnProperty("workId")) {
				const { companyId } = s.workId;
				const companyDetail = await CompanyDetail.find({ companyId }, "companyId companyName ");
				s.companyDetail = companyDetail[0];
			} else if (s.hasOwnProperty("customerRequestId")) {
				const { companyId } = s.customerRequestId;
				const companyDetail = await CompanyDetail.find({ companyId }, "companyId companyName ");
				s.companyDetail = companyDetail[0];
			}
		}

		return this.result;
	}
}

exports.ScheduleServices = ScheduleServices;
