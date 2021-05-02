const mongoose = require("mongoose");
const ApiError = require("../error/ApiError");

const {
	checkTransactionResults,
	checkForWriteErrors,
} = require("../utilities/errorUtil");

const CompanyLogin = require("../models/companies/companyLogin");
const CompanyDetail = require("../models/companies/companyDetail");
const CompanyServiceDetail = require("../models/companies/companyServiceDetail");

const Vehicle = require("../models/companies/vehicle");
const Track = require("../models/companies/geoObjectTrack");
const Zone = require("../models/companies/geoObjectZone");
const WasteList = require("../models/companies/wasteList");

const StaffLogin = require("../models/staff/staffLogin");
const StaffDetail = require("../models/staff/staffDetail");
const StaffGroup = require("../models/staff/staffGroup");

const CustomerRequest = require("../models/common/customerRequest");
const Notification = require("../models/common/notification");
const Subscription = require("../models/common/subscription");
const Work = require("../models/common/work");

const CustomerUsedGeoObject = require("../models/customers/customerUsedGeoObject");
const Schedule = require("../models/customers/schedule");
const WasteDump = require("../models/customers/wasteDump");

const GraphData = require("../models/graph/graphData");

class CompanyServices {
	constructor() {
		this.companyDetail = undefined;
		this.companyServiceDetail = undefined;
		this.result = undefined;
		this.transactionResults = undefined;
	}

	async newCompanyInfo(companyDetail, companyServiceDetail) {
		const session = await mongoose.startSession();
		try {
			this.transactionResults = await session.withTransaction(
				async () => {
					this.result = {};
					const { companyId } = companyDetail;

					this.companyDetail = new CompanyDetail(companyDetail);
					this.result.companyDetail = await this.companyDetail.save({
						session,
					});

					this.companyServiceDetail = new CompanyServiceDetail(
						companyServiceDetail
					);
					this.result.companyServiceDetail = await this.companyServiceDetail.save(
						{ session }
					);

					let result = await CompanyLogin.findByIdAndUpdate(
						companyId,
						{ firstTimeLogin: false },
						{ session }
					);
					checkForWriteErrors(
						result,
						"none",
						"New company info failed"
					);
				}
			);

			if (this.transactionResults) {
				return this.result;
			} else {
				throw ApiError.serverError(
					"New company info transaction failed"
				);
			}
		} catch (e) {
			throw ApiError.serverError(
				"New company info transaction abort due to error: " + e.message
			);
		} finally {
			session.endSession();
		}
	}

	async getGraphData(companyId) {
		this.result = await GraphData.find({ companyId: companyId });
		return this.result;
	}

	async getAllCompany(companyInfoType, query) {
		if (companyInfoType == "company-detail") {

			this.result = await CompanyDetail.find({
				$and: [{}, query],
			}).populate("companyId", "email mobileNo");
		} else if (companyInfoType == "company-service-detail") {
			this.result = await CompanyServiceDetail.find({
				$and: [{}, query],
			}).populate("companyId", "email mobileNo");
		} else {
			throw ApiError.badRequest("companyInfoType not found!!!");
		}
		return this.result;
	}

	async getCompanyById(companyInfoType, id) {
		//type "company" only for auth user
		if (companyInfoType == "company") {
			this.result = await CompanyLogin.findById(id);
		} else if (companyInfoType == "company-detail") {
			this.result = await CompanyDetail.find({ companyId: id }).populate(
				"companyId",
				"email mobileNo"
			);
		} else if (companyInfoType == "company-service-detail") {
			this.result = await CompanyServiceDetail.find({
				companyId: id,
			}).populate("companyId", "email mobileNo");
		} else {
			throw ApiError.badRequest("companyInfoType not found!!!");
		}
		return this.result;
	}

	async getCompanyByRef(companyInfoType, ref, id, query) {
		if (companyInfoType == "company-detail") {
<<<<<<< HEAD
			this.result = await CompanyDetail.findByRef(ref, id, query).populate("companyId", "email mobileNo");
		} else if (companyInfoType == "company-service-detail") {
			this.result = await CompanyServiceDetail.findByRef(ref, id, query).populate("companyId", "email mobileNo");
=======
			this.result = await CompanyDetail.findByRef(
				ref,
				id,
				query
			).populate("companyId", "email mobileNo");
		} else if (companyInfoType == "company-service-detail") {
			this.result = await CompanyServiceDetail.findByRef(
				ref,
				id,
				query
			).populate("companyId", "email mobileNo");
>>>>>>> main
		} else {
			throw ApiError.badRequest("companyInfoType not found!!!");
		}
		return this.result;
	}

	async updateCompanyById(companyInfoType, id, updateData) {
		if (companyInfoType == "company") {
			this.result = await CompanyLogin.findByIdAndUpdate(id, updateData);
		} else if (companyInfoType == "company-detail") {
			this.result = await CompanyDetail.findByIdAndUpdate(id, updateData);
		} else if (companyInfoType == "company-service-detail") {
			this.result = await CompanyServiceDetail.findByIdAndUpdate(
				id,
				updateData
			);
		} else {
			throw ApiError.badRequest("companyInfoType not found!!!");
		}
		return checkForWriteErrors(
			this.result,
			"status",
			"Company update failed"
		);
	}

	async deleteCompanyById(id, updateData) {
		const session = await mongoose.startSession();
		try {
			this.transactionResults = await session.withTransaction(
				async () => {
					//deleting uncollected waste dump of company
					const tempWasteDump = await WasteDump.findByRef(
						"companyId",
						id,
						{},
						{ isCollected: 1 },
						session
					);
					const archiveWasteDump = _.remove(
						tempWasteDump,
						(o) => o.isCollected == true
					);

					for (let wd of archiveWasteDump) {
						this.result = await WasteDump.findByIdAndUpdate(
							wd._id,
							{ customerId: "", companyId: "" },
							{ session }
						);
						checkForWriteErrors(
							this.result,
							"none",
							"Company delete failed"
						);
					}

					for (let wd of tempWasteDump) {
						this.result = await WasteDump.findByIdAndDelete(
							wd._id,
							{ session }
						);
						checkForWriteErrors(
							this.result,
							"none",
							"Company delete failed"
						);
					}

					//deleting notification
					const tempSubscription = await Subscription.findAllSubscriber(
						id,
						{ customerId: 1 },
						session
					);
					for (let s of tempSubscription) {
						this.result = await Notification.deleteByRole(
							"customer",
							s.customerId,
							{},
							session
						);
						checkForWriteErrors(
							this.result,
							"none",
							"Company delete failed"
						);
					}

					const tempStaffLogin = await StaffLogin.findByRef(
						"companyId",
						id,
						{},
						{ _id: 1 },
						session
					);
					for (let sl of tempStaffLogin) {
						this.result = await Notification.deleteByRole(
							"staff",
							sl._id,
							{},
							session
						);
						checkForWriteErrors(
							this.result,
							"none",
							"Company delete failed"
						);
					}

					this.result = await Notification.deleteByRole(
						"company",
						id,
						{},
						session
					);
					checkForWriteErrors(
						this.result,
						"none",
						"Company delete failed"
					);

					//deleting schedule
					const tempWork = await Work.findByRef(
						"companyId",
						id,
						{},
						{ _id: 1 },
						session
					);
					for (let w of tempWork) {
						this.result = await Schedule.deleteByRef(
							"workId",
							w._id,
							session
						);
						checkForWriteErrors(
							this.result,
							"none",
							"Company delete failed"
						);
					}

					const tempCustomerRequest = await CustomerRequest.findByRef(
						"companyId",
						id,
						{},
						{ _id },
						session
					);
					for (let cr of tempCustomerRequest) {
						this.result = await Schedule.deleteByRef(
							"customerRequestId",
							cr._id,
							session
						);
						checkForWriteErrors(
							this.result,
							"none",
							"Company delete failed"
						);
					}

					//updating customer used geoObject
					const tempTrack = await Track.findByRef(
						"companyId",
						id,
						{},
						{ _id: 1 },
						session
					);
					for (let t of tempTrack) {
						const tempCustomerUsedGeoObject = await CustomerUsedGeoObject.findByRef(
							"usedTrack.trackId",
							t._id,
							{},
							{},
							session
						);
						for (let cugo of tempCustomerUsedGeoObject) {
							_.remove(cugo.usedTrack, (o) => o.trackId == t._id);
							this.result = await CustomerUsedGeoObject.findByIdAndUpdate(
								cugo._id,
								{ usedTrack },
								{ session }
							);
							checkForWriteErrors(
								this.result,
								"none",
								"Company delete failed"
							);
						}
					}

					this.result = await Subscription.deleteByRef(
						"companyId",
						id,
						session
					);
					checkForWriteErrors(
						this.result,
						"none",
						"Company delete failed"
					);
					this.result = await CustomerRequest.deleteByRef(
						"companyId",
						id,
						session
					);
					checkForWriteErrors(
						this.result,
						"none",
						"Company delete failed"
					);
					this.result = await Work.deleteByRef(
						"companyId",
						id,
						session
					);
					checkForWriteErrors(
						this.result,
						"none",
						"Company delete failed"
					);

					this.result = await Vehicle.deleteByRef(
						"companyId",
						id,
						session
					);
					checkForWriteErrors(
						this.result,
						"none",
						"Company delete failed"
					);
					this.result = await Track.deleteByRef(
						"companyId",
						id,
						session
					);
					checkForWriteErrors(
						this.result,
						"none",
						"Company delete failed"
					);
					this.result = await Zone.deleteByRef(
						"companyId",
						id,
						session
					);
					checkForWriteErrors(
						this.result,
						"none",
						"Company delete failed"
					);
					this.result = await WasteList.deleteByRef(
						"companyId",
						id,
						session
					);
					checkForWriteErrors(
						this.result,
						"none",
						"Company delete failed"
					);

					this.result = await StaffLogin.deleteByRef(
						"companyId",
						id,
						session
					);
					checkForWriteErrors(
						this.result,
						"none",
						"Company delete failed"
					);
					this.result = await StaffDetail.deleteByRef(
						"companyId",
						id,
						session
					);
					checkForWriteErrors(
						this.result,
						"none",
						"Company delete failed"
					);
					this.result = await StaffGroup.deleteByRef(
						"companyId",
						id,
						session
					);
					checkForWriteErrors(
						this.result,
						"none",
						"Company delete failed"
					);

					this.result = await CompanyDetail.deleteByRef(
						"companyId",
						id,
						session
					);
					checkForWriteErrors(
						this.result,
						"none",
						"Company delete failed"
					);
					this.result = await CompanyServiceDetail.deleteByRef(
						"companyId",
						id,
						session
					);
					checkForWriteErrors(
						this.result,
						"none",
						"Company delete failed"
					);
					this.result = await CompanyLogin.findByIdAndDelete(id, {
						session,
					});
					checkForWriteErrors(
						this.result,
						"none",
						"Company delete failed"
					);
				}
			);

			return checkTransactionResults(
				this.transactionResults,
				"status",
				"Company delete transaction failed"
			);
		} catch (e) {
			throw ApiError.serverError(
				"Company delete transaction abort due to error: " + e.message
			);
		} finally {
			session.endSession();
		}
	}
}

exports.CompanyServices = CompanyServices;
