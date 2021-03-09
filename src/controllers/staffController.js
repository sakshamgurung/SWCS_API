const {StaffServices} = require("../service/staffServices");

class StaffController{
    async newStaffInfo(request, response, next){
        try {
            const { staffDetail } = request.body;
            
            const staffServices = new StaffServices();
            const result =  await staffServices.newStaffInfo(staffDetail);

            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500}); 
        }
    }

    async getAllStaff(request, response, next){
        try{
            const staffInfoType = request.params.type;
            const companyId = request.params.id;
            
            const staffServices = new StaffServices();
            const result = await staffServices.getAllStaff(staffInfoType, companyId);;

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async  getStaffById(request, response, next){
        try{
            const staffInfoType = request.params.type;
            const staffId = request.params.id;
            
            const staffServices = new StaffServices();
            const result = await staffServices.getStaffById(staffInfoType, staffId);;

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async updateStaffById(request, response, next){
        try{
            const staffInfoType = request.params.type;
            const staffId = request.params.id;
            const {body} = request;

            const staffServices = new StaffServices();
            const result = await staffServices.updateStaffById(staffInfoType, staffId, body);

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async deleteStaffById(request, response, next){
        try {
            const staffId = request.params.id;
            const {body} = request;

            const staffServices = new StaffServices();
            const result = await staffServices.deleteStaffById(staffId, body);
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }
}

exports.StaffController = StaffController;