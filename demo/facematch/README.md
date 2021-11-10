# Human Face Recognition & Matching

- **Browser** demo: `index.html` & `facematch.js`:  
  Loads sample images, extracts faces and runs match and similarity analysis  
- **NodeJS** demo `node-match.js` and `node-match-worker.js`  
  Advanced multithreading demo that runs number of worker threads to process high number of matches
- Sample face database: `faces.json`

<br>

## Browser Face Recognition Demo

- `demo/facematch`: Demo for Browsers that uses all face description and embedding features to  
detect, extract and identify all faces plus calculate simmilarity between them

It highlights functionality such as:

- Loading images
- Extracting faces from images
- Calculating face embedding descriptors
- Finding face similarity and sorting them by similarity
- Finding best face match based on a known list of faces and printing matches

<br>

## NodeJS Multi-Threading Match Solution

### Methods and Properties in `node-match`

- `createBuffer`: create shared buffer array  
  single copy of data regardless of number of workers  
  fixed size based on `options.dbMax`
- `appendRecord`: add additional batch of descriptors to buffer  
  can append batch of records to buffer at anytime  
  workers are informed of the new content after append has been completed  
- `workersStart`: start or expand pool of `threadPoolSize` workers  
  each worker runs `node-match-worker` and listens for messages from main thread  
  can shutdown workers or create additional worker threads on-the-fly  
  safe against workers that exit  
- `workersClose`: close workers in a pool  
  first request workers to exit then terminate after timeout
- `match`: dispach a match job to a worker  
  returns first match that satisfies `minThreshold`  
  assigment to workers using round-robin  
  since timing for each job is near-fixed and predictable  
- `getDescriptor`: get descriptor array for a given id from a buffer
- `fuzDescriptor`: small randomize descriptor content for harder match
- `getLabel`: fetch label for resolved descriptor index  
- `loadDB`: load face database from a JSON file `dbFile`  
  extracts descriptors and adds them to buffer  
  extracts labels and maintains them in main thread  
  for test purposes loads same database `dbFact` times to create a very large database

`node-match` runs in a listens for messages from workers until `maxJobs` have been reached

### Performance

Linear performance decrease that depends on number of records in database  
Non-linear performance that increases with number of worker threads due to communication overhead

- Face dataase with 10k records:
  > threadPoolSize: 1 =>  ~60 ms / match job  
  > threadPoolSize: 6 =>  ~25 ms / match job
- Face database with 50k records:
  > threadPoolSize: 1 => ~300 ms / match job  
  > threadPoolSize: 6 => ~100 ms / match job
- Face database with 100k records:
  > threadPoolSize: 1 => ~600 ms / match job  
  > threadPoolSize: 6 => ~200 ms / match job

### Example

> node node-match

```js
2021-10-13 07:53:36 INFO:  options: { dbFile: './faces.json', dbMax: 10000, threadPoolSize: 6, workerSrc: './node-match-worker.js', debug: false, minThreshold: 0.9, descLength: 1024 }
2021-10-13 07:53:36 DATA:  created shared buffer: { maxDescriptors: 10000, totalBytes: 40960000, totalElements: 10240000 }
2021-10-13 07:53:36 DATA:  db loaded: { existingRecords: 0, newRecords: 5700 }
2021-10-13 07:53:36 INFO:  starting worker thread pool: { totalWorkers: 6, alreadyActive: 0 }
2021-10-13 07:53:36 STATE: submitted: { matchJobs: 100, poolSize: 6, activeWorkers: 6 }
2021-10-13 07:53:38 STATE: { matchJobsFinished: 100, totalTimeMs: 1769, averageTimeMs: 17.69 }
2021-10-13 07:53:38 INFO:  closing workers: { poolSize: 6, activeWorkers: 6 }
```
