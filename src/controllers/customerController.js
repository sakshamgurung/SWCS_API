const {CustomerServices} = require("../service/customerServices");

class CustomerController{
    async newCustomerInfo(request, response, next){
        try {
            const { customerDetail } = request.body;

            const customerServices = new CustomerServices();
            const result = customerServices.newCustomerInfo(customerDetail);

            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500}); 
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
            console.error(error.message);
            response.json({error:500});
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
            console.error(error.message);
            response.json({error:500});
        }
    }

    async updateCustomerById(request, response, next){
        try{
            const customerInfoType = request.params.type;
            const customerId = request.params.id;
            const {body} = request;
            
            const customerServices = new CustomerServices();
            const result = await customerServices.updateCustomerById(customerInfoType, customerId, body);

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async deleteCustomerById(request, response, next){
        try {
            const customerId = request.params.id;
            const {body} = request;

            const customerServices = new CustomerServices();
            const result = await customerServices.deleteCustomerById(customerId, body);

            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }
}

exports.CustomerController = CustomerController;