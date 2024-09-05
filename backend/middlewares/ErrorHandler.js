const errorDictionary = require("../utils/ErrorDictionary");

const devError = (err, res) => {
    console.log(err);
    const httpCode = err.isOperational ? err.httpCode : 500;

    res.status(httpCode).json({
        message: err.message ?? "something went wrong",
        status: err.status,
        stack: err.stack,
        error: err
    });
};

const prodError = (err, res) => {
    if (err.isOperational) {
        // trusted, operational error
        res.status(err.httpCode).json({
            message: err.message,
            status: err.status
        });
    } else {
        // untrusted error
        res.status(500).json({
            message: "something went wrong",
            status: errorDictionary[500]
        });
    }
};

const ErrorHandler = (err, req, res, next) => {
    if (process.env.NODE_ENV === "development") {
        devError(err, res);
    } else if (process.env.NODE_ENV === "production") {
        // TODO: handle errors based on names
        // err.name = JsonWebTokenError => cast errors to prod errors etc
        prodError(err, res);
    }
};

module.exports = ErrorHandler;