#!/bin/bash

# HyperTrack Pro - Setup Script
# Automates the complete setup process for new installations

set -e

echo "🚀 HyperTrack Pro Setup Script"
echo "=============================="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Node.js is installed
check_node() {
    print_step "Checking Node.js installation..."
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js not found. Please install Node.js 14+ from https://nodejs.org"
        exit 1
    fi
}

# Check if Python is available (alternative server)
check_python() {
    print_step "Checking Python installation..."
    if command -v python3 >/dev/null 2>&1; then
        PYTHON_VERSION=$(python3 --version)
        print_success "Python3 found: $PYTHON_VERSION"
    elif command -v python >/dev/null 2>&1; then
        PYTHON_VERSION=$(python --version)
        print_success "Python found: $PYTHON_VERSION"
    else
        print_warning "Python not found. You'll need Node.js for the development server."
    fi
}

# Install dependencies
install_dependencies() {
    print_step "Installing dependencies..."
    if [ -f "package.json" ]; then
        npm install
        print_success "Dependencies installed"
    else
        print_warning "No package.json found. This is normal for a vanilla JS project."
    fi
}

# Setup environment file
setup_environment() {
    print_step "Setting up environment configuration..."
    
    if [ ! -f ".env.local" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env.local
            print_success "Created .env.local from template"
            print_warning "Please edit .env.local with your Supabase credentials"
            echo "  - Get credentials from: https://supabase.com"
            echo "  - File location: $(pwd)/.env.local"
        else
            print_warning ".env.example not found. Creating basic .env.local"
            cat > .env.local << 'EOF'
# HyperTrack Pro Environment Configuration
# Copy this file to .env.local and fill in your own values

# Supabase Configuration (Required for full features)
# Get these from your Supabase project dashboard at https://supabase.com
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Custom user ID for data separation
USER_ID=your_unique_user_id

# Optional: App Configuration
APP_NAME=HyperTrack Pro
DEBUG_MODE=false
ENABLE_ANALYTICS=true
EOF
            print_success "Created basic .env.local template"
        fi
    else
        print_success ".env.local already exists"
    fi
}

# Check required files
check_files() {
    print_step "Verifying project files..."
    
    required_files=("index.html" "app.js" "styles.css" "manifest.json")
    missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "Found: $file"
        else
            missing_files+=("$file")
            print_error "Missing: $file"
        fi
    done
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        print_success "All required files present"
    else
        print_error "Missing files detected. Please ensure you have a complete download."
        exit 1
    fi
}

# Setup development server
setup_server() {
    print_step "Setting up development server..."
    
    # Check if serve package is available globally
    if command -v serve >/dev/null 2>&1; then
        print_success "Global 'serve' package found"
        echo "You can start the server with: serve -s . -p 3000"
    else
        print_warning "Global 'serve' package not found"
        echo "Installing serve package for easy development..."
        if command -v npm >/dev/null 2>&1; then
            if npm install -g serve 2>/dev/null; then
                print_success "Installed serve package globally"
            else
                print_warning "Could not install serve globally (permission issue). Using local alternatives."
            fi
        else
            print_warning "Cannot install serve. Use alternative methods below."
        fi
    fi
    
    echo
    echo "Development server options:"
    echo "1. npm start (uses Python HTTP server)"
    echo "2. npm run serve (uses serve package)"
    echo "3. python3 -m http.server 3000"
    echo "4. npx serve -s . -p 3000"
}

# Database setup instructions
database_setup() {
    print_step "Database setup instructions..."
    
    echo
    echo "🗄️  Database Setup (Optional but Recommended):"
    echo "1. Create account at https://supabase.com"
    echo "2. Create a new project"
    echo "3. Go to Settings > API to get your credentials"
    echo "4. Run the database schema:"
    echo "   - Open Supabase Dashboard > SQL Editor"
    if [ -f "setup-database.sql" ]; then
        echo "   - Copy and run the contents of: setup-database.sql"
    else
        echo "   - Run the database schema from the documentation"
    fi
    echo "5. Update .env.local with your credentials"
    echo
    echo "Without database: App works with local storage only"
    echo "With database: Full features + cloud sync + multi-device"
}

# Final instructions
final_instructions() {
    print_step "Setup complete! Next steps:"
    
    echo
    echo "🎯 To start development:"
    echo "1. npm start          # Start development server"
    echo "2. Open http://localhost:3000"
    echo
    echo "🚀 To deploy:"
    echo "1. Push to GitHub"
    echo "2. Deploy to Vercel: https://vercel.com/new"
    echo "3. Or deploy to Netlify: https://netlify.com"
    echo
    echo "📖 For detailed instructions:"
    echo "1. Read README.md"
    echo "2. Check the documentation"
    echo
    print_success "HyperTrack Pro setup complete!"
    print_warning "Don't forget to configure your database credentials in .env.local"
}

# Main setup process
main() {
    echo "Starting HyperTrack Pro setup..."
    echo
    
    check_node
    check_python
    check_files
    install_dependencies
    setup_environment
    setup_server
    database_setup
    final_instructions
    
    echo
    print_success "🎉 Setup completed successfully!"
    echo "Start developing with: npm start"
}

# Run main setup if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi