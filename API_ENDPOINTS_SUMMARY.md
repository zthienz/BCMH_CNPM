# 🏛️ Tra Vinh Travel API - Complete Endpoints Summary

## 📋 Overview

This document provides a complete summary of all API endpoints available in the Tra Vinh Travel system, including the newly added chatbot functionality.

## 🔗 Base URL
```
http://localhost:3001
```

## 📚 Complete API Endpoints

### 🏥 Health & System Info (2 endpoints)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Server health check | ❌ |
| GET | `/api/info` | API information and endpoints | ❌ |

### 🔐 Authentication (5 endpoints)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | User registration | ❌ |
| POST | `/api/auth/login` | User login (JWT) | ❌ |
| GET | `/api/auth/session` | Get current session | ✅ |
| POST | `/api/auth/refresh` | Refresh JWT token | ✅ |
| POST | `/api/auth/logout` | User logout | ✅ |

### 👥 User Management (7 endpoints)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | Get all users | ✅ Admin |
| GET | `/api/users/:id` | Get user by ID | ✅ |
| GET | `/api/users/profile` | Get current user profile | ✅ |
| PUT | `/api/users/profile` | Update current user profile | ✅ |
| PUT | `/api/users/password` | Change password | ✅ |
| PUT | `/api/users/:id` | Update user | ✅ Admin |
| DELETE | `/api/users/:id` | Delete user | ✅ Admin |

### 🏛️ Location Management (7 endpoints)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/locations` | Get all locations | ❌ |
| GET | `/api/locations/:id` | Get location by ID | ❌ |
| GET | `/api/locations/search` | Search locations | ❌ |
| GET | `/api/locations/category/:category` | Get locations by category | ❌ |
| POST | `/api/locations` | Create location | ✅ Admin |
| PUT | `/api/locations/:id` | Update location | ✅ Admin |
| DELETE | `/api/locations/:id` | Delete location | ✅ Admin |

### 📊 Analytics & Ratings (4 endpoints)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/locations/:id/rating` | Submit location rating | ✅ |
| GET | `/api/locations/:id/ratings` | Get location ratings | ❌ |
| GET | `/api/locations?sort=LuotXem` | Get popular locations | ❌ |
| GET | `/api/locations?sort=DanhGia` | Get top rated locations | ❌ |

### 📁 File Upload (2 endpoints)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/uploads/image` | Upload image file | ✅ |
| DELETE | `/api/uploads/:filename` | Delete uploaded file | ✅ Admin |

### 🤖 AI Chatbot & Gemini (10 endpoints)

#### Backend API Endpoints (4 endpoints)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/chatbot/chat` | Chat with AI assistant | ✅ |
| GET | `/api/chatbot/suggestions` | Get chat suggestions | ❌ |
| POST | `/api/chatbot/feedback` | Submit chat feedback | ✅ |
| GET | `/api/chatbot/stats` | Get chatbot statistics | ✅ Admin |

#### Direct Gemini API Calls (6 endpoints)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `https://generativelanguage.googleapis.com/.../generateContent` | Direct Gemini API | API Key |
| - | Chat with Gemini (Direct API) | Tourism expert chatbot | API Key |
| - | Chat - Tourism Question | Ask about destinations | API Key |
| - | Chat - Khmer Culture | Learn about culture | API Key |
| - | Chat - Travel Recommendations | Get travel itineraries | API Key |
| - | Test API Key Validity | Validate Gemini API key | API Key |

### 🔍 Session-based Auth (6 endpoints)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Session-based login | ❌ |
| POST | `/api/auth/register` | Session-based registration | ❌ |
| GET | `/api/auth/session` | Check session status | ❌ |
| GET | `/api/auth/user` | Get current user info | ❌ |
| POST | `/api/auth/check-email` | Check email availability | ❌ |
| POST | `/api/auth/logout` | Session logout | ❌ |

## 📊 Total Endpoints Summary

| Category | Count | Description |
|----------|-------|-------------|
| **Health & Info** | 2 | System status and information |
| **Authentication** | 5 | JWT-based authentication |
| **User Management** | 7 | User CRUD operations |
| **Location Management** | 7 | Tourism location CRUD |
| **Analytics & Ratings** | 4 | Location ratings and statistics |
| **File Upload** | 2 | Image upload and management |
| **AI Chatbot (Backend)** | 4 | Backend chatbot API |
| **AI Chatbot (Direct)** | 6 | Direct Gemini API calls |
| **Session Auth** | 6 | Alternative session-based auth |
| **TOTAL** | **43** | **Complete API coverage** |

## 🔑 Authentication Types

### 1. JWT Token Authentication
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Gemini API Key
```http
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=AIzaSy...
```

### 3. Session-based (Cookies)
```http
Cookie: connect.sid=s%3A...
```

## 🎯 Key Features

### ✅ Complete CRUD Operations
- **Users**: Full user management with roles
- **Locations**: Tourism destination management
- **Ratings**: User feedback and analytics
- **Files**: Image upload and management

### ✅ AI Integration
- **Real Gemini API**: Direct integration with Google's Gemini AI
- **Context-aware Chat**: Tourism, culture, and travel planning contexts
- **Feedback System**: User rating and feedback for AI responses
- **Usage Analytics**: Admin statistics for chatbot usage

### ✅ Security Features
- **JWT Authentication**: Secure token-based auth
- **Role-based Access**: Admin vs User permissions
- **Input Validation**: Request validation and sanitization
- **CORS Support**: Cross-origin resource sharing

### ✅ Advanced Features
- **Search & Filtering**: Location search with multiple criteria
- **Pagination**: Efficient data loading
- **File Upload**: Image handling with validation
- **Analytics**: View counts, ratings, and usage statistics

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:3001
```

### 2. Environment Variables
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dulichtravinh

# JWT
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Postman Testing
1. Import `Tra_Vinh_Travel_API.postman_collection.json`
2. Import `Tra_Vinh_Travel_Environment.postman_environment.json`
3. Set environment to "🏛️ Tra Vinh Travel - Development"
4. Start with Health Check → Authentication → Test other endpoints

## 📈 Usage Examples

### Authentication Flow
```
1. POST /api/auth/register → Create account
2. POST /api/auth/login → Get JWT token
3. Use token in Authorization header for protected endpoints
```

### Chatbot Flow
```
1. POST /api/chatbot/chat → Send message to AI
2. GET /api/chatbot/suggestions → Get suggested questions
3. POST /api/chatbot/feedback → Rate AI response
```

### Location Management Flow
```
1. GET /api/locations → Browse all locations
2. GET /api/locations/search?q=chùa → Search locations
3. POST /api/locations/:id/rating → Rate location
4. GET /api/locations/:id/ratings → View ratings
```

## 🔧 Development Notes

### Adding New Endpoints
1. Add endpoint to main server file
2. Update `/api/info` endpoint documentation
3. Add to Postman collection
4. Update this documentation

### Chatbot Integration
- Frontend uses direct Gemini API calls
- Backend provides proxy API for server-side chat
- Both approaches supported in Postman collection

### Database Schema
- `TaiKhoanNguoiDung`: User accounts
- `diadiemdulich`: Tourism locations
- Additional tables for ratings, uploads, etc.

---

**Last Updated:** January 2024  
**API Version:** 1.0.0  
**Total Endpoints:** 43
