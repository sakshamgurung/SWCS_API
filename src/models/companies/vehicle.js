const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    company_id:{
        type:Schema.Types.ObjectId,
        required:true,
        alias:"companyId"
    },
    brand_name:{
        type:String,
        required:true,
        alias:"brandName"
    },
    modal_no:{
        type:String,
        alias:"modalNo"
    },
    plate_no:{
        type:String,
        required:true,
        alias:"plateNo"
    },
    vehicle_type:{
        type:String,
        required:true,
        alias:"vehicleType"
    },
    vehicle_color:{
        type:String,
        alias:"vehicleColor"
    },
    fuel_capacity:{
        type:Number,
        alias:"fuelCapacity"
    },
    waste_capacity:{
        type:String,
        alias:"wasteCapacity"
    },
    description:{
        type:String
    }
},{
    collection:"vehicle"
});

class HelperClass{
    static findAllVehicle(companyId, session){
        return this.find({ company_id:companyId },{ session:session });
    }
    static findVehicleById(id, session){
        return this.find({ _id:id },{ session:session });
    }
    static updateVehicleById(id, updateData, session){
        return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session:session });
    }
    static deleteVehicleById(id, session){
        return this.deleteOne({ _id:id }, { session:session });
    }
}

schema.loadClass(HelperClass);

module.exports = Vehicle = mongoose.model('Vehicle',schema);