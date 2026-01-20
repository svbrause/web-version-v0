#!/bin/bash
# Simple local server for dashboard
# This will start a server on http://localhost:8000

cd "$(dirname "$0")"

echo "🚀 Starting local server..."
echo ""
echo "Dashboard will be available at:"
echo "  • Lakeshore: http://localhost:8000/dashboard-lakeshore.html"
echo "  • Unique Aesthetics: http://localhost:8000/dashboard-unique.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start Python's built-in HTTP server
python3 -m http.server 8000
