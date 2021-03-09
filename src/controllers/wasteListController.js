const {WasteListServices} = require("../service/wasteListServices");

class WasteListController{
    async createNewWasteList(request, response, next){
        try {
            const { body } = request;

            const wasteListServices = new WasteListServices();
            const result =  await wasteListServices.createNewWasteList(body);

            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getAllWasteList(request, response, next){
        try{
            const companyId = request.params.id;

            const wasteListServices = new WasteListServices();
            const result = await wasteListServices.getAllWasteList(companyId);

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getWasteListById(request, response, next){
        try{
            const wasteListId = request.params.id;

            const wasteListServices = new WasteListServices();
            const result = await wasteListServices.getWasteListById(wasteListId);

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async updateWasteListById(request, response, next){
        try{
            const wasteListId = request.params.id;
            const {body} = request;

            const wasteListServices = new WasteListServices();
            const result = await wasteListServices.updateWasteListById(wasteListId, body);

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async deleteWasteListById(request, response, next){
        try {
            const wasteListId = request.params.id;

            const wasteListServices = new WasteListServices();
            const result = await wasteListServices.deleteWasteListById(wasteListId);
            
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }
}

exports.WasteListController = WasteListController;