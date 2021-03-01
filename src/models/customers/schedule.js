const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    customer_id:{
        type:String,
        required:true,
        alias:"customerId"
    },
    work_id:{
        type:String,
        required:true,
        alias:"workId"
    },
    customer_request_id:{
        type:String,
        alias:"customerRequestId"
    }
},{
    collection:"schedule"
});

class HelperClass{
    static findAllSchedule(customerId, session){
        return this.find({ customer_id:customerId },{ session:session });
    }
    static findScheduleById(id, session){
        return this.find({ _id:id },{ session:session });
    }
    static updateScheduleById(id, updateData, session){
        return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session:session });
    }
    static deleteScheduleById(id, session){
        return this.deleteOne({ _id:id }, { session:session });
    }
    //new
    static findScheduleByRef(ref, id, session){
        switch(ref){
            case "customer-id": return this.find({ customer_id:id},{ session:session });
            case "work-id": return this.find({ work_id:id},{ session:session });
            case "customer-request-id": return this.find({ customer_request_id:id },{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
    //new
    static updateScheduleByRef(ref, id, updateData, session){
        switch(ref){
            case "customer-id": return this.updateMany({ customer_id:id},this.translateAliases( updateData ),{ session:session });
            case "work-id": return this.updateMany({ work_id:id},this.translateAliases( updateData ),{ session:session });
            case "customer-request-id": return this.updateMany({ customer_request_id:id },this.translateAliases( updateData ),{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
    //new
    static deleteScheduleByRef(ref, id, session){
        switch(ref){
            case "customer-id": return this.deleteMany({ customer_id:id},{ session:session });
            case "work-id": return this.deleteMany({ work_id:id},{ session:session });
            case "customer-request-id": return this.deleteMany({ customer_request_id:id },{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
}

schema.loadClass(HelperClass);

module.exports = Schedule = mongoose.model('Schedule',schema);