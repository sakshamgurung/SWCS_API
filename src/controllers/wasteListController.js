const {WasteListServices} = require("../service/wasteListServices");
const ApiError = require('../error/ApiError');

class WasteListController{
    async createNewWasteList(request, response, next){
        try {
            const { body } = request;

            const wasteListServices = new WasteListServices();
            const result =  await wasteListServices.createNewWasteList(body);

            response.json(result);
        } catch (error) {
            throw ApiError.serverError("Waste list Error: " + error.message);
        }
    }

    async getAllWasteList(request, response, next){
        try{
            const companyId = request.params.id;
            const {query} = request;

            const wasteListServices = new WasteListServices();
            const result = await wasteListServices.getAllWasteList(companyId, query);

            response.json(result);
        }catch(error){
            throw ApiError.serverError("Waste list Error: " + error.message);
        }
    }

    async getWasteListById(request, response, next){
        try{
            const wasteListId = request.params.id;

            const wasteListServices = new WasteListServices();
            const result = await wasteListServices.getWasteListById(wasteListId);

            response.json(result);
        }catch(error){
            throw ApiError.serverError("Waste list Error: " + error.message);
        }
    }

    async getWasteListByRef(request, response, next){
        try {
            const {ref, id} = request.params;
            const {query} = request;

            const wasteListServices = new WasteListServices();
            const result = await wasteListServices.getWasteListByRef(ref, id, query);
            
            response.json(result);
        } catch (error) {
            throw ApiError.serverError("Waste list by ref Error: " + error.message);
        }
    }

    async updateWasteListById(request, response, next){
        try{
            const wasteListId = request.params.id;
            const {body} = request;

            const wasteListServices = new WasteListServices();
            const {statusCode, status} = await wasteListServices.updateWasteListById(wasteListId, body);

            response.status(statusCode).send(status);
        }catch(error){
            throw ApiError.serverError("Waste list Error: " + error.message);
        }
    }

    async deleteWasteListById(request, response, next){
        try {
            const wasteListId = request.params.id;

            const wasteListServices = new WasteListServices();
            const {statusCode, status} = await wasteListServices.deleteWasteListById(wasteListId);
            
            response.status(statusCode).send(status);
        } catch (error) {
            throw ApiError.serverError("Waste list Error: " + error.message);
        }
    }
}

exports.WasteListController = WasteListController;