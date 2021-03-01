const {ScheduleServices} = require("../service/scheduleServices");

class ScheduleController{
    async createNewSchedule(request, response, next){
        try {
            const customerId = request.params.id;
            const { body } = request;
            body = {customerId, ...body};
            
            const scheduleServices = new ScheduleServices();
            const result = scheduleServices.createNewSchedule(body);
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }

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
            const id = request.params.id;

            const scheduleServices = new ScheduleServices();
            const result = await scheduleServices.getScheduleById(id);
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async updateScheduleById(request, response, next){
        try{
            const id = request.params.id;
            const updateData = request.body;

            const scheduleServices = new ScheduleServices();
            const result = await scheduleServices.updateScheduleById(id, updateData);
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async deleteScheduleById(request, response, next){
        try {
            const id = request.params.id;

            const scheduleServices = new ScheduleServices();
            const result = await scheduleServices.deleteScheduleById(id);
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }
}

exports.ScheduleController = ScheduleController;