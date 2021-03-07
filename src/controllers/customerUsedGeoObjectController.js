const {CustomerUsedGeoObjectServices} = require("../service/customerUsedGeoObjectServices");

class CustomerUsedGeoObjectController{

    async getCustomerUsedGeoObjectByRef(request, response, next){
        try{
            const customerId = request.params.id;

            const customerUsedGeoObjectServices = new CustomerUsedGeoObjectServices();
            const result = await customerUsedGeoObjectServices.getCustomerUsedGeoObjectByRef("customer-id", customerId);
            
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }
    
    async getCustomerUsedGeoObjectById(request, response, next){
        try{
            const customerUsedGeoObjectId = request.params.id;

            const customerUsedGeoObjectServices = new CustomerUsedGeoObjectServices();
            const result = await customerUsedGeoObjectServices.getCustomerUsedGeoObjectById(customerUsedGeoObjectId);
            
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }
}

exports.CustomerUsedGeoObjectController = CustomerUsedGeoObjectController;