#!/bin/bash
# Test Super Productivity Local REST API

BASE_URL="http://127.0.0.1:3876"

echo "========================================"
echo "Super Productivity API Test"
echo "========================================"
echo ""

# Test 1: Health Check
echo "1. Health Check"
curl -s "$BASE_URL/health" | jq .
echo ""

# Test 2: Status (includes focus mode)
echo "2. Status"
curl -s "$BASE_URL/status" | jq .
echo ""

# Test 3: Focus Mode
echo "3. Focus Mode"
curl -s "$BASE_URL/focus-mode" | jq .
echo ""

# Test 4: Today's Stats
echo "4. Today's Stats"
curl -s "$BASE_URL/stats/today" | jq .
echo ""

# Test 5: Current Task
echo "5. Current Task"
curl -s "$BASE_URL/task-control/current" | jq .
echo ""

# Test 6: Projects
echo "6. Projects"
curl -s "$BASE_URL/projects" | jq .
echo ""

echo "========================================"
echo "Tests complete!"
echo "========================================"
echo ""
echo "For SSE live events, run:"
echo "  curl -N http://127.0.0.1:3876/events"