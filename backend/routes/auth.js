const express = require('express');
const { body } = require('express-validator');
const User     = require('../models/User');
const { protect }   = require('../middleware/auth');
const { validate }  = require('../middleware/validate');
const { sendToken } = require('../utils/jwt');

const router = express.Router();

// ── Validation rules
const signupRules = [
  body('name')    .trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name too short'),
  body('email')   .isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];
const loginRules = [
  body('email')   .isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// ────────────────────────────────────────────────────────────────────────────
// POST /api/auth/signup
// ────────────────────────────────────────────────────────────────────────────
router.post('/signup', signupRules, validate, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Email is already registered.' });
    }

    const user = await User.create({ name, email, password });
    sendToken(res, 201, user, 'Account created successfully.');
  } catch (err) {
    next(err);
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ────────────────────────────────────────────────────────────────────────────
router.post('/login', loginRules, validate, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    sendToken(res, 200, user, 'Login successful.');
  } catch (err) {
    next(err);
  }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me  (protected)
// ────────────────────────────────────────────────────────────────────────────
router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: req.user.toPublic() });
});

// ────────────────────────────────────────────────────────────────────────────
// PUT /api/auth/profile  (protected)
// ────────────────────────────────────────────────────────────────────────────
router.put(
  '/profile',
  protect,
  [
    body('name').optional().trim().isLength({ min: 2 }).withMessage('Name too short'),
    body('currency').optional().isIn(['USD','EUR','GBP','INR','JPY','CAD','AUD']).withMessage('Invalid currency'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, currency, theme } = req.body;
      const updates = {};
      if (name)     updates.name     = name;
      if (currency) updates.currency = currency;
      if (theme)    updates.theme    = theme;

      const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true, runValidators: true,
      });
      res.json({ success: true, user: user.toPublic() });
    } catch (err) {
      next(err);
    }
  }
);

// ────────────────────────────────────────────────────────────────────────────
// PUT /api/auth/password  (protected)
// ────────────────────────────────────────────────────────────────────────────
router.put(
  '/password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id).select('+password');
      if (!(await user.comparePassword(currentPassword))) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
      }
      user.password = newPassword;
      await user.save();
      sendToken(res, 200, user, 'Password updated successfully.');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
