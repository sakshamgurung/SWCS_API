const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    company_id:{
        type:String,
        required:true,
        alias:"companyId"
    },
    customer_id:{
        type:String,
        required:true,
        alias:"customerId"
    },
    request_type:{
        type:String,
        required:true,
        alias:"requestType"
    },
    request_coordinate:{
        type:{latitude:Number, longitude:Number},
        alias:"requestCoordinate"
    },
    description:{
        date:Schema.Types.Date,
        work_desc:{
            type:String,
            alias:"workDesc"
        }
    },
    staff_id:{
        type:[String],
        alias:"staffId"
    },
    staff_group_id:{
        type:[String],
        alias:"staffGroupId"
    },
    vehicle_id:{
        type:String,
        alias:"vehicleId"
    },
    work_status:{
        type:String,
        alias:"workStatus",
        enum:["unconfirmed","confirmed","on progress","finished"]
    }
},{
    collection:"customer_request"
});

class HelperClass{
    static findAllCustomerRequest(role, id, idArray, session){
        switch(role){
            case "company": return this.find({company_id:id},{ session:session }); 
            case "staff": return this.find({
                $or:[
                    { staff_id:{ $in: idArray.staffId} },
                    { staff_group_id:{ $in: idArray.staffGroupId} } 
                ]
            },{ session:session });
            case "customer":
            default : return this.find({customer_id:id},{ session:session });
        }
    }
    static findCustomerRequestById(id, session){
        return this.find({ _id:id },{ session:session });
    }
    static updateCustomerRequestById(id, updateData, session){
        return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session:session });
    }
    static deleteCustomerRequestById(id, session){
        return this.deleteOne({ _id:id }, { session:session });
    }
    //new
    static findCustomerRequestByRef(ref, id, session){
        switch(ref){
            case "company-id": return this.find({company_id:id},{ session:session });
            case "customer-id": return this.find({customer_id:id},{ session:session });
            case "staff-id": return this.find({staff_id:id},{ session:session });
            case "staff-group-id": return this.find({staff_group_id:id},{ session:session });
            case "vehicle-id": return this.find({vehicle_id:id},{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
    //new
    static updateCustomerRequestByRef(ref, id, updateData, session){
        switch(ref){
            case "company-id": return this.updateMany({company_id:id},this.translateAliases( updateData ),{ session:session });
            case "customer-id": return this.updateMany({customer_id:id},this.translateAliases( updateData ),{ session:session });
            case "staff-id": return this.updateMany({staff_id:id},this.translateAliases( updateData ),{ session:session });
            case "staff-group-id": return this.updateMany({staff_group_id:id},this.translateAliases( updateData ),{ session:session });
            case "vehicle-id": return this.updateMany({vehicle_id:id},this.translateAliases( updateData ),{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
    //new
    static deleteCustomerRequestByRef(ref, id, session){
        switch(ref){
            case "company-id": return this.deleteMany({company_id:id},{ session:session });
            case "customer-id": return this.deleteMany({customer_id:id},{ session:session });
            case "staff-id": return this.deleteMany({staff_id:id},{ session:session });
            case "staff-group-id": return this.deleteMany({staff_group_id:id},{ session:session });
            case "vehicle-id": return this.deleteMany({vehicle_id:id},{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
}

schema.loadClass(HelperClass);

module.exports = CustomerRequest = mongoose.model('CustomerRequest',schema);