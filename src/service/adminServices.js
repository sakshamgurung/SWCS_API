const AdminGraph = require("../models/graph/adminGraphData");

class AdminServices {
	constructor() {
		this.result = undefined;
	}

	async getAdminGraphData(adminId) {
		console.log("adminId", adminId);
		this.result = await AdminGraph.find({ adminId: adminId });
		console.log("this.result", this.result);
		return this.result;
	}
}

exports.AdminServices = AdminServices;
