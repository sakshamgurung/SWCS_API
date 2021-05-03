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
		staffId: {
			type: String,
			ref: "StaffLogin",
			required: true,
		},
		personalId: {
			idType: String, //citizenship, driver licence, passport
			idNo: String,
		},
		name: {
			firstName: String,
			lastName: String,
		},
		joinedDate: {
			type: String,
		},
		postTitle: {
			type: String,
		},
		staffGroupId: {
			type: String,
			ref: "StaffGroup",
		},
		address: {
			province: String,
			district: String,
			city: String,
			wardNo: String,
			street: String,
		},
		contactNo: {
			type: String,
		},
	},
	{
		collection: "staffDetails",
	}
);

class HelperClass {
	static findAllByStaffGroupIdArray(idArray, query, projection, session) {
		if (session == undefined) {
			return this.find({ $and: [{ staffGroupId: { $in: idArray } }, query] }, projection);
		} else {
			return this.find({ $and: [{ staffGroupId: { $in: idArray } }, query] }, projection, { session });
		}
	}

	static findByRef(ref, id, query, projection, session) {
		if (session == undefined) {
			switch (ref) {
				case "companyId":
					return this.find({ $and: [{ companyId: id }, query] }, projection);
				case "staffId":
					return this.find({ $and: [{ staffId: id }, query] }, projection);
				case "staffGroupId":
					return this.find({ $and: [{ staffGroupId: id }, query] }, projection);
				default:
					throw ApiError.badRequest("ref not defined");
			}
		} else {
			switch (ref) {
				case "companyId":
					return this.find({ $and: [{ companyId: id }, query] }, projection, { session });
				case "staffId":
					return this.find({ $and: [{ staffId: id }, query] }, projection, { session });
				case "staffGroupId":
					return this.find({ $and: [{ staffGroupId: id }, query] }, projection, { session });
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
				case "staffId":
					return this.updateMany({ staffId: id }, this.translateAliases(updateData));
				case "staffGroupId":
					return this.updateMany({ staffGroupId: id }, this.translateAliases(updateData));
				default:
					throw ApiError.badRequest("ref not defined");
			}
		} else {
			switch (ref) {
				case "companyId":
					return this.updateMany({ companyId: id }, this.translateAliases(updateData), { session });
				case "staffId":
					return this.updateMany({ staffId: id }, this.translateAliases(updateData), { session });
				case "staffGroupId":
					return this.updateMany({ staffGroupId: id }, this.translateAliases(updateData), { session });
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
				case "staffId":
					return this.deleteMany({ staffId: id });
				case "staffGroupId":
					return this.deleteMany({ staffGroupId: id });
				default:
					throw ApiError.badRequest("ref not defined");
			}
		} else {
			switch (ref) {
				case "companyId":
					return this.deleteMany({ companyId: id }, { session });
				case "staffId":
					return this.deleteMany({ staffId: id }, { session });
				case "staffGroupId":
					return this.deleteMany({ staffGroupId: id }, { session });
				default:
					throw ApiError.badRequest("ref not defined");
			}
		}
	}
}

schema.loadClass(HelperClass);

module.exports = StaffDetail = mongoose.model("StaffDetail", schema);
