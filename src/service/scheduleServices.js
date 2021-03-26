const Schedule = require('../models/customers/schedule');

class ScheduleServices{

    constructor(){
        this.schedule = undefined;
        this.result = undefined;
    }

    async getAllSchedule(customerId){
        this.result = await Schedule.findAll(customerId);
        return this.result;
    }

    async getScheduleById(id){
        this.result = await Schedule.findById(id);
        return this.result;
    }

    async getScheduleByRef(ref, id){
        this.result = await Schedule.findByRef(ref, id);
        return this.result;
    }

}

exports.ScheduleServices = ScheduleServices;
