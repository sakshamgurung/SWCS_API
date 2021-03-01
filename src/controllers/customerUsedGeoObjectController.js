const {CustomerUsedGeoObjectServices} = require("../service/customerUsedGeoObjectServices");

class CustomerUsedGeoObjectController{
    async createNewCustomerUsedGeoObject(request, response, next){
        try {
            const customerId = request.params.id;
            const { body } = request;
            body = {customerId, ...body};
            
            const customerUsedGeoObjectServices = new CustomerUsedGeoObjectServices();
            const result = customerUsedGeoObjectServices.createNewCustomerUsedGeoObject(body);
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getAllCustomerUsedGeoObject(request, response, next){
        try{
            const customerId = request.params.id;

            const customerUsedGeoObjectServices = new CustomerUsedGeoObjectServices();
            const result = await customerUsedGeoObjectServices.getAllCustomerUsedGeoObject(customerId);
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async updateCustomerUsedGeoObjectById(request, response, next){
        try{
            const id = request.params.id;
            const updateData = request.body;

            const customerUsedGeoObjectServices = new CustomerUsedGeoObjectServices();
            const result = await customerUsedGeoObjectServices.updateCustomerUsedGeoObjectById(id, updateData);
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async deleteCustomerUsedGeoObjectById(request, response, next){
        try {
            const id = request.params.id;

            const customerUsedGeoObjectServices = new CustomerUsedGeoObjectServices();
            const result = await customerUsedGeoObjectServices.deleteCustomerUsedGeoObjectById(id);
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }
}

exports.CustomerUsedGeoObjectController = CustomerUsedGeoObjectController;