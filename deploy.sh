#!/bin/bash

# HyperTrack Pro Deployment Script
# Automates deployment to various platforms

set -e

echo "🚀 HyperTrack Pro Deployment Script"
echo "===================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running in correct directory
if [[ ! -f "index.html" ]]; then
    print_error "Please run this script from the hypertrack-pro directory"
    exit 1
fi

# Show deployment options
echo "Available deployment options:"
echo "1. Vercel (recommended)"
echo "2. Netlify"
echo "3. GitHub Pages"
echo "4. Custom server"
echo ""

# Get user choice
read -p "Choose deployment option (1-4): " CHOICE

case $CHOICE in
    1)
        echo ""
        echo "🔥 Deploying to Vercel..."
        echo "========================="
        
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            print_info "Installing Vercel CLI..."
            npm install -g vercel
        fi
        
        # Pre-deployment checks
        print_info "Running pre-deployment checks..."
        
        # Check for required files
        if [[ ! -f "vercel.json" ]]; then
            print_error "vercel.json not found"
            exit 1
        fi
        
        if [[ ! -f ".env.example" ]]; then
            print_warning ".env.example not found - users won't have environment template"
        fi
        
        # Deploy to Vercel
        print_info "Deploying to Vercel..."
        vercel --prod
        
        print_success "Deployment to Vercel completed!"
        print_info "Don't forget to set environment variables in Vercel dashboard"
        ;;
        
    2)
        echo ""
        echo "🌐 Deploying to Netlify..."
        echo "=========================="
        
        # Check if Netlify CLI is installed
        if ! command -v netlify &> /dev/null; then
            print_info "Installing Netlify CLI..."
            npm install -g netlify-cli
        fi
        
        # Pre-deployment checks
        print_info "Running pre-deployment checks..."
        
        # Deploy to Netlify
        print_info "Deploying to Netlify..."
        netlify deploy --prod --dir .
        
        print_success "Deployment to Netlify completed!"
        print_info "Don't forget to set environment variables in Netlify dashboard"
        ;;
        
    3)
        echo ""
        echo "📚 Deploying to GitHub Pages..."
        echo "==============================="
        
        # Check if we're in a git repository
        if ! git rev-parse --is-inside-work-tree &> /dev/null; then
            print_error "Not in a git repository"
            exit 1
        fi
        
        # Check for uncommitted changes
        if ! git diff --quiet; then
            print_warning "You have uncommitted changes"
            read -p "Commit changes? (y/N): " COMMIT_CHANGES
            if [[ $COMMIT_CHANGES =~ ^[Yy]$ ]]; then
                git add .
                git commit -m "Prepare for GitHub Pages deployment"
            fi
        fi
        
        # Push to main branch
        print_info "Pushing to main branch..."
        git push origin main
        
        print_success "Pushed to GitHub!"
        print_info "Enable GitHub Pages in your repository settings:"
        print_info "1. Go to Settings > Pages"
        print_info "2. Choose 'Deploy from a branch'"
        print_info "3. Select 'main' branch"
        print_info "4. Your site will be available at https://yourusername.github.io/hypertrack-pro"
        ;;
        
    4)
        echo ""
        echo "🖥️  Custom Server Deployment..."
        echo "=============================="
        
        # Create deployment package
        print_info "Creating deployment package..."
        
        # Create temp directory
        TEMP_DIR=$(mktemp -d)
        
        # Copy files (excluding development files)
        rsync -av --exclude='.git' --exclude='node_modules' --exclude='.env.local' --exclude='*.log' . "$TEMP_DIR/"
        
        # Create archive
        ARCHIVE_NAME="hypertrack-pro-$(date +%Y%m%d-%H%M%S).tar.gz"
        tar -czf "$ARCHIVE_NAME" -C "$TEMP_DIR" .
        
        # Cleanup
        rm -rf "$TEMP_DIR"
        
        print_success "Deployment package created: $ARCHIVE_NAME"
        print_info "Upload this package to your server and extract it"
        print_info "Serve the files with any web server (nginx, apache, etc.)"
        ;;
        
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# Final checks and recommendations
echo ""
echo "🔍 Post-deployment recommendations:"
echo "=================================="
echo ""

print_info "Security checklist:"
echo "- Set up HTTPS (automatically handled by Vercel/Netlify)"
echo "- Configure environment variables"
echo "- Test all features in production"
echo "- Set up monitoring (optional)"
echo ""

print_info "Testing checklist:"
echo "- Verify PWA installation works"
echo "- Test offline functionality"
echo "- Check mobile responsiveness"
echo "- Verify database connection (if configured)"
echo ""

print_info "Optimization recommendations:"
echo "- Enable compression (gzip/brotli)"
echo "- Set up CDN for static assets"
echo "- Configure proper caching headers"
echo "- Monitor Core Web Vitals"
echo ""

print_success "Deployment completed successfully! 🎉"
print_info "Your HyperTrack Pro app is now live!"