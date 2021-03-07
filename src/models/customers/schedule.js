const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    customerId:{
        type:String,
        required:true,
    },
    workId:{
        type:String,
        required:true,
    },
    customerRequestId:{
        type:String,
    }
},{
    collection:"schedules"
});

class HelperClass{
    static findAllSchedule(customerId, session){
        return this.find({ customerId:customerId },{ session:session });
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

    static findScheduleByRef(ref, id, session){
        switch(ref){
            case "customerId": return this.find({ customerId:id},{ session:session });
            case "workId": return this.find({ workId:id},{ session:session });
            case "customerRequestId": return this.find({ customerRequestId:id },{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }

    static updateScheduleByRef(ref, id, updateData, session){
        switch(ref){
            case "customerId": return this.updateMany({ customerId:id},this.translateAliases( updateData ),{ session:session });
            case "workId": return this.updateMany({ workId:id},this.translateAliases( updateData ),{ session:session });
            case "customerRequestId": return this.updateMany({ customerRequestId:id },this.translateAliases( updateData ),{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }

    static deleteScheduleByRef(ref, id, session){
        switch(ref){
            case "customerId": return this.deleteMany({ customerId:id},{ session:session });
            case "workId": return this.deleteMany({ workId:id},{ session:session });
            case "customerRequestId": return this.deleteMany({ customerRequestId:id },{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
}

schema.loadClass(HelperClass);

module.exports = Schedule = mongoose.model('Schedule',schema);