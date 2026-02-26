#!/bin/bash

# Test build script for backend
# This simulates what Render will do

echo "🧪 Testing Backend Build Process..."
echo ""

# Step 1: Clean
echo "📦 Step 1: Cleaning old build..."
rm -rf dist/
echo "✅ Cleaned"
echo ""

# Step 2: Install
echo "📦 Step 2: Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Step 3: Build
echo "📦 Step 3: Building TypeScript..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build completed"
echo ""

# Step 4: Verify
echo "📦 Step 4: Verifying build output..."
if [ -f "dist/server.js" ]; then
    echo "✅ dist/server.js exists"
    ls -lh dist/server.js
else
    echo "❌ dist/server.js NOT FOUND"
    echo "Contents of dist/:"
    ls -la dist/ || echo "dist/ folder doesn't exist"
    exit 1
fi
echo ""

# Step 5: Check structure
echo "📦 Step 5: Checking dist structure..."
echo "dist/ contents:"
ls -la dist/
echo ""

# Step 6: Test start (optional)
echo "📦 Step 6: Testing start command..."
echo "Command: node dist/server.js"
echo "(Press Ctrl+C to stop after server starts)"
echo ""
node dist/server.js
