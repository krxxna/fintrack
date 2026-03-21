const { validationResult } = require('express-validator');

/**
 * Run after express-validator rules.
 * Returns 422 with all validation errors if any.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: errors.array()[0].msg,
      errors:  errors.array(),
    });
  }
  next();
};

module.exports = { validate };
