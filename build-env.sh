#!/bin/bash
# This only runs during the build on travis

# Build Dev Environment Variables
echo "export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY" >> ./bin/env-dev.sh
echo "export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID" >> ./bin/env-dev.sh
echo "export EC2_REGION=$EC2_REGION" >> ./bin/env-dev.sh
echo "export MYSQL_HOST=$MYSQL_HOST" >> ./bin/env-dev.sh
echo "export MYSQL_USER=$MYSQL_USER" >> ./bin/env-dev.sh
echo "export MYSQL_PASS=$MYSQL_PASS" >> ./bin/env-dev.sh
echo "export MYSQL_PORT=$MYSQL_PORT" >> ./bin/env-dev.sh
echo "export MYSQL_DB=$MYSQL_DB" >> ./bin/env-dev.sh
echo "export REDIS_HOST=$REDIS_HOST_PROD" >> ./bin/env-dev.sh
echo "export REDIS_PORT=$REDIS_PORT_PROD" >> ./bin/env-dev.sh

# Build Production Environment Variables
echo "export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY_PROD" >> ./bin/env-production.sh
echo "export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID_PROD" >> ./bin/env-production.sh
echo "export EC2_REGION=$EC2_REGION_PROD" >> ./bin/env-production.sh
echo "export MYSQL_HOST=$MYSQL_HOST_PROD" >> ./bin/env-production.sh
echo "export MYSQL_USER=$MYSQL_USER_PROD" >> ./bin/env-production.sh
echo "export MYSQL_PASS=$MYSQL_PASS_PROD" >> ./bin/env-production.sh
echo "export MYSQL_PORT=$MYSQL_PORT_PROD" >> ./bin/env-production.sh
echo "export MYSQL_DB=$MYSQL_DB_PROD" >> ./bin/env-production.sh
echo "export REDIS_HOST=$REDIS_HOST_PROD" >> ./bin/env-production.sh
echo "export REDIS_PORT=$REDIS_PORT_PROD" >> ./bin/env-production.sh
