# HyperTrack Pro - Agent Documentation Index

## 📋 Quick Navigation for AI Agents

### Core Architecture Documents
- [ARCHITECTURE.md](../hypertrack-pro-v2/ARCHITECTURE.md) - App structure overview
- [README.md](../README.md) - Project overview and setup
- [README-API.md](../README-API.md) - Complete API documentation
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Development guidelines

### Code Structure Reference
- [Knowledge Graph](./knowledge-graph.json) - Complete codebase mapping
- [TypeScript Config](../hypertrack-pro-v2/tsconfig.json) - Path aliases and build config
- [Package Config](../hypertrack-pro-v2/package.json) - Dependencies and scripts

### Research & Evidence Base
- **Research Sources**: 52 peer-reviewed studies integrated
- **Algorithm Files**: hypertrack-pro-v2/src/lib/algorithms/
- **Citation Format**: Author et al. (Year) - Brief description
- **Validation Required**: All fitness recommendations must cite research

### Development Workflows
- **Branch**: Always use `main`
- **Testing**: `npm test` in hypertrack-pro-v2/
- **Build**: `npm run build` in hypertrack-pro-v2/
- **Deploy**: Automatic on push to main (Vercel)

### API Endpoints Summary
- `/api/auth` - User authentication (signup, login, guest, verify)
- `/api/workouts` - Workout CRUD and analytics  
- `/api/exercises` - Exercise database and search
- `/api/recommendations` - AI-powered training suggestions
- `/api/health` - System status and monitoring

### Critical Files for Agent Context
1. `src/shared/types/supabase.ts` - Database schema types
2. `src/lib/algorithms/` - Research-backed calculations (PRESERVE)
3. `api/` - Serverless function implementations
4. `.cursorrules` - Development guidelines and constraints

### Agent-Specific Guidelines
- **Architecture Agent**: Focus on module relationships, API design
- **Implementation Agent**: Follow TypeScript patterns, test coverage
- **Testing Agent**: Validate algorithms against research standards  
- **Documentation Agent**: Maintain research citations, API docs

### Emergency Protocols
- **Algorithm Changes**: Require research validation before implementation
- **Breaking Changes**: Coordinate across frontend, API, and database
- **Performance Issues**: Profile with realistic data volumes (10k+ users)
- **Security Concerns**: Validate all user inputs, maintain RLS policies