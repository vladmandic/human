## Tracker

### Based on

<https://github.com/opendatacam/node-moving-things-tracker>  

### Build

- remove reference to `lodash`:  
  > `isEqual` in <tracker.js>  
- replace external lib:  
  > curl https://raw.githubusercontent.com/ubilabs/kd-tree-javascript/master/kdTree.js -o lib/kdTree-min.js
- build with `esbuild`:  
  > node_modules/.bin/esbuild --bundle tracker.js --format=esm --platform=browser --target=esnext --keep-names --tree-shaking=false --analyze --outfile=/home/vlado/dev/human/demo/tracker/tracker.js --banner:js="/* eslint-disable */"

### Usage

    computeDistance(item1, item2)
    disableKeepInMemory()
    enableKeepInMemory()
    getAllTrackedItems()
    getJSONDebugOfTrackedItems(roundInt = true)
    getJSONOfAllTrackedItems()
    getJSONOfTrackedItems(roundInt = true)
    getTrackedItemsInMOTFormat(frameNb)
    reset()
    setParams(newParams)
    updateTrackedItemsWithNewFrame(detectionsOfThisFrame, frameNb)
