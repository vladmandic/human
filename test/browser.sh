#!/bin/sh

BROWSER="/mnt/c/Users/mandi/AppData/Local/Google/Chrome SxS/Application/chrome.exe"
PARAMS="--enable-unsafe-gpu --allow-insecure-localhost --auto-open-devtools-for-tabs"

"$BROWSER" $PARAMS https://localhost:10031/test/test-browser-iife.html
"$BROWSER" $PARAMS https://localhost:10031/test/test-browser-esm.html
