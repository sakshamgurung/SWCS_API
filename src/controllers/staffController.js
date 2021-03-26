const {StaffServices} = require("../service/staffServices");
const ApiError = require('../error/ApiError');

class StaffController{
    async newStaffInfo(request, response, next){
        try {
            const { staffDetail } = request.body;
            
            const staffServices = new StaffServices();
            const result =  await staffServices.newStaffInfo(staffDetail);

            response.json(result);
        } catch (error) {
            throw ApiError.serverError("Staff Error: " + error.message);
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
            throw ApiError.serverError("Staff Error: " + error.message);
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
            throw ApiError.serverError("Staff Error: " + error.message);
        }
    }

    async getStaffByRef(request, response, next){
        try {
            const staffInfoType = request.params.type;
            const {ref, id} = request.params;

            const staffServices = new StaffServices();
            const result = await staffServices.getStaffByRef(staffInfoType, ref, id);
            
            response.json(result);
        } catch (error) {
            throw ApiError.serverError("Staff by ref Error: " + error.message);
        }
    }

    async updateStaffById(request, response, next){
        try{
            const staffInfoType = request.params.type;
            const staffId = request.params.id;
            const {body} = request;

            const staffServices = new StaffServices();
            const {statusCode, status} = await staffServices.updateStaffById(staffInfoType, staffId, body);

            response.status(statusCode).send(status);
        }catch(error){
            throw ApiError.serverError("Staff Error: " + error.message);
        }
    }

    async deleteStaffById(request, response, next){
        try {
            const staffId = request.params.id;
            const {body} = request;

            const staffServices = new StaffServices();
            const {statusCode, status} = await staffServices.deleteStaffById(staffId, body);
            
            response.status(statusCode).send(status);
        } catch (error) {
            throw ApiError.serverError("Staff Error: " + error.message);
        }
    }
}

exports.StaffController = StaffController;