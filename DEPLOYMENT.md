# 🚀 Deployment & Setup Guide

## 📋 Pre-Publishing Checklist

Before pushing to GitHub, make sure to:

### ⚠️ Security (IMPORTANT!)
- [ ] **DO NOT** commit your actual Supabase credentials to GitHub
- [ ] The current `/utils/supabase/info.tsx` contains real API keys
- [ ] You have two options:

#### Option 1: Use Environment Variables (Recommended)
1. Create a `.env` file (already in .gitignore):
```env
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_ANON_KEY=your-anon-key
```

2. Update `/utils/supabase/info.tsx`:
```typescript
export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || ""
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ""
```

#### Option 2: Keep Current Structure
- Keep the file as-is but document in README that users need to update it
- The anon key is public-safe, but it's still best practice to use env vars

### 📝 Update Files
- [ ] Replace `[Your Name]` in README.md and LICENSE with your actual name
- [ ] Update the repository URL in README.md
- [ ] Add a screenshot or demo GIF to README (optional but recommended)
- [ ] Review and customize the daily tasks list if needed

---

## 🌐 Publishing to GitHub

### Step 1: Create a GitHub Repository
1. Go to [github.com](https://github.com) and log in
2. Click the "+" icon → "New repository"
3. Name it: `solo-system` (or your preferred name)
4. Choose: Public or Private
5. **DO NOT** initialize with README (we already have one)
6. Click "Create repository"

### Step 2: Initialize Git Locally
Open your terminal in the project folder and run:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Solo System v1.0"

# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/solo-system.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Verify Upload
1. Refresh your GitHub repository page
2. Check that all files are uploaded
3. Verify README displays correctly
4. ⚠️ **Double-check no sensitive credentials are visible!**

---

## 🚀 Deploying to Production

### Option 1: Vercel (Recommended - Easiest)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Follow the prompts:**
   - Link to your GitHub account
   - Select the project
   - Configure settings (use defaults)
   - Deploy!

4. **Set Environment Variables** (if using Option 1 above):
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `VITE_SUPABASE_PROJECT_ID` and `VITE_SUPABASE_ANON_KEY`

### Option 2: Netlify

1. **Connect to GitHub**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select your repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**
   - Add your Supabase credentials in Site Settings → Environment Variables

### Option 3: GitHub Pages

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"

# Deploy
npm run deploy
```

---

## 🔧 Supabase Edge Functions Deployment

### Setup Supabase CLI

1. **Install Supabase CLI**
```bash
npm install -g supabase
```

2. **Login**
```bash
supabase login
```

3. **Link Project**
```bash
supabase link --project-ref your-project-id
```

### Deploy Functions

```bash
# Deploy the server function
supabase functions deploy make-server-aae8dea8

# Set environment variables
supabase secrets set SUPABASE_URL=your-url
supabase secrets set SUPABASE_ANON_KEY=your-anon-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
supabase secrets set SUPABASE_DB_URL=your-db-url
```

### Verify Deployment
```bash
# Test the function
curl https://your-project-id.supabase.co/functions/v1/make-server-aae8dea8/health
```

---

## 📊 Database Setup

Your app uses a key-value store table that should already exist in Supabase. If not:

1. Go to Supabase Dashboard → Table Editor
2. The table `kv_store_aae8dea8` should be there
3. If missing, contact support or check your server logs

---

## 🐛 Troubleshooting

### "Failed to load data"
- Check Supabase credentials are correct
- Verify Edge Function is deployed
- Check browser console for errors

### "CORS errors"
- Edge Function includes CORS headers
- Verify function is deployed correctly
- Check function logs in Supabase Dashboard

### "Build errors"
- Run `npm install` to ensure all dependencies are installed
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (18+ required)

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [React Router Documentation](https://reactrouter.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 💡 Post-Deployment Checklist

- [ ] Test login with a new personal code
- [ ] Complete a task and verify XP gain
- [ ] Test cross-device sync (open on phone + PC)
- [ ] Check progress charts display correctly
- [ ] Test discipline penalties
- [ ] Verify logout and re-login works
- [ ] Check mobile responsiveness
- [ ] Test all features on production URL

---

**Need help?** Open an issue on GitHub or check the troubleshooting section above.

Good luck with your deployment! 🚀
