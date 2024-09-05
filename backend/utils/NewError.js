const errorDictionary = require("../utils/ErrorDictionary");

class NewError extends Error {
	constructor(message, httpCode, isOperational = true) {
		super(message);
		this.httpCode = httpCode;
		this.status = errorDictionary[httpCode] || "Unknown Error";
		this.isOperational = isOperational;
		Error.captureStackTrace(this, this.constructor);
	}
}

module.exports = NewError;