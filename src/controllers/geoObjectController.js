const {GeoObjectServices} = require('../service/geoObjectServices');

class GeoObjectController{
    async createNewGeoObject(request, response, next){
        try {
            const geoObjectType = request.params.type;
            const {body} = request;
            
            const geoObjectServices = new GeoObjectServices();
            const result = await geoObjectServices.createNewGeoObject(geoObjectType, body);

            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getAllGeoObject(request, response, next){
        try{
            const geoObjectType = request.params.type;
            const companyId = request.params.id;
            
            const geoObjectServices = new GeoObjectServices();
            const result = await geoObjectServices.getAllGeoObject(geoObjectType, companyId);

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getGeoObjectById(request, response, next){
        try{
            const geoObjectType = request.params.type;
            const geoObjectId = request.params.id;
            
            const geoObjectServices = new GeoObjectServices();
            const result = await geoObjectServices.getGeoOjectById(geoObjectType, geoObjectId);

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async updateGeoObjectById(request, response, next){
        try{
            const geoObjectType = request.params.type;
            const geoObjectId = request.params.id;
            const {body} = request;

            const geoObjectServices = new GeoObjectServices();
            const result = await geoObjectServices.updateGeoObjectById(geoObjectType, geoObjectId, body);
            
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async deleteGeoObjectById(request, response, next){
        try {
            const geoObjectType = request.params.type;
            const geoObjectId = request.params.id;
            
            const geoObjectServices = new GeoObjectServices();
            const result = await geoObjectServices.deleteGeoObjectById(geoObjectType, geoObjectId);
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }
}

exports.GeoObjectController = GeoObjectController;