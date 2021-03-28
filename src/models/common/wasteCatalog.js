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

module.exports = WasteCatalog = mongoose.model('WasteCatalog',schema);