const bcrypt = require('bcryptjs');
const { env } = require('../config/env');

const hashPassword = async (password) => {
    return bcrypt.hash(password, env.BCRYPT_ROUNDS);
};

const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};

module.exports = {
    hashPassword,
    comparePassword,
};
