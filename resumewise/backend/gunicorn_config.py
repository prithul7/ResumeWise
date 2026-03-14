# Gunicorn configuration file

bind = "unix:resumewise.sock"
workers = 3
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2
max_requests = 1000
max_requests_jitter = 100
preload_app = True

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"

# Process naming
proc_name = "resumewise"

# Server mechanics
daemon = False
pidfile = "/tmp/resumewise.pid"
user = "ubuntu"
group = "www-data"

# SSL (if needed)
# keyfile = "/path/to/keyfile"
# certfile = "/path/to/certfile"
