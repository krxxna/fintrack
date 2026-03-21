import { CATEGORIES, MONTHS } from '../constants/categories';

const EXPENSE_PRESETS = [
  { category: 'Food & Dining',     notes: ['Grocery run', 'Dinner out', 'Coffee & snacks', 'Lunch delivery'],           min: 25,  max: 180 },
  { category: 'Shopping',          notes: ['Online order', 'Clothing haul', 'Electronics', 'Home decor'],               min: 40,  max: 350 },
  { category: 'Travel',            notes: ['Flight tickets', 'Hotel stay', 'Weekend trip', 'Taxi'],                     min: 80,  max: 500 },
  { category: 'Bills & Utilities', notes: ['Electricity', 'Internet bill', 'Phone plan', 'Water bill'],                 min: 40,  max: 200 },
  { category: 'Entertainment',     notes: ['Netflix & Spotify', 'Movie night', 'Concert tickets', 'Gaming'],            min: 15,  max: 120 },
  { category: 'Healthcare',        notes: ['Pharmacy', 'Doctor visit', 'Gym membership', 'Vitamins'],                   min: 20,  max: 250 },
  { category: 'Education',         notes: ['Online course', 'Books', 'Workshop', 'Certification'],                      min: 30,  max: 300 },
  { category: 'Transport',         notes: ['Gas fill-up', 'Uber rides', 'Parking fees', 'Car maintenance'],             min: 20,  max: 150 },
];

const INCOME_PRESETS = [
  { category: 'Salary',     notes: ['Monthly salary', 'Bi-weekly pay'],                          min: 4500, max: 6500 },
  { category: 'Freelance',  notes: ['Design project', 'Consulting gig', 'Dev work', 'Writing'],  min: 300,  max: 1800 },
  { category: 'Investment', notes: ['Dividends', 'Stock gain', 'ETF return'],                     min: 100,  max: 800  },
  { category: 'Gift',       notes: ['Birthday gift', 'Bonus', 'Cashback reward'],                 min: 50,   max: 500  },
];

const rand = (min, max) => Math.round((Math.random() * (max - min) + min) * 100) / 100;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function generateMockTransactions() {
  const now = new Date();
  const transactions = [];
  let id = 1;

  for (let m = 0; m < 6; m++) {
    const year  = now.getFullYear();
    const month = now.getMonth() - m;

    // 1–2 income entries per month
    const incomes = [
      INCOME_PRESETS[0], // always salary
      ...(Math.random() > 0.35 ? [pick(INCOME_PRESETS.slice(1))] : []),
    ];
    incomes.forEach(preset => {
      transactions.push({
        _id: String(id++),
        type: 'income',
        amount: rand(preset.min, preset.max),
        category: preset.category,
        note: pick(preset.notes),
        date: new Date(year, month, Math.floor(Math.random() * 26) + 1).toISOString(),
      });
    });

    // 4–8 expense entries per month
    const expenseCount = Math.floor(Math.random() * 4) + 5;
    const shuffled = [...EXPENSE_PRESETS].sort(() => Math.random() - 0.5);
    shuffled.slice(0, expenseCount).forEach(preset => {
      transactions.push({
        _id: String(id++),
        type: 'expense',
        amount: rand(preset.min, preset.max),
        category: preset.category,
        note: pick(preset.notes),
        date: new Date(year, month, Math.floor(Math.random() * 26) + 1).toISOString(),
      });
    });
  }

  return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
}
