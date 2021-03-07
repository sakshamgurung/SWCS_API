const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    customerId:{
        type:String,
        required:true,
    },
    usedPoint:{
        type:[{
            companyId:String,
            pointId:String
        }],
    },
    usedZone:{
        type:[{
            companyId:String,
            zoneId:String
        }],
    }
},{
    collection:"customerUsedGeoObjects"
});

class HelperClass{
    static updateCustomerUsedGeoObjectById(id, updateData, session){
        return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session:session });
    }
    static deleteCustomerUsedGeoObjectById(id, session){
        return this.deleteOne({ _id:id }, { session:session });
    }
    
    static findCustomerUsedGeoObjectById(id, session){
        return this.find({ _id:id },{ session:session });
    }
    
    static findCustomerUsedGeoObjectByRef(ref, id, session){
        switch(ref){
            case "customerId": return this.find({customerId:id},{ session:session });
            case "usedPoint.pointId": return this.find({ "usedPoint.pointId":id},{ session:session });
            case "usedZone.zoneId": return this.find({ "usedZone.zoneId":id },{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
    
    static updateCustomerUsedGeoObjectByRef(ref, id, updateData, session){
        switch(ref){
            case "customerId": return this.updateMany({customerId:id},this.translateAliases( updateData ),{ session:session });
            case "usedPoint.pointId": return this.updateMany({ "usedPoint.pointId":id},this.translateAliases( updateData ),{ session:session });
            case "usedZone.zoneId": return this.updateMany({ "usedZone.zoneId":id },this.translateAliases( updateData ),{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
    
    static deleteCustomerUsedGeoObjectByRef(ref, id, session){
        switch(ref){
            case "customerId": return this.deleteMany({customerId:id},{ session:session });
            case "usedPoint.pointId": return this.deleteMany({ "usedPoint.pointId":id},{ session:session });
            case "usedZone.zoneId": return this.deleteMany({ "usedZone.zoneId":id },{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
}

schema.loadClass(HelperClass);

module.exports = CustomerUsedGeoObject = mongoose.model('CustomerUsedGeoObject',schema);