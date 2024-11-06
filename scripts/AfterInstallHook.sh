#!/bin/bash
set -e
sudo pkill -f "node /home/ubuntu/sample-project/bin/app.js"
sudo pkill -f "node /home/ubuntu/sample-project-1/bin/app.js"
cd /home/ubuntu/sample-project-1 
npm install
npm run build
# Kill Pm2 Process
pm2 kill
