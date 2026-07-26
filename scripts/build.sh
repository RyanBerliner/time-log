#!/bin/bash

# Sets a new version number in the service worker and updates the list of files
# that the service worker must cache.

SCRIPT_DIR=$(dirname $0)

VERSION_NUMBER=$(
  find "$SCRIPT_DIR/../src" -type f ! -name 'service-worker.js' ! -name '.*' |
  sort |
  while IFS= read -r file; do
    shasum "$file"
  done |
  shasum |
  awk '{print $1}'
)

SERVICE_WORKER_FILE="$SCRIPT_DIR/../src/service-worker.js"

sed \
  -i '' \
  "s/const AUTOGEN_CACHE_VERSION = '.*';/const AUTOGEN_CACHE_VERSION = '$VERSION_NUMBER';/" \
  "$SERVICE_WORKER_FILE"

CACHE_FILES=$(
  find "$SCRIPT_DIR/../src" -type f ! -name 'service-worker.js' ! -name '.*' |
  sed 's|.*/src/||' |
  sed "s/.*/'&'/" |
  tr '\n' ',' |
  sed 's/,$//'
)

sed \
  -i '' \
  "s|const AUTOGEN_CACHE_ASSETS = \[.*\];|const AUTOGEN_CACHE_ASSETS = [$CACHE_FILES];|" \
  "$SERVICE_WORKER_FILE"

echo "service-worker.js updated!"
echo "Version:    $VERSION_NUMBER";
echo "File Count: $(echo "$CACHE_FILES" | tr ',' '\n' | wc -l | tr -d ' ')";
