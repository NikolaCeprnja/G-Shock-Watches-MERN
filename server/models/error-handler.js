class ErrorHandler extends Error {
	constructor(message, errorCode) {
		super(message);
		this.statusCode = errorCode;
	}
}

module.exports = ErrorHandler;
