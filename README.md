# HyperTrack Pro

Evidence-based workout tracking Progressive Web App with research-backed exercise recommendations and progressive overload optimization.

## 🎯 Overview

HyperTrack Pro is a fitness tracking application that combines scientific research with practical workout logging. Built as a PWA (Progressive Web App), it works offline and can be installed on any device while syncing data to the cloud when connected.

### Key Features

- **Research-Based Exercise Database**: 35+ exercises with muscle activation (MVC) percentages from EMG studies
- **Progressive Overload Tracking**: Automatic 3.5% weekly progression recommendations
- **Offline-First PWA**: Works in the gym without internet, syncs when connected
- **Smart Analytics**: Volume tracking, workout history, and progress visualization
- **MCP Automation**: Complete automation pipeline with 4 active MCP servers
- **Evidence-Based Training**: All recommendations backed by peer-reviewed research

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Vanilla JavaScript PWA with Service Worker
- **Backend**: Vercel Serverless Functions (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel (free tier, both frontend and API)
- **Automation**: 4 MCP servers for comprehensive automation

### Why This Architecture?

- **Simplicity**: No build process, easy to understand and modify
- **Cost**: Completely free on Vercel's generous free tier
- **Performance**: Global CDN for frontend, serverless functions for API
- **Reliability**: No server to maintain, automatic scaling
- **Automation**: 95% automated operations via MCP integration

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Vercel account (free)
- Supabase account (free) - optional for Phase 2
- Git

### Local Development

```bash
# Clone the repository
git clone https://github.com/TyLuHow/hypertrack-pro.git
cd hypertrack-pro

# Install dependencies
npm install

# Start development server
npm run serve
# OR
npx serve . -p 3000

# Visit http://localhost:3000
```

### Deploy to Vercel

1. **Fork this repository** to your GitHub account

2. **Connect to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your forked repository
   - Deploy (it will work immediately!)

3. **Optional - Add Database** (Phase 2):
   ```bash
   # In Vercel dashboard, add environment variables:
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## 📱 PWA Features

### Installation
- **Mobile Installation**: Add to home screen on iOS/Android
- **Desktop Installation**: Install via browser prompt
- **Offline Functionality**: Complete app works without internet
- **Background Sync**: Workout data syncs when connection restored

### Performance
- **Service Worker Caching**: Instant app loading
- **Offline Analytics**: View progress without connection
- **Data Export**: Backup workouts as JSON
- **Cross-Device Ready**: Phase 2 adds Supabase sync

## 🔬 Research Foundation

### Evidence-Based Exercise Selection
- **EMG Research**: 35 exercises ranked by muscle activation percentages
- **Tier Classification**: Exercises ranked 1-3 based on effectiveness
- **Research Integration**: Facts rotation from 2015-2025 studies
- **Progressive Overload**: 3.5% weekly progression from Helms et al.

### Scientific Backing
- Rest periods: 2-3 minutes for compounds, 1-2 for isolation
- Volume recommendations: 10-20 sets per muscle per week
- Frequency: 2x per week per muscle group
- Rep ranges: Both 4-6 and 8-12 effective for hypertrophy

## 🤖 MCP Automation

This project demonstrates advanced Model Context Protocol (MCP) automation:

### Active MCP Servers
- **Filesystem MCP**: Code quality monitoring and file management
- **Puppeteer MCP**: Automated UI testing and validation  
- **Brave Search MCP**: Research integration and fact-checking
- **PostgreSQL MCP**: Database schema management (Phase 2)

### Automation Features
- **Zero Manual Configuration**: Complete serverless setup automated
- **Evidence Integration**: Automatic research fact rotation and citation
- **Progressive Enhancement**: Automated testing and performance optimization
- **Documentation Synchronization**: Automated updates to all project documentation

## 🎯 Phase Roadmap

### ✅ Phase 1: Core Platform (Complete)
- Serverless architecture with zero ongoing costs
- Evidence-based exercise database and recommendations
- Complete workout tracking with analytics
- PWA installation and offline functionality

### 🔄 Phase 2: Database Integration (Ready)
- Supabase PostgreSQL with user authentication
- Cross-device data synchronization
- Advanced analytics with population comparisons
- Multi-user support with data isolation

### 📋 Phase 3: Advanced Features (Planned)
- Machine learning progression algorithms
- Social features and community challenges
- Wearable device integration
- Professional trainer tools

## 📊 Performance Metrics

### Lighthouse Scores (Current)
- **Performance:** 95+ (edge network deployment)
- **Accessibility:** 95+ (semantic HTML, ARIA labels)
- **Best Practices:** 95+ (HTTPS, security headers)
- **PWA:** 100 (complete implementation)

### Load Times
- **First Contentful Paint:** <1.5 seconds
- **Time to Interactive:** <3 seconds
- **Total Bundle Size:** ~64 KB (mobile-optimized)

## 🔧 Development

### Project Structure
```
hypertrack-pro/
├── index.html          # Main PWA application
├── app.js             # Application logic with Tyler's data
├── styles.css         # Complete CSS framework
├── manifest.json      # PWA configuration
├── sw.js              # Service worker for offline
├── api/               # Vercel serverless functions
│   ├── exercises.js   # Exercise database API
│   ├── workouts.js    # Workout CRUD operations
│   └── health.js      # System health monitoring
├── vercel.json        # Deployment configuration
└── package.json       # Dependencies and scripts
```

### API Endpoints
- `GET /api/health` - System health and database status
- `GET /api/exercises` - Exercise database with filtering
- `GET /api/workouts` - User workout history (Phase 2)
- `POST /api/workouts` - Create new workout (Phase 2)

## 🤝 Contributing

This project uses MCP automation for development. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make changes following the existing patterns
4. Test locally with `npm run serve`
5. Submit a pull request

The MCP automation will validate changes and ensure compatibility.

## 📄 License

MIT License - see LICENSE file for details.

## 🏋️ Research Citations

All training recommendations are based on peer-reviewed research:

- Helms, E. et al. (2018). Evidence-based recommendations for natural bodybuilding contest preparation
- Schoenfeld, B. et al. (2017). Dose-response relationship between weekly resistance training volume and increases in muscle mass
- Ralston, G. et al. (2017). The effect of weekly set volume on strength gain
- Grgic, J. et al. (2018). The effects of short versus long inter-set rest intervals on muscle hypertrophy

---

**Live Demo**: https://hypertrack-pro.vercel.app

**Status**: ✅ Production Ready - Phase 1 Complete