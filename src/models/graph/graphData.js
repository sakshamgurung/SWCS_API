const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
	{
		companyId: {
			type: Schema.Types.ObjectId,
			ref:"CompanyLogin",
		},
		subscribers: {
			type: String
		},
		staff: {
			type: String
		},
		vehicle: {
			type: String
		},
		date: {
			type: Date,
			default: Date.now
		}
	},

	{
		collection: "graphData"
	}
);

module.exports = mongoose.model("GraphData", schema);
