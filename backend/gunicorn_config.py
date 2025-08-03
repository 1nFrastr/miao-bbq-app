# Gunicorn配置文件
import multiprocessing
import os

# 服务器socket
bind = "0.0.0.0:8000"
backlog = 2048

# Worker进程
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2

# 重启
max_requests = 1000
max_requests_jitter = 50
preload_app = True

# 日志
accesslog = "/www/wwwroot/miao-bbq-backend/logs/gunicorn_access.log"
errorlog = "/www/wwwroot/miao-bbq-backend/logs/gunicorn_error.log"
loglevel = "info"

# 进程名
proc_name = "miao-bbq-backend"

# 进程文件
pidfile = "/www/wwwroot/miao-bbq-backend/gunicorn.pid"

# 用户和组
user = "www"
group = "www"
