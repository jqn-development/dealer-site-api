#!/bin/bash

# update instance
yum -y update

# perform other updates here

# update npm
npm i -g npm

# install pm2
npm i -g pm2
pm2 update
