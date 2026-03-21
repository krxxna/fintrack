const mongoose = require('mongoose');

const CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Travel',
  'Bills & Utilities',
  'Entertainment',
  'Healthcare',
  'Education',
  'Transport',
  'Salary',
  'Freelance',
  'Investment',
  'Gift',
  'Other',
];

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },
    amount: {
      type:     Number,
      required: [true, 'Amount is required'],
      min:      [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type:     String,
      enum:     ['income', 'expense'],
      required: [true, 'Transaction type is required'],
    },
    category: {
      type:     String,
      enum:     CATEGORIES,
      required: [true, 'Category is required'],
    },
    date: {
      type:    Date,
      default: Date.now,
    },
    note: {
      type:      String,
      trim:      true,
      maxlength: [200, 'Note cannot exceed 200 characters'],
      default:   '',
    },
  },
  {
    timestamps: true,
  }
);

// ── Compound indexes for fast user-scoped queries
transactionSchema.index({ userId: 1, date:     -1 });
transactionSchema.index({ userId: 1, type:      1 });
transactionSchema.index({ userId: 1, category:  1 });
transactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
module.exports.CATEGORIES = CATEGORIES;
