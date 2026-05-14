# 🔧 Spotify Redirect URI - Fixed for New Requirements

**Issue:** Spotify now requires loopback IP addresses (127.0.0.1) instead of localhost  
**Status:** ✅ Code Updated - Just Add Redirect URI

---

## 🎯 Quick Fix (2 Minutes)

### Step 1: Find Your Port Number

Run your dev server:
```bash
cd straming
npm run dev
```

Look for the port in the output:
```
➜  Local:   http://localhost:5173/
```

The port is **5173** (or whatever number you see).

### Step 2: Add Redirect URI to Spotify Dashboard

1. Go to: https://developer.spotify.com/dashboard/e4fc3f0706bd405bb50d5cda85c13cd2

2. Click **"Settings"** button

3. Scroll to **"Redirect URIs"**

4. Add this URL (replace 5173 with your port if different):
   ```
   http://127.0.0.1:5173/
   ```
   
   **Note:** Just the root path `/` - no `/callback` needed!

5. Click **"Add"**

6. Click **"Save"** at the bottom

### Step 3: Access via 127.0.0.1 (Not localhost)

**Important:** You must access your app using the IP address, not localhost!

❌ **Don't use:** `http://localhost:5173`  
✅ **Use instead:** `http://127.0.0.1:5173`

### Step 4: Connect Spotify

1. Open: `http://127.0.0.1:5173`

2. Click the **Spotify button** (bottom-right)

3. Click **"Connect with Spotify OAuth"**

4. Authorize on Spotify

5. You'll be redirected back and see "Successfully connected!"

6. Done! 🎉

---

## 📋 Why This Change?

### Spotify's New Requirements (April 2025):

- ✅ **Loopback IP required:** `127.0.0.1` or `[::1]`
- ❌ **localhost not allowed:** Security requirement
- ✅ **HTTP allowed for loopback:** Only for local development
- ✅ **Dynamic ports supported:** Can omit port in redirect URI

### What We Changed:

```typescript
// Before (doesn't work anymore)
const REDIRECT_URI = 'http://localhost:5173/callback'

// After (works with new requirements)
const getRedirectUri = () => {
  const port = window.location.port || '5173'
  return `http://127.0.0.1:${port}/callback`
}
```

---

## 🚀 Alternative: Use Manual Token (No Redirect URI)

If you don't want to deal with OAuth setup:

1. Go to: https://developer.spotify.com/console/get-users-currently-playing-track/

2. Click **"Get Token"** → **"Request Token"**

3. Copy the token (starts with `BQD...`)

4. Open: `http://127.0.0.1:5173` (or your port)

5. Click Spotify button → **"Or use manual token →"**

6. Paste token → **"Connect Spotify"**

7. Done! (Token lasts 1 hour)

---

## 🐛 Troubleshooting

### "redirect_uri: Not matching configuration"

**Solution:** Make sure you:
1. Added `http://127.0.0.1:5173/callback` to Spotify Dashboard
2. Clicked "Save" in Spotify Dashboard
3. Are accessing via `http://127.0.0.1:5173` (not localhost)

### "Cannot connect to 127.0.0.1"

**Solution:** Your dev server might be on a different port:
1. Check the terminal where you ran `npm run dev`
2. Look for the port number
3. Use that port: `http://127.0.0.1:YOUR_PORT`

### "localhost works but 127.0.0.1 doesn't"

**Solution:** They're the same thing! Just use 127.0.0.1 for Spotify OAuth.

---

## 📝 Summary

### What You Need to Do:

1. ✅ Add `http://127.0.0.1:5173/callback` to Spotify Dashboard
2. ✅ Access app via `http://127.0.0.1:5173` (not localhost)
3. ✅ Click "Connect with Spotify OAuth"
4. ✅ Enjoy! 🎵

### Code Changes Made:

- ✅ Updated `spotifyAuth.ts` to use `127.0.0.1`
- ✅ Dynamic port detection
- ✅ Compliant with Spotify's new requirements

---

**Updated:** May 12, 2026  
**Status:** Ready to Use ✅
