#!/bin/bash
set -e
sudo npm update -y
sudo pm2 update
sudo aws s3 cp s3://S3-PATH-CONFIG/ecosystem.config.js /home/ubuntu/PROJECT_NAME/
sudo service nginx reload
