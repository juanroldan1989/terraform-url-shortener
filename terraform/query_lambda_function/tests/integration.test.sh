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
### [GET /urls API Endpoint] should return default message when no parameters are provided
##############################################
custom_url="/urls"
full_request_url="${api_base_url}${custom_url}"
echo $full_request_url

# `-s` option is for `silent` - otherwise it shows `curl` standard table for download in progress
response=$(curl -s "${full_request_url}")

echo $response
# { "message" : "Hello, world!" }

if [[ $response =~ "Missing Authentication Token" ]]
then
  echo "[GET /urls API Endpoint] should return default message when no parameters are provided - OK"
else
  echo "[GET /urls API Endpoint] should return default message when no parameters are provided - FAILED"
  exit 1
fi
##############################################

##############################################
### [GET /urls API Endpoint] should return error message when `code` parameter is not associated with any `url` record
##############################################
custom_url="/urls/123456"
full_request_url="${api_base_url}${custom_url}"
echo $full_request_url

# `-s` option is for `silent` - otherwise it shows `curl` standard table for download in progress
response=$(curl -s "${full_request_url}")

echo $response
# { "message" : "`url` record not found" }

if [[ $response =~ "\`url\` record not found" ]]
then
  echo "[GET /urls API Endpoint] should return error message when 'code' parameter is not associated with any 'url' record - OK"
else
  echo "[GET /urls API Endpoint] should return error message when 'code' parameter is not associated with any 'url' record - FAILED"
  exit 1
fi
##############################################

# ##############################################
# ### [GET /urls API Endpoint] should return `original_url` when `code` parameter path is provided
# ##############################################

# `url` record created first via POST /urls endpoint
custom_url="/urls/"
full_request_url="${api_base_url}${custom_url}"
echo $full_request_url

response=$(curl -s -X POST -H "Content-Type: application/json" -d '{ "url": "http://this-is-a-really-long-url.com" }' "${full_request_url}")

echo $response
# 1957686465

# `url` record searched by its `code` from `response` above
custom_url="/urls/${response}"
full_request_url="${api_base_url}${custom_url}"
echo $full_request_url

# `-s` option is for `silent` - otherwise it shows `curl` standard table for download in progress
response=$(curl -s "${full_request_url}")

echo $response
# { "message" : "http://this-is-a-really-long-url.com" }

if [[ $response =~ "http://this-is-a-really-long-url.com" ]]
then
  echo "[GET /urls API Endpoint] should return 'original_url' when 'code' parameter is associated with a 'url' record - OK"
else
  echo "[GET /urls API Endpoint] should return 'original_url' when 'code' parameter is associated with a 'url' record - FAILED"
  exit 1
fi
##############################################
