# HyperTrack Pro 🏋️‍♂️

> **Evidence-Based Hypertrophy Optimization PWA**  
> A research-backed fitness tracking application with intelligent training algorithms

[![Live Demo](https://img.shields.io/badge/Live%20Demo-hypertrack--pro.vercel.app-brightgreen)](https://hypertrack-pro.vercel.app)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FTyLuHow%2Fhypertrack-pro)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## 🚀 Quick Start (2 minutes)

1. **Fork & Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/hypertrack-pro.git
   cd hypertrack-pro
   ```

2. **Deploy to Vercel**
   - Click the "Deploy with Vercel" button above, or
   - Connect your GitHub repo to Vercel
   - Deploy automatically with zero configuration

3. **Set up Database** (optional for full features)
   - Create a [Supabase](https://supabase.com) project
   - Run the provided SQL schema
   - Add environment variables to Vercel

**That's it!** Your HyperTrack Pro instance is live.

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

Experience HyperTrack Pro live: **[hypertrack-pro.vercel.app](https://hypertrack-pro.vercel.app)**

Test the full feature set:
- Create workouts
- Track exercises
- View progress analytics
- Explore intelligent training features

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