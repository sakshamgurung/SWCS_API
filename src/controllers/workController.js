const {WorkServices} = require("../service/workServices");

class WorkController{
    async createNewWork(request, response, next){
        try {
            const companyId = request.params.id;
            const { body } = request;
            body = {companyId, ...body};
            
            const workServices = new WorkServices();
            const result = workServices.createNewWork(body);
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getAllWork(request, response, next){
        try{
            const role = request.params.role;
            const { id, idArray } = request.body;

            const workServices = new WorkServices();
            const result = await workServices.getAllWork(role, id, idArray);
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getWorkById(request, response, next){
        try{
            const id = request.params.id;

            const workServices = new WorkServices();
            const result = await workServices.getWorkById(id);
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async updateWorkById(request, response, next){
        try{
            const id = request.params.id;
            const updateData = request.body;

            const workServices = new WorkServices();
            const result = await workServices.updateWorkById(id, updateData);
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async deleteWorkById(request, response, next){
        try {
            const id = request.params.id;

            const workServices = new WorkServices();
            const result = await workServices.deleteWorkById(id);
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }
}

exports.WorkController = WorkController;