const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    wasteType:{
        type:String,
        required:true,
    },
    wasteName:{
        type:String,
    },
    description:{
        type:String
    }
},{
    collection:"wasteCatalogs"
});

class HelperClass{
    static findAll(projection, session){
        if(session == undefined){
            return this.find({}, projection);
        }else{
            return this.find({}, projection,{ session });
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
}

schema.loadClass(HelperClass);

module.exports = WasteCatalog = mongoose.model('WasteCatalog',schema);