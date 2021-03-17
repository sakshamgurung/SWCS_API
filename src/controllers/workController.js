const {WorkServices} = require("../service/workServices");
const ApiError = require('../error/ApiError');

class WorkController{
    async createNewWork(request, response, next){
        try {
            const { body } = request;
            
            const workServices = new WorkServices();
            const result = await  workServices.createNewWork(body);
            
            response.json(result);
        } catch (error) {
            throw ApiError.serverError("Work Error: " + error.message);
        }
    }

    async getAllWork(request, response, next){
        try{
            const {role, id} = request.params;

            const workServices = new WorkServices();
            const result = await workServices.getAllWork(role, id);

            response.json(result);
        }catch(error){
            throw ApiError.serverError("Work Error: " + error.message);
        }
    }

    async getWorkById(request, response, next){
        try{
            const workId = request.params.id;

            const workServices = new WorkServices();
            const result = await workServices.getWorkById(workId);

            response.json(result);
        }catch(error){
            throw ApiError.serverError("Work Error: " + error.message);
        }
    }

    async updateWorkById(request, response, next){
        try{
            const workId = request.params.id;
            const {body} = request;

            const workServices = new WorkServices();
            const result = await workServices.updateWorkById(workId, body);

            response.json(result);
        }catch(error){
            throw ApiError.serverError("Work Error: " + error.message);
        }
    }

    async deleteWorkById(request, response, next){
        try {
            const workId = request.params.id;
            const {body} = request;
            
            const workServices = new WorkServices();
            const {statusCode, status} = await workServices.deleteWorkById(workId, body);

            response.status(statusCode).send(status);
        } catch (error) {
            throw ApiError.serverError("Work Error: " + error.message);
        }
    }
}

exports.WorkController = WorkController;