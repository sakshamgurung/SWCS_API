const CustomerUsedGeoObject = require('../models/customers/customerUsedGeoObject');

class CustomerUsedGeoObjectServices{

    constructor(){
        this.customerUsedGeoObject = undefined;
        this.result = undefined;
    }

    async getCustomerUsedGeoObjectByRef(ref, id){
        this.result = await CustomerUsedGeoObject.findByRef(ref, id);
        return this.result;
    }

    async getCustomerUsedGeoObjectById(id){
        this.result = await CustomerUsedGeoObject.findById(id);
        return this.result;
    }

    async getCustomerUsedGeoObjectByRef(ref, id){
        this.result = await CustomerUsedGeoObject.findByRef(ref, id);
        return this.result;
    }

}

exports.CustomerUsedGeoObjectServices = CustomerUsedGeoObjectServices;
