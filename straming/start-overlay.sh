#!/bin/bash

# Super Productivity Overlay Startup Script
# This script checks prerequisites and starts the overlay dev server

set -e

echo "🚀 Super Productivity Overlay Startup"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run this script from the straming directory"
    echo "   cd /Users/swastik/Documents/yt/super-productivity-master/overlay_yt-main/straming"
    exit 1
fi

# Check if Super Productivity Angular frontend is running
echo "🔍 Checking if Super Productivity Angular frontend is running (localhost:4200)..."
if ! curl -s http://localhost:4200 > /dev/null 2>&1; then
    echo "❌ Angular frontend is NOT running on port 4200"
    echo ""
    echo "Please start it first in another terminal:"
    echo "  cd /Users/swastik/Documents/yt/super-productivity-master"
    echo "  npm run startFrontend"
    echo ""
    echo "Wait for '✔ Compiled successfully' before continuing."
    exit 1
fi
echo "✅ Angular frontend is running"

# Check if Super Productivity Electron app is running (REST API)
echo "🔍 Checking if Super Productivity REST API is accessible (127.0.0.1:3876)..."
if ! curl -s http://127.0.0.1:3876/status > /dev/null 2>&1; then
    echo "⚠️  REST API is NOT accessible on port 3876"
    echo ""
    echo "Make sure:"
    echo "  1. Super Productivity Electron app is running (npm start)"
    echo "  2. Settings → Misc → 'Enable Local REST API' is turned ON"
    echo ""
    echo "The overlay will start anyway, but won't connect until you enable the API."
    echo ""
    read -p "Press Enter to continue anyway, or Ctrl+C to cancel..."
else
    echo "✅ REST API is accessible"
fi

echo ""
echo "📦 Installing dependencies (if needed)..."
npm install --silent

echo ""
echo "🎨 Starting Vite dev server..."
echo ""
echo "Once started, open:"
echo "  • Main overlay: http://localhost:5173"
echo "  • Diagnostics:  http://localhost:5173?diagnostics=true"
echo "  • OBS mode:     http://localhost:5173?obs=true"
echo ""

npm run dev
