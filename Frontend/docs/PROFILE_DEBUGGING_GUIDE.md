# Profile Endpoint Debugging & Monitoring Guide

## What's Been Implemented

### 1. Frontend Token Validation ✅
**Location:** [AuthContext.jsx](src/context/AuthContext.jsx#L139-L177)

- **`hasValidToken()`** - Validates that token exists and has proper JWT format before making API calls
- **`fetchProfileWithRetry()`** - Safely fetches profile with:
  - Token validation check
  - Up to 2 retry attempts
  - Exponential backoff delay (1s → 2s → max 5s)
  - Skips retry for 401/403/404 errors (auth/permission errors)
  - Comprehensive logging of each attempt

**Key Benefits:**
- Prevents unnecessary 500 errors from missing tokens
- Automatic recovery from temporary server issues
- Clear logging of what's happening at each step

### 2. API Retry Logic ✅
**Location:** [api.js](src/services/api.js#L108-L140)

**Features:**
- **500 Error Handling** - Automatically retries with exponential backoff
  - Max 2 retries (configurable via `MAX_RETRIES`)
  - Delays: 1000ms → 2000ms → max 5000ms
  - Respects existing retry configuration

- **Request/Response Logging** - Every API call is logged with:
  - Method (GET, POST, etc.)
  - URL (cleaned to remove domain)
  - Status code
  - Success/failure indicator
  - Timestamp

**Configuration:**
```javascript
const MAX_RETRIES = 2           // Max retry attempts for 500 errors
const RETRY_DELAY_MS = 1000     // Initial retry delay
```

### 3. API Monitoring & Logging ✅
**Location:** [apiLogger.js](src/utils/apiLogger.js)

**Features:**
- **Automatic Logging** - Tracks all API requests/responses in localStorage
- **Log Persistence** - Stores up to 100 logs for debugging
- **Export Functionality** - Download logs as JSON for analysis
- **Error Filtering** - Quickly identify recent errors

**Using the Logger (Browser Console):**
```javascript
// Import the logger in any component:
import apiLogger from '../utils/apiLogger'

// View all logs
apiLogger.getAllLogs()

// View logs for specific endpoint
apiLogger.getLogsForEndpoint('/auth/profile')

// View recent errors
apiLogger.getRecentErrors(20)

// Export logs as JSON file
apiLogger.exportLogs()

// Clear logs
apiLogger.clearLogs()
```

## Monitoring the 500 Error

### Step 1: Check Frontend Logs
Open browser DevTools (F12) → Console:
```javascript
// Check if token is valid before profile fetch
apiLogger.getRecentErrors()

// Look for "Profile fetch (attempt X)" messages
apiLogger.getLogsForEndpoint('/auth/profile')
```

### Step 2: Monitor Backend Logs
The backend now logs profile operations with detailed context:

```
[PROFILE] Fetching profile for user: 69a036980482692435f118b6
[PROFILE] Successfully fetched profile for 69a036980482692435f118b6 with 33 permissions

// OR on error:
[PROFILE] Error finding user: ...
[PROFILE] Unexpected error fetching profile for userId 69a036980482692435f118b6: ...
```

### Step 3: Trace the Error Chain
1. **Frontend** calls `fetchProfileWithRetry()` → checks token → calls API
2. **API Layer** logs request with timestamp
3. **Backend** receives request, logs in `profileController`
4. **API Layer** logs response/error with retry count
5. **Frontend** retries if 500 error with exponential backoff

## Debugging Checklist

### Problem: 500 Error on Profile Endpoint

**Check List:**
- [ ] Token exists: `localStorage.getItem('accessToken')`
- [ ] Token is valid JWT (3 dot-separated parts): `token.split('.').length === 3`
- [ ] Backend is running: `http://localhost:4000/api/v1/health` (if available)
- [ ] Frontend proxy works: Network tab shows `/api` → `localhost:4000`
- [ ] Database connection: Check backend logs for "MongoDB connected"
- [ ] User exists in DB: Check backend "User not found" error

### If Profile Fetch Fails:

1. **Open Browser DevTools (F12)**
2. **Go to Console tab**
3. **Run:**
   ```javascript
   // Check recent API errors
   apiLogger.getRecentErrors(5)
   
   // Check profile-specific logs  
   apiLogger.getLogsForEndpoint('/auth/profile')
   
   // View all logs
   apiLogger.getAllLogs()
   ```

4. **Export logs for debugging:**
   ```javascript
   apiLogger.exportLogs()  // Downloads api-logs-*.json
   ```

5. **Check backend console** for `[PROFILE]` log lines

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "No valid access token" | Token missing after login | Check login doesn't clear token, verify localStorage |
| "Profile fetch failed after all retries" | Consistent 500 error | Check backend logs for detailed error message |
| Token invalid format | Corrupted token in storage | Clear localStorage, re-login |
| 401 Unauthorized | Token expired | Token refresh should handle, check refresh endpoint |
| 403 Forbidden | User cannot login | Check `user.canLogin` and `user.isActive` in DB |

## Configuration

### Adjust Retry Behavior
**File:** [api.js](src/services/api.js#L14-L16)
```javascript
const MAX_RETRIES = 2          // Change to 3 for more retries
const RETRY_DELAY_MS = 1000    // Change to 500 for faster retries
```

### Disable Logging (Production)
**File:** [apiLogger.js](src/utils/apiLogger.js#L8)
```javascript
const ENABLE_LOGGING = import.meta.env.DEV  // Only logs in development
// Change to:
const ENABLE_LOGGING = false  // Disable all logging
```

## Testing the Implementation

### Test 1: Verify Token Validation
```javascript
// In browser console
localStorage.removeItem('accessToken')
// Try navigating to a protected page - should redirect or show error
```

### Test 2: Test Retry Logic
```javascript
// Simulate a 500 error by temporarily breaking backend
// Frontend should retry automatically with delays
apiLogger.getRecentErrors()  // Should show 2 retry attempts
```

### Test 3: Verify Logging
```javascript
// Navigate to any page, check console
apiLogger.getAllLogs()  // Should show recent API calls
apiLogger.getRecentErrors()  // Should be empty if no errors
```

## Next Steps

1. **Monitor production** - Keep apiLogger.js enabled in dev, disable in prod
2. **Set up alerts** - Add error tracking to report critical issues
3. **Implement health checks** - Periodically test backend availability
4. **Cache profile data** - Consider caching profile to reduce requests

## Support & Debugging

For detailed backend logs, check [auth.controller.js profileController](../Backend/src/controllers/auth.controller.js#L671-L745)

For API service configuration, see [api.js](src/services/api.js)

For authentication flow, see [AuthContext.jsx](src/context/AuthContext.jsx)
