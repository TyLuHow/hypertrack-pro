# HyperTrack Pro

Evidence-based workout tracking application with progressive overload optimization.

## 🎯 Features

- **Evidence-Based Training**: Exercise database backed by scientific research
- **Progressive Overload**: Automated progression recommendations 
- **Offline Support**: PWA with service worker for gym use
- **Analytics**: Comprehensive progress tracking and insights
- **Research Integration**: Rotating research facts and best practices
- **Modern UI**: Dark theme with responsive design

## 🏗️ Architecture

### Frontend (PWA)
- **HTML5**: Semantic markup with accessibility
- **CSS3**: Modern styling with CSS custom properties
- **JavaScript**: Vanilla JS with modern ES6+ features
- **Service Worker**: Offline functionality and caching
- **Manifest**: PWA installation support

### Backend (API)
- **Node.js**: Runtime environment
- **Express.js**: Web framework with middleware
- **Supabase**: PostgreSQL database with real-time features
- **JWT**: Authentication and authorization
- **Rate Limiting**: API protection and abuse prevention

### Database (PostgreSQL via Supabase)
- **Future-Proof Schema**: JSONB fields for extensibility
- **Row Level Security**: User data isolation
- **Research Data**: Scientific exercise information
- **Analytics Views**: Pre-computed statistics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TyLuHow/hypertrack-pro.git
   cd hypertrack-pro
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your Supabase credentials
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   # Serve with any static server
   npx http-server . -p 3000
   # Or use VS Code Live Server extension
   ```

4. **Database Setup**
   ```bash
   # Run the schema setup in Supabase SQL Editor
   # Copy contents of scripts/future-proof-schema.sql
   ```

## 📱 Demo

**Live Demo**: [https://tylubow.github.io/hypertrack-pro](https://github.com/TyLuHow/hypertrack-pro)

**Repository**: [https://github.com/TyLuHow/hypertrack-pro](https://github.com/TyLuHow/hypertrack-pro)

## 🏋️ Built with MCP Automation

This project was built using Model Context Protocol (MCP) automation, demonstrating:
- Rapid full-stack development
- Real-world data integration from CSV
- Production-ready code generation
- Complete PWA implementation

## 📊 Project Statistics

- **3,500+ lines of code** generated
- **Real workout data** integrated (54 sets, 64,400 lbs volume)
- **Complete PWA** with offline functionality
- **Production deployment** ready

---

**Built with ❤️ for evidence-based training**