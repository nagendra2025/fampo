# Testing API Endpoints - Cookie Authentication Guide

## Understanding Authentication Cookies

When you log in to the application, Supabase sets authentication cookies in your browser. These cookies are required for API requests to authenticate you.

---

## Method 1: Get Cookie from Browser DevTools (Easiest)

### Step-by-Step:

1. **Open your browser and log in** to the application at `http://localhost:3000`

2. **Open DevTools** (Press `F12` or right-click → Inspect)

3. **Go to Application/Storage tab:**
   - **Chrome/Edge:** Click "Application" tab → "Cookies" → `http://localhost:3000`
   - **Firefox:** Click "Storage" tab → "Cookies" → `http://localhost:3000`

4. **Find the Supabase cookies:**
   Look for cookies that start with:
   - `sb-` (Supabase cookies)
   - Common ones: `sb-<project-ref>-auth-token`, `sb-<project-ref>-auth-token.0`, etc.

5. **Copy the cookie values:**
   You'll need to copy ALL the Supabase auth cookies and format them like:
   ```
   sb-xxxxx-auth-token=value1; sb-xxxxx-auth-token.0=value2; sb-xxxxx-auth-token.1=value3
   ```

### Example Cookie String:
```
sb-abcdefgh-auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; sb-abcdefgh-auth-token.0=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; sb-abcdefgh-auth-token.1=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Method 2: Copy from Network Tab (Recommended)

### Step-by-Step:

1. **Open DevTools** → **Network tab**

2. **Make a request** in the UI (e.g., create an announcement)

3. **Click on the API request** (e.g., `POST /api/announcements`)

4. **Go to "Headers" section**

5. **Find "Request Headers"** → Look for `Cookie:` header

6. **Copy the entire cookie string** (it will be all the cookies together)

### Example:
```
Cookie: sb-abcdefgh-auth-token=eyJhbGc...; sb-abcdefgh-auth-token.0=eyJhbGc...; sb-abcdefgh-auth-token.1=eyJhbGc...
```

7. **Use it in curl:**
```bash
curl -X POST http://localhost:3000/api/announcements \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-abcdefgh-auth-token=eyJhbGc...; sb-abcdefgh-auth-token.0=eyJhbGc...; sb-abcdefgh-auth-token.1=eyJhbGc..." \
  -d '{"message": "Test announcement"}'
```

---

## Method 3: Use Browser DevTools Console (Easiest for Testing)

Instead of curl, you can test directly in the browser console:

### Test GET Request:
```javascript
fetch('/api/announcements')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Test POST Request:
```javascript
fetch('/api/announcements', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'Test announcement from console'
  })
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### Test DELETE Request:
```javascript
fetch('/api/announcements/[announcement-id]', {
  method: 'DELETE'
})
  .then(res => res.json())
  .then(data => console.log(data));
```

**Advantage:** Cookies are automatically included by the browser!

---

## Method 4: Use Postman or Insomnia

### Postman Setup:

1. **Install Postman** (if not installed)

2. **Create a new request:**
   - Method: POST
   - URL: `http://localhost:3000/api/announcements`

3. **Get cookies:**
   - Open your browser → DevTools → Application → Cookies
   - Copy all Supabase cookie values

4. **Add cookies in Postman:**
   - Go to "Cookies" tab
   - Add each cookie manually, OR
   - Use "Headers" tab and add:
     ```
     Cookie: sb-xxx-auth-token=value; sb-xxx-auth-token.0=value; ...
     ```

5. **Add body:**
   - Go to "Body" tab
   - Select "raw" → "JSON"
   - Enter: `{"message": "Test announcement"}`

---

## Method 5: Browser Extension (Cookie Editor)

1. **Install Cookie Editor extension** (Chrome/Edge/Firefox)

2. **Open extension** while on `http://localhost:3000`

3. **Export cookies** → Copy the cookie string

4. **Use in curl** or other tools

---

## Quick Test Script

Create a file `test-api.sh`:

```bash
#!/bin/bash

# Get cookies from browser first, then replace COOKIE_VALUE below
COOKIE_VALUE="sb-xxx-auth-token=value; sb-xxx-auth-token.0=value"

# Test GET
echo "Testing GET /api/announcements..."
curl -X GET http://localhost:3000/api/announcements \
  -H "Cookie: $COOKIE_VALUE" \
  | jq .

# Test POST
echo -e "\nTesting POST /api/announcements..."
curl -X POST http://localhost:3000/api/announcements \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE_VALUE" \
  -d '{"message": "Test announcement from script"}' \
  | jq .
```

---

## Common Issues

### Issue: "Unauthorized" (401)
**Solution:** 
- Make sure you're logged in
- Check cookie values are correct
- Cookies might have expired - log in again

### Issue: Cookie too long
**Solution:** 
- Supabase cookies can be very long
- Make sure you copy the ENTIRE value
- Some terminals have line length limits - use a file instead

### Issue: Cookie expired
**Solution:**
- Log out and log in again
- Get fresh cookies
- Cookies typically expire after session timeout

---

## Recommended Approach

**For Quick Testing:** Use Browser Console (Method 3) - cookies are automatic!

**For API Documentation:** Use Postman/Insomnia (Method 4)

**For Scripts/Automation:** Use curl with cookies from Network tab (Method 2)

---

## Example: Complete curl Command

```bash
# Replace with your actual cookie values from browser
curl -X POST http://localhost:3000/api/announcements \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-abcdefghijklmnop-auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzM1Njg5NjAwLCJzdWIiOiIxMjM0NTY3OC05YWJjLWRlZmctMTIzNC01Njc4OTBhYmNkZWYiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiYXV0aF9wcm92aWRlciI6ImVtYWlsIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzcyIsInRpbWVzdGFtcCI6MTczNTY4OTAwMH1dLCJzZXNzaW9uX2lkIjoiMTIzNDU2NzgtOWFiYy1kZWZnLTEyMzQtNTY3ODkwYWJjZGVmIn0.signature; sb-abcdefghijklmnop-auth-token.0=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; sb-abcdefghijklmnop-auth-token.1=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"message": "Test announcement"}'
```

**Note:** The cookie values are very long JWT tokens. Make sure to copy the complete value!

---

## Pro Tip: Use Browser Console Instead

The easiest way to test API endpoints is directly in the browser console since cookies are handled automatically:

```javascript
// Test in browser console (F12 → Console tab)
fetch('/api/announcements', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Test from console' })
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

This automatically includes all cookies! 🎉



