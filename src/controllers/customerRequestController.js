const {CustomerRequestServices} = require("../service/customerRequestServices");
const ApiError = require('../error/ApiError');
const {customerRequestClientToServer} = require('../utilities/geoObjectUtil');

class CustomerRequestController{
    async createNewCustomerRequest(request, response, next){
        try {
            let { body } = request;
            body = customerRequestClientToServer(body);

            const customerRequestServices = new CustomerRequestServices();
            const result =  await customerRequestServices.createNewCustomerRequest(body);

            response.json(result);
        } catch (error) {
            throw ApiError.serverError("Customer request Error: " + error.message);
        }
    }

    async getAllCustomerRequest(request, response, next){
        try{
            const {role, id} = request.params;

            const customerRequestServices = new CustomerRequestServices();
            const result = await customerRequestServices.getAllCustomerRequest(role, id);
            
            response.json(result);
        }catch(error){
            throw ApiError.serverError("Customer request Error: " + error.message);
        }
    }

    async getCustomerRequestById(request, response, next){
        try{
            const customerRequestId = request.params.id;

            const customerRequestServices = new CustomerRequestServices();
            const result = await customerRequestServices.getCustomerRequestById(customerRequestId);

            response.json(result);
        }catch(error){
            throw ApiError.serverError("Customer request Error: " + error.message);
        }
    }

    async updateCustomerRequestById(request, response, next){
        try{
            const customerRequestId = request.params.id;
            const {body} = request;

            const customerRequestServices = new CustomerRequestServices();
            const {statusCode, status} = await customerRequestServices.updateCustomerRequestById(customerRequestId, body);

            response.status(statusCode).send(status);
        }catch(error){
            throw ApiError.serverError("Customer request Error: " + error.message);
        }
    }

    async deleteCustomerRequestById(request, response, next){
        try {
            const customerRequestId = request.params.id;
            const {body} = request;

            const customerRequestServices = new CustomerRequestServices();
            const {statusCode, status} = await customerRequestServices.deleteCustomerRequestById(customerRequestId, body);
            
            response.status(statuscode).send(status);
        } catch (error) {
            throw ApiError.serverError("Customer request Error: " + error.message);
        }
    }
}

exports.CustomerRequestController = CustomerRequestController;