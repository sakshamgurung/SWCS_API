const Schedule = require('../models/customers/schedule');

class ScheduleServices{

    constructor(){
        this.schedule = undefined;
        this.result = undefined;
    }

    async getAllSchedule(customerId, query){
        this.result = await Schedule.find({ $and:[{customerId}, query]});
        return this.result;
    }

    async getScheduleById(id){
        this.result = await Schedule.findById(id);
        return this.result;
    }

    async getScheduleByRef(ref, id, query){
        this.result = await Schedule.findByRef(ref, id, query);
        return this.result;
    }

}

exports.ScheduleServices = ScheduleServices;
