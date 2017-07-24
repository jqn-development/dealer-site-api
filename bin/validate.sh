#!/bin/bash
source /home/ec2-user/.bash_profile
pm2 describe "Site API" > /dev/null
