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
    },
    customerRequestId:{
        type:String,
    }
},{
    collection:"schedules"
});

class HelperClass{
    static findAll(customerId, projection, session){
        if(session == undefined){
            return this.find({ customerId }, projection);
        }else{
            return this.find({ customerId }, projection, { session });
        }
    }

    static findById(id, projection, session){
        if(session == undefined){
            return this.find({ _id:id }, projection);
        }else{
            return this.find({ _id:id }, projection, { session });
        }
    }

    static updateById(id, updateData, session){
        if(session == undefined){
            return this.updateOne({ _id:id }, this.translateAliases( updateData ));
        }else{
            return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session });
        }
    }

    static deleteById(id, session){
        if(session == undefined){
            return this.deleteOne({ _id:id });
        }else{
            return this.deleteOne({ _id:id }, { session });
        }
    }

    static findByRef(ref, id, projection, session){
        if(session == undefined){
            switch(ref){
                case "customerId": return this.find({ customerId:id}, projection);
                case "workId": return this.find({ workId:id}, projection);
                case "customerRequestId": return this.find({ customerRequestId:id }, projection);
                default: throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "customerId": return this.find({ customerId:id}, projection, { session });
                case "workId": return this.find({ workId:id}, projection, { session });
                case "customerRequestId": return this.find({ customerRequestId:id }, projection, { session });
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