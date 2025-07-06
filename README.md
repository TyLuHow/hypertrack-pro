# HyperTrack Pro 🏋️‍♂️

> **Evidence-Based Hypertrophy Optimization PWA**  
> A research-backed fitness tracking application with intelligent training algorithms

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Try%20Now-brightgreen)](https://hypertrack-pro.vercel.app/?demo=true)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FTyLuHow%2Fhypertrack-pro)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## 🚀 Quick Start (Deploy Your Own Instance)

### Option 1: One-Click Deploy to Vercel
1. Click the "Deploy with Vercel" button above
2. Fork the repository to your GitHub account
3. Set up your own Supabase database (see [Full Setup](#full-setup-database-integration))
4. Add your Supabase credentials to Vercel environment variables

### Option 2: Manual Setup
1. **Fork this repository** to your GitHub account
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/hypertrack-pro.git
   cd hypertrack-pro
   ```
3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```
4. **Deploy to your preferred platform** (Vercel, Netlify, etc.)

**🔒 Privacy**: Your data stays in YOUR database. Each deployment is completely isolated.

## 📋 Table of Contents

- [Features](#-features)
- [Live Demo](#-live-demo)
- [Installation](#-installation)
- [Deployment](#-deployment)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Architecture](#-architecture)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Tracking
- **Workout Logging**: Exercise selection, set/rep/weight tracking
- **Progress Analytics**: Volume progression, strength trends
- **Rest Timers**: Smart rest period management
- **Workout History**: Complete training log with search

### Intelligent Training (Phase 2)
- **Personalized Progression**: AI-calculated optimal load increases
- **Plateau Prediction**: Early warning system for training plateaus
- **Auto-Periodization**: Automatic program phase transitions
- **Recovery Management**: Load adjustment based on readiness

### Research Integration
- **Evidence-Based**: 50+ research findings integrated
- **Smart Recommendations**: Research-backed training suggestions
- **Adaptive Algorithms**: Personalized based on response patterns

### Technical Features
- **Progressive Web App**: Install on mobile/desktop
- **Offline Capable**: Works without internet connection
- **Responsive Design**: Optimized for all devices
- **Zero Dependencies**: Pure vanilla JavaScript

## 🌐 Live Demo

**[👉 Try Demo Mode](https://hypertrack-pro.vercel.app/?demo=true)** - Explore with 45 research-based workouts (no data saved)

Or deploy your own instance in 2 minutes using the one-click deploy button above, then experience the full feature set:
- Create workouts
- Track exercises  
- View progress analytics
- Explore intelligent training features

> **Demo Mode**: Shows the complete app with 45 realistic workouts following research-based progression patterns. Perfect for exploring features without affecting any real data.
> 
> **Your Own Instance**: Deploy to get your private version where you can save real workout data and sync across devices.

## 🔧 Installation

### Local Development

```bash
# Clone the repository
git clone https://github.com/TyLuHow/hypertrack-pro.git
cd hypertrack-pro

# Start local server
npm start
# or
python3 -m http.server 3000

# Open http://localhost:3000
```

### Docker (Alternative)

```bash
# Build and run
docker build -t hypertrack-pro .
docker run -p 3000:3000 hypertrack-pro
```

## 🚢 Deployment

### Vercel (Recommended)

**Option 1: One-Click Deploy**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FTyLuHow%2Fhypertrack-pro)

**Option 2: Manual Deploy**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from your cloned repo
vercel --prod
```

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir .
```

### GitHub Pages

1. Fork the repository
2. Go to Settings > Pages
3. Select source: Deploy from a branch
4. Choose `main` branch
5. Your site will be live at `https://yourusername.github.io/hypertrack-pro`

## ⚙️ Configuration

### Basic Setup (Works Out of the Box)

HyperTrack Pro works immediately with local storage - no database required.

### Full Setup (Database Integration)

For user authentication, sync, and advanced features:

1. **Create Supabase Project**
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Set Up Database**
   ```bash
   # Run the provided schema
   # In Supabase Dashboard > SQL Editor
   # Paste and run: database-schema.sql
   ```

3. **Environment Variables**
   
   Create `.env.local` (development) or add to Vercel/Netlify:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Seed Data** (optional)
   ```bash
   # Run in Supabase SQL Editor
   # Paste and run: seed-2025-data.sql
   ```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Optional |
| `SUPABASE_ANON_KEY` | Your Supabase anon key | Optional |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (admin) | Optional |
| `NODE_ENV` | Environment (development/production) | Optional |

## 🎯 Usage

### Basic Workout Tracking

1. **Start a Workout**
   - Click "Start New Workout"
   - Add exercises from the database
   - Log sets, reps, and weights

2. **Track Progress**
   - View workout history
   - Analyze progress trends
   - Monitor volume progression

### Advanced Features (with Database)

1. **User Accounts**
   - Sign up for cloud sync
   - Access across devices
   - Backup your data

2. **Intelligent Training**
   - AI-powered progression suggestions
   - Plateau prediction and prevention
   - Personalized periodization

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Vercel Serverless Functions (optional)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Local Storage + Cloud Sync
- **PWA**: Service Worker, Web App Manifest

### File Structure

```
hypertrack-pro/
├── index.html              # Main app shell
├── app.js                  # Core application logic
├── styles.css              # Styling and responsive design
├── intelligent-training.js # AI training algorithms
├── supabase-service.js     # Database integration
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── database-schema.sql     # Database setup
├── seed-2025-data.sql      # Exercise data
└── docs/                   # Documentation
```

### Key Components

1. **App Shell**: Fast-loading application skeleton
2. **Workout Engine**: Exercise tracking and progression
3. **Intelligence Layer**: AI-powered training optimization
4. **Sync Service**: Cloud backup and multi-device sync
5. **PWA Infrastructure**: Offline capability and installation

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

### Quick Development Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/hypertrack-pro.git
cd hypertrack-pro

# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and test
npm start

# Commit and push
git commit -m "Add amazing feature"
git push origin feature/amazing-feature

# Create pull request
```

### Development Guidelines

- Follow existing code style
- Test on mobile and desktop
- Update documentation
- Add research citations for training features

## 📖 Research References

HyperTrack Pro integrates findings from 50+ peer-reviewed studies:

- **Schoenfeld et al. (2016)** - Rest period optimization
- **Helms et al. (2018)** - Periodization for hypertrophy
- **Mangine et al. (2015)** - Individual response patterns
- **Rhea et al. (2002)** - Progression rate recommendations

Full references available in `/research/hypertrophy-research-summary.md`

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Research community for evidence-based training protocols
- Open source contributors
- Fitness professionals providing real-world feedback

---

**Made with ❤️ for the evidence-based fitness community**

[Report Issues](https://github.com/TyLuHow/hypertrack-pro/issues) | [Request Features](https://github.com/TyLuHow/hypertrack-pro/issues/new?labels=enhancement)