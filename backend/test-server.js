const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(express.json());

app.get('/health', (req, res) => {
    console.log('Health check requested');
    res.json({ status: 'OK', port: PORT });
});

app.post('/api/auth/login', (req, res) => {
    console.log('Login request:', req.body);
    const { email, password } = req.body;
    
    // Test credentials
    if (email === 'vpt123@gmail.com' && password === '123456') {
        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                user: {
                    id: 1,
                    name: 'Test User',
                    email: email,
                    type: 'user'
                }
            }
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Email hoặc mật khẩu không đúng'
        });
    }
});

app.post('/api/auth/register', (req, res) => {
    console.log('Register request:', req.body);
    res.json({
        success: true,
        message: 'Đăng ký thành công',
        data: {
            user: {
                id: 2,
                name: req.body.username,
                email: req.body.email,
                type: 'user'
            }
        }
    });
});

app.get('/api/auth/session', (req, res) => {
    res.json({
        success: true,
        data: {
            logged_in: false,
            user: null
        }
    });
});

app.post('/api/auth/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Đăng xuất thành công'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Test Server running on http://localhost:${PORT}`);
    console.log(`🔗 Health: http://localhost:${PORT}/health`);
    console.log(`📧 Test login: vpt123@gmail.com / 123456`);
});
