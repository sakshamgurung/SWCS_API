const {CustomerServices} = require("../service/customerServices");

class CustomerController{
    async createNewCustomer(request, response, next){
        try {
            const { body } = request;
            const customerServices = new CustomerServices();
            const result = customerServices.createNewCustomer(body);
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500}); 
        }
    }

    async  getAllCustomerInIdArray(request, response, next){
        try{
            const { body } = request;
            const customerInfoType = request.params.type;
            const result = undefined;

            const customerServices = new CustomerServices();
            if(customerInfoType == "customer"){
                result = await customerServices.getAllCustomerInIdArray(body);
            }else if(customerInfoType == "customer-detail"){
                result = await customerServices.getAllCustomerDetailInIdArray(body);
            }

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async  getCustomerById(request, response, next){
        try{
            const customerInfoType = request.params.type;
            const id = request.params.id;
            const result = undefined;

            const customerServices = new CustomerServices();
            if(customerInfoType == "customer"){
                result = await customerServices.getCustomerById(id);
            }else if(customerInfoType == "customer-detail"){
                result = await customerServices.getCustomerDetailById(id);
            }

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async updateCustomerById(request, response, next){
        try{
            const customerInfoType = request.params.type;
            const id = request.params.id;
            const result = undefined;
            const updateData = request.body;

            const customerServices = new CustomerServices();
            switch(customerInfoType){
                case "customer": {
                    result = await customerServices.updateCustomerById(id, updateData);
                    break;
                }
                case "customer-detail": {
                    result = await customerServices.updateCustomerDetailById(id, updateData);
                    break;
                }
                default:{
                    throw new Error("customerInfoType not found!!!");
                }
            }

            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async deleteCustomerById(request, response, next){
        try {
            const id = request.params.id;
            const updateData = request.body;

            const customerServices = new CustomerServices();
            const result = await customerServices.deleteCustomerById(id, updateData);
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }
}

exports.CustomerController = CustomerController;