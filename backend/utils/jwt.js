const jwt = require('jsonwebtoken');

const SECRET  = process.env.JWT_SECRET     || 'dev_secret_change_in_production';
const EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Sign a JWT for the given user ID
 */
const signToken = (id) => jwt.sign({ id }, SECRET, { expiresIn: EXPIRES });

/**
 * Send token + user object in response
 */
const sendToken = (res, statusCode, user, message = 'Success') => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: user.toPublic ? user.toPublic() : user,
  });
};

module.exports = { signToken, sendToken };
