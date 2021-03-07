const {NotificationServices} = require("../service/notificationServices");

class NotificationController{
    async createNewNotification(request, response, next){
        try {
            const { body } = request;

            const notificationServices = new NotificationServices();
            const result = notificationServices.createNewNotification(body);

            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getAllNotification(request, response, next){
        try{
            const {role, id} = request.params;

            const notificationServices = new NotificationServices();
            const result = await notificationServices.getAllNotification(role, id);

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getNotificationById(request, response, next){
        try{
            const notificationId = request.params.id;

            const notificationServices = new NotificationServices();
            const result = await notificationServices.getNotificationById(notificationId);

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async deleteNotificationById(request, response, next){
        try {
            const notificationId = request.params.id;

            const notificationServices = new NotificationServices();
            const result = await notificationServices.deleteNotificationById(notificationId);
            
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }
}

exports.NotificationController = NotificationController;