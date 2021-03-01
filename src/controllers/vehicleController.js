const {VehicleServices} = require("../service/vehicleServices");

class VehicleController{
    async createNewVehicle(request, response, next){
        try {
            const companyId = request.params.id;
            const { body } = request;
            body = {companyId, ...body};

            const vehicleServices = new VehicleServices();
            const result = vehicleServices.createNewVehicle(body);
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getAllVehicle(request, response, next){
        try{
            const companyId = request.params.id;

            const vehicleServices = new VehicleServices();
            const result = await vehicleServices.getAllVehicle(companyId);
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getVehicleById(request, response, next){
        try{
            const id = request.params.id;

            const vehicleServices = new VehicleServices();
            const result = await vehicleServices.getVehicleById(id);
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async updateVehicleById(request, response, next){
        try{
            const id = request.params.id;
            const updateData = request.body;

            const vehicleServices = new VehicleServices();
            const result = await vehicleServices.updateVehicleById(id, updateData);
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async deleteVehicleById(request, response, next){
        try {
            const id = request.params.id;
            const vehicleServices = new VehicleServices();
            const result = await vehicleServices.deleteVehicleById(id);
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }
}

exports.VehicleController = VehicleController;