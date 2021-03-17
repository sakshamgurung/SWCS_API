const {CustomerUsedGeoObjectServices} = require("../service/customerUsedGeoObjectServices");
const ApiError = require('../error/ApiError');

class CustomerUsedGeoObjectController{

    async getCustomerUsedGeoObjectByRef(request, response, next){
        try{
            const customerId = request.params.id;

            const customerUsedGeoObjectServices = new CustomerUsedGeoObjectServices();
            const result = await customerUsedGeoObjectServices.getCustomerUsedGeoObjectByRef("customer-id", customerId);
            
            response.json(result);
        }catch(error){
            throw ApiError.serverError("Customer used geo object Error: " + error.message);
        }
    }
    
    async getCustomerUsedGeoObjectById(request, response, next){
        try{
            const customerUsedGeoObjectId = request.params.id;

            const customerUsedGeoObjectServices = new CustomerUsedGeoObjectServices();
            const result = await customerUsedGeoObjectServices.getCustomerUsedGeoObjectById(customerUsedGeoObjectId);
            
            response.json(result);
        }catch(error){
            throw ApiError.serverError("Customer used geo object Error: " + error.message);
        }
    }
}

exports.CustomerUsedGeoObjectController = CustomerUsedGeoObjectController;