const CustomerUsedGeoObject = require('../models/customers/customerUsedGeoObject');

class CustomerUsedGeoObjectServices{

    constructor(){
        this.customerUsedGeoObject = undefined;
        this.result = undefined;
    }
    
    async createNewCustomerUsedGeoObject(customerUsedGeoObjectData){
        this.customerUsedGeoObject = new CustomerUsedGeoObject(customerUsedGeoObjectData);
        this.result = await this.customerUsedGeoObject.save();
        return this.result;
    }
    //new
    async getCustomerUsedGeoObjectById(id){
        this.result = await CustomerUsedGeoObject.findCustomerUsedGeoObjectById(id);
        return this.result;
    }
    //new
    async getCustomerUsedGeoObjectByRef(ref, id){
        this.result = await CustomerUsedGeoObject.findCustomerUsedGeoObjectByRef(ref, id);
        return this.result;
    }
    async getAllCustomerUsedGeoObject(customerId){
        this.result = await CustomerUsedGeoObject.findAllCustomerUsedGeoObject(customerId);
        return this.result;
    }

    async updateCustomerUsedGeoObjectById(id, updateData){
        this.result = await CustomerUsedGeoObject.updateCustomerUsedGeoObjectById(id, updateData);
        return this.result;
    }

    async deleteCustomerUsedGeoObjectById(id, updateData){
        this.result = await CustomerUsedGeoObject.deleteCustomerUsedGeoObjectById(id);
        return this.result;
    }
}

exports.CustomerUsedGeoObjectServices = CustomerUsedGeoObjectServices;
