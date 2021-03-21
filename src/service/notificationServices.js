const Notification = require('../models/common/notification');
const ApiError = require('../error/ApiError');
const {checkForWriteErrors } = require('../utilities/errorUtil');

class NotificationServices{

    constructor(){
        this.notification = undefined;
        this.result = undefined;
    }
    
    async createNewNotification(notificationData){
        this.notification = new Notification(notificationData);
        this.result = await this.notification.save();
        return this.result;
    }

    async getAllNotification(role, id){
        this.result = await Notification.findAll(role, id);
        return this.result;
    }

    async getNotificationById(id){
        this.result = await Notification.findById(id);
        return this.result;
    }

    async deleteNotificationById(id, updateData){
        this.result = await Notification.deleteById(id);
        return checkForWriteErrors(this.result, "status", "Notification delete failed");
    }
}

exports.NotificationServices = NotificationServices;
