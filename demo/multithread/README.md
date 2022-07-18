# Human Multithreading Demos

- **Browser** demo `multithread` & `worker`
  Runs each `human` module in a separate web worker for highest possible performance  
- **NodeJS** demo `node-multiprocess` & `node-multiprocess-worker`  
  Runs multiple parallel `human` by dispaching them to pool of pre-created worker processes  

<br><hr><br>

## NodeJS Multi-process Demo

`nodejs/node-multiprocess.js` and `nodejs/node-multiprocess-worker.js`: Demo using NodeJS with CommonJS module  
  Demo that starts n child worker processes for parallel execution

```shell
node demo/nodejs/node-multiprocess.js
```

```json
2021-06-01 08:54:19 INFO:  @vladmandic/human version 2.0.0
2021-06-01 08:54:19 INFO:  User: vlado Platform: linux Arch: x64 Node: v16.0.0
2021-06-01 08:54:19 INFO:  Human multi-process test
2021-06-01 08:54:19 STATE: Enumerated images: ./assets 15
2021-06-01 08:54:19 STATE: Main: started worker: 130362
2021-06-01 08:54:19 STATE: Main: started worker: 130363
2021-06-01 08:54:19 STATE: Main: started worker: 130369
2021-06-01 08:54:19 STATE: Main: started worker: 130370
2021-06-01 08:54:20 STATE: Worker: PID: 130370 TensorFlow/JS 3.6.0 Human 2.0.0 Backend: tensorflow
2021-06-01 08:54:20 STATE: Worker: PID: 130362 TensorFlow/JS 3.6.0 Human 2.0.0 Backend: tensorflow
2021-06-01 08:54:20 STATE: Worker: PID: 130369 TensorFlow/JS 3.6.0 Human 2.0.0 Backend: tensorflow
2021-06-01 08:54:20 STATE: Worker: PID: 130363 TensorFlow/JS 3.6.0 Human 2.0.0 Backend: tensorflow
2021-06-01 08:54:21 STATE: Main: dispatching to worker: 130370
2021-06-01 08:54:21 INFO:  Latency: worker initializtion:  1348 message round trip: 0
2021-06-01 08:54:21 DATA:  Worker received message: 130370 { test: true }
2021-06-01 08:54:21 STATE: Main: dispatching to worker: 130362
2021-06-01 08:54:21 DATA:  Worker received message: 130362 { image: 'samples/ai-face.jpg' }
2021-06-01 08:54:21 DATA:  Worker received message: 130370 { image: 'samples/ai-body.jpg' }
2021-06-01 08:54:21 STATE: Main: dispatching to worker: 130369
2021-06-01 08:54:21 STATE: Main: dispatching to worker: 130363
2021-06-01 08:54:21 DATA:  Worker received message: 130369 { image: 'assets/human-sample-upper.jpg' }
2021-06-01 08:54:21 DATA:  Worker received message: 130363 { image: 'assets/sample-me.jpg' }
2021-06-01 08:54:24 DATA:  Main: worker finished: 130362 detected faces: 1 bodies: 1 hands: 0 objects: 1
2021-06-01 08:54:24 STATE: Main: dispatching to worker: 130362
2021-06-01 08:54:24 DATA:  Worker received message: 130362 { image: 'assets/sample1.jpg' }
2021-06-01 08:54:25 DATA:  Main: worker finished: 130369 detected faces: 1 bodies: 1 hands: 0 objects: 1
2021-06-01 08:54:25 STATE: Main: dispatching to worker: 130369
2021-06-01 08:54:25 DATA:  Main: worker finished: 130370 detected faces: 1 bodies: 1 hands: 0 objects: 1
2021-06-01 08:54:25 STATE: Main: dispatching to worker: 130370
2021-06-01 08:54:25 DATA:  Worker received message: 130369 { image: 'assets/sample2.jpg' }
2021-06-01 08:54:25 DATA:  Main: worker finished: 130363 detected faces: 1 bodies: 1 hands: 0 objects: 2
2021-06-01 08:54:25 STATE: Main: dispatching to worker: 130363
2021-06-01 08:54:25 DATA:  Worker received message: 130370 { image: 'assets/sample3.jpg' }
2021-06-01 08:54:25 DATA:  Worker received message: 130363 { image: 'assets/sample4.jpg' }
2021-06-01 08:54:30 DATA:  Main: worker finished: 130362 detected faces: 3 bodies: 1 hands: 0 objects: 7
2021-06-01 08:54:30 STATE: Main: dispatching to worker: 130362
2021-06-01 08:54:30 DATA:  Worker received message: 130362 { image: 'assets/sample5.jpg' }
2021-06-01 08:54:31 DATA:  Main: worker finished: 130369 detected faces: 3 bodies: 1 hands: 0 objects: 5
2021-06-01 08:54:31 STATE: Main: dispatching to worker: 130369
2021-06-01 08:54:31 DATA:  Worker received message: 130369 { image: 'assets/sample6.jpg' }
2021-06-01 08:54:31 DATA:  Main: worker finished: 130363 detected faces: 4 bodies: 1 hands: 2 objects: 2
2021-06-01 08:54:31 STATE: Main: dispatching to worker: 130363
2021-06-01 08:54:39 STATE: Main: worker exit: 130370 0
2021-06-01 08:54:39 DATA:  Main: worker finished: 130362 detected faces: 1 bodies: 1 hands: 0 objects: 1
2021-06-01 08:54:39 DATA:  Main: worker finished: 130369 detected faces: 1 bodies: 1 hands: 1 objects: 3
2021-06-01 08:54:39 STATE: Main: worker exit: 130362 0
2021-06-01 08:54:39 STATE: Main: worker exit: 130369 0
2021-06-01 08:54:41 DATA:  Main: worker finished: 130363 detected faces: 9 bodies: 1 hands: 0 objects: 10
2021-06-01 08:54:41 STATE: Main: worker exit: 130363 0
2021-06-01 08:54:41 INFO:  Processed: 15 images in total: 22006 ms working: 20658 ms average: 1377 ms
```
