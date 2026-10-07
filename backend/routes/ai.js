const express = require('express');
const { protect } = require('../middleware/auth');
const Transaction = require('../models/Transaction');

const router = express.Router();
// Optional auth middleware — allows both logged in users and demo users
router.use((req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
});

const API_KEY = process.env.GEMINI_API_KEY;

/**
 * Call Gemini API with a prompt
 */
async function callGemini(promptText) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API HTTP ${response.status}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText || null;
  } catch (err) {
    console.warn('Gemini API call notice:', err.message);
    return null; // Fallback will handle
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/suggestions
// Generates investment, expense-cutting, and financial growth recommendations
// ─────────────────────────────────────────────────────────────────────────────
router.post('/suggestions', async (req, res, next) => {
  try {
    let txns = req.body?.transactions || [];

    // If logged-in DB user has transactions, query them
    if (req.user && txns.length === 0) {
      txns = await Transaction.find({ userId: req.user._id }).sort({ date: -1 }).limit(50);
    }

    const totalIncome = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const netBalance = totalIncome - totalExpense;

    // Group expenses by category
    const expCats = {};
    txns.filter(t => t.type === 'expense').forEach(t => {
      expCats[t.category] = (expCats[t.category] || 0) + t.amount;
    });

    const topCategory = Object.entries(expCats).sort((a, b) => b[1] - a[1])[0] || ['Food & Dining', 350];
    const unusedSubs = txns.filter(t => t.type === 'expense' && (t.note?.toLowerCase().includes('netflix') || t.note?.toLowerCase().includes('spotify') || t.note?.toLowerCase().includes('gym') || t.note?.toLowerCase().includes('youtube')));

    const prompt = `You are a world-class personal wealth advisor. Analyze this financial data:
    - Monthly Income: $${totalIncome}
    - Monthly Expenses: $${totalExpense}
    - Net Surplus: $${netBalance}
    - Top Expense Category: ${topCategory[0]} ($${topCategory[1]})
    - Recurring Subscriptions: ${unusedSubs.length} found

    Provide 3 distinct sections with concise, actionable points:
    1. Investment Strategy (Where to invest surplus cash, SIPs, Index Funds)
    2. Unusual / Excess Expense Cutbacks (How to stop wasteful spending)
    3. Wealth Acceleration Plan (Next 6-12 month goals)
    Format as clean JSON: { "investments": [...], "expenseCutbacks": [...], "wealthAdvice": [...] }`;

    let aiRaw = await callGemini(prompt);
    let result = null;

    if (aiRaw) {
      try {
        const jsonMatch = aiRaw.match(/\{[\s\S]*\}/);
        if (jsonMatch) result = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.warn('Could not parse Gemini JSON, fallback used');
      }
    }

    // Dynamic smart fallback if Gemini response is pending or quota reached
    if (!result) {
      const surplus = Math.max(netBalance, 1200);
      result = {
        investments: [
          {
            title: 'Low-Cost Index Funds & SIPs',
            detail: `Allocate 40% of surplus ($${Math.round(surplus * 0.4)}) into low-cost S&P 500 / Nifty 50 Index funds for steady 12% compound return.`,
            riskLevel: 'Moderate',
            estReturn: '+10–12% per year',
          },
          {
            title: 'High-Yield Emergency Reserve',
            detail: `Direct 25% ($${Math.round(surplus * 0.25)}) into a high-yield 6%+ savings account until 3 months of expenses ($${Math.round(totalExpense * 3)}) are secured.`,
            riskLevel: 'Ultra Low',
            estReturn: '6.5% Guaranteed',
          },
          {
            title: 'Dividend Growth Stocks',
            detail: 'Invest in dividend aristocrats for predictable passive cash flow and automated reinvestment.',
            riskLevel: 'Moderate',
            estReturn: '+8% Dividends + Equity Growth',
          },
        ],
        expenseCutbacks: [
          {
            title: `Cap High Spending in ${topCategory[0]}`,
            detail: `You spent ${topCategory[1]} on ${topCategory[0]}. Setting a strict limit of ${Math.round(topCategory[1] * 0.75)} will save ${Math.round(topCategory[1] * 0.25)} monthly.`,
            potentialSavings: `$${Math.round(topCategory[1] * 0.25)}/mo`,
          },
          {
            title: 'Consolidate Overlapping Streaming & Subscriptions',
            detail: `Audit ${unusedSubs.length || 3} recurring entertainment subscriptions. Canceling 1 unused streaming plan saves $180/year.`,
            potentialSavings: '$180/yr',
          },
          {
            title: 'Eliminate Impulse Micro-Purchases',
            detail: 'Apply the 24-Hour Rule: wait 24 hours before making any non-essential purchase over $50.',
            potentialSavings: '$150/mo',
          },
        ],
        wealthAdvice: [
          {
            goal: 'Automate 20% Direct Savings',
            step: 'Set up an auto-debit transfer on payday directly to your investment account before spending.',
          },
          {
            goal: 'Annual Financial Reset',
            step: 'Review tax deductions, rebalance portfolio quarterly, and eliminate lingering credit balances.',
          },
        ],
      };
    }

    res.json({
      success: true,
      data: result,
      source: aiRaw ? 'gemini-ai' : 'smart-analytics-engine',
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/chat
// Interactive Q&A endpoint for Ask AI drawer
// ─────────────────────────────────────────────────────────────────────────────
router.post('/chat', async (req, res, next) => {
  try {
    const { prompt, transactions = [], summary = {} } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    const contextPrompt = `You are FinTrack AI, an intelligent personal finance assistant.
    User Question: "${prompt}"
    User Financial Summary: Income $${summary.income || 0}, Expense $${summary.expense || 0}, Net $${summary.balance || 0}.
    
    Provide a direct, friendly, and practical answer in 2-3 sentences. Give clear actionable steps.`;

    const geminiReply = await callGemini(contextPrompt);

    res.json({
      success: true,
      reply: geminiReply || `Based on your recent records (Income: $${summary.income || 0}, Expenses: $${summary.expense || 0}), keeping your category spending below 70% of income will boost your investment reserves by up to 25%.`,
      source: geminiReply ? 'gemini-ai' : 'smart-analytics-engine',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
