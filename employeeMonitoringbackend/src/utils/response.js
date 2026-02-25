const sendSuccess = (
    res,
    data,
    statusCode = 200,
    meta = null
) => {
    res.status(statusCode).json({ success: true, data, ...(meta && { meta }) });
};

const sendError = (
    res,
    message,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    details = null
) => {
    res.status(statusCode).json({ success: false, error: { code, message, details } });
};

module.exports = {
    sendSuccess,
    sendError,
};
