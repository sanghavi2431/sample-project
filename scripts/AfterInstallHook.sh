#!/bin/bash
set -e
sudo chown -R ubuntu:ubuntu /home/ubuntu/sample-project-1
PIDS=$(ps -aef | grep "node /home/ubuntu/sample-project/bin/app.js" | grep -v grep | awk '{print $2}')
if [ -n "$PIDS" ]; then
    for PID in $PIDS; do
        sudo kill -9 $PID
        echo "Killed Node server with PID $PID"
    done
else
    echo "No Node server processes found."
fi
cd /home/ubuntu/sample-project-1 
npm install
npm run build
# Kill Pm2 Process
pm2 kill
