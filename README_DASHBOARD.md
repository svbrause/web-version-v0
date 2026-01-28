# Dashboard Local Server Setup

## Quick Start

### Option 1: Using the Shell Script (Easiest)

1. Open Terminal
2. Navigate to the project directory:
   ```bash
   cd /Users/sambrause/Downloads/Photos-1-001/test7
   ```
3. Run the server:
   ```bash
   ./start-server.sh
   ```
4. Open your browser to:
   - **Lakeshore Dashboard**: http://localhost:8000/dashboard-lakeshore.html
   - **Unique Aesthetics Dashboard**: http://localhost:8000/dashboard-unique.html

### Option 2: Using Python Directly

```bash
cd /Users/sambrause/Downloads/Photos-1-001/test7
python3 -m http.server 8000
```

Then open http://localhost:8000/dashboard-lakeshore.html or dashboard-unique.html

### Option 3: Using Node.js (if you prefer)

If you have `npx` available:
```bash
cd /Users/sambrause/Downloads/Photos-1-001/test7
npx http-server -p 8000
```

## Why Use Localhost?

- ✅ **Fixes CORS issues** - Airtable API works properly
- ✅ **Faster loading** - Better performance than file:// protocol
- ✅ **Proper HTTP headers** - All APIs work correctly
- ✅ **Better debugging** - DevTools work better

## Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

## Troubleshooting

**Port 8000 already in use?**
- Use a different port: `python3 -m http.server 8080`
- Then access: http://localhost:8080/dashboard-lakeshore.html

**Permission denied?**
- Make script executable: `chmod +x start-server.sh`

**Still seeing CORS errors?**
- Make sure you're accessing via `http://localhost:8000/` not `file://`
- Check browser console for specific error messages
