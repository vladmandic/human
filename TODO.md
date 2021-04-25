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

Configuration simplification:

replaced maxFaces, maxDetections, maxHands, maxResults with maxDetected
- Remove deallocate, profile, scoped

Build:

- Stop building sourcemaps for NodeJS deliverables
- Build NodeJS deliverables in non-minified form

### TBD
