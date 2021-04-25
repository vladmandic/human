# To-Do list for Human library

## Big Ticket Items

N/A

## Exploring Features

- Implement built-in input handler for `http:`, `https:`, `file:`
- Canvas.js for WASM on NodeJS

## Explore Models

- InsightFace  
  RetinaFace detector and ArcFace recognition  
  <https://github.com/deepinsight/insightface>  
- Blazepose  
  Needs detector before running pose to center the image

## RC: 1.8

### Done

Major configuration simplification:

- Unified minConfidence and scoreThresdold as minConfidence
- Replaced nmsRadius with built-in default
- Replaced maxFaces, maxDetections, maxHands, maxResults with maxDetected
- Remove deallocate, profile, scoped

Stop building sourcemaps for NodeJS deliverables

### TBD

- Remove modelPaths
- Remove blazeface-front, replace blazeface-back with blazeface
- NodeJS Exception handling
