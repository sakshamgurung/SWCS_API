const {ScheduleServices} = require("../service/scheduleServices");

class ScheduleController{

    async getAllSchedule(request, response, next){
        try{
            const customerId = request.params.id;

            const scheduleServices = new ScheduleServices();
            const result = await scheduleServices.getAllSchedule(customerId);
            
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getScheduleById(request, response, next){
        try{
            const scheduleId = request.params.id;

            const scheduleServices = new ScheduleServices();
            const result = await scheduleServices.getScheduleById(scheduleId);
            
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }
}

exports.ScheduleController = ScheduleController;