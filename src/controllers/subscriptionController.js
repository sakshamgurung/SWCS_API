const {SubscriptionServices} = require("../service/subscriptionServices");

class SubscriptionController{
    //for customer
    async createNewSubscription(request, response, next){
        try {
            const { body } = request;
            
            const subscriptionServices = new SubscriptionServices();
            const result = await subscriptionServices.createNewSubscription(body);

            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }
    //for customer
    async getAllSubscription(request, response, next){
        try{
            const customerId = request.params.id;

            const subscriptionServices = new SubscriptionServices();
            const result = await subscriptionServices.getAllSubscription(customerId);

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }
    //for company
    async getAllSubscriber(request, response, next){
        try{
            const companyId = request.params.id;

            const subscriptionServices = new SubscriptionServices();
            const result = await subscriptionServices.getAllSubscriber(companyId);

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }
    //for customer
    async deleteSubscriptionById(request, response, next){
        try {
            const subscriptionId = request.params.id;
            const {body} = request;

            const subscriptionServices = new SubscriptionServices();
            const result = await subscriptionServices.deleteSubscriptionById(subscriptionId, body);
            
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }
}

exports.SubscriptionController = SubscriptionController;