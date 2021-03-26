const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    companyId:{
        type:String,
        required:true,
    },
    isReserved:{
        type:Boolean,
        required:true,
    },
    brandName:{
        type:String,
        required:true,
    },
    modalNo:{
        type:String,
    },
    plateNo:{
        type:String,
        required:true,
    },
    vehicleType:{
        type:String,
        required:true,
        enum:["light", "medium", "heavy"]
    },
    vehicleColor:{
        type:String,
    },
    fuelCapacity:{
        type:Number,
    },
    fuelCapacityUnit:{
        type:String,
        enum:["litre"]
    },
    wasteCapacity:{
        type:Number,
    },
    wasteCapacityUnit:{
        type:String,
        enum:["kg","litre","metric cube"]
    },
    description:{
        type:String
    }
},{
    collection:"vehicles"
});

class HelperClass{
    static findAll(companyId, projection, session){
        if(session == undefined){
            return this.find({ companyId }, projection);
        }else{
            return this.find({ companyId }, projection, { session });
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
                case "companyId": return this.find({companyId:id}, projection);
                default : throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "companyId": return this.find({companyId:id}, projection, { session });
                default : throw ApiError.badRequest("ref not defined");
            }
        }
    }

    static deleteByRef(ref, id, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.deleteOne({companyId:id});
                default : throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "companyId": return this.deleteOne({companyId:id}, { session });
                default : throw ApiError.badRequest("ref not defined");
            }
        }
    }
}

schema.loadClass(HelperClass);

module.exports = Vehicle = mongoose.model('Vehicle',schema);