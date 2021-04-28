const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ApiError = require("../../error/ApiError");

const schema = new Schema(
	{
		companyId: {
			type: String,
			required: true
		},
		customerId: {
			type: Schema.Types.ObjectId,
			ref: "CustomerLogin",
			required: true
		}
	},
	{
		collection: "subscriptions"
	}
);

class HelperClass {
	static deleteByRef(ref, id, session) {
		if (session == undefined) {
			switch (ref) {
				case "customerId":
					return this.deleteMany({ customerId: id });
				case "companyId":
					return this.deleteMany({ companyId: id });
				default:
					throw ApiError.badRequest("ref not defined");
			}
		} else {
			switch (ref) {
				case "customerId":
					return this.deleteMany({ customerId: id }, { session });
				case "companyId":
					return this.deleteMany({ companyId: id }, { session });
				default:
					throw ApiError.badRequest("ref not defined");
			}
		}
	}
}

schema.loadClass(HelperClass);

module.exports = Subscription = mongoose.model("Subscription", schema);
