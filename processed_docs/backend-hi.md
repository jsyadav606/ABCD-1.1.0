# BACKEND दस्तावेज़ीकरण

## TOGGLE_CAN_LOGIN_GUIDE

## **toggleCanLogin Endpoint - Complete Testing Guide**

### **Issues Fixed:**
1. ✅ Added validation for `enable` parameter (was doing nothing if enable was undefined)
2. ✅ Added user सक्रिय स्थिति check BEFORE enabling लॉगिन (with helpful त्रुटि message)
3. ✅ Added proper त्रुटि handling for UserLogin creation
4. ✅ Fetch fresh user data after save to confirm changes
5. ✅ Added console logging for debugging

---

### **Business Logic Implemented:**

**When enabling लॉगिन (enable: true):**
- ❌ REJECT if user is NOT सक्रिय (isActive === false)
- ✅ Allow only if user is सक्रिय (isActive === true)
- Create UserLogin credentials automatically (unless already exists)
- Generate username from user नाम with numeric suffix handling
- Set canLogin = true

**When disabling लॉगिन (enable: false):**
- हटाएं all UserLogin records for this user
- Set canLogin = false
- NO requirement for user to be सक्रिय

---

### **API Endpoint Details:**

```
POST /api/v1/users/:id/toggle-can-लॉगिन
Content-Type: application/json

Required Fields in Body:
{
  "enable": true | false
}

Optional Fields:
{
  "loginId": "custom_username"  // If provided, uses this as username instead of generating from नाम
}
```

---

### **Example Requests:**

#### **Test 1: Enable लॉगिन for सक्रिय User (सफलता)**
```bash
curl -X POST http://localhost:3000/api/v1/users/USER_ID/toggle-can-लॉगिन \
  -H "Content-Type: application/json" \
  -d '{"enable": true}'

Expected Response (200):
{
  "statusCode": 200,
  "सफलता": true,
  "message": "लॉगिन enabled successfully for user John Doe",
  "data": {
    "_id": "USER_ID",
    "नाम": "John Doe",
    "canLogin": true,
    "isActive": true,
    ...
  }
}
```

#### **Test 2: Enable लॉगिन for निष्क्रिय User (FAILURE)**
```bash
curl -X POST http://localhost:3000/api/v1/users/USER_ID/toggle-can-लॉगिन \
  -H "Content-Type: application/json" \
  -d '{"enable": true}'

Expected Response (400):
{
  "statusCode": 400,
  "सफलता": false,
  "message": "Cannot enable लॉगिन for निष्क्रिय user. User \"John Doe\" must be सक्रिय first. Please enable user स्थिति (isActive) before enabling लॉगिन.",
  "errors": []
}
```

#### **Test 3: Disable लॉगिन (सफलता)**
```bash
curl -X POST http://localhost:3000/api/v1/users/USER_ID/toggle-can-लॉगिन \
  -H "Content-Type: application/json" \
  -d '{"enable": false}'

Expected Response (200):
{
  "statusCode": 200,
  "सफलता": true,
  "message": "लॉगिन disabled successfully for user John Doe",
  "data": {
    "_id": "USER_ID",
    "नाम": "John Doe",
    "canLogin": false,
    "isActive": true,
    ...
  }
}
```

#### **Test 4: Enable with Custom Username**
```bash
curl -X POST http://localhost:3000/api/v1/users/USER_ID/toggle-can-लॉगिन \
  -H "Content-Type: application/json" \
  -d '{"enable": true, "loginId": "johndoe123"}'

Expected Response (200):
{
  "statusCode": 200,
  "सफलता": true,
  "message": "लॉगिन enabled successfully for user John Doe",
  "data": {
    "_id": "USER_ID",
    "नाम": "John Doe",
    "canLogin": true,
    ...
  }
}

UserLogin Collection will have: { username: "johndoe123", user: USER_ID, ... }
```

---

### **Workflow to Enable लॉगिन for a User:**

**Step 1:** Make sure user is सक्रिय
```bash
POST /api/v1/users/:id/toggle-is-सक्रिय
{"enable": true}
```

**Step 2:** Enable लॉगिन after user is सक्रिय
```bash
POST /api/v1/users/:id/toggle-can-लॉगिन
{"enable": true}
```

**Result:** User can now लॉगिन, credentials created automatically

---

### **What Gets Created in Database:**

When enable=true and user is सक्रिय:

**User Collection (AFTER):**
```
{
  "_id": ObjectId("..."),
  "नाम": "John Doe",
  "canLogin": true,
  "isActive": true,
  ...
}
```

**UserLogin Collection (NEW RECORD CREATED):**
```
{
  "_id": ObjectId("..."),
  "user": ObjectId("..."),  // Reference to User
  "username": "john.doe",    // Auto-generated or from loginId param
  "password": "$2b$10$...",  // Hashed default password (bcrypt)
  "forcePasswordChange": true,
  "isLoggedIn": false,
  ...
}
```

When enable=false:

**UserLogin Collection:** DELETED ❌
**User.canLogin:** Set to false

---

### **त्रुटि Cases & Messages:**

| Scenario | स्थिति | Message |
|----------|--------|---------|
| User not found | 404 | "User not found" |
| User निष्क्रिय when enabling | 400 | "Cannot enable लॉगिन for निष्क्रिय user. User '...' must be सक्रिय first..." |
| Missing enable param | 400 | "Enable flag is required (true/false)" |
| Failed to create credentials | 500 | "Failed to create लॉगिन credentials: ..." |

---

### **Key Points to Remember:**

✅ **Always check isActive before enabling लॉगिन**
✅ **Disabling isActive automatically disables canLogin** 
✅ **Username auto-generated (firstname.lastname)** with numeric suffix
✅ **Default password used**: 12345678 (set via DEFAULT_PASSWORD env var)
✅ **forcePasswordChange**: Always set to true when credentials created
✅ **Console logs**: Check server console for debugging

---

### **Server Console Output (When enable=true):**

```
✅ लॉगिन credentials created for user 64d5f2a1b8c9d0e1f2g3h4i5: username = john.doe
✅ User updated - canLogin is now: true
```

---

### **Testing Now:**

1. Start your backend server
2. Use any of the above curl commands
3. Check response messages match expected
4. Verify isActive स्थिति requirement is enforced
5. Check console logs for detailed debugging


---

