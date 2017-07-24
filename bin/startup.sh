#!/bin/bash
if [ ! -z "$DEPLOYMENT_GROUP_NAME" ]; then
 export NODE_ENV=$DEPLOYMENT_GROUP_NAME
fi

cd ~/website-api
pm2 start app -n "Site API" -i 0
