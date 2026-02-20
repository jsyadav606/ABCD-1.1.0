# Login Functionality Implementation Guide

## Overview
This document outlines the proper login functionality implemented for the ABCD Application, including authentication flow, token management, and error handling.

## Architecture

### Token Management Strategy
```
┌─────────────────────────────────────────────────────────────┐
│ Browser                                                     │
├─────────────────────────────────────────────────────────────┤
│ localStorage: accessToken (in-memory)                       │
│ Cookie: refreshToken (httpOnly, secure, auto-managed)      │
└─────────────────────────────────────────────────────────────┘
                              ↕
                         API Calls
                              ↕
┌─────────────────────────────────────────────────────────────┐
│ Server                                                      │
├─────────────────────────────────────────────────────────────┤
│ Response Body: { accessToken, user, deviceId }             │
│ Response Cookie: refreshToken (httpOnly)                   │
│ Validation: Device tracking & token versioning             │
└─────────────────────────────────────────────────────────────┘
```

## Changes Made

### 1. Frontend API Service (`src/services/api.js`)

#### Changes:
- **Fixed login endpoint** to send `loginId` instead of `email` (accepts username, userId, or email)
- **Added device ID support** for multi-device tracking
- **Implemented automatic token refresh** using interceptors
- **Added credentials flag** to allow cookies to be sent automatically
- **Queue failed requests** during token refresh to prevent race conditions

#### Key Features:
```javascript
// Login can now accept username, userId, or email
POST /auth/login { loginId, password, deviceId }

// Automatic token refresh when accessToken expires
POST /auth/refresh { deviceId }

// Token Management:
// - accessToken: Stored in localStorage, passed in Authorization header
// - refreshToken: Stored in httpOnly cookie, auto-sent by browser
```

### 2. Authentication Context (`src/context/AuthContext.jsx`)

#### Changes:
- **Fixed response field mapping** from `token` to `accessToken`
- **Added device ID generation and persistence** using sessionStorage
- **Improved token storage** using `accessToken` instead of `authToken`
- **Added password change handling** with `forcePasswordChange` flag
- **Implemented new auth methods**: `logoutAll()`, `changePassword()`
- **Better error handling** with proper error messages

#### Key Features:
```javascript
// Login response handling
{
  success: true,
  user: userData,
  forcePasswordChange: false,
  deviceId: "device-uuid"
}

// Device tracking
const deviceId = sessionStorage.getItem('deviceId') || uuidv4()

// Available methods:
- login(loginId, password)
- logout(deviceId)
- logoutAll()
- changePassword(oldPassword, newPassword, confirmPassword)
- clearError()
```

### 3. Login Page (`src/pages/Login.jsx`)

#### Changes:
- **Updated input label** from "Email Address" to "Username, Email, or User ID"
- **Added validation** for required fields and password length
- **Improved error handling** with separate validation error display
- **Added forcePasswordChange redirect** to password change page
- **Auto-focus** on login field for better UX
- **Auto-redirect** if user is already authenticated

#### Features:
- Form validation before submission
- Clear distinction between validation and auth errors
- Proper password change flow enforcement
- Account lock/temporary unavailable messages

## Authentication Flow

### 1. Login Flow
```
User inputs: loginId (username/email/userId) + password
                                ↓
                    Frontend validates form
                                ↓
                    POST /auth/login { loginId, password, deviceId }
                                ↓
Backend:
  - Find UserLogin by username/userId/email
  - Verify password
  - Check if canLogin && isActive
  - Check if account is locked
  - Reset failed attempts
  - Generate accessToken + refreshToken
  - Set device info
                                ↓
Response:
  - Body: { user, accessToken, deviceId, forcePasswordChange }
  - Cookie: refreshToken (httpOnly)
                                ↓
Frontend:
  - Store accessToken in localStorage
  - Store user in localStorage
  - Set Authorization header for next requests
  - Redirect to /dashboard (or /change-password if forcePasswordChange)
```

### 2. Request Flow (Authenticated)
```
Any API request:
                                ↓
Add Authorization header:
  Authorization: Bearer {accessToken}
                                ↓
                    Request sent (with cookies auto-included)
                                ↓
Backend verifies:
  - Token valid
  - Device recognized
  - Token version matches device version
  - User canLogin && !isBlocked
                                ↓
Process request and respond
```

### 3. Token Refresh Flow (When Access Token Expires)
```
API returns 401 Unauthorized
                                ↓
Frontend interceptor catches error
                                ↓
Check if already refreshing (prevent race conditions)
                                ↓
If not refreshing:
  POST /auth/refresh { deviceId }
  (refreshToken auto-sent in cookie)
                                ↓
Backend:
  - Verify refreshToken
  - Check device match
  - Generate new accessToken + new refreshToken
  - Return new accessToken
  - Set new refreshToken cookie
                                ↓
Frontend:
  - Store new accessToken
  - Retry original request with new token
  - If multiple requests were queued, process them all
                                ↓
If refresh fails:
  - Clear tokens
  - Redirect to /login
```

### 4. Logout Flow
```
User clicks logout:
                                ↓
POST /auth/logout { deviceId }
(accessToken in Authorization header)
                                ↓
Backend:
  - Find UserLogin record
  - Mark device as logged out
  - Clear refreshToken for device
                                ↓
Frontend:
  - Clear localStorage (accessToken, user)
  - Redirect to /login
```

## Backend Integration

### Required Endpoints
All endpoints are properly implemented in the backend. The frontend expects:

```javascript
POST /auth/login
  Input: { loginId, password, deviceId? }
  Output: { user, accessToken, deviceId, forcePasswordChange }
  Cookie: refreshToken (httpOnly)

POST /auth/refresh
  Input: { deviceId? }
  Cookie: refreshToken (auto-sent)
  Output: { accessToken }
  Cookie: refreshToken (new, auto-set)

POST /auth/logout
  Input: { deviceId? }
  Header: Authorization: Bearer {accessToken}
  Output: { message }
  Cookie: refreshToken cleared

POST /auth/logout-all
  Header: Authorization: Bearer {accessToken}
  Output: { message }
  Cookie: refreshToken cleared

POST /auth/change-password
  Input: { oldPassword, newPassword, confirmPassword }
  Header: Authorization: Bearer {accessToken}
  Output: { message }

GET /auth/devices
  Header: Authorization: Bearer {accessToken}
  Output: { devices: [...] }
```

## Error Handling

### Frontend Error Scenarios

1. **Invalid Credentials (401)**
   - Message: "Invalid login credentials"
   - Action: Display error, allow retry

2. **Account Locked (429)**
   - Message: "Account is locked. Try again in X minutes."
   - Action: Display error, disable btn for countdown

3. **User Not Allowed to Login (403)**
   - Message: "User is not allowed to login"
   - Action: Clear tokens, show error message

4. **Network Error**
   - Message: Auto-generated from axios
   - Action: Display error, allow retry

5. **Token Expired (401 during request)**
   - Automatic: Refresh token interceptor handles this
   - User sees: Seamless request continuation (transparent to UI)

6. **Refresh Token Expired**
   - Action: Clear tokens, redirect to /login
   - Force user to re-authenticate

7. **Validation Errors**
   - Required fields missing
   - Password too short
   - Shows inline validation messages

## Security Features

### Access Token
- Stored in localStorage (accessible by JS - needed for Authorization header)
- Short expiry (15 minutes)
- Includes device ID for device-scoped invalidation
- Verified on every request

### Refresh Token
- Stored in httpOnly cookie (not accessible by JS - prevents XSS attacks)
- Long expiry (10 days)
- Device-specific (each device has its own)
- Cannot be used for API calls, only for token refresh

### Device Tracking
- Each device gets unique deviceId (UUID)
- Device persisted in sessionStorage
- Server tracks: deviceId, refreshToken, tokenVersion, lastIP, userAgent
- Token version incremented on logout/password change
- Prevents token reuse across devices

### Account Protection
- Failed login attempts tracked
- Account locked after 5 failed attempts (15 minutes)
- Permanent account lock available for admins
- canLogin and isActive flags for additional control

## Configuration

### Frontend Environment Variables
```env
VITE_API_URL=http://localhost:4000/api/v1
VITE_APP_NAME=ABCD
NODE_ENV=development
```

### Backend Environment Variables
```env
PORT=4000
MONGO_URI=mongodb+srv://...
ACCESS_TOKEN_SECRET=...
REFRESH_TOKEN_SECRET=...
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=10D
CORS_ORIGIN=*
```

## Testing the Login

### Prerequisites
1. Backend running on `http://localhost:4000`
2. Frontend running on `http://localhost:5173`
3. MongoDB connected
4. Test user exists in database

### Steps
1. Navigate to login page
2. Enter username/userId/email
3. Enter password
4. Login should succeed and redirect to /dashboard
5. Check localStorage: should have `accessToken` and `user`
6. Check cookies: should have `refreshToken` (httpOnly)

### Testing Token Refresh
1. Login successfully
2. Wait for access token to expire (or manually clear it)
3. Make any API request
4. Should automatically refresh token without user action
5. Request should complete successfully

### Testing Logout
1. Login successfully
2. Click logout
3. Should be redirected to /login
4. localStorage should be cleared
5. Cookie should be cleared

## Common Issues & Solutions

### Issue: Login returns 400 "Login ID required"
**Cause**: Sending `email` instead of `loginId`
**Solution**: Use the updated API call with `loginId` parameter

### Issue: "Invalid token" after login
**Cause**: Token not properly stored in localStorage
**Solution**: Check that `VITE_API_URL` env var is correct

### Issue: Cookies not persisting
**Cause**: `withCredentials: true` not set in axios
**Solution**: Verified in updated api.js

### Issue: Infinite refresh loop
**Cause**: Refresh endpoint returning invalid token
**Solution**: Check backend refresh token endpoint

### Issue: "User is not allowed to login"
**Cause**: User's `canLogin` or `isActive` is false
**Solution**: Use admin API to enable user login

## Next Steps

1. ✅ Login with username/userId/email
2. ✅ Token refresh mechanism
3. ✅ Logout functionality
4. ⏭ Implement password reset
5. ⏭ Implement forgot password flow
6. ⏭ Implement role-based access control
7. ⏭ Implement two-factor authentication

---

**Last Updated**: February 20, 2026
**Status**: Fully Implemented and Tested
