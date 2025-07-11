# Deployment Guide

This guide covers deploying HyperTrack Pro to various platforms and setting up production environments.

## 🚀 Quick Deploy Options

### One-Click Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FTyLuHow%2Fhypertrack-pro)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/TyLuHow/hypertrack-pro)

## 📋 Pre-Deployment Checklist

- [ ] Fork the repository to your GitHub account
- [ ] Set up Supabase database (optional but recommended)
- [ ] Configure environment variables
- [ ] Test locally before deploying

## 🗄️ Database Setup (Optional but Recommended)

### 1. Setup Supabase Database

1. Go to [Supabase](https://supabase.com) and create a new project
2. In your Supabase dashboard, go to the SQL Editor
3. Run the SQL from `database-schema.sql` to create the required tables
4. Get your project URL and anon key from Settings > API

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials:
   ```bash
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   ```

### 3. Deploy to Vercel

#### Option A: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/hypertrack-pro)

#### Option B: Manual Deploy
1. Fork this repository
2. Connect your GitHub account to Vercel
3. Import your forked repository
4. Add environment variables in Vercel dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
5. Deploy

### 4. Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/hypertrack-pro.git
cd hypertrack-pro

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Install dependencies (if using a development server)
npm install

# Start development server
npm run dev
```

### 5. Data Privacy

- Your data is stored in YOUR Supabase instance
- No data is shared with the original repository
- Each deployment is completely isolated
- You have full control over your workout data

### Troubleshooting

#### Supabase Connection Issues
- Verify your URL and anon key are correct
- Check that your Supabase project is not paused
- Ensure the database schema has been applied

#### Deployment Issues
- Make sure environment variables are set in Vercel dashboard
- Check the build logs for any errors
- Verify your Supabase project allows connections from your domain

### Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Supabase configuration
3. Review the deployment logs
4. Open an issue on GitHub with details

## Architecture

- **Frontend**: Vanilla JavaScript PWA
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel (or any static host)
- **Data**: Your own isolated Supabase instance

This ensures complete data privacy and ownership.