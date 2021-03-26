const {ScheduleServices} = require("../service/scheduleServices");
const ApiError = require('../error/ApiError');

class ScheduleController{

    async getAllSchedule(request, response, next){
        try{
            const customerId = request.params.id;

            const scheduleServices = new ScheduleServices();
            const result = await scheduleServices.getAllSchedule(customerId);
            
            response.json(result);
        }catch(error){
            throw ApiError.serverError("Schedule Error: " + error.message);
        }
    }

    async getScheduleById(request, response, next){
        try{
            const scheduleId = request.params.id;

            const scheduleServices = new ScheduleServices();
            const result = await scheduleServices.getScheduleById(scheduleId);
            
            response.json(result);
        }catch(error){
            throw ApiError.serverError("Schedule Error: " + error.message);
        }
    }

    async getScheduleByRef(request, response, next){
        try {
            const {ref, id} = request.params;

            const scheduleServices = new ScheduleServices();
            const result = await scheduleServices.getScheduleByRef(ref, id);
            
            response.json(result);
        } catch (error) {
            throw ApiError.serverError("Schedule by ref Error: " + error.message);
        }
    }
}

exports.ScheduleController = ScheduleController;