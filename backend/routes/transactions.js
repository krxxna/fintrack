const express     = require('express');
const { body, query, param } = require('express-validator');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// All transaction routes require authentication
router.use(protect);

// ── Validation rules
const txnRules = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),
  body('category')
    .isIn(Transaction.CATEGORIES)
    .withMessage('Invalid category'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Note cannot exceed 200 characters'),
];

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/transactions
// Query params: type, category, month, year, search, page, limit, sortBy, sortOrder
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const {
      type,
      category,
      month,
      year,
      search,
      page      = 1,
      limit     = 20,
      sortBy    = 'date',
      sortOrder = 'desc',
    } = req.query;

    const filter = { userId: req.user._id };

    // Type filter
    if (type && ['income', 'expense'].includes(type)) {
      filter.type = type;
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Date range filter
    if (month && year) {
      const m    = parseInt(month, 10) - 1; // 0-indexed
      const y    = parseInt(year,  10);
      const start = new Date(y, m, 1);
      const end   = new Date(y, m + 1, 0, 23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    } else if (year) {
      filter.date = {
        $gte: new Date(parseInt(year, 10), 0,  1),
        $lte: new Date(parseInt(year, 10), 11, 31, 23, 59, 59),
      };
    }

    // Full-text search on note & category
    if (search) {
      filter.$or = [
        { note:     { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const pageNum  = Math.max(1, parseInt(page,  10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    // Sorting
    const allowedSort = ['date', 'amount', 'category', 'createdAt'];
    const sort = {
      [allowedSort.includes(sortBy) ? sortBy : 'date']:
        sortOrder === 'asc' ? 1 : -1,
    };

    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort(sort).skip(skip).limit(limitNum),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page:  pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/transactions
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', txnRules, validate, async (req, res, next) => {
  try {
    const { amount, type, category, date, note } = req.body;
    const transaction = await Transaction.create({
      userId:   req.user._id,
      amount,
      type,
      category,
      date:     date || new Date(),
      note:     note?.trim() || '',
    });
    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/transactions/:id
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id:    req.params.id,
      userId: req.user._id,
    });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }
    res.json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/transactions/:id
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id', txnRules, validate, async (req, res, next) => {
  try {
    const { amount, type, category, date, note } = req.body;
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { amount, type, category, date, note: note?.trim() || '' },
      { new: true, runValidators: true }
    );
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }
    res.json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/transactions/:id  (partial update)
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id', async (req, res, next) => {
  try {
    const allowed = ['amount', 'type', 'category', 'date', 'note'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }
    res.json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/transactions/:id
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id:    req.params.id,
      userId: req.user._id,
    });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }
    res.json({ success: true, message: 'Transaction deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/transactions  (bulk delete by IDs)
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/', async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Provide an array of IDs.' });
    }
    const result = await Transaction.deleteMany({
      _id:    { $in: ids },
      userId: req.user._id,
    });
    res.json({ success: true, deleted: result.deletedCount });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
