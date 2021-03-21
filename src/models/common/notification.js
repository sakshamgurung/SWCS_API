const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    from:{
        role:{
            type:String,
            enum:['company','staff','customer']
        },
        id:{
            type:String
        }
    },
    to:{
        role:{
            type:String,
            enum:['company','staff','customer']
        },
        id:{
            type:String
        }
    },
    targetCollection:{
        collectionName:{
            type:String,
        },
        collectionId:{
            type:String,
        }
    },
    sentDate:{
        type:Schema.Types.Date,
    },
    data:{
        type:Schema.Types.Mixed
    },
    notification:{
        type:Schema.Types.Mixed
    }
},{
    collection:"notifications"
});

class HelperClass{
    static findAll(role, id, projection, session){
        if(session == undefined){
            return this.find({ $and: [{'to.role':role},{'to.id':id}] }, projection);
        }else{
            return this.find({ $and: [{'to.role':role},{'to.id':id}] }, projection,{ session });
        }
    }

    static findById(id, projection, session){
        if(session == undefined){
            return this.find({ _id:id }, projection);
        }else{
            return this.find({ _id:id }, projection,{ session });
        }
    }

    static deleteById(id, session){
        if(session == undefined){
            return this.deleteOne({ _id:id });
        }else{
            return this.deleteOne({ _id:id }, { session });  
        }
    }
    
    static deleteByRole(role, id, session){
        if(session == undefined){
            return this.deleteMany({ $and: [{'to.role':role},{'to.id':id}] });
        }else{
            return this.deleteMany({ $and: [{'to.role':role},{'to.id':id}] },{ session });
        }
    }
}

schema.loadClass(HelperClass);

module.exports = Notification = mongoose.model('Notification',schema);