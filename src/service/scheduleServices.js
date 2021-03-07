const Schedule = require('../models/customers/schedule');

class ScheduleServices{

    constructor(){
        this.schedule = undefined;
        this.result = undefined;
    }

    async getAllSchedule(customerId){
        this.result = await Schedule.findAllSchedule(customerId);
        return this.result;
    }

    async getScheduleById(id){
        this.result = await Schedule.findScheduleById(id);
        return this.result;
    }

}

exports.ScheduleServices = ScheduleServices;
