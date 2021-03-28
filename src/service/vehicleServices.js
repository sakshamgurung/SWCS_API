const mongoose = require('mongoose');
const ApiError = require('../error/ApiError');
const {checkTransactionResults, checkForWriteErrors} = require('../utilities/errorUtil');

const Vehicle = require('../models/companies/vehicle');
const Work = require('../models/common/work');
const CustomerRequest = require('../models/common/customerRequest');

class VehicleServices{

    constructor(){
        this.vehicle = undefined;
        this.result = undefined;
        this.transactionResults = undefined;
    }
    
    async createNewVehicle(vehicleData){
        this.vehicle = new Vehicle(vehicleData);
        this.result = await this.vehicle.save();
        return this.result;
    }

    async getAllVehicle(companyId, query){
        this.result = await Vehicle.find({$and:[{companyId}, query]});
        return this.result;
    }

    async getVehicleById(id){
        this.result = await Vehicle.findById(id);
        return this.result;
    }

    async getVehicleByRef(ref, id, query){
        this.result = await Vehicle.findByRef(ref, id, query);
        return this.result;
    }

    async updateVehicleById(id, updateData){
        if(updateData.hasOwnProperty("isReserved")){
            throw ApiError.badRequest("isReserved can't be modified from here");
        }
        this.result = await Vehicle.findByIdAndUpdate(id, updateData);
        return checkForWriteErrors(this.result, "status", "Vehicle update failed");
    }
    
    async deleteVehicleById(id, updateData){
        const session = await mongoose.startSession();
        try{
            this.transactionResults = await session.withTransaction(async() => {
                //removing delete vehicle from work collection's vehicleId
                this.result = await Work.updateByRef("vehicleId", id, { vehicleId:"" } ,session)
                checkForWriteErrors(this.result, "none", "Vehicle delete failed");
                
                //removing delete vehicle from customerRequest collection's vehicleId
                this.result = await CustomerRequest.updateByRef("vehicleId", id, { vehicleId: "" }, session);
                checkForWriteErrors(this.result, "none", "Vehicle delete failed");
                
                this.result = await Vehicle.findByIdAndDelete(id, {session});
                checkForWriteErrors(this.result, "none", "Vehicle delete failed");
            });

            return checkTransactionResults(this.transactionResults, "status", "Vehicle transaction failed");

        }catch(e){
            throw ApiError.serverError("Vehicle delete transaction abort due to error: " + e.message);
        }finally{
            session.endSession();
        }
    }
}

exports.VehicleServices = VehicleServices;
