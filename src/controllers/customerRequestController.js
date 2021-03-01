const {CustomerRequestServices} = require("../service/customerRequestServices");

class CustomerRequestController{
    async createNewCustomerRequest(request, response, next){
        try {
            const customerId = request.params.id;
            const { body } = request;
            body = {customerId, ...body};
            
            const customerRequestServices = new CustomerRequestServices();
            const result = customerRequestServices.createNewCustomerRequest(body);
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getAllCustomerRequest(request, response, next){
        try{
            const role = request.params.role;
            const { id, idArray } = request.body;

            const customerRequestServices = new CustomerRequestServices();
            const result = await customerRequestServices.getAllCustomerRequest(role, id, idArray);
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getCustomerRequestById(request, response, next){
        try{
            const id = request.params.id;

            const customerRequestServices = new CustomerRequestServices();
            const result = await customerRequestServices.getCustomerRequestById(id);
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async updateCustomerRequestById(request, response, next){
        try{
            const id = request.params.id;
            const updateData = request.body;

            const customerRequestServices = new CustomerRequestServices();
            const result = await customerRequestServices.updateCustomerRequestById(id, updateData);
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async deleteCustomerRequestById(request, response, next){
        try {
            const id = request.params.id;

            const customerRequestServices = new CustomerRequestServices();
            const result = await customerRequestServices.deleteCustomerRequestById(id);
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }
}

exports.CustomerRequestController = CustomerRequestController;