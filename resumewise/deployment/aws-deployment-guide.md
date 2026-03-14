# AWS Deployment Guide for ResumeWise

## Architecture Overview

```
Frontend (React) → AWS S3 + CloudFront
       ↓
Nginx (Reverse Proxy) → AWS EC2
       ↓
Backend (Flask) → AWS EC2
       ↓
Database → AWS RDS (PostgreSQL) or EC2 SQLite
```

## Step 1: Backend Production Configuration

### 1.1 Create Production App Configuration

Create `config.py`:
```python
import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-super-secret-key-change-this'
    DATABASE_URL = os.environ.get('DATABASE_URL') or 'sqlite:///resumewise.db'
    ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY')
    DEBUG = False
    ENV = 'production'

class DevelopmentConfig(Config):
    DEBUG = True
    ENV = 'development'

class ProductionConfig(Config):
    DEBUG = False
    ENV = 'production'

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
```

### 1.2 Update app.py for Production

```python
import os
from flask import Flask
from flask_cors import CORS
from config import config
from database import init_db
from routes.auth import auth_bp
from routes.resume import resume_bp
from routes.coverletter import cover_bp

# Get configuration
env = os.environ.get('FLASK_ENV', 'development')
app_config = config[env]

app = Flask(__name__)
app.config.from_object(app_config)

CORS(app, resources={r"/api/*": {"origins": ["https://yourdomain.com", "http://localhost:3000"]}})

# Register blueprints
app.register_blueprint(auth_bp,   url_prefix='/api/auth')
app.register_blueprint(resume_bp, url_prefix='/api/resume')
app.register_blueprint(cover_bp,  url_prefix='/api/cover')

# Init DB on startup
with app.app_context():
    init_db()

@app.route('/api/health')
def health():
    return {'status': 'ok', 'app': 'ResumeWise API'}

if __name__ == '__main__':
    app.run(debug=app.config['DEBUG'], host='0.0.0.0', port=5000)
```

## Step 2: Database Options

### Option A: AWS RDS (Recommended for Production)

1. **Create RDS Instance**:
   - Go to AWS RDS Console
   - Create PostgreSQL instance
   - Set instance class: `db.t3.micro` (Free Tier)
   - Set username/password
   - Enable public access if needed

2. **Update Database Configuration**:
```python
# In database.py
import psycopg2
from psycopg2.extras import RealDictCursor
import os

def get_db_connection():
    conn = psycopg2.connect(
        host=os.environ.get('DB_HOST'),
        database=os.environ.get('DB_NAME'),
        user=os.environ.get('DB_USER'),
        password=os.environ.get('DB_PASSWORD')
    )
    return conn
```

### Option B: EC2 with SQLite (Simpler)

Keep current SQLite setup but ensure data persistence:
```python
# In database.py
import sqlite3
import os

DATABASE_PATH = os.environ.get('DATABASE_PATH', '/home/ubuntu/resumewise/resumewise.db')

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn
```

## Step 3: EC2 Setup

### 3.1 Launch EC2 Instance

1. Go to AWS EC2 Console
2. Launch Instance → Ubuntu Server 22.04 LTS
3. Instance type: `t2.micro` (Free Tier)
4. Configure Security Group:
   - SSH: Port 22 (your IP)
   - HTTP: Port 80
   - HTTPS: Port 443
   - Custom: Port 5000 (for Flask app)

### 3.2 Install Dependencies on EC2

```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and tools
sudo apt install python3-pip python3-venv nginx -y

# Install Node.js (for build process)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone your repository
git clone your-repo-url
cd resumewise

# Setup backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn

# Setup environment variables
sudo nano .env
```

### 3.3 Environment Variables (.env)

```bash
SECRET_KEY=your-super-secret-key
ANTHROPIC_API_KEY=sk-ant-your-key
FLASK_ENV=production
DATABASE_PATH=/home/ubuntu/resumewise/resumewise.db
```

## Step 4: Gunicorn Service

### 4.1 Create Gunicorn Service

```bash
sudo nano /etc/systemd/system/resumewise.service
```

```ini
[Unit]
Description=ResumeWise Flask App
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/resumewise/backend
Environment="PATH=/home/ubuntu/resumewise/backend/venv/bin"
ExecStart=/home/ubuntu/resumewise/backend/venv/bin/gunicorn --workers 3 --bind unix:resumewise.sock -m 00777 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

### 4.2 Start Service

```bash
sudo systemctl start resumewise
sudo systemctl enable resumewise
sudo systemctl status resumewise
```

## Step 5: Nginx Configuration

### 5.1 Create Nginx Config

```bash
sudo nano /etc/nginx/sites-available/resumewise
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend static files (if serving from same server)
    location / {
        root /home/ubuntu/resumewise/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API reverse proxy
    location /api {
        proxy_pass http://unix:/home/ubuntu/resumewise/backend/resumewise.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

### 5.2 Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/resumewise /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## Step 6: SSL Certificate (HTTPS)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renew certificate
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 7: Frontend Build and Deploy

### 7.1 Build Frontend

```bash
cd /home/ubuntu/resumewise/frontend
npm install
npm run build
```

### 7.2 Update API URL for Production

In `frontend/src/api.js`:
```javascript
const BASE = window.location.origin + "/api";
// This will work both in development and production
```

## Step 8: Deployment Script

Create `deploy.sh`:
```bash
#!/bin/bash

# Pull latest changes
git pull origin main

# Build frontend
cd frontend
npm install
npm run build
cd ..

# Restart backend service
sudo systemctl restart resumewise

# Restart nginx
sudo systemctl restart nginx

echo "Deployment complete!"
```

## Step 9: Monitoring and Logs

```bash
# Check application logs
sudo journalctl -u resumewise -f

# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Check service status
sudo systemctl status resumewise nginx
```

## AWS Cost Optimization

1. **Use Free Tier Resources**:
   - EC2 t2.micro (750 hours/month)
   - RDS t3.micro (750 hours/month)
   - S3 Standard (5GB storage)

2. **Enable Auto-scaling** (for production)

3. **Use CloudWatch** for monitoring

## Security Best Practices

1. **Use HTTPS only** (redirect HTTP to HTTPS)
2. **Environment variables** for sensitive data
3. **Regular updates** of system packages
4. **Firewall rules** restrict access
5. **Backup database** regularly

## Troubleshooting

### Common Issues:

1. **502 Bad Gateway**: Gunicorn service not running
2. **Database connection errors**: Check credentials
3. **CORS issues**: Update allowed origins
4. **Permission denied**: Check file permissions

### Debug Commands:

```bash
# Check if gunicorn is running
ps aux | grep gunicorn

# Test backend directly
curl http://localhost:5000/api/health

# Check nginx config
sudo nginx -t

# Restart services
sudo systemctl restart resumewise nginx
```

## Domain Configuration

1. **Point DNS** to EC2 IP address
2. **Wait for propagation** (up to 48 hours)
3. **Test HTTPS** certificate
4. **Monitor** application performance

This setup provides a production-ready deployment for your ResumeWise application with proper security, scalability, and monitoring.
