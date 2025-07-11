# Contributing to HyperTrack Pro

We welcome contributions to HyperTrack Pro! This guide will help you get started with development and ensure your contributions align with the project's goals.

## 🚀 Quick Start

### Prerequisites
- **Node.js** 14+ (for development server)
- **Git** for version control
- **Python 3** (alternative development server)
- **Modern web browser** with developer tools

### Initial Setup
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/hypertrack-pro.git
cd hypertrack-pro

# Run the automated setup
chmod +x setup.sh
./setup.sh

# Start development server
npm start
# or alternatively
python3 -m http.server 3000
```

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Development Standards](#development-standards)
- [Testing](#testing)
- [Research Standards](#research-standards)
- [Getting Help](#getting-help)

## 📜 Code of Conduct

This project adheres to a code of conduct to ensure a welcoming environment for all contributors. By participating, you agree to:

- Be respectful and inclusive
- Focus on what's best for the community
- Show empathy towards other contributors
- Accept constructive criticism gracefully
- Focus on facts and evidence-based discussions

## 🛠️ Development Setup

### Prerequisites

- Git
- A modern web browser
- Text editor (VS Code recommended)
- Basic knowledge of JavaScript, HTML, CSS

### Local Development

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/hypertrack-pro.git
cd hypertrack-pro

# Start local development server
npm start
# or
python3 -m http.server 3000

# Open http://localhost:3000
```

### Optional: Full Database Setup

For testing advanced features:

1. Create a [Supabase](https://supabase.com) project
2. Run `database-schema.sql` in the SQL editor
3. Optionally run `seed-2025-data.sql` for test data
4. Copy `.env.example` to `.env.local` and configure

## 🎯 Contributing Guidelines

### Types of Contributions

We welcome various types of contributions:

**🐛 Bug Reports**
- Use the bug report template
- Include steps to reproduce
- Provide browser/device information
- Include screenshots if relevant

**✨ Feature Requests**
- Use the feature request template
- Explain the problem you're solving
- Provide research backing if applicable
- Consider backward compatibility

**🔧 Code Contributions**
- Bug fixes
- New features
- Performance improvements
- Code refactoring
- Documentation improvements

**📚 Research Contributions**
- New research findings
- Research fact updates
- Training protocol improvements
- Algorithm enhancements

### What We're Looking For

**High Priority:**
- Bug fixes for existing features
- Mobile responsiveness improvements
- Performance optimizations
- Research-backed feature enhancements
- Accessibility improvements

**Medium Priority:**
- New exercise database entries
- UI/UX improvements
- Additional analytics features
- New training algorithms

**Please Avoid:**
- Breaking changes without discussion
- Features without research backing
- Duplicate functionality
- Overly complex solutions

## 🔄 Pull Request Process

### 1. Planning

- **Check existing issues** to avoid duplicates
- **Create an issue** for significant changes
- **Discuss your approach** before major work

### 2. Development

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ... code, test, commit ...

# Push to your fork
git push origin feature/your-feature-name
```

### 3. Pull Request

- **Use the PR template**
- **Link related issues**
- **Provide clear description**
- **Include testing instructions**
- **Add screenshots/GIFs** for UI changes

### 4. Review Process

- **Automated checks** must pass
- **At least one reviewer** approval required
- **Address feedback** promptly
- **Keep discussions constructive**

### 5. Merge

- **Squash commits** will be used
- **Branch will be deleted** after merge
- **Release notes** will be updated

## 📐 Development Standards

### Code Style

**JavaScript:**
- Use modern ES6+ features
- Prefer `const` and `let` over `var`
- Use arrow functions where appropriate
- Comment complex logic
- Keep functions small and focused

**HTML:**
- Use semantic HTML5 elements
- Include proper ARIA attributes
- Ensure mobile responsiveness
- Follow accessibility guidelines

**CSS:**
- Use CSS custom properties (variables)
- Mobile-first responsive design
- Consistent naming conventions
- Avoid inline styles

### File Organization

```
hypertrack-pro/
├── index.html              # Main app shell
├── app.js                  # Core application logic
├── styles.css              # Main stylesheet
├── intelligent-training.js # AI algorithms
├── supabase-service.js     # Database integration
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
└── research/               # Research documentation
```

### Commit Messages

Use clear, descriptive commit messages:

```bash
# Good
git commit -m "Add plateau prediction algorithm based on Helms et al. research"
git commit -m "Fix rest timer not starting automatically on mobile"
git commit -m "Update exercise database with 2025 research findings"

# Avoid
git commit -m "fix bug"
git commit -m "update stuff"
git commit -m "changes"
```

## 🧪 Testing

### Manual Testing

Before submitting a PR, test:

1. **Core functionality** works as expected
2. **Mobile responsiveness** on different screen sizes
3. **PWA features** (offline, installation)
4. **Database integration** (if applicable)
5. **Cross-browser compatibility**

### Test Cases

**Workout Tracking:**
- Start/stop workout
- Add exercises
- Log sets with different weights/reps
- Rest timer functionality
- Complete workout

**Data Management:**
- Local storage persistence
- Cloud sync (if configured)
- Export/import functionality
- User authentication

**Progressive Web App:**
- Service worker registration
- Offline functionality
- Installation prompt
- Push notifications

### Browser Testing

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📊 Research Standards

HyperTrack Pro is evidence-based. When contributing research-related features:

### Research Quality

**Acceptable Sources:**
- Peer-reviewed journals
- Meta-analyses and systematic reviews
- Randomized controlled trials
- Well-designed observational studies

**Avoid:**
- Blog posts or opinion pieces
- Industry-funded studies without peer review
- Anecdotal evidence
- Outdated research (>10 years unless foundational)

### Research Integration

**When adding research facts:**

1. **Cite the source** properly
2. **Include study details** (sample size, duration, methodology)
3. **Note limitations** of the research
4. **Provide context** for practical application

**Example:**
```javascript
// Good
"Schoenfeld et al. (2016, n=21): 3-minute rest periods produced 9.8% greater hypertrophy than 1-minute rest in trained men performing multi-joint exercises"

// Avoid
"Longer rest periods build more muscle"
```

### Algorithm Development

**For training algorithms:**

1. **Base on peer-reviewed research**
2. **Document the methodology**
3. **Include confidence intervals**
4. **Test with different populations**
5. **Validate against known outcomes**

## 🎨 UI/UX Guidelines

### Design Principles

- **Mobile-first**: Design for mobile, enhance for desktop
- **Accessibility**: Follow WCAG 2.1 AA guidelines
- **Performance**: Optimize for fast loading
- **Evidence-based**: Show research backing for features

### Visual Design

- **Color scheme**: Maintain the existing dark theme
- **Typography**: Use the existing font stack
- **Icons**: Use consistent SVG icons
- **Spacing**: Follow the existing grid system

### User Experience

- **Progressive disclosure**: Show complex features when needed
- **Clear hierarchy**: Important features should be prominent
- **Feedback**: Provide clear feedback for user actions
- **Error handling**: Graceful error messages and recovery

## 🔍 Review Checklist

Before submitting, ensure:

- [ ] Code follows the style guidelines
- [ ] All tests pass (manual testing)
- [ ] Documentation is updated
- [ ] Research is properly cited
- [ ] Mobile responsiveness is maintained
- [ ] Accessibility is not compromised
- [ ] Performance impact is minimal
- [ ] Breaking changes are documented

## 🆘 Getting Help

### Communication Channels

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For general questions and ideas
- **Pull Request Comments**: For code-specific discussions

### Common Questions

**Q: How do I add a new exercise to the database?**
A: Add it to the `seed-2025-data.sql` file following the existing format.

**Q: How do I test the intelligent training features?**
A: Set up the full database and create multiple workout sessions to generate training history.

**Q: What's the best way to propose a new training algorithm?**
A: Create an issue with the research backing and methodology, then implement after discussion.

### Getting Started Issues

Look for issues labeled:
- `good first issue`: Perfect for new contributors
- `help wanted`: We need community help
- `research`: Research-related contributions
- `documentation`: Documentation improvements

## 📚 Resources

### Development Resources
- [MDN Web Docs](https://developer.mozilla.org/)
- [Progressive Web Apps](https://web.dev/progressive-web-apps/)
- [Supabase Documentation](https://supabase.com/docs)

### Research Resources
- [PubMed](https://pubmed.ncbi.nlm.nih.gov/)
- [Stronger by Science](https://www.strongerbyscience.com/)
- [Research Gate](https://www.researchgate.net/)

### Design Resources
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design](https://material.io/design)
- [PWA Design Patterns](https://web.dev/pwa-patterns/)

## 🙏 Recognition

Contributors are recognized in:
- Repository contributors page
- Release notes for significant contributions
- Special recognition for research contributions

---

**Thank you for contributing to HyperTrack Pro!** Your contributions help make evidence-based fitness tracking accessible to everyone.

Questions? Feel free to open an issue or start a discussion!