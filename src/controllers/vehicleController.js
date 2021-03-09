const {VehicleServices} = require("../service/vehicleServices");

class VehicleController{
    async createNewVehicle(request, response, next){
        try {
            const { body } = request;

            const vehicleServices = new VehicleServices();
            const result =  await vehicleServices.createNewVehicle(body);

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
            const vehicleId = request.params.id;

            const vehicleServices = new VehicleServices();
            const result = await vehicleServices.getVehicleById(vehicleId);

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
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
            console.error(error.message);
            response.json({error:500});
        }
    }

    async deleteVehicleById(request, response, next){
        try {
            const vehicleId = request.params.id;

            const vehicleServices = new VehicleServices();
            const result = await vehicleServices.deleteVehicleById(vehicleId);
            
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }
}

exports.VehicleController = VehicleController;