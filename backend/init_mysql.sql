-- 创建数据库
CREATE DATABASE IF NOT EXISTS miao_bbq_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 创建用户（可选，建议在生产环境中使用专门的数据库用户）
-- CREATE USER 'miao_bbq_user'@'localhost' IDENTIFIED BY 'your_password';
-- GRANT ALL PRIVILEGES ON miao_bbq_db.* TO 'miao_bbq_user'@'localhost';
-- FLUSH PRIVILEGES;
