# Du Lich Tra Vinh - Backend API

## 🚀 Production Deployment Guide

### Prerequisites
- Node.js 16+ installed
- MySQL/MariaDB database running
- All required npm packages installed

### Security Configuration

#### 1. Environment Variables
Create a `.env` file with the following variables:

```env
# Server Configuration
NODE_ENV=production
PORT=3001

# Database Configuration (KEEP SECURE!)
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_NAME=dulichtravinh

# Security Configuration (CHANGE THESE!)
JWT_SECRET=your_very_secure_jwt_secret_key_here
SESSION_SECRET=your_very_secure_session_secret_here

# CORS Configuration
CORS_ORIGIN=http://yourdomain.com,https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=error
```

#### 2. Security Features Enabled

✅ **Rate Limiting**: 100 requests per 15 minutes per IP
✅ **Input Validation**: All user inputs are validated
✅ **CORS Protection**: Only allowed origins can access the API
✅ **JWT Authentication**: Secure token-based authentication
✅ **Password Hashing**: bcrypt with 12 rounds
✅ **Error Handling**: No sensitive information exposed in production
✅ **File Upload Security**: Only image files allowed, size limited to 5MB

### 🔒 Security Checklist

- [ ] Change default JWT_SECRET in .env file
- [ ] Change default SESSION_SECRET in .env file
- [ ] Update database password
- [ ] Configure CORS_ORIGIN for your domain
- [ ] Set NODE_ENV=production
- [ ] Review and update rate limiting settings
- [ ] Ensure .env file is not committed to version control
- [ ] Set up HTTPS in production
- [ ] Configure firewall rules
- [ ] Regular security updates

### 🚀 Starting the Server

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
# Windows
start-production.bat

# Linux/Mac
NODE_ENV=production node restful-api-server.js
```

### 📁 File Structure

```
backend/
├── .env                    # Environment variables (KEEP SECURE!)
├── .gitignore             # Git ignore rules
├── package.json           # Dependencies
├── restful-api-server.js  # Main server file
├── uploads/               # Uploaded images
├── config/                # Configuration files
├── routes/                # Route handlers
└── utils/                 # Utility functions
```

### 🛡️ Security Best Practices

1. **Never commit .env file** to version control
2. **Use strong passwords** for database and JWT secrets
3. **Enable HTTPS** in production
4. **Regular security updates** for all dependencies
5. **Monitor logs** for suspicious activities
6. **Backup database** regularly
7. **Use firewall** to restrict access
8. **Implement proper logging** and monitoring

### 🔧 Maintenance

#### Update Dependencies
```bash
npm audit
npm audit fix
npm update
```

#### Database Backup
```bash
mysqldump -u username -p dulichtravinh > backup.sql
```

#### Log Monitoring
Check server logs regularly for:
- Failed login attempts
- Rate limit violations
- Unusual API usage patterns
- Error messages

### 📞 Support

For security issues or questions, please contact the development team.

---

**⚠️ IMPORTANT**: This API contains sensitive user data. Always follow security best practices and keep all credentials secure.
