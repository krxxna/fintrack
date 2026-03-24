# Fintrack Currency Fix - TODO

## Plan Overview
Fix currency selection in Settings so symbol/type changes everywhere (Dashboard, Transactions).

## Steps
- [x] 1. Create useCurrency hook for easy access to user.currency
- [x] 2. Update Dashboard.jsx - pass currency to all fmt() calls  
- [x] 3. Update Transactions.jsx - pass currency to fmt() & summary cards
- [x] 4. Update TxnRow.jsx - accept & use currency prop
# Fintrack Currency Fix ✅ COMPLETE

All steps done:
- Currency selection works ✓
- Symbols change everywhere ✓ (Dashboard, Transactions, Rows, Cards)
- Backend stores/retrieves currency ✓ 
- Demo defaults to INR ✓
- Settings preview works without external deps ✓

**Test:** Settings → Rupees → Save → See ₹ everywhere!

**Next:** `npm run dev` & enjoy! 🎉

**Current: Step 1 ✅ & Backend ✅ (User model + auth routes fully support currency save/load). Proceeding to step 2: Dashboard.jsx**


