<?php
/**
 * Authentication API Endpoints
 * Handles user login, registration, and session management
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../includes/functions.php';

// Start session
session_start();

// Get request method and data
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

try {
    switch ($method) {
        case 'POST':
            $action = $input['action'] ?? '';
            
            switch ($action) {
                case 'login':
                    handleLogin($input);
                    break;
                    
                case 'register':
                    handleRegister($input);
                    break;
                    
                case 'logout':
                    handleLogout();
                    break;
                    
                case 'check_session':
                    checkSession();
                    break;
                    
                default:
                    throw new Exception('Invalid action');
            }
            break;
            
        case 'GET':
            // Get current user info
            getCurrentUser();
            break;
            
        default:
            throw new Exception('Method not allowed');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

/**
 * Handle user login
 */
function handleLogin($data) {
    global $pdo;
    
    // Validate input
    if (empty($data['email']) || empty($data['password'])) {
        throw new Exception('Email và mật khẩu không được để trống');
    }
    
    $email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
    if (!$email) {
        throw new Exception('Email không hợp lệ');
    }
    
    // Check user in database
    $stmt = $pdo->prepare("
        SELECT id, name, email, password, status, created_at 
        FROM users 
        WHERE email = ? AND status = 'active'
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        throw new Exception('Email hoặc mật khẩu không đúng');
    }
    
    // Verify password
    if (!password_verify($data['password'], $user['password'])) {
        throw new Exception('Email hoặc mật khẩu không đúng');
    }
    
    // Create session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['login_time'] = time();
    
    // Update last login
    $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
    $stmt->execute([$user['id']]);
    
    // Log login activity
    logActivity($user['id'], 'login', 'User logged in');
    
    echo json_encode([
        'success' => true,
        'message' => 'Đăng nhập thành công',
        'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'login_time' => $_SESSION['login_time']
        ]
    ]);
}

/**
 * Handle user registration
 */
function handleRegister($data) {
    global $pdo;
    
    // Validate input
    if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
        throw new Exception('Tất cả các trường đều bắt buộc');
    }
    
    $name = trim($data['name']);
    $email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
    $password = $data['password'];
    
    if (!$email) {
        throw new Exception('Email không hợp lệ');
    }
    
    if (strlen($name) < 2) {
        throw new Exception('Họ và tên phải có ít nhất 2 ký tự');
    }
    
    if (strlen($password) < 6) {
        throw new Exception('Mật khẩu phải có ít nhất 6 ký tự');
    }
    
    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        throw new Exception('Email này đã được sử dụng');
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new user
    $stmt = $pdo->prepare("
        INSERT INTO users (name, email, password, status, created_at) 
        VALUES (?, ?, ?, 'active', NOW())
    ");
    
    if ($stmt->execute([$name, $email, $hashedPassword])) {
        $userId = $pdo->lastInsertId();
        
        // Log registration activity
        logActivity($userId, 'register', 'User registered');
        
        echo json_encode([
            'success' => true,
            'message' => 'Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.',
            'user_id' => $userId
        ]);
    } else {
        throw new Exception('Có lỗi xảy ra khi tạo tài khoản');
    }
}

/**
 * Handle user logout
 */
function handleLogout() {
    if (isset($_SESSION['user_id'])) {
        // Log logout activity
        logActivity($_SESSION['user_id'], 'logout', 'User logged out');
        
        // Destroy session
        session_destroy();
        
        echo json_encode([
            'success' => true,
            'message' => 'Đăng xuất thành công'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Không có phiên đăng nhập nào'
        ]);
    }
}

/**
 * Check current session
 */
function checkSession() {
    if (isset($_SESSION['user_id'])) {
        echo json_encode([
            'success' => true,
            'logged_in' => true,
            'user' => [
                'id' => $_SESSION['user_id'],
                'name' => $_SESSION['user_name'],
                'email' => $_SESSION['user_email'],
                'login_time' => $_SESSION['login_time']
            ]
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'logged_in' => false
        ]);
    }
}

/**
 * Get current user info
 */
function getCurrentUser() {
    global $pdo;
    
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Chưa đăng nhập');
    }
    
    $stmt = $pdo->prepare("
        SELECT id, name, email, status, created_at, last_login 
        FROM users 
        WHERE id = ?
    ");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        throw new Exception('Không tìm thấy thông tin người dùng');
    }
    
    echo json_encode([
        'success' => true,
        'user' => $user
    ]);
}

/**
 * Log user activity
 */
function logActivity($userId, $action, $description) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO user_activities (user_id, action, description, ip_address, user_agent, created_at) 
            VALUES (?, ?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            $userId,
            $action,
            $description,
            $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ]);
    } catch (Exception $e) {
        // Log error but don't throw exception
        error_log("Failed to log activity: " . $e->getMessage());
    }
}
?>
