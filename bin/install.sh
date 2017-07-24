#!/bin/bash
source /home/ec2-user/.bash_profile

# update instance
sudo yum -y update

# perform other updates here

# update npm
npm i -g npm

# install pm2
npm i -g pm2
pm2 update
