const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ApiError = require("../../error/ApiError");

const schema = new Schema(
	{
		companyId: {
			type: String,
			ref: "CompanyLogin",
			required: true,
		},
		activeDays: {
			type: [Boolean], //7 for 7 days of a week
		},
		startTime: {
			type: String,
		},
		endTime: {
			type: String,
		},
		isDateRange: {
			type: Boolean,
		},
		startDate: {
			type: String,
			//type:Schema.Types.Date,
		},
		endDate: {
			type: String,
			//type:Schema.Types.Date,
		},
		staffGroupId: {
			type: String,
			ref: "StaffGroup",
		},
		workTitle: {
			type: String,
		},
		workDescription: {
			type: String,
		},
		toDoList: {
			type: [
				{
					_id: false,
					toDo: {
						type: String,
					},
					completed: Boolean,
				},
			],
		},
		workStatus: {
			type: String,
			enum: ["unconfirmed", "confirmed", "on progress", "finished"],
		},
		vehicleId: {
			type: String,
			ref: "Vehicle",
		},
		geoObjectTrackId: [
			{
				type: [String],
				ref: "Track",
			},
		],
	},
	{
		collection: "works",
	}
);

class HelperClass {
	static findAll(role, id, query, projection, session) {
		if (session == undefined) {
			switch (role) {
				case "company":
					return this.find({ $and: [{ companyId: id }, query] }, projection);
				case "staff":
					return this.find({ $and: [{ staffGroupId: id }, query] }, projection);
				default:
					throw ApiError.badRequest("role not defined");
			}
		} else {
			switch (role) {
				case "company":
					return this.find({ $and: [{ companyId: id }, query] }, projection, { session });
				case "staff":
					return this.find({ $and: [{ staffGroupId: id }, query] }, projection, { session });
				default:
					throw ApiError.badRequest("role not defined");
			}
		}
	}

	static findByRef(ref, id, query, projection, session) {
		if (session == undefined) {
			switch (ref) {
				case "companyId":
					return this.find({ $and: [{ companyId: id }, query] }, projection);
				case "staffGroupId":
					return this.find({ $and: [{ staffGroupId: id }, query] }, projection);
				case "vehicleId":
					return this.find({ $and: [{ vehicleId: id }, query] }, projection);
				case "geoObjectTrackId":
					return this.find({ $and: [{ geoObjectTrackId: id }, query] }, projection);
				default:
					throw ApiError.badRequest("ref not defined");
			}
		} else {
			switch (ref) {
				case "companyId":
					return this.find({ $and: [{ companyId: id }, query] }, projection, { session });
				case "staffGroupId":
					return this.find({ $and: [{ staffGroupId: id }, query] }, projection, { session });
				case "vehicleId":
					return this.find({ $and: [{ vehicleId: id }, query] }, projection, { session });
				case "geoObjectTrackId":
					return this.find({ $and: [{ geoObjectTrackId: id }, query] }, projection, { session });
				default:
					throw ApiError.badRequest("ref not defined");
			}
		}
	}

	static updateByRef(ref, id, updateData, session) {
		if (session == undefined) {
			switch (ref) {
				case "companyId":
					return this.updateMany({ companyId: id }, this.translateAliases(updateData));
				case "staffGroupId":
					return this.updateMany({ staffGroupId: id }, this.translateAliases(updateData));
				case "vehicleId":
					return this.updateMany({ vehicleId: id }, this.translateAliases(updateData));
				case "geoObjectTrackId":
					return this.updateMany({ geoObjectTrackId: id }, this.translateAliases(updateData));
				default:
					throw ApiError.badRequest("ref not defined");
			}
		} else {
			switch (ref) {
				case "companyId":
					return this.updateMany({ companyId: id }, this.translateAliases(updateData), { session });
				case "staffGroupId":
					return this.updateMany({ staffGroupId: id }, this.translateAliases(updateData), { session });
				case "vehicleId":
					return this.updateMany({ vehicleId: id }, this.translateAliases(updateData), { session });
				case "geoObjectTrackId":
					return this.updateMany({ geoObjectTrackId: id }, this.translateAliases(updateData), { session });
				default:
					throw ApiError.badRequest("ref not defined");
			}
		}
	}

	static deleteByRef(ref, id, session) {
		if (session == undefined) {
			switch (ref) {
				case "companyId":
					return this.deleteMany({ companyId: id });
				case "staffGroupId":
					return this.deleteMany({ staffGroupId: id });
				case "vehicleId":
					return this.deleteMany({ vehicleId: id });
				case "geoObjectTrackId":
					return this.deleteMany({ geoObjectTrackId: id });
				default:
					throw ApiError.badRequest("ref not defined");
			}
		} else {
			switch (ref) {
				case "companyId":
					return this.deleteMany({ companyId: id }, { session });
				case "staffGroupId":
					return this.deleteMany({ staffGroupId: id }, { session });
				case "vehicleId":
					return this.deleteMany({ vehicleId: id }, { session });
				case "geoObjectTrackId":
					return this.deleteMany({ geoObjectTrackId: id }, { session });
				default:
					throw ApiError.badRequest("ref not defined");
			}
		}
	}
}

schema.loadClass(HelperClass);

module.exports = Work = mongoose.model("Work", schema);
