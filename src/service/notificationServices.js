const Notification = require('../models/common/notification');

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
        this.result = await Notification.findAllNotification(role, id);
        return this.result;
    }

    async getNotificationById(id){
        this.result = await Notification.findNotificationById(id);
        return this.result;
    }

    async deleteNotificationById(id, updateData){
        this.result = await Notification.deleteNotificationById(id);
        return this.result;
    }
}

exports.NotificationServices = NotificationServices;
