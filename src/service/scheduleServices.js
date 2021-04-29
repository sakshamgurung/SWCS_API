const Schedule = require('../models/customers/schedule');

class ScheduleServices{

    constructor(){
        this.schedule = undefined;
        this.result = undefined;
    }

    async getAllSchedule(customerId, query){
        this.result = await Schedule.find({ $and:[{customerId}, query]})
        .populate("customerId", "email mobileNo")
        .populate("workId")
        .populate("customerRequestId");
        return this.result;
    }
    
    async getScheduleById(id){
        this.result = await Schedule.findById(id)
        .populate("customerId", "email mobileNo")
        .populate("workId")
        .populate("customerRequestId");
        return this.result;
    }
    
    async getScheduleByRef(ref, id, query){
        this.result = await Schedule.findByRef(ref, id, query)
        .populate("customerId", "email mobileNo")
        .populate("workId")
        .populate("customerRequestId");
        return this.result;
    }

}

exports.ScheduleServices = ScheduleServices;
