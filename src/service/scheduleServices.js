const Schedule = require('../models/customers/schedule');

class ScheduleServices{

    constructor(){
        this.schedule = undefined;
        this.result = undefined;
    }
    
    async createNewSchedule(scheduleData){
        this.schedule = new Schedule(scheduleData);
        this.result = await this.schedule.save();
        return this.result;
    }

    async getAllSchedule(customerId){
        this.result = await Schedule.findAllSchedule(customerId);
        return this.result;
    }

    async getScheduleById(id){
        this.result = await Schedule.findScheduleById(id);
        return this.result;
    }
    //new
    async getScheduleByRef(ref, id){
        this.result = await Schedule.findScheduleByRef(ref, id);
        return this.result;
    }
    async updateScheduleById(id, updateData){
        this.result = await Schedule.updateScheduleById(id, updateData);
        return this.result;
    }

    async deleteScheduleById(id, updateData){
        this.result = await Schedule.deleteScheduleById(id);
        return this.result;
    }
}

exports.ScheduleServices = ScheduleServices;
