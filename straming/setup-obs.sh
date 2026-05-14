#!/bin/bash

# OBS Studio Installation and Setup Script
# For Ubuntu/Debian-based systems

set -e

echo "=================================="
echo "OBS Studio Setup for Stream Dashboard"
echo "=================================="
echo ""

# Check if running on Ubuntu/Debian
if ! command -v apt &> /dev/null; then
    echo "❌ This script is for Ubuntu/Debian systems only"
    exit 1
fi

# Check if OBS is already installed
if command -v obs &> /dev/null; then
    echo "✅ OBS Studio is already installed!"
    OBS_VERSION=$(obs --version 2>&1 | head -1 || echo "Unknown version")
    echo "   Version: $OBS_VERSION"
    echo ""
else
    echo "📥 Installing OBS Studio..."
    echo ""
    
    # Add OBS Studio PPA
    echo "Adding OBS Studio repository..."
    sudo add-apt-repository -y ppa:obsproject/obs-studio
    
    # Update package list
    echo "Updating package list..."
    sudo apt update
    
    # Install OBS Studio
    echo "Installing OBS Studio..."
    sudo apt install -y obs-studio
    
    echo ""
    echo "✅ OBS Studio installed successfully!"
    echo ""
fi

# Check if frontend is running
echo "🔍 Checking Stream Dashboard status..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Frontend is running on http://localhost:5173"
else
    echo "⚠️  Frontend is not running. Start it with: npm run dev"
fi

# Check if server is running
if curl -s http://localhost:4000 > /dev/null 2>&1; then
    echo "✅ Server is running on http://localhost:4000"
else
    echo "⚠️  Server is not running. Start it with: cd server && node index.js"
fi

echo ""
echo "=================================="
echo "🎬 Next Steps:"
echo "=================================="
echo ""
echo "1. Launch OBS Studio:"
echo "   obs"
echo ""
echo "2. Add Browser Source:"
echo "   - Click '+' in Sources panel"
echo "   - Select 'Browser'"
echo "   - Name: Stream Dashboard"
echo ""
echo "3. Configure Browser Source:"
echo "   URL: http://localhost:5173/?mode=overlay"
echo "   Width: 1920"
echo "   Height: 1080"
echo "   FPS: 30"
echo ""
echo "4. Read full guide:"
echo "   cat OBS_SETUP_GUIDE.md"
echo ""
echo "=================================="
echo "✨ Ready to stream!"
echo "=================================="
