# 🏛️ Tra Vinh Travel API - Postman Guide

## 📋 Overview

This Postman collection provides complete API testing for the Tra Vinh Tourism Management System. It includes all endpoints for authentication, user management, location management, and file uploads.

## 📁 Files Included

- **`Tra_Vinh_Travel_API.postman_collection.json`** - Main API collection
- **`Tra_Vinh_Travel_Environment.postman_environment.json`** - Environment variables
- **`POSTMAN_API_GUIDE.md`** - This guide

## 🚀 Quick Start

### 1. Import Files into Postman

1. **Open Postman**
2. **Import Collection:**
   - Click "Import" button
   - Select `Tra_Vinh_Travel_API.postman_collection.json`
   - Click "Import"

3. **Import Environment:**
   - Click "Import" button  
   - Select `Tra_Vinh_Travel_Environment.postman_environment.json`
   - Click "Import"

4. **Select Environment:**
   - Click environment dropdown (top right)
   - Select "🏛️ Tra Vinh Travel - Development"

### 2. Start Backend Server

```bash
cd backend
npm install
npm start
# Server should start on http://localhost:3001
```

### 3. Test API Connection

1. **Run Health Check:**
   - Go to "🏥 Health & Info" folder
   - Click "Health Check"
   - Click "Send"
   - Should return status 200 with server info

## 📚 API Endpoints Overview

### 🏥 Health & Info
- **GET** `/health` - Server health check
- **GET** `/api/info` - API information and endpoints

### 🔐 Authentication (JWT-based)
- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - Login user (returns JWT token)
- **GET** `/api/auth/session` - Get current session
- **POST** `/api/auth/refresh` - Refresh JWT token
- **POST** `/api/auth/logout` - Logout user

### 👥 User Management
- **GET** `/api/users` - Get all users (Admin only)
- **GET** `/api/users/:id` - Get user by ID
- **GET** `/api/users/profile` - Get current user profile
- **PUT** `/api/users/profile` - Update current user profile
- **PUT** `/api/users/password` - Change password
- **PUT** `/api/users/:id` - Update user (Admin only)
- **DELETE** `/api/users/:id` - Delete user (Admin only)

### 🏛️ Location Management
- **GET** `/api/locations` - Get all locations (with pagination)
- **GET** `/api/locations/:id` - Get location by ID
- **GET** `/api/locations/search` - Search locations
- **GET** `/api/locations/category/:category` - Get locations by category
- **POST** `/api/locations` - Create location (Admin only)
- **PUT** `/api/locations/:id` - Update location (Admin only)
- **DELETE** `/api/locations/:id` - Delete location (Admin only)

### 📁 File Upload
- **POST** `/api/uploads/image` - Upload image file
- **DELETE** `/api/uploads/:filename` - Delete uploaded file (Admin only)

### 🤖 AI Chatbot & Gemini
- **POST** `https://generativelanguage.googleapis.com/.../generateContent` - Direct Gemini API calls
- **Chat with Gemini** - Tourism expert chatbot (same as frontend)
- **Tourism Questions** - Ask about Tra Vinh destinations
- **Khmer Culture** - Learn about Khmer temples and culture
- **Travel Recommendations** - Get detailed travel itineraries
- **Test API Key** - Validate Gemini API key

### 📊 Analytics & Ratings
- **POST** `/api/locations/:id/rating` - Submit location rating
- **GET** `/api/locations/:id/ratings` - Get location ratings
- **GET** `/api/locations?sort=LuotXem` - Get popular locations
- **GET** `/api/locations?sort=DanhGia` - Get top rated locations

### 🔍 Session-based Auth (Alternative)
- Alternative authentication using sessions instead of JWT
- Same endpoints but different authentication mechanism

## 🔧 Usage Instructions

### Step 1: Authentication

#### Option A: JWT Authentication (Recommended)
1. **Register User:**
   - Go to "🔐 Authentication" → "Register User"
   - Modify email/username if needed
   - Click "Send"
   - User will be created

2. **Login:**
   - Go to "🔐 Authentication" → "Login User"
   - Click "Send"
   - JWT token will be automatically saved to environment

#### Option B: Session Authentication
1. Use endpoints in "🔍 Session-based Auth" folder
2. Sessions are maintained via cookies

### Step 2: Test User Management

1. **Get Profile:**
   - Go to "👥 User Management" → "Get Current User Profile"
   - Click "Send"

2. **Update Profile:**
   - Go to "👥 User Management" → "Update User Profile"
   - Modify name/email in request body
   - Click "Send"

### Step 3: Test Location Management

1. **Get All Locations:**
   - Go to "🏛️ Location Management" → "Get All Locations"
   - Click "Send"

2. **Search Locations:**
   - Go to "🏛️ Location Management" → "Search Locations"
   - Modify search query
   - Click "Send"

3. **Create Location (Admin only):**
   - Go to "🏛️ Location Management" → "Create Location (Admin)"
   - Modify location data in request body
   - Click "Send"

### Step 4: Test AI Chatbot

1. **Test API Key:**
   - Go to "🤖 AI Chatbot & Gemini" → "Test API Key Validity"
   - Click "Send"
   - Should return 200 if API key is valid

2. **Chat with AI:**
   - Go to "🤖 AI Chatbot & Gemini" → "Chat with Gemini (Direct API)"
   - Click "Send"
   - AI will respond about Ao Bà Om

3. **Ask Tourism Questions:**
   - Go to "🤖 AI Chatbot & Gemini" → "Chat - Tourism Question"
   - Modify the question in request body
   - Click "Send"

### Step 5: Test Analytics & Ratings

1. **Rate a Location:**
   - Go to "📊 Analytics & Ratings" → "Rate Location"
   - Make sure you have a location_id set
   - Modify rating and comment
   - Click "Send"

2. **Get Popular Locations:**
   - Go to "📊 Analytics & Ratings" → "Get Popular Locations"
   - Click "Send"

### Step 6: Test File Upload

1. **Upload Image:**
   - Go to "📁 File Upload" → "Upload Image"
   - Select an image file in the form-data
   - Click "Send"

## 🔑 Environment Variables

The collection uses these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `base_url` | API server URL | `http://localhost:3001` |
| `auth_token` | JWT authentication token | Auto-set after login |
| `user_id` | Current user ID | Auto-set after login |
| `location_id` | Location ID for testing | Auto-set after creating location |
| `test_email` | Test user email | `test@travinh.com` |
| `test_username` | Test user name | `Test User` |
| `test_password` | Test user password | `password123` |
| `gemini_api_key` | Gemini AI API key | `AIzaSy...` |
| `last_ai_response` | Last AI response | Auto-set after chat |
| `rating_id` | Rating ID for testing | Auto-set after rating |

## 🧪 Testing Scenarios

### Scenario 1: Complete User Journey
1. Register new user
2. Login user
3. Get user profile
4. Update profile
5. Change password
6. Logout

### Scenario 2: Location Management (Admin)
1. Login as admin
2. Create new location
3. Get location details
4. Update location
5. Search locations
6. Delete location

### Scenario 3: AI Chatbot Testing
1. Test API key validity
2. Ask tourism questions
3. Get travel recommendations
4. Test different chat scenarios

### Scenario 4: Analytics & Ratings
1. Login user
2. Rate multiple locations
3. Get popular locations
4. Get top rated locations
5. Analyze rating trends

### Scenario 5: File Upload
1. Login user
2. Upload image
3. Use uploaded image in location creation
4. Delete uploaded file (admin)

## 🔍 Response Examples

### Successful Response
```json
{
    "success": true,
    "message": "Operation successful",
    "data": {
        "user": {
            "id": "TK001",
            "name": "Test User",
            "email": "test@travinh.com",
            "type": "Khach"
        }
    }
}
```

### Error Response
```json
{
    "success": false,
    "message": "Email already exists",
    "error": "Duplicate entry"
}
```

## 🛠️ Troubleshooting

### Common Issues

1. **Server not responding:**
   - Check if backend server is running on port 3001
   - Verify database connection

2. **Authentication failed:**
   - Check if JWT token is valid
   - Re-login to get new token

3. **Permission denied:**
   - Check if user has required permissions (Admin for admin endpoints)

4. **File upload failed:**
   - Check file size (max 5MB)
   - Verify file type (JPEG, PNG, GIF, WebP only)

### Debug Tips

1. **Check Console:**
   - Open Postman Console (View → Show Postman Console)
   - Check for detailed error messages

2. **Verify Environment:**
   - Check if correct environment is selected
   - Verify environment variables are set

3. **Test Individual Endpoints:**
   - Start with health check
   - Test authentication first
   - Then test other endpoints

## 📊 Collection Features

### Auto-Generated Variables
- JWT tokens are automatically saved after login
- User IDs are captured from responses
- Location IDs are saved for testing

### Global Tests
- Response time validation (< 5000ms)
- JSON content-type validation
- Success field validation

### Pre-request Scripts
- Auto-set base URL if not configured
- Default test credentials setup

## 🎯 Best Practices

1. **Always test health check first**
2. **Login before testing protected endpoints**
3. **Use environment variables for dynamic data**
4. **Check response status and structure**
5. **Clean up test data after testing**

## 📞 Support

If you encounter issues:
1. Check server logs in backend console
2. Verify database connection
3. Check Postman console for detailed errors
4. Ensure all required fields are provided in requests

---

**Happy Testing!** 🚀

*Last updated: January 2024*
