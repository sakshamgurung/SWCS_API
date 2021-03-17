const {GeoObjectServices} = require('../service/geoObjectServices');
const ApiError = require('../error/ApiError');

class GeoObjectController{
    async createNewGeoObject(request, response, next){
        try {
            const geoObjectType = request.params.type;
            const {body} = request;
            
            const geoObjectServices = new GeoObjectServices();
            const result = await geoObjectServices.createNewGeoObject(geoObjectType, body);

            response.json(result);
        } catch (error) {
            throw ApiError.serverError("Geo object Error: " + error.message);
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
            throw ApiError.serverError("Geo object Error: " + error.message);
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
            throw ApiError.serverError("Geo object Error: " + error.message);
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
            throw ApiError.serverError("Geo object Error: " + error.message);
        }
    }

    async deleteGeoObjectById(request, response, next){
        try {
            const geoObjectType = request.params.type;
            const geoObjectId = request.params.id;
            
            const geoObjectServices = new GeoObjectServices();
            const {statusCode, status} = await geoObjectServices.deleteGeoObjectById(geoObjectType, geoObjectId);
            
            response.status(statusCode).send(status);
        } catch (error) {
            throw ApiError.serverError("Geo object Error: " + error.message);
        }
    }
}

exports.GeoObjectController = GeoObjectController;