const {WasteCatalogServices} = require("../service/wasteCatalogServices");

class WasteCatalogController{
    async createNewWasteCatalog(request, response, next){
        try {
            const { body } = request;
            
            const wasteCatalogServices = new WasteCatalogServices();
            const result =  await wasteCatalogServices.createNewWasteCatalog(body);

            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getAllWasteCatalog(request, response, next){
        try{
            const wasteCatalogServices = new WasteCatalogServices();
            const result = await wasteCatalogServices.getAllWasteCatalog();

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getWasteCatalogById(request, response, next){
        try{
            const id = request.params.id;
            
            const wasteCatalogServices = new WasteCatalogServices();
            const result = await wasteCatalogServices.getWasteCatalogById(id);

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async updateWasteCatalogById(request, response, next){
        try{
            const id = request.params.id;
            const updateData = request.body;

            const wasteCatalogServices = new WasteCatalogServices();
            const result = await wasteCatalogServices.updateWasteCatalogById(id, updateData);

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async deleteWasteCatalogById(request, response, next){
        try {
            const id = request.params.id;
            const {body} = request;

            const wasteCatalogServices = new WasteCatalogServices();
            const result = await wasteCatalogServices.deleteWasteCatalogById(id, body);

            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }
}

exports.WasteCatalogController = WasteCatalogController;