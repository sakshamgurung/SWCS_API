const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
	{
		companyId: {
			type: String,
			ref: "CompanyLogin",
			required: true,
		},
		email: {
			type: String,
		},
		mobileNo: {
			type: String,
		},
		password: {
			type: String,
			required: true,
		},
		uuid: [String],
		firstTimeLogin: {
			type: Boolean,
		},
		resetToken: {
			type: String,
		},
		resetTokenTimeStamp: {
			type: String,
		},
		token: {
			type: String,
			//required:true
		},
		refreshToken: {
			type: String,
			//required:true,
		},
		timeStamp: {
			type: Schema.Types.Date,
			//required:true,
		},
	},
	{
		collection: "staffLogins",
	}
);

class HelperClass {
	static findByUUID(uuidArray, query, projection, session) {
		if (session == undefined) {
			return this.find(
				{ $and: [{ uuid: { $in: uuidArray } }, query] },
				projection
			);
		} else {
			return this.find(
				{ $and: [{ uuid: { $in: uuidArray } }, query] },
				projection,
				{ session }
			);
		}
	}

	static findByRef(ref, id, query, projection, session) {
		if (session == undefined) {
			switch (ref) {
				case "companyId":
					return this.find(
						{ $and: [{ companyId: id }, query] },
						projection
					);
				default:
					throw ApiError.badRequest("ref not defined");
			}
		} else {
			switch (ref) {
				case "companyId":
					return this.find(
						{ $and: [{ companyId: id }, query] },
						projection,
						{ session }
					);
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
				default:
					throw ApiError.badRequest("ref not defined");
			}
		} else {
			switch (ref) {
				case "companyId":
					return this.deleteMany({ companyId: id }, { session });
				default:
					throw ApiError.badRequest("ref not defined");
			}
		}
	}
}

schema.loadClass(HelperClass);

module.exports = StaffLogin = mongoose.model("StaffLogin", schema);
