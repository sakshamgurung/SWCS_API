const AdminGraph = require("../models/graph/adminGraphData");
const _ = require("lodash");
class AdminServices {
	constructor() {
		this.result = undefined;
	}

	async getAdminGraphData() {
		this.result = await AdminGraph.find();
		console.log("this.result", this.result);
		return this.result;
	}
}

exports.AdminServices = AdminServices;
