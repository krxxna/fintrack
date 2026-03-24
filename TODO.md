# FinTrack Deployment Fix - TODO

## Plan Steps:
- [x] Step 1: Update backend/server.js CORS ✅
- [x] Step 2: Verified frontend/src/services/api.js (correct URL hardcoded) ✅
- [ ] Step 3: Create .env.example files for both backend/frontend
- [ ] Step 3: Create .env.example files for both backend/frontend
- [ ] Step 4: Commit changes: git add . && git commit -m "fix: CORS for production + env examples" && git push
- [ ] Step 5: Update Render env vars (CLIENT_URL=https://fintrack-nu-kohl.vercel.app,https://localhost:3000)
- [ ] Step 6: Update Vercel env vars (REACT_APP_API_URL=https://fintrack-x68g.onrender.com/api)
- [ ] Step 7: Test deployed app endpoints from browser dev tools
- [ ] Step 8: Seed test data if needed (backend/scripts/seed.js)

**Progress: Starting Step 1**
