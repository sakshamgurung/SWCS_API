const {WasteDumpServices} = require("../service/wasteDumpServices");

class WasteDumpController{
    async createNewWasteDump(request, response, next){
        try {
            const customerId = request.params.id;
            const { body } = request;
            body = {customerId, ...body};
            
            const wasteDumpServices = new WasteDumpServices();
            const result = wasteDumpServices.createNewWasteDump(body);
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getAllWasteDump(request, response, next){
        try{
            const {customerId, companyId} = request.body;

            const wasteDumpServices = new WasteDumpServices();
            const result = await wasteDumpServices.getAllWasteDump(customerId, companyId);
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getWasteDumpById(request, response, next){
        try{
            const id = request.params.id;

            const wasteDumpServices = new WasteDumpServices();
            const result = await wasteDumpServices.getWasteDumpById(id);
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async updateWasteDumpById(request, response, next){
        try{
            const id = request.params.id;
            const updateData = request.body;

            const wasteDumpServices = new WasteDumpServices();
            const result = await wasteDumpServices.updateWasteDumpById(id, updateData);
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async deleteWasteDumpById(request, response, next){
        try {
            const id = request.params.id;

            const wasteDumpServices = new WasteDumpServices();
            const result = await wasteDumpServices.deleteWasteDumpById(id);
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }
}

exports.WasteDumpController = WasteDumpController;