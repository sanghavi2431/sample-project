#!/bin/bash
set -e
sudo chown -R ubuntu:ubuntu /home/ubuntu/sample-project-1
pm2 stop all
cd /home/ubuntu/sample-project-1 
npm install
npm run build
# Kill Pm2 Process
pm2 kill
