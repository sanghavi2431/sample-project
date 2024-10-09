#!/bin/bash
set -e
sudo npm update -y
sudo pm2 update
sudo aws s3 cp s3://sanghavi/project/config.js /home/ubuntu/sample-project/
sudo service nginx reload
