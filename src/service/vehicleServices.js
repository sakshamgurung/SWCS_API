const mongoose = require('mongoose');

const Vehicle = require('../models/companies/vehicle');
const Work = require('../models/common/work');
const CustomerRequest = require('../models/common/customerRequest');

class VehicleServices{

    constructor(){
        this.vehicle = undefined;
        this.result = undefined;
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
        return this.result;
    }

    async deleteVehicleById(id, updateData){
        const session = await mongoose.startSession();
        try{
            await session.withTransaction(async() => {
                this.result = {};
                
                //removing delete vehicle from work collection's vehicle_id
                this.result.work = await Work.updateWorkByRef("vehicle-id", id, { vehicleId:"" } ,session)

                //removing delete vehicle from customerRequest collection's vehicle_id
                this.result.customerRequest = await CustomerRequest.updateCustomerRequestByRef("vehicle-id", id, { vehicleId: "" }, session);
                
                this.result.vehicle = await Vehicle.deleteVehicleById(id, session);
            });
        }
        finally{
            session.endSession();
        }
        return this.result;
    }
}

exports.VehicleServices = VehicleServices;
