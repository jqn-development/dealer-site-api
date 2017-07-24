#!/bin/bash
cd ~/website-api
pm2 stop "Site API" || true
