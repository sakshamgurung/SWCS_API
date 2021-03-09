const {WorkServices} = require("../service/workServices");

class WorkController{
    async createNewWork(request, response, next){
        try {
            const { body } = request;
            
            const workServices = new WorkServices();
            const result = await  workServices.createNewWork(body);
            
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getAllWork(request, response, next){
        try{
            const {role, id} = request.params;

            const workServices = new WorkServices();
            const result = await workServices.getAllWork(role, id);

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getWorkById(request, response, next){
        try{
            const workId = request.params.id;

            const workServices = new WorkServices();
            const result = await workServices.getWorkById(workId);

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
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
            console.error(error.message);
            response.json({error:500});
        }
    }

    async deleteWorkById(request, response, next){
        try {
            const workId = request.params.id;
            const {body} = request;
            
            const workServices = new WorkServices();
            const result = await workServices.deleteWorkById(workId, body);

            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }
}

exports.WorkController = WorkController;