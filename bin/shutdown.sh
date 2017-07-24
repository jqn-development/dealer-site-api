#!/bin/bash
source ~/.bash_profile

cd ~/website-api
pm2 stop "Site API" || true
