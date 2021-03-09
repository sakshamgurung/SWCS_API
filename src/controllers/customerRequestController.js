const {CustomerRequestServices} = require("../service/customerRequestServices");

class CustomerRequestController{
    async createNewCustomerRequest(request, response, next){
        try {
            const { body } = request;
            
            const customerRequestServices = new CustomerRequestServices();
            const result =  await customerRequestServices.createNewCustomerRequest(body);

            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getAllCustomerRequest(request, response, next){
        try{
            const {role, id} = request.params;

            const customerRequestServices = new CustomerRequestServices();
            const result = await customerRequestServices.getAllCustomerRequest(role, id);

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getCustomerRequestById(request, response, next){
        try{
            const customerRequestId = request.params.id;

            const customerRequestServices = new CustomerRequestServices();
            const result = await customerRequestServices.getCustomerRequestById(customerRequestId);

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async updateCustomerRequestById(request, response, next){
        try{
            const customerRequestId = request.params.id;
            const {body} = request;

            const customerRequestServices = new CustomerRequestServices();
            const result = await customerRequestServices.updateCustomerRequestById(customerRequestId, body);

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async deleteCustomerRequestById(request, response, next){
        try {
            const customerRequestId = request.params.id;
            const {body} = request;

            const customerRequestServices = new CustomerRequestServices();
            const result = await customerRequestServices.deleteCustomerRequestById(customerRequestId, body);
            
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }
}

exports.CustomerRequestController = CustomerRequestController;