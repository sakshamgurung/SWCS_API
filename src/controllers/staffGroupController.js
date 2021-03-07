const {StaffGroupServices} = require("../service/staffGroupServices");

class StaffGroupController{
    async createNewStaffGroup(request, response, next){
        try {
            const { body } = request;
            
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
            const staffGroupId = request.params.id;

            const staffGroupServices = new StaffGroupServices();
            const result = await staffGroupServices.getStaffGroupById(staffGroupId);

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async updateStaffGroupById(request, response, next){
        try{
            const staffGroupId = request.params.id;
            const {body} = request.body;

            const staffGroupServices = new StaffGroupServices();
            const result = await staffGroupServices.updateStaffGroupById(staffGroupId, body);

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async deleteStaffGroupById(request, response, next){
        try {
            const staffGroupId = request.params.id;

            const staffGroupServices = new StaffGroupServices();
            const result = await staffGroupServices.deleteStaffGroupById(staffGroupId);
            
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }
}

exports.StaffGroupController = StaffGroupController;