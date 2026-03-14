#!/bin/bash

# ResumeWise EC2 Setup Script
# Run this as ubuntu user on your EC2 instance

set -e

echo "🚀 Starting ResumeWise EC2 Setup..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
echo "🐍 Installing Python, Nginx, and other dependencies..."
sudo apt install python3-pip python3-venv nginx git -y

# Install Node.js
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/resumewise
sudo chown ubuntu:ubuntu /var/www/resumewise

# Clone repository (replace with your repo URL)
echo "📥 Cloning repository..."
cd /var/www/resumewise
git clone https://github.com/your-username/resumewise.git .

# Setup Python virtual environment
echo "🐍 Setting up Python virtual environment..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn

# Create environment file
echo "⚙️ Setting up environment variables..."
cat > .env << EOF
SECRET_KEY=$(openssl rand -hex 32)
ANTHROPIC_API_KEY=your-anthropic-api-key-here
FLASK_ENV=production
DATABASE_PATH=/var/www/resumewise/resumewise.db
EOF

echo "🔑 Please edit .env file to add your Anthropic API key:"
echo "nano /var/www/resumewise/backend/.env"

# Build frontend
echo "🏗️ Building frontend..."
cd ../frontend
npm install
npm run build

# Create systemd service
echo "⚙️ Creating systemd service..."
sudo tee /etc/systemd/system/resumewise.service > /dev/null << EOF
[Unit]
Description=ResumeWise Flask App
After=network.target

[Service]
Type=notify
User=ubuntu
Group=www-data
WorkingDirectory=/var/www/resumewise/backend
Environment="PATH=/var/www/resumewise/backend/venv/bin"
ExecStart=/var/www/resumewise/backend/venv/bin/gunicorn --config gunicorn_config.py app:app
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=always
StandardOutput=journal
StandardError=journal
SyslogIdentifier=resumewise

[Install]
WantedBy=multi-user.target
EOF

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/resumewise > /dev/null << EOF
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend static files
    location / {
        root /var/www/resumewise/frontend/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API reverse proxy
    location /api {
        proxy_pass http://unix:/var/www/resumewise/backend/resumewise.sock;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_buffering off;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# Enable Nginx site
sudo ln -sf /etc/nginx/sites-available/resumewise /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Enable and start services
echo "🚀 Starting services..."
sudo systemctl daemon-reload
sudo systemctl enable resumewise
sudo systemctl start resumewise
sudo systemctl enable nginx
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
echo "🔒 Setting up SSL certificate..."
sudo apt install certbot python3-certbot-nginx -y

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit environment file: sudo nano /var/www/resumewise/backend/.env"
echo "2. Update yourdomain.com in Nginx config: sudo nano /etc/nginx/sites-available/resumewise"
echo "3. Get SSL certificate: sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com"
echo "4. Check service status: sudo systemctl status resumewise"
echo "5. Check logs: sudo journalctl -u resumewise -f"
echo ""
echo "🌐 Your app will be available at: http://yourdomain.com"
