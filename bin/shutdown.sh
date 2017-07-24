#!/bin/bash
source /home/ec2-user/.bash_profile

cd ~/website-api
pm2 stop "Site API" || true
