#!/bin/bash

# HyperTrack Pro Setup Script
# Automates the setup process for local development

set -e

echo "🚀 HyperTrack Pro Setup Script"
echo "================================"
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

# Step 1: Check prerequisites
echo "Step 1: Checking prerequisites..."

# Check if Node.js is available (optional)
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
    HAS_NODE=true
else
    print_warning "Node.js not found - using Python server instead"
    HAS_NODE=false
fi

# Check if Python is available
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_success "Python found: $PYTHON_VERSION"
    HAS_PYTHON=true
elif command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version)
    print_success "Python found: $PYTHON_VERSION"
    HAS_PYTHON=true
else
    print_error "Python not found - please install Python 3"
    exit 1
fi

# Step 2: Set up environment file
echo ""
echo "Step 2: Environment configuration..."

if [[ ! -f ".env.local" ]]; then
    print_info "Creating .env.local from template..."
    cp .env.example .env.local
    print_success "Created .env.local"
    print_warning "Please edit .env.local with your Supabase credentials"
else
    print_info ".env.local already exists"
fi

# Step 3: Verify file structure
echo ""
echo "Step 3: Verifying file structure..."

REQUIRED_FILES=(
    "index.html"
    "app.js"
    "styles.css"
    "manifest.json"
    "sw.js"
    "database-schema.sql"
    "seed-2025-data.sql"
    "intelligent-training.js"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        print_success "$file exists"
    else
        print_error "$file is missing"
        exit 1
    fi
done

# Step 4: Test local server
echo ""
echo "Step 4: Testing local server..."

# Find available port
PORT=3000
while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; do
    ((PORT++))
done

print_info "Using port $PORT"

# Start server in background
if [[ $HAS_NODE == true ]]; then
    print_info "Starting Node.js server..."
    npx serve -s . -p $PORT > /dev/null 2>&1 &
    SERVER_PID=$!
    SERVER_TYPE="Node.js"
else
    print_info "Starting Python server..."
    python3 -m http.server $PORT > /dev/null 2>&1 &
    SERVER_PID=$!
    SERVER_TYPE="Python"
fi

# Wait for server to start
sleep 2

# Test if server is running
if curl -f http://localhost:$PORT > /dev/null 2>&1; then
    print_success "$SERVER_TYPE server started successfully"
    print_info "Server running at http://localhost:$PORT"
    
    # Kill the test server
    kill $SERVER_PID 2>/dev/null || true
else
    print_error "Failed to start server"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Step 5: Database setup check
echo ""
echo "Step 5: Database setup check..."

if [[ -f ".env.local" ]]; then
    if grep -q "your_supabase_url" .env.local; then
        print_warning "Supabase not configured - app will use local storage only"
        print_info "To set up Supabase:"
        print_info "1. Create a project at https://supabase.com"
        print_info "2. Run database-schema.sql in the SQL editor"
        print_info "3. Update .env.local with your credentials"
    else
        print_success "Supabase configuration detected"
    fi
fi

# Step 6: PWA setup check
echo ""
echo "Step 6: PWA setup check..."

if [[ -f "manifest.json" && -f "sw.js" ]]; then
    print_success "PWA files present"
else
    print_error "PWA files missing"
fi

# Step 7: Summary and next steps
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
print_success "HyperTrack Pro is ready for development"
echo ""
echo "Next steps:"
echo "1. Start the development server:"
if [[ $HAS_NODE == true ]]; then
    echo "   npm start"
else
    echo "   python3 -m http.server 3000"
fi
echo "2. Open http://localhost:3000 in your browser"
echo "3. Configure Supabase (optional) for full features"
echo "4. Start developing!"
echo ""
echo "Useful commands:"
echo "- npm start          : Start development server"
echo "- ./deploy.sh        : Deploy to production"
echo "- ./test.sh          : Run tests"
echo ""
echo "Documentation:"
echo "- README.md          : Project overview"
echo "- SETUP.md           : Deployment guide"
echo "- CONTRIBUTING.md    : Developer guide"
echo ""
print_info "Happy coding! 🚀"