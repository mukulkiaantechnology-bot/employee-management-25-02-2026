const { sendError } = require('../utils/response');

const validate = (schema, target = 'body') => {
    return (req, res, next) => {
        const result = schema.safeParse(req[target]);
        if (!result.success) {
            sendError(res, 'Validation error', 400, 'VALIDATION_ERROR', result.error.flatten());
            return;
        }
        req[target] = result.data;
        next();
    };
};

module.exports = { validate };
