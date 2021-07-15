const mongoose = require("mongoose");
const ApiError = require("../error/ApiError");
const fs = require("fs");
const { checkTransactionResults, checkForWriteErrors } = require("../utilities/errorUtil");
const { mongooseToPlainObjectArray } = require("../utilities/converter");

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
			this.transactionResults = await session.withTransaction(async () => {
				this.result = {};
				const { companyId } = companyDetail;

				this.companyDetail = new CompanyDetail(companyDetail);
				this.result.companyDetail = await this.companyDetail.save({
					session,
				});

				this.companyServiceDetail = new CompanyServiceDetail(companyServiceDetail);
				this.result.companyServiceDetail = await this.companyServiceDetail.save({ session });

				let result = await CompanyLogin.findByIdAndUpdate(companyId, { firstTimeLogin: false }, { session });
				checkForWriteErrors(result, "none", "New company info failed");
			});

			if (this.transactionResults) {
				return this.result;
			} else {
				throw ApiError.serverError("New company info transaction failed");
			}
		} catch (e) {
			throw ApiError.serverError("New company info transaction abort due to error: " + e.message);
		} finally {
			session.endSession();
		}
	}

	async getGraphData(companyId) {
		this.result = await GraphData.find({ companyId: companyId });
		return this.result;
	}

	async getAllCompany(companyInfoType, query) {
		if (companyInfoType == "company") {
			this.result = await CompanyLogin.find(
				{
					$and: [{}, query],
				},
				"-password -token -uuid"
			);

			this.result = mongooseToPlainObjectArray(this.result);

			for (let co of this.result) {
				const companyDetail = await CompanyDetail.find({ companyId: co._id });
				co.companyDetail = companyDetail[0];
			}

			return this.result;
		} else if (companyInfoType == "company-detail") {
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
			this.result = await CompanyDetail.find({ companyId: id }).populate("companyId", "email mobileNo");
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
			this.result = await CompanyDetail.findByRef(ref, id, query).populate("companyId", "email mobileNo");
		} else if (companyInfoType == "company-service-detail") {
			this.result = await CompanyServiceDetail.findByRef(ref, id, query).populate("companyId", "email mobileNo");
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
			this.result = await CompanyServiceDetail.findByIdAndUpdate(id, updateData);
		} else {
			throw ApiError.badRequest("companyInfoType not found!!!");
		}
		return checkForWriteErrors(this.result, "status", "Company update failed");
	}

	async uploadCompanyProfileImage(img, id, imgtype) {
		if (imgtype === "profileimage") {
			const cmpusrdetails = await CompanyDetail.find({ companyId: id });
			if (cmpusrdetails.length <= 0) {
				throw ApiError.badRequest("No company exist!!!");
			} else {
				//  remove prev image of this name
				const prevImage = cmpusrdetails[0].companyImage;
				console.log(" Prev Company image : ", prevImage);
				const updateProfileImage = await CompanyDetail.updateOne({ companyId: id }, { companyImage: "assets/images/" + img.filename });
				const updatedImageData = await CompanyDetail.find({ companyId: id });
				console.log(" updated profile image : ", updatedImageData);
				if (updateProfileImage.length != 0 && prevImage && prevImage.length != 0) {
					await fs.unlink(prevImage, (err) => {
						if (err) throw ApiError.badRequest("Old profile iamge is not cleared!!!" + err.maessage);
						console.log("old image remove success : ", err);
					});
					this.result = updatedImageData;
				}
			}
		}

		return this.result;
	}

	async deleteCompanyById(id, updateData) {
		const session = await mongoose.startSession();
		try {
			this.transactionResults = await session.withTransaction(async () => {
				//deleting uncollected waste dump of company
				const tempWasteDump = await WasteDump.findByRef("companyId", id, {}, {}, session);
				const archiveWasteDump = _.remove(tempWasteDump, (o) => o.isCollected == true);
				const opWD = tempWasteDump.map((doc) => ({
					deleteOne: {
						filter: { _id: doc._id },
					},
				}));

				const opAWD = archiveWasteDump.map((doc) => ({
					updateOne: {
						filter: { _id: doc._id },
						update: { customerId: "", companyId: "" },
					},
				}));
				const wasteDumpBulkOps = _.cloneDeep([...opWD, ...opAWD]);
				await WasteDump.bulkWrite(wasteDumpBulkOps, { session });

				//deleting notification
				await Subscription.bulkWrite(
					[
						{
							deleteMany: {
								filter: {
									$or: [
										{ "from.role": "company", "from.id": id },
										{ "to.role": "company", "to.id": id },
									],
								},
							},
						},
					],
					{ session }
				);

				const tempStaffLogin = await StaffLogin.findByRef("companyId", id, {}, { _id: 1 }, session);
				await Notification.bulkWrite(
					tempStaffLogin.map((doc) => ({
						deleteMany: {
							filter: {
								$or: [
									{ "from.role": "staff", "from.id": doc._id },
									{ "to.role": "staff", "to.id": doc._id },
								],
							},
						},
					})),
					{ session }
				);

				//deleting schedule
				const tempWork = await Work.findByRef("companyId", id, {}, { _id: 1 }, session);
				await Schedule.bulkWrite(
					tempWork.map((doc) => ({
						deleteOne: {
							filter: {
								$or: [{ workId: doc._id }],
							},
						},
					})),
					{ session }
				);

				const tempCustomerRequest = await CustomerRequest.findByRef("companyId", id, {}, { _id }, session);
				await Schedule.bulkWrite(
					tempCustomerRequest.map((doc) => ({
						deleteOne: {
							filter: {
								$or: [{ customerRequestId: doc._id }],
							},
						},
					})),
					{ session }
				);

				//updating or deleting customer used geoObject
				const tempTrack = await Track.findByRef("companyId", id, {}, { _id: 1 }, session);
				for (let t of tempTrack) {
					const tempCustomerUsedGeoObject = await CustomerUsedGeoObject.findByRef("usedTrack.trackId", t._id, {}, {}, session);
					for (let cugo of tempCustomerUsedGeoObject) {
						_.remove(cugo.usedTrack, (o) => o.trackId == t._id);
						if (cugo.usedTrack.length == 0) {
							await CustomerUsedGeoObject.findByIdAndDelete(cugo._id, { session });
						} else {
							await CustomerUsedGeoObject.findByIdAndUpdate(cugo._id, { usedTrack: cugo.usedTrack }, { session });
						}
					}
				}

				await Subscription.deleteByRef("companyId", id, session);
				await CustomerRequest.deleteByRef("companyId", id, session);
				await Work.deleteByRef("companyId", id, session);

				await Vehicle.deleteByRef("companyId", id, session);
				await Track.deleteByRef("companyId", id, session);
				await Zone.deleteByRef("companyId", id, session);
				await WasteList.deleteByRef("companyId", id, session);

				await StaffLogin.deleteByRef("companyId", id, session);
				await StaffDetail.deleteByRef("companyId", id, session);
				await StaffGroup.deleteByRef("companyId", id, session);

				await CompanyDetail.deleteByRef("companyId", id, session);
				await CompanyServiceDetail.deleteByRef("companyId", id, session);
				await CompanyLogin.findByIdAndDelete(id, { session });
			});

			return checkTransactionResults(this.transactionResults, "status", "Company delete transaction failed");
		} catch (e) {
			throw ApiError.serverError("Company delete transaction abort due to error: " + e.message);
		} finally {
			session.endSession();
		}
	}
}

exports.CompanyServices = CompanyServices;
