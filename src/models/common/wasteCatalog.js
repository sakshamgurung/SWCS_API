const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    uid:{
        type:String,
        required:true
    },
    waste_type:{
        type:String,
        required:true,
        alias:"wasteType"
    },
    waste_name:{
        type:String,
        alias:"wasteName"
    },
    description:{
        type:String
    }
},{
    collection:"waste_catalog"
});

class HelperClass{
    static findAllWasteCatalog(session){
        return this.find({},{ session:session });
    }
    static findWasteCatalogById(id, session){
        return this.find({ _id:id },{ session:session });
    }
    static updateWasteCatalogById(id, updateData, session){
        return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session:session });
    }
    static deleteWasteCatalogById(id, session){
        return this.deleteOne({ _id:id }, { session:session });
    }  
}

schema.loadClass(HelperClass);

module.exports = WasteCatalog = mongoose.model('WasteCatalog',schema);