#!/bin/bash
set -e
pm2 stop all
cd /home/ubuntu/sample-project-1 
npm install
npm run build
# Kill Pm2 Process
pm2 kill
