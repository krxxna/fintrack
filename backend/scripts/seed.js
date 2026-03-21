/**
 * Seed script – creates a demo user and 6 months of realistic transactions.
 *
 * Usage:
 *   cd backend
 *   node scripts/seed.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose   = require('mongoose');
const User        = require('../models/User');
const Transaction = require('../models/Transaction');

// ── Seed config
const DEMO_USER = {
  name:     'Alex Morgan',
  email:    'demo@fintrack.app',
  password: 'demo123456',
  currency: 'USD',
};

const EXPENSE_TEMPLATES = [
  { category: 'Food & Dining',     notes: ['Grocery run', 'Restaurant dinner', 'Coffee shop', 'Lunch delivery', 'Meal prep'],      minAmt: 25,  maxAmt: 180 },
  { category: 'Shopping',          notes: ['Amazon order', 'Clothing', 'Electronics', 'Home goods', 'Online shopping'],            minAmt: 35,  maxAmt: 350 },
  { category: 'Bills & Utilities', notes: ['Electricity bill', 'Internet plan', 'Phone bill', 'Water bill', 'Gas bill'],           minAmt: 45,  maxAmt: 220 },
  { category: 'Entertainment',     notes: ['Netflix subscription', 'Spotify', 'Movie tickets', 'Gaming', 'Concert tickets'],       minAmt: 12,  maxAmt: 150 },
  { category: 'Healthcare',        notes: ['Pharmacy', 'Doctor visit', 'Gym membership', 'Dental checkup'],                        minAmt: 20,  maxAmt: 280 },
  { category: 'Travel',            notes: ['Flight booking', 'Hotel stay', 'Weekend trip', 'Taxi/Uber', 'Travel insurance'],       minAmt: 60,  maxAmt: 600 },
  { category: 'Education',         notes: ['Online course', 'Books', 'Workshop', 'Udemy course', 'Professional certification'],    minAmt: 20,  maxAmt: 250 },
  { category: 'Transport',         notes: ['Gas fill-up', 'Uber rides', 'Parking fees', 'Car wash', 'Bus pass'],                  minAmt: 15,  maxAmt: 130 },
];

const INCOME_TEMPLATES = [
  { category: 'Salary',     notes: ['Monthly salary', 'Bi-weekly paycheck'],                                minAmt: 4800, maxAmt: 6200 },
  { category: 'Freelance',  notes: ['Design project', 'Dev consulting', 'Writing gig', 'Video editing'],   minAmt: 300,  maxAmt: 2000 },
  { category: 'Investment', notes: ['Stock dividends', 'ETF return', 'Index fund gain', 'Crypto gain'],     minAmt: 80,   maxAmt: 700  },
  { category: 'Gift',       notes: ['Birthday gift', 'Performance bonus', 'Cash back reward', 'Tax refund'], minAmt: 50, maxAmt: 600  },
];

const rand    = (min, max) => +(Math.random() * (max - min) + min).toFixed(2);
const pick    = (arr)      => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fintrack');
    console.log('✅  MongoDB connected');

    // ── Clear existing demo data
    const existing = await User.findOne({ email: DEMO_USER.email });
    if (existing) {
      await Transaction.deleteMany({ userId: existing._id });
      await User.deleteOne({ _id: existing._id });
      console.log('🗑   Cleared existing demo data');
    }

    // ── Create demo user
    const user = await User.create(DEMO_USER);
    console.log(`👤  Created demo user: ${user.email}`);

    // ── Generate 6 months of transactions
    const transactions = [];
    const now          = new Date();

    for (let m = 0; m < 6; m++) {
      const targetMonth = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const daysInMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();

      // ── Income (1-2 per month)
      const incomeSlots = [
        INCOME_TEMPLATES[0],                                         // always salary
        ...(Math.random() > 0.3 ? [pick(INCOME_TEMPLATES.slice(1))] : []),
      ];
      incomeSlots.forEach(tpl => {
        transactions.push({
          userId:   user._id,
          type:     'income',
          amount:   rand(tpl.minAmt, tpl.maxAmt),
          category: tpl.category,
          note:     pick(tpl.notes),
          date:     new Date(targetMonth.getFullYear(), targetMonth.getMonth(), randInt(1, daysInMonth)),
        });
      });

      // ── Expenses (5-9 per month)
      const expenseCount = randInt(5, 9);
      const shuffled     = [...EXPENSE_TEMPLATES].sort(() => Math.random() - 0.5);
      shuffled.slice(0, expenseCount).forEach(tpl => {
        const txnDate = new Date(
          targetMonth.getFullYear(),
          targetMonth.getMonth(),
          randInt(1, daysInMonth)
        );
        // Some categories appear multiple times per month
        const repeat = (tpl.category === 'Food & Dining' || tpl.category === 'Transport')
          ? randInt(2, 4)
          : 1;
        for (let r = 0; r < repeat; r++) {
          transactions.push({
            userId:   user._id,
            type:     'expense',
            amount:   rand(tpl.minAmt, tpl.maxAmt),
            category: tpl.category,
            note:     pick(tpl.notes),
            date:     new Date(
              targetMonth.getFullYear(),
              targetMonth.getMonth(),
              randInt(1, daysInMonth)
            ),
          });
        }
      });
    }

    await Transaction.insertMany(transactions);
    console.log(`💰  Created ${transactions.length} transactions across 6 months`);

    console.log('\n─────────────────────────────────────────');
    console.log('🎉  Seed complete!');
    console.log('   Email:    demo@fintrack.app');
    console.log('   Password: demo123456');
    console.log('─────────────────────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('❌  Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
