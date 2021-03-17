const mongoose = require('mongoose');
const ApiError = require('../error/ApiError');

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

    async getAllVehicle(companyId){
        this.result = await Vehicle.findAllVehicle(companyId);
        return this.result;
    }

    async getVehicleById(id){
        this.result = await Vehicle.findVehicleById(id);
        return this.result;
    }

    async updateVehicleById(id, updateData){
        this.result = await Vehicle.updateVehicleById(id, updateData);
                
        if(!this.result.hasOwnProperty("writeErrors")){
            return this.result;
        }else{
            throw ApiError.serverError("Vehicle update failed");
        }
    }

    async deleteVehicleById(id, updateData){
        const session = await mongoose.startSession();
        try{
            this.transactionResults = await session.withTransaction(async() => {
                //removing delete vehicle from work collection's vehicleId
                await Work.updateWorkByRef("vehicleId", id, { vehicleId:"" } ,session)

                //removing delete vehicle from customerRequest collection's vehicleId
                await CustomerRequest.updateCustomerRequestByRef("vehicleId", id, { vehicleId: "" }, session);
                
                await Vehicle.deleteVehicleById(id, session);
            });

            if(this.transactionResults){
                return {statusCode:"200", status:"Success"}
            }else{
                throw ApiError.serverError("Vehicle transaction failed");
            }

        }catch(e){
            throw ApiError.serverError("Vehicle delete transaction abort due to error: " + e.message);
        }finally{
            session.endSession();
        }
    }
}

exports.VehicleServices = VehicleServices;
