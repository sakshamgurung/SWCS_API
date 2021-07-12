const _ = require("lodash");
const mongoose = require("mongoose");
const ApiError = require("../error/ApiError");

const { checkTransactionResults } = require("../utilities/errorUtil");

const CompanyLogin = require("../models/companies/companyLogin");
const CompanyDetail = require("../models/companies/companyDetail");
const CompanyServiceDetail = require("../models/companies/companyServiceDetail");
const WasteList = require("../models/companies/wasteList");
const Vehicle = require("../models/companies/vehicle");
const Zone = require("../models/companies/geoObjectZone");
const Track = require("../models/companies/geoObjectTrack");
const StaffLogin = require("../models/staff/staffLogin");
const StaffDetail = require("../models/staff/staffDetail");
const StaffGroup = require("../models/staff/staffGroup");
const Graph = require("../models/graph/graphData");

const Work = require("../models/common/work");
const CustomerRequest = require("../models/common/customerRequest");
const Notification = require("../models/common/notification");
const Subscription = require("../models/common/subscription");

const CustomerLogin = require("../models/customers/customerLogin");
const CustomerDetail = require("../models/customers/customerDetail");
const WasteDump = require("../models/customers/wasteDump");
const CustomerUsedGeoObject = require("../models/customers/customerUsedGeoObject");
const Schedule = require("../models/customers/schedule");

class TestServices {
	constructor() {
		this.result = undefined;
		this.transactionResults = undefined;
	}

	async cleanTestEntries(testData) {
		const session = await mongoose.startSession();
		try {
			this.transactionResults = await session.withTransaction(async () => {
				const { companyIds, customerIds } = testData;
				for (let companyId of companyIds) {
					await CompanyDetail.deleteOne({ companyId }, { session });
					await CompanyServiceDetail.deleteOne({ companyId }, { session });
					await WasteList.deleteMany({ companyId }, { session });
					await Vehicle.deleteMany({ companyId }, { session });
					await Zone.deleteMany({ companyId }, { session });
					await Track.deleteMany({ companyId }, { session });
					await Graph.deleteMany({ companyId }, { session });

					const staffs = await StaffLogin.find({ companyId }, {}, { session });
					await Notification.bulkWrite(
						staffs.map((doc) => ({
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

					await StaffDetail.deleteMany({ companyId }, { session });
					await StaffGroup.deleteMany({ companyId }, { session });
					await Work.deleteMany({ companyId }, { session });
					await CustomerRequest.deleteMany({ companyId }, { session });
					await WasteDump.deleteMany({ companyId }, { session });
					await Subscription.deleteMany({ companyId }, { session });
					await Notification.deleteMany(
						{
							$or: [
								{ "from.role": "company", "from.id": companyId },
								{ "to.role": "company", "to.id": companyId },
							],
						},
						{ session }
					);
					await StaffLogin.deleteMany({ companyId }, { session });
					await CompanyLogin.findByIdAndDelete(companyId, { session });
				}

				for (let customerId of customerIds) {
					await CustomerDetail.deleteOne({ customerId }, { session });
					await CustomerUsedGeoObject.deleteMany({ customerId }, { session });
					await CustomerRequest.deleteMany({ customerId }, { session });
					await Schedule.deleteMany({ customerId }, { session });
					await WasteDump.deleteMany({ customerId }, { session });
					await Subscription.deleteMany({ customerId }, { session });
					await Notification.deleteMany(
						{
							$or: [
								{ "from.role": "customer", "from.id": customerId },
								{ "to.role": "customer", "to.id": customerId },
							],
						},
						{ session }
					);
					await CustomerLogin.findByIdAndDelete(customerId, { session });
				}
			});

			return checkTransactionResults(this.transactionResults, "status", "CleanTestEntries transaction failed");
		} catch (e) {
			throw ApiError.serverError("CleanTestEntries transaction abort due to error: " + e.message);
		} finally {
			session.endSession();
		}
	}
}

exports.TestServices = TestServices;
