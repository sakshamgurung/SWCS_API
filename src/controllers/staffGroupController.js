const {StaffGroupServices} = require("../service/staffGroupServices");

class StaffGroupController{
    async createNewStaffGroup(request, response, next){
        try {
            const companyId = request.params.id;
            const { body } = request;
            body = {companyId, ...body};
            
            const staffGroupServices = new StaffGroupServices();
            const result = staffGroupServices.createNewStaffGroup(body);
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getAllStaffGroup(request, response, next){
        try{
            const companyId = request.params.id;

            const staffGroupServices = new StaffGroupServices();
            const result = await staffGroupServices.getAllStaffGroup(companyId);
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getStaffGroupById(request, response, next){
        try{
            const id = request.params.id;

            const staffGroupServices = new StaffGroupServices();
            const result = await staffGroupServices.getStaffGroupById(id);
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async updateStaffGroupById(request, response, next){
        try{
            const id = request.params.id;
            const updateData = request.body;

            const staffGroupServices = new StaffGroupServices();
            const result = await staffGroupServices.updateStaffGroupById(id, updateData);
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async deleteStaffGroupById(request, response, next){
        try {
            const id = request.params.id;

            const staffGroupServices = new StaffGroupServices();
            const result = await staffGroupServices.deleteStaffGroupById(id);
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }
}

exports.StaffGroupController = StaffGroupController;