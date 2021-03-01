const {StaffServices} = require("../service/staffServices");

class StaffController{
    async createNewStaff(request, response, next){
        try {
            const companyId = request.params.id;
            const { body } = request;
            body = {companyId, ...body};
            
            const staffServices = new StaffServices();
            const result = staffServices.createNewStaff(body);
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
            const result = undefined;

            const staffServices = new StaffServices();
            if(staffInfoType == "staff"){
                result = await staffServices.getAllStaff(companyId);
            }else if(staffInfoType == "staff-detail"){
                result = await staffServices.getAllStaffDetail(companyId);
            }

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async  getStaffById(request, response, next){
        try{
            const staffInfoType = request.params.type;
            const id = request.params.id;
            const result = undefined;

            const staffServices = new StaffServices();
            if(staffInfoType == "staff"){
                result = await staffServices.getStaffById(id);
            }else if(staffInfoType == "staff-detail"){
                result = await staffServices.getStaffDetailById(id);
            }

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async updateStaffById(request, response, next){
        try{
            const staffInfoType = request.params.type;
            const id = request.params.id;
            const result = undefined;
            const updateData = request.body;

            const staffServices = new StaffServices();
            switch(staffInfoType){
                case "staff": {
                    result = await staffServices.updateStaffById(id, updateData);
                    break;
                }
                case "staff-detail": {
                    result = await staffServices.updateStaffDetailById(id, updateData);
                    break;
                }
                default:{
                    throw new Error("staffInfoType not found!!!");
                }
            }

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async deleteStaffById(request, response, next){
        try {
            const id = request.params.id;
            const updateData = request.body;

            const staffServices = new StaffServices();
            const result = await staffServices.deleteStaffById(id, updateData);
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }
}

exports.StaffController = StaffController;