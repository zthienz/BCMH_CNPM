#!/bin/bash

echo "========================================"
echo "   Tra Vinh Travel Backend Server"
echo "========================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js is installed"
node --version

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    echo "Please run this script from the backend directory"
    exit 1
fi

echo
echo "🔄 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies!"
    exit 1
fi

echo
echo "✅ Dependencies installed successfully!"
echo

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "Creating .env file with default values..."
    echo
    
    cat > .env << EOL
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=dulich_travinh
DB_USER=root
DB_PASSWORD=

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
SESSION_NAME=travinh_session
SESSION_MAX_AGE=86400000

# JWT Configuration (optional)
JWT_SECRET=your-jwt-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:5500,file://

# Logging
LOG_LEVEL=info
EOL
    
    echo "✅ .env file created with default values"
    echo "⚠️  Please update database credentials in .env file"
    echo
fi

echo "🚀 Starting server..."
echo
echo "Server will be available at:"
echo "  - http://localhost:3000"
echo "  - Health check: http://localhost:3000/health"
echo "  - API docs: http://localhost:3000/api/docs"
echo
echo "Press Ctrl+C to stop the server"
echo

# Start the server
npm start
