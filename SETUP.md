# HyperTrack Pro Setup Guide

## 🚀 Quick Deploy (2 minutes)

Choose your deployment method:

### Option 1: Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FTyLuHow%2Fhypertrack-pro)

1. Click the deploy button above
2. Connect your GitHub account
3. Fork the repository
4. Deploy automatically
5. **Done!** Your app is live

### Option 2: Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/TyLuHow/hypertrack-pro)

1. Click deploy button
2. Connect GitHub
3. Deploy automatically
4. **Done!** Your app is live

### Option 3: Manual Fork & Deploy

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/hypertrack-pro.git
cd hypertrack-pro

# 3. Deploy to Vercel
npx vercel --prod
# or deploy to Netlify
npx netlify deploy --prod --dir .
```

## 📱 Basic Usage (No Database Required)

Your app works immediately with local storage:

1. **Start a Workout**: Click "Start New Workout"
2. **Add Exercises**: Search and select from 100+ exercises
3. **Track Sets**: Log weight, reps, and rest periods
4. **View Progress**: Check analytics and workout history

## 🔧 Full Setup (Database Integration)

For user accounts, cloud sync, and AI features:

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/sign in
3. Click "New Project"
4. Choose organization and name
5. Generate a strong password
6. Wait for setup to complete

### Step 2: Set Up Database

1. **Go to SQL Editor** in Supabase dashboard
2. **Create new query**
3. **Copy and paste** the contents of `database-schema.sql`
4. **Run the query** to create all tables

### Step 3: Seed Exercise Data (Optional)

1. **In SQL Editor**, create another new query
2. **Copy and paste** the contents of `seed-2025-data.sql`
3. **Run the query** to add 100+ exercises

### Step 4: Configure Environment Variables

#### For Vercel:
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add these variables:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

#### For Netlify:
1. Go to your Netlify dashboard
2. Select your site
3. Go to Site Settings → Environment Variables
4. Add the same variables as above

#### For Local Development:
1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials
3. Save the file

### Step 5: Get Your Supabase Credentials

1. **In Supabase dashboard**, go to Settings → API
2. **Copy your Project URL** → This is your `SUPABASE_URL`
3. **Copy your anon/public key** → This is your `SUPABASE_ANON_KEY`

### Step 6: Deploy/Restart

- **Vercel**: Changes deploy automatically
- **Netlify**: Redeploy your site
- **Local**: Restart your development server

## 🧪 Testing Your Setup

### Test Database Connection

1. Open your deployed app
2. Go to Settings tab
3. Click "Test Database"
4. Should show "✅ Connection successful!"

### Test Full Features

1. **Sign up** for an account
2. **Create a workout** with exercises
3. **Check sync** across devices
4. **View analytics** and AI recommendations

## 🔒 Security Setup

### Environment Variables

**Never commit these to GitHub:**
- `.env.local` (already in .gitignore)
- `.env` files with real credentials

**Always use environment variables for:**
- Database URLs
- API keys
- Authentication secrets

### Database Security

Your Supabase database includes:
- **Row Level Security** (RLS) enabled
- **User-based data isolation**
- **Secure API endpoints**

## 🚨 Troubleshooting

### Common Issues

**❌ "Database connection failed"**
- Check your `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Ensure they're set in your deployment platform
- Verify your Supabase project is running

**❌ "Exercises not loading"**
- Run the `seed-2025-data.sql` script
- Check the exercises table has data
- Verify table permissions

**❌ "Authentication not working"**
- Check Supabase Auth settings
- Verify authentication providers are enabled
- Check your site URL in Supabase settings

**❌ "App not updating"**
- Clear browser cache
- Force refresh (Ctrl+F5)
- Check service worker registration

### Getting Help

1. **Check the issues** on [GitHub](https://github.com/TyLuHow/hypertrack-pro/issues)
2. **Search existing solutions**
3. **Create a new issue** with:
   - Your deployment method
   - Error messages
   - Steps to reproduce

## 📚 Additional Resources

### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [PWA Guide](https://web.dev/progressive-web-apps/)

### Example Deployments
- [Live Demo](https://hypertrack-pro.vercel.app)
- [GitHub Repository](https://github.com/TyLuHow/hypertrack-pro)

### Community
- [GitHub Discussions](https://github.com/TyLuHow/hypertrack-pro/discussions)
- [Issues & Feature Requests](https://github.com/TyLuHow/hypertrack-pro/issues)

---

## 🎯 Next Steps

After successful setup:

1. **Customize the app** for your needs
2. **Add your own exercises** to the database
3. **Modify the research facts** for your audience
4. **Contribute improvements** back to the project

**Need help?** Open an issue on GitHub or check the troubleshooting section above.