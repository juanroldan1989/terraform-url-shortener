#!/bin/bash

# The set -e (exit) option causes a script to exit if any of the processes it calls generate a non-zero return code.
# Anything non-zero is taken to be a failure.
set -e

##############################################
### Read API_BASE_URL from first parameter
api_base_url=$1
echo $api_base_url
##############################################

##############################################
### [POST /urls API Endpoint] should return default message when no parameters are provided
##############################################
custom_url="/urls"
full_request_url="${api_base_url}${custom_url}"
echo $full_request_url

# `-s` option is for `silent` - otherwise it shows `curl` standard table for download in progress
response=$(curl -s -X POST -H "Content-Type: application/json" -d '{}' "${full_request_url}")

echo $response
# { "message" : "`url` parameter is required" }

if [[ $response =~ "\`url\` parameter is required" ]]
then
  echo "[POST /urls API Endpoint] should return default message when no parameters are provided - OK"
else
  echo "[POST /urls API Endpoint] should return default message when no parameters are provided - FAILED"
  exit 1
fi
##############################################

##############################################
### [POST /urls API Endpoint] should return `hash_code` when `url` parameter is present in request
##############################################
custom_url="/urls"
full_request_url="${api_base_url}${custom_url}"
echo $full_request_url

# `-s` option is for `silent` - otherwise it shows `curl` standard table for download in progress
response=$(curl -s -X POST -H "Content-Type: application/json" -d '{ "url" : "https://this-is-a-really-long-url.com" }' "${full_request_url}")

echo $response
# { "message" : "1759289636" }

if [[ $response =~ "1759289636" ]]
then
  echo "[POST /urls API Endpoint] should return 'hash_code' when 'url' parameter is present in request - OK"
else
  echo "[POST /urls API Endpoint] should return 'hash_code' when 'url' parameter is present in request - FAILED"
  exit 1
fi
##############################################
