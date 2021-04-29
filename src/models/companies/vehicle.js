const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
	{
		companyId: {
			type: String,
			ref:"CompanyLogin",
			required: true
		},
		isReserved: {
			type: Boolean,
			required: true
		},
		brandName: {
			type: String,
			required: true
		},
		modalNo: {
			type: String
		},
		plateNo: {
			type: String,
			required: true
		},
		vehicleType: {
			type: String,
			required: true,
			enum: ["light", "medium", "heavy"]
		},
		vehicleColor: {
			type: String
		},
		fuelCapacity: {
			type: Number
		},
		fuelCapacityUnit: {
			type: String,
			enum: ["litre"]
		},
		wasteCapacity: {
			type: Number
		},
		wasteCapacityUnit: {
			type: String,
			enum: ["kg", "litre", "metric cube"]
		},
		description: {
			type: String
		}
	},
	{
		collection: "vehicles"
	}
);

class HelperClass {
	static findByRef(ref, id, query, projection, session) {
		if (session == undefined) {
			switch (ref) {
				case "companyId":
					return this.find({ $and: [{ companyId: id }, query] }, projection);
				default:
					throw ApiError.badRequest("ref not defined");
			}
		} else {
			switch (ref) {
				case "companyId":
					return this.find({ $and: [{ companyId: id }, query] }, projection, { session });
				default:
					throw ApiError.badRequest("ref not defined");
			}
		}
	}

	static deleteByRef(ref, id, session) {
		if (session == undefined) {
			switch (ref) {
				case "companyId":
					return this.deleteOne({ companyId: id });
				default:
					throw ApiError.badRequest("ref not defined");
			}
		} else {
			switch (ref) {
				case "companyId":
					return this.deleteOne({ companyId: id }, { session });
				default:
					throw ApiError.badRequest("ref not defined");
			}
		}
	}
}

schema.loadClass(HelperClass);

module.exports = Vehicle = mongoose.model("Vehicle", schema);
