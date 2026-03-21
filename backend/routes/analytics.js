const express     = require('express');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/summary
// Returns total income, expense, balance, and transaction counts for a year
// ─────────────────────────────────────────────────────────────────────────────
router.get('/summary', async (req, res, next) => {
  try {
    const year = parseInt(req.query.year || new Date().getFullYear(), 10);

    const result = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lte: new Date(`${year}-12-31T23:59:59.999Z`),
          },
        },
      },
      {
        $group: {
          _id:   '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avg:   { $avg: '$amount' },
          min:   { $min: '$amount' },
          max:   { $max: '$amount' },
        },
      },
    ]);

    const income  = result.find(r => r._id === 'income')  || { total: 0, count: 0, avg: 0 };
    const expense = result.find(r => r._id === 'expense') || { total: 0, count: 0, avg: 0 };

    res.json({
      success: true,
      data: {
        year,
        totalIncome:     Math.round(income.total  * 100) / 100,
        totalExpense:    Math.round(expense.total * 100) / 100,
        balance:         Math.round((income.total - expense.total) * 100) / 100,
        savingsRate:     income.total > 0
          ? Math.round(((income.total - expense.total) / income.total) * 10000) / 100
          : 0,
        incomeCount:     income.count,
        expenseCount:    expense.count,
        avgIncome:       Math.round(income.avg  * 100) / 100,
        avgExpense:      Math.round(expense.avg * 100) / 100,
        totalTransactions: income.count + expense.count,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/monthly
// Returns 12-month breakdown of income / expense / net for a given year
// ─────────────────────────────────────────────────────────────────────────────
router.get('/monthly', async (req, res, next) => {
  try {
    const year = parseInt(req.query.year || new Date().getFullYear(), 10);

    const result = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: {
            $gte: new Date(year, 0,  1),
            $lte: new Date(year, 11, 31, 23, 59, 59),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            type:  '$type',
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const monthly = MONTHS.map((month, i) => {
      const inc = result.find(r => r._id.month === i + 1 && r._id.type === 'income');
      const exp = result.find(r => r._id.month === i + 1 && r._id.type === 'expense');
      const income  = Math.round((inc?.total || 0));
      const expense = Math.round((exp?.total || 0));
      return {
        month,
        monthNum: i + 1,
        income,
        expense,
        net:          income - expense,
        incomeCount:  inc?.count  || 0,
        expenseCount: exp?.count  || 0,
      };
    });

    res.json({ success: true, data: monthly });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/categories
// Category breakdown for income or expense; optionally filtered by month/year
// ─────────────────────────────────────────────────────────────────────────────
router.get('/categories', async (req, res, next) => {
  try {
    const {
      type  = 'expense',
      year  = new Date().getFullYear(),
      month,
    } = req.query;

    let dateFilter;
    if (month) {
      const m = parseInt(month, 10) - 1;
      const y = parseInt(year,  10);
      dateFilter = {
        $gte: new Date(y, m, 1),
        $lte: new Date(y, m + 1, 0, 23, 59, 59),
      };
    } else {
      const y = parseInt(year, 10);
      dateFilter = {
        $gte: new Date(y, 0,  1),
        $lte: new Date(y, 11, 31, 23, 59, 59),
      };
    }

    const result = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type,
          date:   dateFilter,
        },
      },
      {
        $group: {
          _id:   '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avg:   { $avg: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const grandTotal = result.reduce((s, r) => s + r.total, 0);

    res.json({
      success: true,
      data: result.map(r => ({
        category:   r._id,
        total:      Math.round(r.total * 100) / 100,
        count:      r.count,
        avg:        Math.round(r.avg   * 100) / 100,
        percentage: grandTotal > 0
          ? Math.round((r.total / grandTotal) * 10000) / 100
          : 0,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/trends
// Day-by-day running balance for current month
// ─────────────────────────────────────────────────────────────────────────────
router.get('/trends', async (req, res, next) => {
  try {
    const now   = new Date();
    const year  = parseInt(req.query.year  || now.getFullYear(),  10);
    const month = parseInt(req.query.month || now.getMonth() + 1, 10);

    const result = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: {
            $gte: new Date(year, month - 1, 1),
            $lte: new Date(year, month, 0, 23, 59, 59),
          },
        },
      },
      {
        $group: {
          _id: {
            day:  { $dayOfMonth: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.day': 1 } },
    ]);

    const daysInMonth = new Date(year, month, 0).getDate();
    let   runningBalance = 0;
    const trend = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const inc = result.find(r => r._id.day === d && r._id.type === 'income');
      const exp = result.find(r => r._id.day === d && r._id.type === 'expense');
      runningBalance += (inc?.total || 0) - (exp?.total || 0);
      trend.push({
        day:     d,
        income:  Math.round(inc?.total || 0),
        expense: Math.round(exp?.total || 0),
        balance: Math.round(runningBalance),
      });
    }

    res.json({ success: true, data: trend });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/compare
// Compare two consecutive months
// ─────────────────────────────────────────────────────────────────────────────
router.get('/compare', async (req, res, next) => {
  try {
    const now  = new Date();
    const year = parseInt(req.query.year  || now.getFullYear(),  10);
    const month= parseInt(req.query.month || now.getMonth() + 1, 10);

    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear  = month === 1 ? year - 1 : year;

    const buildMatch = (y, m) => ({
      userId: req.user._id,
      date: {
        $gte: new Date(y, m - 1, 1),
        $lte: new Date(y, m,     0, 23, 59, 59),
      },
    });

    const [current, previous] = await Promise.all([
      Transaction.aggregate([
        { $match: buildMatch(year, month) },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Transaction.aggregate([
        { $match: buildMatch(prevYear, prevMonth) },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
    ]);

    const extract = (arr) => ({
      income:  arr.find(r => r._id === 'income') ?.total || 0,
      expense: arr.find(r => r._id === 'expense')?.total || 0,
    });

    const cur  = extract(current);
    const prev = extract(previous);

    const pct = (a, b) => b > 0 ? Math.round(((a - b) / b) * 10000) / 100 : null;

    res.json({
      success: true,
      data: {
        current: {
          month: month, year,
          income:  Math.round(cur.income),
          expense: Math.round(cur.expense),
          balance: Math.round(cur.income - cur.expense),
        },
        previous: {
          month: prevMonth, year: prevYear,
          income:  Math.round(prev.income),
          expense: Math.round(prev.expense),
          balance: Math.round(prev.income - prev.expense),
        },
        change: {
          incomePct:  pct(cur.income,  prev.income),
          expensePct: pct(cur.expense, prev.expense),
          balancePct: pct(cur.income - cur.expense, prev.income - prev.expense),
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
