#!/bin/bash
source ~/.bash_profile

cd ~/website-api
npm install

if [ ! -z "$DEPLOYMENT_GROUP_NAME" ]; then
# setup NODE_ENV
    export NODE_ENV=$DEPLOYMENT_GROUP_NAME

    hasEnv=`grep "export NODE_ENV" ~/.bash_profile | cat`
    if [ -z "$hasEnv" ]; then
        echo "export NODE_ENV=$DEPLOYMENT_GROUP_NAME" >> ~/.bash_profile
    else
        sed -i "/export NODE_ENV=\b/c\export NODE_ENV=$DEPLOYMENT_GROUP_NAME" ~/.bash_profile
    fi

# setup Environment variables
    hasExports=`grep "source ~/website-api/bin/" ~/.bash_profile | cat`
    if [ -z "$hasExports" ]; then
        echo "source ~/website-api/bin/env-$DEPLOYMENT_GROUP_NAME.sh" >> ~/.bash_profile
    else
        sed -i "/source ~/website-api/bin/env-\b/c\source ~/website-api/bin/env-$DEPLOYMENT_GROUP_NAME.sh" ~/.bash_profile
    fi

# copy the correct deployment configuration for the environment
    cp config/config-$DEPLOYMENT_GROUP_NAME.js config/config.js
fi

# add node to startup
hasRc=`grep "su -l $USER" /etc/rc.d/rc.local | cat`
if [ -z "$hasRc" ]; then
    sudo sh -c "echo 'su -l $USER -c \"cd ~/website-api;sh ./bin/startup.sh\"' >> /etc/rc.d/rc.local"
fi
