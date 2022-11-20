#!/bin/sh

BROWSER="/mnt/c/Users/mandi/AppData/Local/Google/Chrome SxS/Application/chrome.exe"
PARAMS="--enable-unsafe-gpu --allow-insecure-localhost --auto-open-devtools-for-tabs --unsafely-treat-insecure-origin-as-secure=https:/localhost:8001"

"$BROWSER" $PARAMS https://localhost:8001/test/test-browser-esm.html
"$BROWSER" $PARAMS https://localhost:8001/test/test-browser-iife.html
