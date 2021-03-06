const mongoose = require("mongoose");
const ApiError = require("../error/ApiError");
const { checkTransactionResults, checkForWriteErrors } = require("../utilities/errorUtil");
const Subscription = require("../models/common/subscription");
const Staff = require("../models/staff/staffLogin");
const Vehicle = require("../models/companies/vehicle");
const Work = require("../models/common/work");
const CustomerRequest = require("../models/common/customerRequest");
const GraphData = require("../models/graph/graphData");
const _ = require("lodash");
class VehicleServices {
	constructor() {
		this.vehicle = undefined;
		this.result = undefined;
		this.transactionResults = undefined;
	}

	async createNewVehicle(vehicleData) {
		this.result = {};
		this.vehicle = new Vehicle(vehicleData);
		this.result.vehicle = await this.vehicle.save();

		// logs
		const totalVehicle = await Vehicle.find({ companyId: vehicleData.companyId }).count();
		const totalStaff = await Staff.find({ companyId: vehicleData.companyId }).count();
		const subs = await Subscription.find({ companyId: vehicleData.companyId }).count();

		this.graph = new GraphData({ companyId: vehicleData.companyId, subscribers: subs, staff: totalStaff, vehicle: totalVehicle });

		this.result.logResult = await this.graph.save();

		return this.result;
	}

	async getAllVehicle(companyId, query) {
		this.result = await Vehicle.find({ $and: [{ companyId }, query] });
		return this.result;
	}

	async getVehicleById(id) {
		this.result = await Vehicle.findById(id);
		return this.result;
	}

	async getVehicleByRef(ref, id, query) {
		this.result = await Vehicle.findByRef(ref, id, query);
		return this.result;
	}

	async updateVehicleById(id, updateData) {
		if (updateData.hasOwnProperty("isReserved")) {
			throw ApiError.badRequest("isReserved can't be modified from here");
		}
		this.result = await Vehicle.findByIdAndUpdate(id, updateData);
		return checkForWriteErrors(this.result, "status", "Vehicle update failed");
	}

	async deleteVehicleById(id, updateData) {
		const session = await mongoose.startSession();
		try {
			console.log("Vehicle data delete");
			this.transactionResults = await session.withTransaction(async () => {
				//removing delete vehicle from work collection's vehicleId
				this.result = await Work.updateByRef("vehicleId", id, { $unset: { vehicleId: 1 } }, session);
				checkForWriteErrors(this.result, "none", "Vehicle delete failed");

				//removing delete vehicle from customerRequest collection's vehicleId
				this.result = await CustomerRequest.updateByRef("vehicleId", id, { $unset: { vehicleId: 1 } }, session);
				checkForWriteErrors(this.result, "none", "Vehicle delete failed");

				// update graph data
				const companyId = await Vehicle.findById(id);
				const totVehicle = await Vehicle.find({ companyId: companyId.companyId });
				const toSubs = await Subscription.find({ companyId: companyId.companyId });
				const toStaff = await Staff.find({ companyId: companyId.companyId });
				this.graph = new GraphData({
					companyId: companyId.companyId,
					subscribers: toSubs.length,
					staff: toStaff.length,
					vehicle: totVehicle.length - 1,
				});
				await this.graph.save();

				this.result = await Vehicle.findByIdAndDelete(id, { session });
				checkForWriteErrors(this.result, "none", "Vehicle delete failed");
			});

			return checkTransactionResults(this.transactionResults, "status", "Vehicle transaction failed");
		} catch (e) {
			throw ApiError.serverError("Vehicle delete transaction abort due to error: " + e.message);
		} finally {
			session.endSession();
		}
	}
}

exports.VehicleServices = VehicleServices;
