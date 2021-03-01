const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    from:{
        role:{
            type:String,
            enum:['company','staff','customer']
        },
        id:{
            type:Schema.Types.ObjectId
        }
    },
    to:{
        role:{
            type:String,
            enum:['company','staff','customer']
        },
        id:{
            type:Schema.Types.ObjectId
        }
    },
    target_collection:{
        collection_name:{
            type:String,
            alias:"collectionName"
        },
        collection_id:{
            type:Schema.Types.ObjectId,
            alias:"collectionId"
        }
    },
    sent_date:{
        type:Schema.Types.Date,
        alias:"sentDate"
    },
    data:{
        type:Schema.Types.Mixed
    },
    notification:{
        type:Schema.Types.Mixed
    }
},{
    collection:"notification"
});

class HelperClass{
    static findAllNotification(role, id, session){
        return this.find({ $and: [{'to.role':role},{'to.id':id}] },{ session:session });
    }
    static findNotificationById(id, session){
        return this.find({ _id:id },{ session:session });
    }
    static deleteNotificationById(id, session){
        return this.deleteOne({ _id:id }, { session:session });
    }
    //new
    static deleteNotificationByRole(role, id, session){
        return this.deleteMany({ $and: [{'to.role':role},{'to.id':id}] },{ session:session });
    }
}

schema.loadClass(HelperClass);

module.exports = Notification = mongoose.model('Notification',schema);