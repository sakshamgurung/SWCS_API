const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
	{
		adminId: {
			type: Schema.Types.ObjectId,
			ref: "SuperAdmin"
		},
		activeorg: {
			type: String
		},
		activereq: {
			type: String
		},
		date: {
			type: Date,
			default: Date.now
		}
	},

	{
		collection: "adminGraphData"
	}
);

module.exports = mongoose.model("AdminGraphData", schema);
