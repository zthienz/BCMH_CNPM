-- Authentication Tables for Travel Website
-- Create tables for user management and authentication

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL,
    `email` varchar(150) NOT NULL UNIQUE,
    `password` varchar(255) NOT NULL,
    `phone` varchar(20) DEFAULT NULL,
    `avatar` varchar(255) DEFAULT NULL,
    `status` enum('active', 'inactive', 'banned') DEFAULT 'active',
    `email_verified` tinyint(1) DEFAULT 0,
    `email_verification_token` varchar(100) DEFAULT NULL,
    `password_reset_token` varchar(100) DEFAULT NULL,
    `password_reset_expires` datetime DEFAULT NULL,
    `last_login` datetime DEFAULT NULL,
    `login_count` int(11) DEFAULT 0,
    `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
    `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_email` (`email`),
    KEY `idx_status` (`status`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User activities table for logging
CREATE TABLE IF NOT EXISTS `user_activities` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) NOT NULL,
    `action` varchar(50) NOT NULL,
    `description` text DEFAULT NULL,
    `ip_address` varchar(45) DEFAULT NULL,
    `user_agent` text DEFAULT NULL,
    `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_action` (`action`),
    KEY `idx_created_at` (`created_at`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User sessions table (optional, for advanced session management)
CREATE TABLE IF NOT EXISTS `user_sessions` (
    `id` varchar(128) NOT NULL,
    `user_id` int(11) DEFAULT NULL,
    `ip_address` varchar(45) DEFAULT NULL,
    `user_agent` text DEFAULT NULL,
    `payload` longtext NOT NULL,
    `last_activity` int(11) NOT NULL,
    `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_last_activity` (`last_activity`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User preferences table
CREATE TABLE IF NOT EXISTS `user_preferences` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) NOT NULL,
    `preference_key` varchar(100) NOT NULL,
    `preference_value` text DEFAULT NULL,
    `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
    `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_user_preference` (`user_id`, `preference_key`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User favorites table (for favorite destinations)
CREATE TABLE IF NOT EXISTS `user_favorites` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) NOT NULL,
    `destination_id` int(11) NOT NULL,
    `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_user_favorite` (`user_id`, `destination_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_destination_id` (`destination_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`destination_id`) REFERENCES `diadiemdulich`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User reviews table (for destination reviews)
CREATE TABLE IF NOT EXISTS `user_reviews` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) NOT NULL,
    `destination_id` int(11) NOT NULL,
    `rating` tinyint(1) NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
    `title` varchar(200) DEFAULT NULL,
    `content` text DEFAULT NULL,
    `images` json DEFAULT NULL,
    `status` enum('pending', 'approved', 'rejected') DEFAULT 'pending',
    `helpful_count` int(11) DEFAULT 0,
    `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
    `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_user_review` (`user_id`, `destination_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_destination_id` (`destination_id`),
    KEY `idx_rating` (`rating`),
    KEY `idx_status` (`status`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`destination_id`) REFERENCES `diadiemdulich`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample admin user (password: admin123)
INSERT INTO `users` (`name`, `email`, `password`, `status`, `email_verified`) VALUES
('Administrator', 'admin@travinh-travel.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active', 1);

-- Insert sample regular user (password: user123)
INSERT INTO `users` (`name`, `email`, `password`, `status`, `email_verified`) VALUES
('Nguyễn Văn A', 'user@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active', 1);

-- Insert sample user preferences
INSERT INTO `user_preferences` (`user_id`, `preference_key`, `preference_value`) VALUES
(1, 'language', 'vi'),
(1, 'notifications', 'true'),
(1, 'theme', 'light'),
(2, 'language', 'vi'),
(2, 'notifications', 'true');

-- Create indexes for better performance
CREATE INDEX idx_users_email_status ON users(email, status);
CREATE INDEX idx_user_activities_user_action ON user_activities(user_id, action);
CREATE INDEX idx_user_reviews_destination_status ON user_reviews(destination_id, status);

-- Create views for common queries
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.status,
    u.created_at,
    u.last_login,
    u.login_count,
    COUNT(DISTINCT uf.id) as favorite_count,
    COUNT(DISTINCT ur.id) as review_count,
    AVG(ur.rating) as avg_rating_given
FROM users u
LEFT JOIN user_favorites uf ON u.id = uf.user_id
LEFT JOIN user_reviews ur ON u.id = ur.user_id
GROUP BY u.id;

-- Create view for recent activities
CREATE VIEW recent_activities AS
SELECT 
    ua.id,
    ua.user_id,
    u.name as user_name,
    u.email as user_email,
    ua.action,
    ua.description,
    ua.ip_address,
    ua.created_at
FROM user_activities ua
JOIN users u ON ua.user_id = u.id
ORDER BY ua.created_at DESC
LIMIT 100;
