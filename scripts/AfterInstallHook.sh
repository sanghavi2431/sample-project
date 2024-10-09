#!/bin/bash
set -e
#cd /home/ubuntu/sample-project
npm install
npm run build
# Kill Pm2 Process
pm2 kill
