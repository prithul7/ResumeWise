#!/bin/bash

# ResumeWise Deployment Script
# Use this to deploy updates to your EC2 instance

set -e

echo "🚀 Starting ResumeWise Deployment..."

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Build frontend
echo "🏗️ Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Restart backend service
echo "🔄 Restarting backend service..."
sudo systemctl restart resumewise

# Restart nginx
echo "🔄 Restarting nginx..."
sudo systemctl restart nginx

# Check service status
echo "🔍 Checking service status..."
sudo systemctl status resumewise --no-pager
sudo systemctl status nginx --no-pager

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your app is available at: https://yourdomain.com"
echo "📊 Check logs: sudo journalctl -u resumewise -f"
