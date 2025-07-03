# Vercel Environment Variables Setup

## 🔧 Required Environment Variables

After deployment, you need to set these environment variables in Vercel:

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Select your `hypertrack-pro` project
- Go to Settings → Environment Variables

### 2. Add These Variables

**Copy these from Tyler's API key collection:**

```
SUPABASE_URL=[Your Supabase Project URL]
SUPABASE_ANON_KEY=[Your Supabase Anon Key]  
SUPABASE_SERVICE_ROLE_KEY=[Your Supabase Service Role Key]
NODE_ENV=production
```

**Values to use:** Refer to your private API key collection for the actual values.

### 3. Add Optional API Keys (if using)

```
BRAVE_SEARCH_API_KEY=[Your Brave Search Key]
OPENAI_API_KEY=[Your OpenAI Key]
FIRECRAWL_API_KEY=[Your Firecrawl Key]
```

### 4. Deploy Settings
- Set Environment: **Production**
- Apply to: **All Environments** (recommended)
- Then redeploy the project

## 🎯 After Setup
1. Database will connect automatically
2. App will save workout data to Supabase
3. No localStorage fallback needed
4. Full functionality enabled

## 🔍 Verify Setup
- Check `/api/health` endpoint for database connection status
- Create a test workout to verify data persistence
- Check Supabase dashboard for saved data