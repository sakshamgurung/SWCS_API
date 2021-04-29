const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    customerId:{
        type:String,
        ref:"CustomerLogin",
        required:true,
    },
    workId:{
        type:String,
        ref:"Work"
    },
    customerRequestId:{
        type:String,
        ref:"CustomerRequest"
    }
},{
    collection:"schedules"
});

class HelperClass{
    
    static findByRef(ref, id, query, projection, session){
        if(session == undefined){
            switch(ref){
                case "customerId": return this.find({ $and:[{ customerId:id}, query]}, projection);
                case "workId": return this.find({ $and:[{ workId:id}, query]}, projection);
                case "customerRequestId": return this.find({ $and:[{ customerRequestId:id }, query]}, projection);
                default: throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "customerId": return this.find({ $and:[{customerId:id}, query]}, projection, { session });
                case "workId": return this.find({ $and:[{workId:id}, query]}, projection, { session });
                case "customerRequestId": return this.find({ $and:[{customerRequestId:id}, query] }, projection, { session });
                default: throw ApiError.badRequest("ref not defined");
            }
        }
    }

    static updateByRef(ref, id, updateData, session){
        if(session == undefined){
            switch(ref){
                case "customerId": return this.updateMany({ customerId:id},this.translateAliases( updateData ));
                case "workId": return this.updateMany({ workId:id},this.translateAliases( updateData ));
                case "customerRequestId": return this.updateMany({ customerRequestId:id },this.translateAliases( updateData ));
                default: throw ApiError.badRequest("ref not defined");
            }  
        }else{
            switch(ref){
                case "customerId": return this.updateMany({ customerId:id},this.translateAliases( updateData ),{ session });
                case "workId": return this.updateMany({ workId:id},this.translateAliases( updateData ),{ session });
                case "customerRequestId": return this.updateMany({ customerRequestId:id },this.translateAliases( updateData ),{ session });
                default: throw ApiError.badRequest("ref not defined");
            }
        }
    }

    static deleteByRef(ref, id, session){
        if(session == undefined){
            switch(ref){
                case "customerId": return this.deleteMany({ customerId:id});
                case "workId": return this.deleteMany({ workId:id});
                case "customerRequestId": return this.deleteMany({ customerRequestId:id });
                default: throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "customerId": return this.deleteMany({ customerId:id},{ session });
                case "workId": return this.deleteMany({ workId:id},{ session });
                case "customerRequestId": return this.deleteMany({ customerRequestId:id },{ session });
                default: throw ApiError.badRequest("ref not defined");
            }
        }
    }
}

schema.loadClass(HelperClass);

module.exports = Schedule = mongoose.model('Schedule',schema);