const {VehicleServices} = require("../service/vehicleServices");
const ApiError = require('../error/ApiError');

class VehicleController{
    async createNewVehicle(request, response, next){
        try {
            const { body } = request;

            const vehicleServices = new VehicleServices();
            const result =  await vehicleServices.createNewVehicle(body);

            response.json(result);
        } catch (error) {
            throw ApiError.serverError("Vehicle Error: " + error.message);
        }
    }

    async getAllVehicle(request, response, next){
        try{
            const companyId = request.params.id;

            const vehicleServices = new VehicleServices();
            const result = await vehicleServices.getAllVehicle(companyId);

            response.json(result);
        }catch(error){
            throw ApiError.serverError("Vehicle Error: " + error.message);
        }
    }

    async getVehicleById(request, response, next){
        try{
            const vehicleId = request.params.id;

            const vehicleServices = new VehicleServices();
            const result = await vehicleServices.getVehicleById(vehicleId);

            response.json(result);
        }catch(error){
            throw ApiError.serverError("Vehicle Error: " + error.message);
        }
    }

    async updateVehicleById(request, response, next){
        try{
            const vehicleId = request.params.id;
            const {body} = request;

            const vehicleServices = new VehicleServices();
            const result = await vehicleServices.updateVehicleById(vehicleId, body);

            response.json(result);
        }catch(error){
            throw ApiError.serverError("Vehicle Error: " + error.message);
        }
    }

    async deleteVehicleById(request, response, next){
        try {
            const vehicleId = request.params.id;

            const vehicleServices = new VehicleServices();
            const {statusCode, status} = await vehicleServices.deleteVehicleById(vehicleId);
            
            response.status(statusCode).send(status);
        } catch (error) {
            throw ApiError.serverError("Vehicle Error: " + error.message);
        }
    }
}

exports.VehicleController = VehicleController;