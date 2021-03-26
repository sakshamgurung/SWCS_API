const {CustomerServices} = require("../service/customerServices");
const ApiError = require('../error/ApiError');

class CustomerController{
    async newCustomerInfo(request, response, next){
        try {
            const { customerDetail } = request.body;

            const customerServices = new CustomerServices();
            const result =  await customerServices.newCustomerInfo(customerDetail);

            response.json(result);
        } catch (error) {
            throw ApiError.serverError("Customer Error: " + error.message); 
        }
    }

    async  getAllCustomerInIdArray(request, response, next){
        try{
            const { idArray } = request.body;
            const customerInfoType = request.params.type;

            const customerServices = new CustomerServices();
            const result = await customerServices.getAllCustomerInIdArray(customerInfoType, idArray);

            response.json(result);
        }catch(error){
            throw ApiError.serverError("Customer Error: " + error.message);
        }
    }

    async  getCustomerById(request, response, next){
        try{
            const customerInfoType = request.params.type;
            const customerId = request.params.id;
            
            const customerServices = new CustomerServices();
            const result = await customerServices.getCustomerById(customerInfoType, customerId);

            response.json(result);
        }catch(error){
            throw ApiError.serverError("Customer Error: " + error.message);
        }
    }

    async getCustomerByRef(request, response, next){
        try {
            const customerInfoType = request.params.type;
            const {ref, id} = request.params;

            const customerServices = new CustomerServices();
            const result = await customerServices.getCustomerByRef(customerInfoType, ref, id);
            
            response.json(result);
        } catch (error) {
            throw ApiError.serverError("Customer by ref Error: " + error.message);
        }
    }

    async updateCustomerById(request, response, next){
        try{
            const customerInfoType = request.params.type;
            const customerId = request.params.id;
            const {body} = request;
            
            const customerServices = new CustomerServices();
            const {statusCode, status} = await customerServices.updateCustomerById(customerInfoType, customerId, body);

            response.status(statusCode).send(status);
        }catch(error){
            throw ApiError.serverError("Customer Error: " + error.message);
        }
    }

    async deleteCustomerById(request, response, next){
        try {
            const customerId = request.params.id;
            const {body} = request;

            const customerServices = new CustomerServices();
            const {statusCode, status} = await customerServices.deleteCustomerById(customerId, body);

            response.status(statusCode).send(status);
        } catch (error) {
            throw ApiError.serverError("Customer Error: " + error.message);
        }
    }
}

exports.CustomerController = CustomerController;