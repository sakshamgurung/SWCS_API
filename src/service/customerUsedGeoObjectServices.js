const CustomerUsedGeoObject = require("../models/customers/customerUsedGeoObject");
const _ = require("lodash");
class CustomerUsedGeoObjectServices {
	constructor() {
		this.customerUsedGeoObject = undefined;
		this.result = undefined;
	}

	async getCustomerUsedGeoObjectByRef(ref, id, query) {
		this.result = await CustomerUsedGeoObject.findByRef(ref, id, query).populate("customerId", "email mobileNo");
		return this.result;
	}

	async getCustomerUsedGeoObjectById(id) {
		this.result = await CustomerUsedGeoObject.findById(id).populate("customerId", "email mobileNo");
		return this.result;
	}
}

exports.CustomerUsedGeoObjectServices = CustomerUsedGeoObjectServices;
