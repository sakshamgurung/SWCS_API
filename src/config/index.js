const dotenv = require("dotenv");

process.env.NODE_ENV = process.env.NODE_ENV || "development";
process.env.PWD = process.cwd();
if (process.env.NODE_ENV === "development") {
	const envFound = dotenv.config();
	if (envFound.error) {
		throw new Error("Couldn't find .env file");
	}
}

/**
 * if heroku error: Cannot read property 'split' of null
 * check env config variables and make sure database uri does not contain quotes in uri
 * or
 * you can set username and password as env config variables and use them with template literals in mongoose connect
 *
 *
 * conversion from ascii to base64 so that we can use this in our .env
 * const base64String = Buffer.from(JSON.stringify(
 *     {
 *         //key:value
 *     }
 * )).toString('base64');
 *  */

// conversion from base64 to ascii to java object
const FCM_CONFIG = JSON.parse(Buffer.from(process.env.FCM_CONFIG_BASE64, "base64").toString("ascii"));

module.exports = {
	port: parseInt(process.env.PORT, 10) || 5000,
	databaseURL: process.env.MONGODB_URI,
	remoteDatabaseURL: process.env.MONGODB_ATLAS_URI,
	fcmURL: process.env.FCM_DATABASE_URL,
	fcmConfig: FCM_CONFIG,
	jwtSecret: process.env.JWT_SECRET,
	pwd: process.env.PWD,
};
