const {WasteDumpServices} = require("../service/wasteDumpServices");

class WasteDumpController{
    async createNewWasteDump(request, response, next){
        try {
            const { body } = request;
            
            const wasteDumpServices = new WasteDumpServices();
            const result =  await wasteDumpServices.createNewWasteDump(body);

            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getAllWasteDump(request, response, next){
        try{
            const {ref, id} = request.params;

            const wasteDumpServices = new WasteDumpServices();
            const result = await wasteDumpServices.getAllWasteDump(ref, id);

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getWasteDumpById(request, response, next){
        try{
            const wasteDumpId = request.params.id;

            const wasteDumpServices = new WasteDumpServices();
            const result = await wasteDumpServices.getWasteDumpById(wasteDumpId);

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async updateWasteDumpById(request, response, next){
        try{
            const wasteDumpId = request.params.id;
            const {body} = request;

            const wasteDumpServices = new WasteDumpServices();
            const result = await wasteDumpServices.updateWasteDumpById(wasteDumpId, body);

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async deleteWasteDumpById(request, response, next){
        try {
            const wasteDumpId = request.params.id;
            const {body} = request;

            const wasteDumpServices = new WasteDumpServices();
            const result = await wasteDumpServices.deleteWasteDumpById(wasteDumpId, body);
            
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }
}

exports.WasteDumpController = WasteDumpController;