#!/bin/bash
set -e

# Update npm packages
sudo npm update -y

# Update PM2 to the latest version
sudo pm2 update

# Remove existing pm2.config.js if it exists
if [ -f /home/ubuntu/sample-project/pm2.config.js ]; then
    echo "Removing existing pm2.config.js"
    sudo rm /home/ubuntu/sample-project/pm2.config.js
fi

# Copy the new pm2.config.js from S3
echo "Copying pm2.config.js from S3"
sudo aws s3 cp s3://sanghavi/sanghavi24/pm2.config.js /home/ubuntu/sample-project/

# Reload Nginx service
sudo service nginx reload
