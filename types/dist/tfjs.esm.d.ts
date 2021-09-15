export var Abs: string;
export var Acos: string;
export var Acosh: string;
export var AdadeltaOptimizer: {
    new (learningRate: any, rho: any, epsilon3?: null): {
        learningRate: any;
        rho: any;
        epsilon: any;
        accumulatedGrads: any[];
        accumulatedUpdates: any[];
        applyGradients(variableGradients: any): void;
        dispose(): void;
        getWeights(): Promise<{
            name: string;
            tensor: any;
        }[]>;
        setWeights(weightValues: any): Promise<void>;
        getConfig(): {
            learningRate: any;
            rho: any;
            epsilon: any;
        };
        minimize(f: any, returnCost: boolean | undefined, varList: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(f: any, varList: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(weightValues: any): Promise<any>;
        getClassName(): any;
    };
    fromConfig(cls: any, config: any): any;
    className: string;
};
export var AdagradOptimizer: {
    new (learningRate: any, initialAccumulatorValue?: number): {
        learningRate: any;
        initialAccumulatorValue: number;
        accumulatedGrads: any[];
        applyGradients(variableGradients: any): void;
        dispose(): void;
        getWeights(): Promise<{
            name: string;
            tensor: any;
        }[]>;
        setWeights(weightValues: any): Promise<void>;
        getConfig(): {
            learningRate: any;
            initialAccumulatorValue: number;
        };
        minimize(f: any, returnCost: boolean | undefined, varList: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(f: any, varList: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(weightValues: any): Promise<any>;
        getClassName(): any;
    };
    fromConfig(cls: any, config: any): any;
    className: string;
};
export var AdamOptimizer: {
    new (learningRate: any, beta1: any, beta2: any, epsilon3?: null): {
        learningRate: any;
        beta1: any;
        beta2: any;
        epsilon: any;
        accumulatedFirstMoment: any[];
        accumulatedSecondMoment: any[];
        accBeta1: any;
        accBeta2: any;
        applyGradients(variableGradients: any): void;
        dispose(): void;
        getWeights(): Promise<{
            name: string;
            tensor: any;
        }[]>;
        setWeights(weightValues: any): Promise<void>;
        getConfig(): {
            learningRate: any;
            beta1: any;
            beta2: any;
            epsilon: any;
        };
        minimize(f: any, returnCost: boolean | undefined, varList: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(f: any, varList: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(weightValues: any): Promise<any>;
        getClassName(): any;
    };
    fromConfig(cls: any, config: any): any;
    className: string;
};
export var AdamaxOptimizer: {
    new (learningRate: any, beta1: any, beta2: any, epsilon3?: null, decay?: number): {
        learningRate: any;
        beta1: any;
        beta2: any;
        epsilon: any;
        decay: number;
        accumulatedFirstMoment: any[];
        accumulatedWeightedInfNorm: any[];
        iteration: any;
        accBeta1: any;
        applyGradients(variableGradients: any): void;
        dispose(): void;
        getWeights(): Promise<void>;
        setWeights(weightValues: any): Promise<void>;
        getConfig(): {
            learningRate: any;
            beta1: any;
            beta2: any;
            epsilon: any;
            decay: number;
        };
        minimize(f: any, returnCost: boolean | undefined, varList: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(f: any, varList: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(weightValues: any): Promise<any>;
        getClassName(): any;
    };
    fromConfig(cls: any, config: any): any;
    className: string;
};
export var Add: string;
export var AddN: string;
export var All: string;
export var Any: string;
export var ArgMax: string;
export var ArgMin: string;
export var Asin: string;
export var Asinh: string;
export var Atan: string;
export var Atan2: string;
export var Atanh: string;
export var AvgPool: string;
export var AvgPool3D: string;
export var AvgPool3DGrad: string;
export var AvgPoolGrad: string;
export var BackendWasm: {
    new (wasm: any): {
        wasm: any;
        dataIdNextNumber: number;
        dataIdMap: {
            backend: any;
            dataMover: any;
            data: WeakMap<object, any>;
            dataIdsCount: number;
            get(dataId: any): any;
            set(dataId: any, value: any): void;
            has(dataId: any): boolean;
            delete(dataId: any): boolean;
            numDataIds(): number;
        };
        write(values: any, shape: any, dtype: any): {
            id: number;
        };
        numDataIds(): number;
        time(f: any): Promise<{
            kernelMs: number;
        }>;
        move(dataId: any, values: any, shape: any, dtype: any, refCount: any): void;
        read(dataId: any): Promise<any>;
        readSync(dataId: any): any;
        disposeData(dataId: any, force?: boolean): boolean;
        refCount(dataId: any): any;
        incRef(dataId: any): void;
        floatPrecision(): number;
        getMemoryOffset(dataId: any): any;
        dispose(): void;
        memory(): {
            unreliable: boolean;
        };
        makeOutput(shape: any, dtype: any, memoryOffset: any): {
            dataId: {
                id: number;
            };
            shape: any;
            dtype: any;
        };
        typedArrayFromHeap({ shape, dtype, dataId }: {
            shape: any;
            dtype: any;
            dataId: any;
        }): Float32Array | Int32Array | Uint8Array;
        timerAvailable(): boolean;
        epsilon(): number;
    };
};
export var BatchMatMul: string;
export var BatchToSpaceND: string;
export var Bincount: string;
export var BroadcastArgs: string;
export var BroadcastTo: string;
export var Callback: {
    new (...args: any[]): {
        model: {
            [x: string]: any;
            isTraining: boolean;
            summary(lineLength: any, positions: any, printFn?: {
                (...data: any[]): void;
                (...data: any[]): void;
                (message?: any, ...optionalParams: any[]): void;
            }): void;
            compile(args: any): void;
            loss: any;
            optimizer_: any;
            isOptimizerOwned: boolean | undefined;
            lossFunctions: any;
            feedOutputNames: any[] | undefined;
            feedOutputShapes: any[] | undefined;
            feedLossFns: any[] | undefined;
            metrics: any;
            metricsNames: string[] | undefined;
            metricsTensors: any[] | undefined;
            collectedTrainableWeights: any;
            checkTrainableWeightsConsistency(): void;
            evaluate(x: any, y: any, args?: {}): any;
            evaluateDataset(dataset: any, args: any): Promise<any>;
            checkNumSamples(ins: any, batchSize: any, steps: any, stepsName?: string): any;
            execute(inputs: any, outputs: any): any;
            retrieveSymbolicTensors(symbolicTensorNames: any): any[];
            predictLoop(ins: any, batchSize?: number, verbose?: boolean): any;
            predict(x: any, args?: {}): any;
            predictOnBatch(x: any): any;
            standardizeUserDataXY(x: any, y: any, checkBatchAxis: boolean | undefined, batchSize: any): any[];
            standardizeUserData(x: any, y: any, sampleWeight: any, classWeight: any, checkBatchAxis: boolean | undefined, batchSize: any): Promise<any[]>;
            testLoop(f: any, ins: any, batchSize: any, verbose: number | undefined, steps: any): any;
            getDedupedMetricsNames(): string[];
            makeTrainFunction(): (data: any) => any[];
            makeTestFunction(): void;
            testFunction: ((data: any) => any) | undefined;
            fit(x: any, y: any, args?: {}): Promise<any>;
            fitDataset(dataset: any, args: any): Promise<any>;
            trainOnBatch(x: any, y: any): Promise<any>;
            getNamedWeights(config: any): {
                name: any;
                tensor: any;
            }[];
            stopTraining: any;
            stopTraining_: any;
            optimizer: any;
            dispose(): any;
            getLossIdentifiers(): any;
            getMetricIdentifiers(): {};
            getTrainingConfig(): {
                loss: any;
                metrics: {};
                optimizer_config: {
                    class_name: any;
                    config: any;
                };
            };
            loadTrainingConfig(trainingConfig: any): void;
            save(handlerOrURL: any, config: any): Promise<any>;
            setUserDefinedMetadata(userDefinedMetadata: any): void;
            userDefinedMetadata: any;
            getUserDefinedMetadata(): any;
        } | null;
        setModel(model2: any): void;
        validationData: any;
        setParams(params: any): void;
        params: any;
        onEpochBegin(epoch: any, logs: any): Promise<void>;
        onEpochEnd(epoch: any, logs: any): Promise<void>;
        onBatchBegin(batch: any, logs: any): Promise<void>;
        onBatchEnd(batch: any, logs: any): Promise<void>;
        onTrainBegin(logs: any): Promise<void>;
        onTrainEnd(logs: any): Promise<void>;
    };
};
export var CallbackList: {
    new (callbacks2: any, queueLength?: number): {
        callbacks: any;
        queueLength: number;
        append(callback: any): void;
        setParams(params: any): void;
        setModel(model2: any): void;
        onEpochBegin(epoch: any, logs: any): Promise<void>;
        onEpochEnd(epoch: any, logs: any): Promise<void>;
        onBatchBegin(batch: any, logs: any): Promise<void>;
        onBatchEnd(batch: any, logs: any): Promise<void>;
        onTrainBegin(logs: any): Promise<void>;
        onTrainEnd(logs: any): Promise<void>;
    };
};
export var Cast: string;
export var Ceil: string;
export var ClipByValue: string;
export var Complex: string;
export var ComplexAbs: string;
export var Concat: string;
export var Conv2D: string;
export var Conv2DBackpropFilter: string;
export var Conv2DBackpropInput: string;
export var Conv3D: string;
export var Conv3DBackpropFilterV2: string;
export var Conv3DBackpropInputV2: string;
export var Cos: string;
export var Cosh: string;
export var CropAndResize: string;
export var Cumsum: string;
export var CustomCallback: {
    new (args: any, yieldEvery: any): {
        currentEpoch: number;
        yieldEvery: any;
        maybeWait(epoch: any, batch: any, logs: any): Promise<void>;
        trainBegin: any;
        trainEnd: any;
        epochBegin: any;
        epochEnd: any;
        batchBegin: any;
        batchEnd: any;
        yield: any;
        onEpochBegin(epoch: any, logs: any): Promise<void>;
        onEpochEnd(epoch: any, logs: any): Promise<void>;
        onBatchBegin(batch: any, logs: any): Promise<void>;
        onBatchEnd(batch: any, logs: any): Promise<void>;
        onTrainBegin(logs: any): Promise<void>;
        onTrainEnd(logs: any): Promise<void>;
        validationData: any;
        setParams(params: any): void;
        params: any;
        setModel(model2: any): void;
    };
};
export var DataStorage: {
    new (backend2: any, dataMover: any): {
        backend: any;
        dataMover: any;
        data: WeakMap<object, any>;
        dataIdsCount: number;
        get(dataId: any): any;
        set(dataId: any, value: any): void;
        has(dataId: any): boolean;
        delete(dataId: any): boolean;
        numDataIds(): number;
    };
};
export var DenseBincount: string;
export var DepthToSpace: string;
export var DepthwiseConv2dNative: string;
export var DepthwiseConv2dNativeBackpropFilter: string;
export var DepthwiseConv2dNativeBackpropInput: string;
export var Diag: string;
export var Dilation2D: string;
export var Dilation2DBackpropFilter: string;
export var Dilation2DBackpropInput: string;
export var ENV: any;
export var EarlyStopping: {
    new (args: any): {
        monitor: any;
        minDelta: number;
        patience: any;
        verbose: any;
        mode: any;
        baseline: any;
        monitorFunc: typeof less2;
        onTrainBegin(logs: any): Promise<void>;
        wait: number | undefined;
        stoppedEpoch: any;
        best: any;
        onEpochEnd(epoch: any, logs: any): Promise<void>;
        onTrainEnd(logs: any): Promise<void>;
        getMonitorValue(logs: any): any;
        model: {
            [x: string]: any;
            isTraining: boolean;
            summary(lineLength: any, positions: any, printFn?: {
                (...data: any[]): void;
                (...data: any[]): void;
                (message?: any, ...optionalParams: any[]): void;
            }): void;
            compile(args: any): void;
            loss: any;
            optimizer_: any;
            isOptimizerOwned: boolean | undefined;
            lossFunctions: any;
            feedOutputNames: any[] | undefined;
            feedOutputShapes: any[] | undefined;
            feedLossFns: any[] | undefined;
            metrics: any;
            metricsNames: string[] | undefined;
            metricsTensors: any[] | undefined;
            collectedTrainableWeights: any;
            checkTrainableWeightsConsistency(): void;
            evaluate(x: any, y: any, args?: {}): any;
            evaluateDataset(dataset: any, args: any): Promise<any>;
            checkNumSamples(ins: any, batchSize: any, steps: any, stepsName?: string): any;
            execute(inputs: any, outputs: any): any;
            retrieveSymbolicTensors(symbolicTensorNames: any): any[];
            predictLoop(ins: any, batchSize?: number, verbose?: boolean): any;
            predict(x: any, args?: {}): any;
            predictOnBatch(x: any): any;
            standardizeUserDataXY(x: any, y: any, checkBatchAxis: boolean | undefined, batchSize: any): any[];
            standardizeUserData(x: any, y: any, sampleWeight: any, classWeight: any, checkBatchAxis: boolean | undefined, batchSize: any): Promise<any[]>;
            testLoop(f: any, ins: any, batchSize: any, verbose: number | undefined, steps: any): any;
            getDedupedMetricsNames(): string[];
            makeTrainFunction(): (data: any) => any[];
            makeTestFunction(): void;
            testFunction: ((data: any) => any) | undefined;
            fit(x: any, y: any, args?: {}): Promise<any>;
            fitDataset(dataset: any, args: any): Promise<any>;
            trainOnBatch(x: any, y: any): Promise<any>;
            getNamedWeights(config: any): {
                name: any;
                tensor: any;
            }[];
            stopTraining: any;
            stopTraining_: any;
            optimizer: any;
            dispose(): any;
            getLossIdentifiers(): any;
            getMetricIdentifiers(): {};
            getTrainingConfig(): {
                loss: any;
                metrics: {};
                optimizer_config: {
                    class_name: any;
                    config: any;
                };
            };
            loadTrainingConfig(trainingConfig: any): void;
            save(handlerOrURL: any, config: any): Promise<any>;
            setUserDefinedMetadata(userDefinedMetadata: any): void;
            userDefinedMetadata: any;
            getUserDefinedMetadata(): any;
        } | null;
        setModel(model2: any): void;
        validationData: any;
        setParams(params: any): void;
        params: any;
        onEpochBegin(epoch: any, logs: any): Promise<void>;
        onBatchBegin(batch: any, logs: any): Promise<void>;
        onBatchEnd(batch: any, logs: any): Promise<void>;
    };
};
export var Einsum: string;
export var Elu: string;
export var EluGrad: string;
export var Environment: {
    new (global2: any): {
        global: any;
        flags: {};
        flagRegistry: {};
        urlFlags: {};
        getQueryParams: typeof getQueryParams;
        setPlatform(platformName: any, platform: any): void;
        platformName: any;
        platform: any;
        registerFlag(flagName: any, evaluationFn: any, setHook: any): void;
        getAsync(flagName: any): Promise<any>;
        get(flagName: any): any;
        getNumber(flagName: any): any;
        getBool(flagName: any): any;
        getFlags(): {};
        readonly features: {};
        set(flagName: any, value: any): void;
        evaluateFlag(flagName: any): any;
        setFlags(flags: any): void;
        reset(): void;
        populateURLFlags(): void;
    };
};
export var Equal: string;
export var Erf: string;
export var Exp: string;
export var ExpandDims: string;
export var Expm1: string;
export var FFT: string;
export var Fill: string;
export var FlipLeftRight: string;
export var Floor: string;
export var FloorDiv: string;
export var FromPixels: string;
export var FusedBatchNorm: string;
export var FusedConv2D: string;
export var FusedDepthwiseConv2D: string;
export var GPGPUContext: {
    new (gl: any): {
        outputTexture: any;
        program: any;
        disposed: boolean;
        vertexAttrsAreBound: boolean;
        itemsToPoll: any[];
        gl: any;
        textureFloatExtension: any;
        textureHalfFloatExtension: any;
        colorBufferFloatExtension: any;
        colorBufferHalfFloatExtension: any;
        vertexBuffer: any;
        indexBuffer: any;
        framebuffer: any;
        textureConfig: {
            internalFormatFloat: any;
            internalFormatHalfFloat: any;
            internalFormatPackedHalfFloat: any;
            internalFormatPackedFloat: any;
            textureFormatFloat: any;
            downloadTextureFormat: any;
            downloadUnpackNumChannels: number;
            defaultNumChannels: number;
            textureTypeHalfFloat: any;
            textureTypeFloat: any;
        };
        readonly debug: any;
        dispose(): void;
        createFloat32MatrixTexture(rows: any, columns: any): any;
        createFloat16MatrixTexture(rows: any, columns: any): any;
        createUnsignedBytesMatrixTexture(rows: any, columns: any): any;
        uploadPixelDataToTexture(texture: any, pixels: any): void;
        uploadDenseMatrixToTexture(texture: any, width: any, height: any, data: any): void;
        createFloat16PackedMatrixTexture(rows: any, columns: any): any;
        createPackedMatrixTexture(rows: any, columns: any): any;
        deleteMatrixTexture(texture: any): void;
        downloadByteEncodedFloatMatrixFromOutputTexture(texture: any, rows: any, columns: any): any;
        downloadPackedMatrixFromBuffer(buffer2: any, batch: any, rows: any, columns: any, physicalRows: any, physicalCols: any): Float32Array;
        downloadFloat32MatrixFromBuffer(buffer2: any, size: any): Float32Array;
        createBufferFromTexture(texture: any, rows: any, columns: any): any;
        createAndWaitForFence(): Promise<any>;
        createFence(gl: any): {
            query: any;
            isFencePassed: () => any;
        };
        downloadMatrixFromPackedTexture(texture: any, physicalRows: any, physicalCols: any): any;
        createProgram(fragmentShaderSource: any): any;
        vertexShader: any;
        deleteProgram(program: any): void;
        setProgram(program: any): void;
        getUniformLocation(program: any, uniformName: any, shouldThrow?: boolean): any;
        getAttributeLocation(program: any, attribute: any): any;
        getUniformLocationNoThrow(program: any, uniformName: any): any;
        setInputMatrixTexture(inputMatrixTexture: any, uniformLocation: any, textureUnit: any): void;
        setOutputMatrixTexture(outputMatrixTexture: any, rows: any, columns: any): void;
        setOutputPackedMatrixTexture(outputPackedMatrixTexture: any, rows: any, columns: any): void;
        setOutputMatrixWriteRegion(startRow: any, numRows: any, startColumn: any, numColumns: any): void;
        setOutputPackedMatrixWriteRegion(startRow: any, numRows: any, startColumn: any, numColumns: any): void;
        debugValidate(): void;
        executeProgram(): void;
        blockUntilAllProgramsCompleted(): void;
        getQueryTimerExtension(): any;
        disjointQueryTimerExtension: any;
        getQueryTimerExtensionWebGL2(): any;
        getQueryTimerExtensionWebGL1(): any;
        beginQuery(): any;
        endQuery(): void;
        waitForQueryAndGetTime(query: any): Promise<number | null>;
        getQueryTime(query: any, queryTimerVersion: any): number | null;
        isQueryAvailable(query: any, queryTimerVersion: any): any;
        disjoint: any;
        pollFence(fenceContext: any): Promise<any>;
        pollItems(): void;
        addItemToPoll(isDoneFn: any, resolveFn: any): void;
        bindTextureToFrameBuffer(texture: any): void;
        unbindTextureToFrameBuffer(): void;
        downloadMatrixDriver(texture: any, downloadAndDecode: any): any;
        setOutputMatrixTextureDriver(outputMatrixTextureMaybePacked: any, width: any, height: any): void;
        setOutputMatrixWriteRegionDriver(x: any, y: any, width: any, height: any): void;
        throwIfDisposed(): void;
        throwIfNoProgram(): void;
    };
};
export var GatherNd: string;
export var GatherV2: string;
export var GraphModel: {
    new (modelUrl: any, loadOptions?: {}): {
        modelUrl: any;
        loadOptions: {};
        version: string;
        resourceManager: {
            hashTableNameToHandle: {};
            hashTableMap: {};
            addHashTable(name: any, hashTable2: any): void;
            getHashTableHandleByName(name: any): any;
            getHashTableById(id: any): any;
            dispose(): void;
        };
        readonly modelVersion: string;
        readonly inputNodes: any;
        readonly outputNodes: any;
        readonly inputs: any;
        readonly outputs: any;
        readonly weights: any;
        readonly metadata: any;
        readonly modelSignature: any;
        findIOHandler(): void;
        handler: any;
        load(): Promise<boolean>;
        loadSync(artifacts: any): boolean;
        artifacts: any;
        signature: any;
        executor: {
            graph: any;
            parent: any;
            compiledMap: Map<any, any>;
            _weightMap: {};
            SEPERATOR: string;
            _functions: any;
            _functionExecutorMap: {};
            _outputs: any;
            _inputs: any;
            _initNodes: any;
            _signature: any;
            readonly weightIds: any;
            readonly functionExecutorMap: any;
            weightMap: any;
            _weightIds: any[] | undefined;
            resourceManager: any;
            _resourceManager: any;
            readonly inputs: any;
            readonly outputs: any;
            readonly inputNodes: any;
            readonly outputNodes: any;
            readonly functions: {};
            getCompilationKey(inputs: any, outputs: any): string;
            compile(inputs: any, outputs: any): any[];
            execute(inputs: any, outputs: any): any;
            getFrozenTensorIds(tensorMap: any): Set<any>;
            checkTensorForDisposal(nodeName: any, node: any, tensorMap: any, context: any, tensorsToKeep: any, outputNames: any, intermediateTensorConsumerCount: any): void;
            executeAsync(inputs: any, outputs: any): Promise<any>;
            _executeAsync(inputs: any, outputs: any, isFunctionExecution?: boolean, tensorArrayMap?: {}, tensorListMap?: {}): Promise<any>;
            executeFunctionAsync(inputs: any, tensorArrayMap: any, tensorListMap: any): Promise<any>;
            executeWithControlFlow(inputs: any, context: any, outputNames: any, isFunctionExecution: any): Promise<any>;
            processStack(inputNodes: any, stack2: any, context: any, tensorMap: any, added: any, tensorsToKeep: any, outputNames: any, intermediateTensorConsumerCount: any, usedNodes: any): any[];
            processChildNodes(node: any, stack2: any, context: any, tensorMap: any, added: any, usedNodes: any): void;
            dispose(): void;
            checkInputShapeAndType(inputs: any): void;
            mapInputs(inputs: any): {};
            checkInputs(inputs: any): void;
            mapOutputs(outputs: any): any;
            checkOutputs(outputs: any): void;
        } | undefined;
        initializer: {
            graph: any;
            parent: any;
            compiledMap: Map<any, any>;
            _weightMap: {};
            SEPERATOR: string;
            _functions: any;
            _functionExecutorMap: {};
            _outputs: any;
            _inputs: any;
            _initNodes: any;
            _signature: any;
            readonly weightIds: any;
            readonly functionExecutorMap: any;
            weightMap: any;
            _weightIds: any[] | undefined;
            resourceManager: any;
            _resourceManager: any;
            readonly inputs: any;
            readonly outputs: any;
            readonly inputNodes: any;
            readonly outputNodes: any;
            readonly functions: {};
            getCompilationKey(inputs: any, outputs: any): string;
            compile(inputs: any, outputs: any): any[];
            execute(inputs: any, outputs: any): any;
            getFrozenTensorIds(tensorMap: any): Set<any>;
            checkTensorForDisposal(nodeName: any, node: any, tensorMap: any, context: any, tensorsToKeep: any, outputNames: any, intermediateTensorConsumerCount: any): void;
            executeAsync(inputs: any, outputs: any): Promise<any>;
            _executeAsync(inputs: any, outputs: any, isFunctionExecution?: boolean, tensorArrayMap?: {}, tensorListMap?: {}): Promise<any>;
            executeFunctionAsync(inputs: any, tensorArrayMap: any, tensorListMap: any): Promise<any>;
            executeWithControlFlow(inputs: any, context: any, outputNames: any, isFunctionExecution: any): Promise<any>;
            processStack(inputNodes: any, stack2: any, context: any, tensorMap: any, added: any, tensorsToKeep: any, outputNames: any, intermediateTensorConsumerCount: any, usedNodes: any): any[];
            processChildNodes(node: any, stack2: any, context: any, tensorMap: any, added: any, usedNodes: any): void;
            dispose(): void;
            checkInputShapeAndType(inputs: any): void;
            mapInputs(inputs: any): {};
            checkInputs(inputs: any): void;
            mapOutputs(outputs: any): any;
            checkOutputs(outputs: any): void;
        } | undefined;
        save(handlerOrURL: any, config: any): Promise<any>;
        predict(inputs: any, config: any): any;
        normalizeInputs(inputs: any): any;
        normalizeOutputs(outputs: any): any[];
        execute(inputs: any, outputs: any): any;
        executeAsync(inputs: any, outputs: any): Promise<any>;
        convertTensorMapToTensorsMap(map: any): {};
        dispose(): void;
    };
};
export var Greater: string;
export var GreaterEqual: string;
export var History: {
    new (): {
        onTrainBegin(logs: any): Promise<void>;
        epoch: any[] | undefined;
        history: {} | undefined;
        onEpochEnd(epoch: any, logs: any): Promise<void>;
        syncData(): Promise<void>;
        validationData: any;
        setParams(params: any): void;
        params: any;
        onEpochBegin(epoch: any, logs: any): Promise<void>;
        onBatchBegin(batch: any, logs: any): Promise<void>;
        onBatchEnd(batch: any, logs: any): Promise<void>;
        onTrainEnd(logs: any): Promise<void>;
        setModel(model2: any): void;
    };
};
export var IFFT: string;
export var Identity: string;
export var Imag: string;
export var InputSpec: {
    new (args: any): {
        dtype: any;
        shape: any;
        ndim: any;
        maxNDim: any;
        minNDim: any;
        axes: any;
    };
};
export var IsFinite: string;
export var IsInf: string;
export var IsNan: string;
export var KernelBackend: {
    new (): {
        refCount(dataId: any): void;
        incRef(dataId: any): void;
        timerAvailable(): boolean;
        time(f: any): void;
        read(dataId: any): void;
        readSync(dataId: any): void;
        numDataIds(): void;
        disposeData(dataId: any, force: any): void;
        write(values: any, shape: any, dtype: any): void;
        move(dataId: any, values: any, shape: any, dtype: any, refCount: any): void;
        memory(): void;
        floatPrecision(): void;
        epsilon(): number;
        dispose(): void;
    };
};
export var LRN: string;
export var LRNGrad: string;
export var LayerVariable: {
    new (val: any, dtype?: string, name?: string, trainable?: boolean, constraint?: null): {
        dtype: string;
        shape: any;
        id: number;
        originalName: string;
        name: any;
        trainable_: boolean;
        constraint: any;
        val: any;
        read(): any;
        write(newVal: any): any;
        dispose(): void;
        assertNotDisposed(): void;
        trainable: boolean;
    };
};
export var LayersModel: {
    new (args: any): {
        [x: string]: any;
        isTraining: boolean;
        summary(lineLength: any, positions: any, printFn?: {
            (...data: any[]): void;
            (...data: any[]): void;
            (message?: any, ...optionalParams: any[]): void;
        }): void;
        compile(args: any): void;
        loss: any;
        optimizer_: any;
        isOptimizerOwned: boolean | undefined;
        lossFunctions: any;
        feedOutputNames: any[] | undefined;
        feedOutputShapes: any[] | undefined;
        feedLossFns: any[] | undefined;
        metrics: any;
        metricsNames: string[] | undefined;
        metricsTensors: any[] | undefined;
        collectedTrainableWeights: any;
        checkTrainableWeightsConsistency(): void;
        evaluate(x: any, y: any, args?: {}): any;
        evaluateDataset(dataset: any, args: any): Promise<any>;
        checkNumSamples(ins: any, batchSize: any, steps: any, stepsName?: string): any;
        execute(inputs: any, outputs: any): any;
        retrieveSymbolicTensors(symbolicTensorNames: any): any[];
        predictLoop(ins: any, batchSize?: number, verbose?: boolean): any;
        predict(x: any, args?: {}): any;
        predictOnBatch(x: any): any;
        standardizeUserDataXY(x: any, y: any, checkBatchAxis: boolean | undefined, batchSize: any): any[];
        standardizeUserData(x: any, y: any, sampleWeight: any, classWeight: any, checkBatchAxis: boolean | undefined, batchSize: any): Promise<any[]>;
        testLoop(f: any, ins: any, batchSize: any, verbose: number | undefined, steps: any): any;
        getDedupedMetricsNames(): string[];
        makeTrainFunction(): (data: any) => any[];
        makeTestFunction(): void;
        testFunction: ((data: any) => any) | undefined;
        fit(x: any, y: any, args?: {}): Promise<any>;
        fitDataset(dataset: any, args: any): Promise<any>;
        trainOnBatch(x: any, y: any): Promise<any>;
        getNamedWeights(config: any): {
            name: any;
            tensor: any;
        }[];
        stopTraining: any;
        stopTraining_: any;
        optimizer: any;
        dispose(): any;
        getLossIdentifiers(): any;
        getMetricIdentifiers(): {};
        getTrainingConfig(): {
            loss: any;
            metrics: {};
            optimizer_config: {
                class_name: any;
                config: any;
            };
        };
        loadTrainingConfig(trainingConfig: any): void;
        save(handlerOrURL: any, config: any): Promise<any>;
        setUserDefinedMetadata(userDefinedMetadata: any): void;
        userDefinedMetadata: any;
        getUserDefinedMetadata(): any;
    };
    [x: string]: any;
    className: string;
};
export var LeakyRelu: string;
export var Less: string;
export var LessEqual: string;
export var LinSpace: string;
export var Log: string;
export var Log1p: string;
export var LogSoftmax: string;
export var LogicalAnd: string;
export var LogicalNot: string;
export var LogicalOr: string;
export var MathBackendWebGL: {
    new (gpgpu: any): {
        pendingRead: WeakMap<object, any>;
        pendingDisposal: WeakSet<object>;
        dataRefCount: WeakMap<object, any>;
        numBytesInGPU: number;
        uploadWaitMs: number;
        downloadWaitMs: number;
        lastGlFlushTime: number;
        warnedAboutMemory: boolean;
        pendingDeletes: number;
        disposed: boolean;
        binaryCache: any;
        gpgpu: any;
        canvas: any;
        gpgpuCreatedLocally: boolean;
        textureManager: {
            gpgpu: any;
            numUsedTextures: number;
            numFreeTextures: number;
            _numBytesAllocated: number;
            _numBytesFree: number;
            freeTextures: {};
            logEnabled: boolean;
            usedTextures: {};
            acquireTexture(shapeRC: any, usage: any, isPacked: any): any;
            releaseTexture(texture: any, shape: any, logicalTexType: any, isPacked: any): void;
            log(): void;
            readonly numBytesAllocated: number;
            readonly numBytesFree: number;
            getNumUsedTextures(): number;
            getNumFreeTextures(): number;
            dispose(): void;
        };
        numMBBeforeWarning: number;
        texData: {
            backend: any;
            dataMover: any;
            data: WeakMap<object, any>;
            dataIdsCount: number;
            get(dataId: any): any;
            set(dataId: any, value: any): void;
            has(dataId: any): boolean;
            delete(dataId: any): boolean;
            numDataIds(): number;
        };
        nextDataId(): number;
        numDataIds(): number;
        write(values: any, shape: any, dtype: any): {
            id: number;
        };
        refCount(dataId: any): any;
        incRef(dataId: any): void;
        decRef(dataId: any): void;
        move(dataId: any, values: any, shape: any, dtype: any, refCount: any): void;
        disposeIntermediateTensorInfo(tensorInfo: any): void;
        readSync(dataId: any): any;
        read(dataId: any): any;
        bufferSync(t: any): {
            dtype: any;
            shape: any;
            size: any;
            values: any;
            strides: any[];
            set(value: any, ...locs: any[]): void;
            get(...locs: any[]): any;
            locToIndex(locs: any): any;
            indexToLoc(index: any): any[];
            readonly rank: any;
            toTensor(): any;
        };
        checkNumericalProblems(values: any): void;
        getValuesFromTexture(dataId: any): any;
        timerAvailable(): boolean;
        time(f: any): Promise<{
            uploadWaitMs: number;
            downloadWaitMs: number;
            kernelMs: null;
            wallMs: null;
        }>;
        programTimersStack: any[] | null | undefined;
        activeTimers: any;
        memory(): {
            unreliable: boolean;
            numBytesInGPU: number;
            numBytesInGPUAllocated: number;
            numBytesInGPUFree: number;
        };
        startTimer(): any;
        endTimer(query: any): any;
        getQueryTime(query: any): Promise<any>;
        disposeData(dataId: any, force?: boolean): boolean;
        releaseGPUData(dataId: any): void;
        getTexture(dataId: any): any;
        getDataInfo(dataId: any): any;
        shouldExecuteOnCPU(inputs: any, sizeThreshold?: any): any;
        getGPGPUContext(): any;
        where(condition: any): any;
        packedUnaryOp(x: any, op2: any, dtype: any): any;
        abs(x: any): any;
        makeTensorInfo(shape: any, dtype: any, values: any): {
            dataId: {
                id: number;
            };
            shape: any;
            dtype: any;
        };
        makeOutput(shape: any, dtype: any, values: any): any;
        unpackTensor(input2: any): any;
        packTensor(input2: any): any;
        packedReshape(input2: any, afterShape: any): {
            dataId: any;
            shape: any;
            dtype: any;
        };
        decode(dataId: any): {
            dtype: any;
            shape: any;
            dataId: any;
        };
        runWebGLProgram(program: any, inputs: any, outputDtype: any, customUniformValues: any, preventEagerUnpackingOfOutput?: boolean): any;
        compileAndRun(program: any, inputs: any, outputDtype: any, customUniformValues: any, preventEagerUnpackingOfOutput?: boolean): any;
        getAndSaveBinary(key: any, getBinary: any): any;
        getTextureManager(): {
            gpgpu: any;
            numUsedTextures: number;
            numFreeTextures: number;
            _numBytesAllocated: number;
            _numBytesFree: number;
            freeTextures: {};
            logEnabled: boolean;
            usedTextures: {};
            acquireTexture(shapeRC: any, usage: any, isPacked: any): any;
            releaseTexture(texture: any, shape: any, logicalTexType: any, isPacked: any): void;
            log(): void;
            readonly numBytesAllocated: number;
            readonly numBytesFree: number;
            getNumUsedTextures(): number;
            getNumFreeTextures(): number;
            dispose(): void;
        };
        dispose(): void;
        floatPrecision(): any;
        floatPrecisionValue: any;
        epsilon(): number;
        uploadToGPU(dataId: any): void;
        convertAndCacheOnCPU(dataId: any, float32Values: any): any;
        acquireTexture(texShape: any, texType: any, dtype: any, isPacked: any): any;
        computeBytes(shape: any, dtype: any): number;
    };
    nextDataId: number;
};
export var Max: string;
export var MaxPool: string;
export var MaxPool3D: string;
export var MaxPool3DGrad: string;
export var MaxPoolGrad: string;
export var MaxPoolWithArgmax: string;
export var Maximum: string;
export var Mean: string;
export var Min: string;
export var Minimum: string;
export var MirrorPad: string;
export var Mod: string;
export var MomentumOptimizer: {
    new (learningRate: any, momentum: any, useNesterov?: boolean): {
        learningRate: any;
        momentum: any;
        useNesterov: boolean;
        accumulations: any[];
        m: any;
        applyGradients(variableGradients: any): void;
        dispose(): void;
        setMomentum(momentum: any): void;
        getWeights(): Promise<{
            name: string;
            tensor: any;
        }[]>;
        setWeights(weightValues: any): Promise<void>;
        getConfig(): {
            learningRate: any;
            momentum: any;
            useNesterov: boolean;
        };
        setLearningRate(learningRate: any): void;
        c: any;
        minimize(f: any, returnCost: boolean | undefined, varList: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(f: any, varList: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(weightValues: any): Promise<any>;
        getClassName(): any;
    };
    fromConfig(cls: any, config: any): any;
    className: string;
};
export var Multinomial: string;
export var Multiply: string;
export var Neg: string;
export var NonMaxSuppressionV3: string;
export var NonMaxSuppressionV4: string;
export var NonMaxSuppressionV5: string;
export var NotEqual: string;
export var OP_SCOPE_SUFFIX: string;
export var OneHot: string;
export var OnesLike: string;
export var Optimizer: {
    new (): {
        minimize(f: any, returnCost: boolean | undefined, varList: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(f: any, varList: any): {
            value: any;
            grads: {};
        };
        dispose(): void;
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        getWeights(): Promise<void>;
        setWeights(weightValues: any): Promise<void>;
        extractIterations(weightValues: any): Promise<any>;
        getClassName(): any;
    };
    fromConfig(cls: any, config: any): any;
};
export var Pack: string;
export var PadV2: string;
export var Pool: string;
export var Pow: string;
export var Prelu: string;
export var Prod: string;
export var RMSPropOptimizer: {
    new (learningRate: any, decay?: number, momentum?: number, epsilon3?: null, centered?: boolean): {
        learningRate: any;
        decay: number;
        momentum: number;
        epsilon: any;
        accumulatedMeanSquares: any[];
        accumulatedMoments: any[];
        accumulatedMeanGrads: any[];
        centered: boolean;
        applyGradients(variableGradients: any): void;
        dispose(): void;
        getWeights(): Promise<{
            name: string;
            tensor: any;
        }[]>;
        setWeights(weightValues: any): Promise<void>;
        getConfig(): {
            learningRate: any;
            decay: number;
            momentum: number;
            epsilon: any;
            centered: boolean;
        };
        minimize(f: any, returnCost: boolean | undefined, varList: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(f: any, varList: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(weightValues: any): Promise<any>;
        getClassName(): any;
    };
    fromConfig(cls: any, config: any): any;
    className: string;
};
export var RNN: {
    new (args: any): {
        cell: any;
        returnSequences: any;
        returnState: any;
        goBackwards: any;
        _stateful: any;
        unroll: any;
        supportsMasking: boolean;
        inputSpec: {
            dtype: any;
            shape: any;
            ndim: any;
            maxNDim: any;
            minNDim: any;
            axes: any;
        }[];
        stateSpec: any;
        states_: any;
        numConstants: any;
        keptStates: any[];
        getStates(): any;
        setStates(states: any): void;
        computeOutputShape(inputShape: any): any[];
        computeMask(inputs: any, mask: any): any;
        states: any;
        build(inputShape: any): void;
        resetStates(states: any, training?: boolean): void;
        apply(inputs: any, kwargs: any): any;
        call(inputs: any, kwargs: any): any;
        getInitialState(inputs: any): any;
        readonly trainableWeights: any;
        readonly nonTrainableWeights: any;
        setFastWeightInitDuringBuild(value: any): void;
        getConfig(): any;
        _callHook: any;
        _addedWeightNames: any[];
        id: number;
        activityRegularizer: any;
        _trainableWeights: any[];
        _nonTrainableWeights: any[];
        _losses: any[];
        _updates: any[];
        _built: boolean;
        inboundNodes: any[];
        outboundNodes: any[];
        name: any;
        trainable_: any;
        batchInputShape: any;
        dtype: any;
        initialWeights: any;
        _refCount: number | null;
        fastWeightInitDuringBuild: boolean;
        getNodeAtIndex(nodeIndex: any, attrName: any): any;
        getInputAt(nodeIndex: any): any;
        getOutputAt(nodeIndex: any): any;
        readonly input: any;
        readonly output: any;
        readonly losses: any[];
        calculateLosses(): any[];
        readonly updates: any[];
        built: boolean;
        trainable: any;
        readonly weights: any[];
        readonly stateful: boolean;
        assertInputCompatibility(inputs: any): void;
        invokeCallHook(inputs: any, kwargs: any): void;
        setCallHook(callHook: any): void;
        clearCallHook(): void;
        warnOnIncompatibleInputShape(inputShape: any): void;
        readonly outputShape: any;
        countParams(): number;
        getWeights(trainableOnly?: boolean): any;
        setWeights(weights: any): void;
        addWeight(name: any, shape: any, dtype: any, initializer: any, regularizer: any, trainable: any, constraint: any): {
            dtype: string;
            shape: any;
            id: number;
            originalName: string;
            name: any;
            trainable_: boolean;
            constraint: any;
            val: any;
            read(): any;
            write(newVal: any): any;
            dispose(): void;
            assertNotDisposed(): void;
            trainable: boolean;
        };
        addLoss(losses4: any): void;
        addInboundNode(inputTensors: any, outputTensors: any, inputMasks: any, outputMasks: any, inputShapes: any, outputShapes: any, kwargs?: null): void;
        disposeWeights(): number;
        assertNotDisposed(): void;
        dispose(): {
            refCountAfterDispose: number;
            numDisposedVariables: number;
        };
    };
    fromConfig(cls: any, config: any, customObjects?: {}): any;
    className: string;
    nodeKey(layer: any, nodeIndex: any): string;
};
export var Range: string;
export var Rank: any;
export var Real: string;
export var RealDiv: string;
export var Reciprocal: string;
export var Reduction: any;
export var Relu: string;
export var Relu6: string;
export var Reshape: string;
export var ResizeBilinear: string;
export var ResizeBilinearGrad: string;
export var ResizeNearestNeighbor: string;
export var ResizeNearestNeighborGrad: string;
export var Reverse: string;
export var RotateWithOffset: string;
export var Round: string;
export var Rsqrt: string;
export var SGDOptimizer: {
    new (learningRate: any): {
        learningRate: any;
        applyGradients(variableGradients: any): void;
        setLearningRate(learningRate: any): void;
        c: any;
        dispose(): void;
        getWeights(): Promise<{
            name: string;
            tensor: any;
        }[]>;
        setWeights(weightValues: any): Promise<void>;
        getConfig(): {
            learningRate: any;
        };
        minimize(f: any, returnCost: boolean | undefined, varList: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(f: any, varList: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(weightValues: any): Promise<any>;
        getClassName(): any;
    };
    fromConfig(cls: any, config: any): any;
    className: string;
};
export var ScatterNd: string;
export var Select: string;
export var Selu: string;
export var Sequential: any;
export var Sigmoid: string;
export var Sign: string;
export var Sin: string;
export var Sinh: string;
export var Slice: string;
export var Softmax: string;
export var Softplus: string;
export var SpaceToBatchND: string;
export var SparseFillEmptyRows: string;
export var SparseReshape: string;
export var SparseSegmentMean: string;
export var SparseSegmentSum: string;
export var SparseToDense: string;
export var SplitV: string;
export var Sqrt: string;
export var Square: string;
export var SquaredDifference: string;
export var Step: string;
export var StridedSlice: string;
export var StringNGrams: string;
export var StringSplit: string;
export var StringToHashBucketFast: string;
export var Sub: string;
export var Sum: string;
export var SymbolicTensor: {
    new (dtype: any, shape: any, sourceLayer: any, inputs: any, callArgs: any, name: any, outputTensorIndex: any): {
        dtype: any;
        shape: any;
        sourceLayer: any;
        inputs: any;
        callArgs: any;
        outputTensorIndex: any;
        id: number;
        originalName: string | undefined;
        name: any;
        rank: any;
    };
};
export var Tan: string;
export var Tanh: string;
export var Tensor: {
    new (shape: any, dtype: any, dataId: any, id: any): {
        kept: boolean;
        isDisposedInternal: boolean;
        shape: any;
        dtype: any;
        size: any;
        strides: any[];
        dataId: any;
        id: any;
        rankType: any;
        readonly rank: any;
        buffer(): Promise<any>;
        bufferSync(): any;
        array(): Promise<any>;
        arraySync(): any;
        data(): Promise<any>;
        dataSync(): any;
        bytes(): Promise<any>;
        dispose(): void;
        readonly isDisposed: boolean;
        throwIfDisposed(): void;
        print(verbose?: boolean): any;
        clone(): any;
        toString(verbose?: boolean): string;
        cast(dtype: any): any;
        variable(trainable: boolean | undefined, name: any, dtype: any): any;
    };
};
export var TensorBuffer: {
    new (shape: any, dtype: any, values: any): {
        dtype: any;
        shape: any;
        size: any;
        values: any;
        strides: any[];
        set(value: any, ...locs: any[]): void;
        get(...locs: any[]): any;
        locToIndex(locs: any): any;
        indexToLoc(index: any): any[];
        readonly rank: any;
        toTensor(): any;
    };
};
export var Tile: string;
export var TopK: string;
export var Transform: string;
export var Transpose: string;
export var Unique: string;
export var Unpack: string;
export var UnsortedSegmentSum: string;
export var Variable: {
    new (initialValue: any, trainable: any, name: any, tensorId: any): {
        trainable: any;
        name: any;
        assign(newValue: any): void;
        dataId: any;
        dispose(): void;
        isDisposedInternal: boolean;
        kept: boolean;
        shape: any;
        dtype: any;
        size: any;
        strides: any[];
        id: any;
        rankType: any;
        readonly rank: any;
        buffer(): Promise<any>;
        bufferSync(): any;
        array(): Promise<any>;
        arraySync(): any;
        data(): Promise<any>;
        dataSync(): any;
        bytes(): Promise<any>;
        readonly isDisposed: boolean;
        throwIfDisposed(): void;
        print(verbose?: boolean): any;
        clone(): any;
        toString(verbose?: boolean): string;
        cast(dtype: any): any;
        variable(trainable: boolean | undefined, name: any, dtype: any): any;
    };
};
export var ZerosLike: string;
export var _FusedMatMul: string;
export function abs(...args: any[]): any;
export namespace abs {
    const name: string;
}
export function acos(...args: any[]): any;
export namespace acos { }
export function acosh(...args: any[]): any;
export namespace acosh { }
declare function add2(...args: any[]): any;
declare namespace add2 { }
export function addN(...args: any[]): any;
export namespace addN { }
export function all(...args: any[]): any;
export namespace all { }
export function any(...args: any[]): any;
export namespace any { }
export function argMax(...args: any[]): any;
export namespace argMax { }
export function argMin(...args: any[]): any;
export namespace argMin { }
export function asin(...args: any[]): any;
export namespace asin { }
export function asinh(...args: any[]): any;
export namespace asinh { }
export function atan(...args: any[]): any;
export namespace atan { }
export function atan2(...args: any[]): any;
export namespace atan2 { }
export function atanh(...args: any[]): any;
export namespace atanh { }
export function avgPool(...args: any[]): any;
export namespace avgPool { }
export function avgPool3d(...args: any[]): any;
export namespace avgPool3d { }
export function backend(): any;
declare var backend_util_exports: {};
export function basicLSTMCell(...args: any[]): any;
export namespace basicLSTMCell { }
export function batchNorm(...args: any[]): any;
export namespace batchNorm { }
export function batchNorm2d(...args: any[]): any;
export namespace batchNorm2d { }
export function batchNorm3d(...args: any[]): any;
export namespace batchNorm3d { }
export function batchNorm4d(...args: any[]): any;
export namespace batchNorm4d { }
export function batchToSpaceND(...args: any[]): any;
export namespace batchToSpaceND { }
export function bincount(...args: any[]): any;
export namespace bincount { }
export function booleanMaskAsync(tensor2: any, mask: any, axis: any): Promise<any>;
export function broadcastArgs(...args: any[]): any;
export namespace broadcastArgs { }
export function broadcastTo(...args: any[]): any;
export namespace broadcastTo { }
declare var browser_exports: {};
export function buffer(shape: any, dtype: string | undefined, values: any): {
    dtype: any;
    shape: any;
    size: any;
    values: any;
    strides: any[];
    set(value: any, ...locs: any[]): void;
    get(...locs: any[]): any;
    locToIndex(locs: any): any;
    indexToLoc(index: any): any[];
    readonly rank: any;
    toTensor(): any;
};
export namespace callbacks {
    export { earlyStopping };
}
export function cast(...args: any[]): any;
export namespace cast { }
export function ceil(...args: any[]): any;
export namespace ceil { }
export function clipByValue(...args: any[]): any;
export namespace clipByValue { }
export function clone(...args: any[]): any;
export namespace clone { }
export function complex(...args: any[]): any;
export namespace complex { }
export function concat(...args: any[]): any;
export namespace concat { }
export function concat1d(...args: any[]): any;
export namespace concat1d { }
export function concat2d(...args: any[]): any;
export namespace concat2d { }
export function concat3d(...args: any[]): any;
export namespace concat3d { }
export function concat4d(...args: any[]): any;
export namespace concat4d { }
declare var exports_constraints_exports: {};
export function conv1d(...args: any[]): any;
export namespace conv1d { }
export function conv2d(...args: any[]): any;
export namespace conv2d { }
export function conv2dTranspose(...args: any[]): any;
export namespace conv2dTranspose { }
export function conv3d(...args: any[]): any;
export namespace conv3d { }
export function conv3dTranspose(...args: any[]): any;
export namespace conv3dTranspose { }
export function copyRegisteredKernels(registeredBackendName: any, newBackendName: any): void;
export function cos(...args: any[]): any;
export namespace cos { }
export function cosh(...args: any[]): any;
export namespace cosh { }
export function cosineWindow(windowLength: any, a: any, b: any): any;
export function cumsum(...args: any[]): any;
export namespace cumsum { }
export function customGrad(f: any): any;
declare var dist_exports: {};
export function denseBincount(...args: any[]): any;
export namespace denseBincount { }
export function deprecationWarn(msg: any): void;
export function depthToSpace(...args: any[]): any;
export namespace depthToSpace { }
export function depthwiseConv2d(...args: any[]): any;
export namespace depthwiseConv2d { }
export function deregisterOp(name: any): void;
declare var device_util_exports: {};
export function diag(...args: any[]): any;
export namespace diag { }
export function dilation2d(...args: any[]): any;
export namespace dilation2d { }
export function disableDeprecationWarnings(): void;
export function dispose(container: any): void;
export function disposeVariables(): void;
export function div(...args: any[]): any;
export namespace div { }
export function divNoNan(...args: any[]): any;
export namespace divNoNan { }
export function dot(...args: any[]): any;
export namespace dot { }
export function dropout(...args: any[]): any;
export namespace dropout { }
export function einsum(...args: any[]): any;
export namespace einsum { }
export function elu(...args: any[]): any;
export namespace elu { }
export function enableDebugMode(): void;
export function enableProdMode(): void;
export function enclosingPowerOfTwo(value: any): number;
export function engine(): any;
export function env(): any;
export function equal(...args: any[]): any;
export namespace equal { }
export function erf(...args: any[]): any;
export namespace erf { }
export function exp(...args: any[]): any;
export namespace exp { }
export function expandDims(...args: any[]): any;
export namespace expandDims { }
export function expm1(...args: any[]): any;
export namespace expm1 { }
export function eye(...args: any[]): any;
export namespace eye { }
export function fft(...args: any[]): any;
export namespace fft { }
export function fill(shape: any, value: any, dtype: any): any;
export function findBackend(name: any): any;
export function findBackendFactory(name: any): any;
export function floor(...args: any[]): any;
export namespace floor { }
export function floorDiv(...args: any[]): any;
export namespace floorDiv { }
export function forceHalfFloat(): void;
declare var fused_ops_exports: {};
export function gather(...args: any[]): any;
export namespace gather { }
export function gatherND(...args: any[]): any;
export namespace gatherND { }
declare var gather_nd_util_exports: {};
export function getBackend(): any;
export function getGradient(kernelName: any): any;
export function getKernel(kernelName: any, backendName: any): any;
export function getKernelsForBackend(backendName: any): any[];
declare var gpgpu_util_exports: {};
export function grad(f: any): (x: any, dy: any) => any;
export function grads(f: any): (args: any, dy: any) => any;
export function greater(...args: any[]): any;
export namespace greater { }
export function greaterEqual(...args: any[]): any;
export namespace greaterEqual { }
export function ifft(...args: any[]): any;
export namespace ifft { }
export function imag(...args: any[]): any;
export namespace imag { }
export namespace image {
    export { flipLeftRight };
    export { grayscaleToRGB };
    export { resizeNearestNeighbor };
    export { resizeBilinear };
    export { rotateWithOffset };
    export { cropAndResize };
    export { nonMaxSuppression };
    export { nonMaxSuppressionAsync };
    export { nonMaxSuppressionWithScore };
    export { nonMaxSuppressionWithScoreAsync };
    export { nonMaxSuppressionPadded };
    export { nonMaxSuppressionPaddedAsync };
    export { threshold };
    export { transform };
}
export function inTopKAsync(predictions: any, targets: any, k?: number): Promise<any>;
declare var exports_initializers_exports: {};
export function input(config: any): any;
declare var io_exports: {};
export function irfft(...args: any[]): any;
export namespace irfft { }
declare function isFinite2(...args: any[]): any;
declare namespace isFinite2 { }
export function isInf(...args: any[]): any;
export namespace isInf { }
declare function isNaN2(...args: any[]): any;
declare namespace isNaN2 { }
export function keep(result: any): any;
declare var kernel_impls_exports: {};
declare var exports_layers_exports: {};
export function leakyRelu(...args: any[]): any;
export namespace leakyRelu { }
export function less(...args: any[]): any;
export namespace less { }
export function lessEqual(...args: any[]): any;
export namespace lessEqual { }
export namespace linalg {
    export { bandPart };
    export { gramSchmidt };
    export { qr };
}
export function linspace(start: any, stop: any, num: any): any;
export function loadGraphModel(modelUrl: any, options?: {}): Promise<{
    modelUrl: any;
    loadOptions: {};
    version: string;
    resourceManager: {
        hashTableNameToHandle: {};
        hashTableMap: {};
        addHashTable(name: any, hashTable2: any): void;
        getHashTableHandleByName(name: any): any;
        getHashTableById(id: any): any;
        dispose(): void;
    };
    readonly modelVersion: string;
    readonly inputNodes: any;
    readonly outputNodes: any;
    readonly inputs: any;
    readonly outputs: any;
    readonly weights: any;
    readonly metadata: any;
    readonly modelSignature: any;
    findIOHandler(): void;
    handler: any;
    load(): Promise<boolean>;
    loadSync(artifacts: any): boolean;
    artifacts: any;
    signature: any;
    executor: {
        graph: any;
        parent: any;
        compiledMap: Map<any, any>;
        _weightMap: {};
        SEPERATOR: string;
        _functions: any;
        _functionExecutorMap: {};
        _outputs: any;
        _inputs: any;
        _initNodes: any;
        _signature: any;
        readonly weightIds: any;
        readonly functionExecutorMap: any;
        weightMap: any;
        _weightIds: any[] | undefined;
        resourceManager: any;
        _resourceManager: any;
        readonly inputs: any;
        readonly outputs: any;
        readonly inputNodes: any;
        readonly outputNodes: any;
        readonly functions: {};
        getCompilationKey(inputs: any, outputs: any): string;
        compile(inputs: any, outputs: any): any[];
        execute(inputs: any, outputs: any): any;
        getFrozenTensorIds(tensorMap: any): Set<any>;
        checkTensorForDisposal(nodeName: any, node: any, tensorMap: any, context: any, tensorsToKeep: any, outputNames: any, intermediateTensorConsumerCount: any): void;
        executeAsync(inputs: any, outputs: any): Promise<any>;
        _executeAsync(inputs: any, outputs: any, isFunctionExecution?: boolean, tensorArrayMap?: {}, tensorListMap?: {}): Promise<any>;
        executeFunctionAsync(inputs: any, tensorArrayMap: any, tensorListMap: any): Promise<any>;
        executeWithControlFlow(inputs: any, context: any, outputNames: any, isFunctionExecution: any): Promise<any>;
        processStack(inputNodes: any, stack2: any, context: any, tensorMap: any, added: any, tensorsToKeep: any, outputNames: any, intermediateTensorConsumerCount: any, usedNodes: any): any[];
        processChildNodes(node: any, stack2: any, context: any, tensorMap: any, added: any, usedNodes: any): void;
        dispose(): void;
        checkInputShapeAndType(inputs: any): void;
        mapInputs(inputs: any): {};
        checkInputs(inputs: any): void;
        mapOutputs(outputs: any): any;
        checkOutputs(outputs: any): void;
    } | undefined;
    initializer: {
        graph: any;
        parent: any;
        compiledMap: Map<any, any>;
        _weightMap: {};
        SEPERATOR: string;
        _functions: any;
        _functionExecutorMap: {};
        _outputs: any;
        _inputs: any;
        _initNodes: any;
        _signature: any;
        readonly weightIds: any;
        readonly functionExecutorMap: any;
        weightMap: any;
        _weightIds: any[] | undefined;
        resourceManager: any;
        _resourceManager: any;
        readonly inputs: any;
        readonly outputs: any;
        readonly inputNodes: any;
        readonly outputNodes: any;
        readonly functions: {};
        getCompilationKey(inputs: any, outputs: any): string;
        compile(inputs: any, outputs: any): any[];
        execute(inputs: any, outputs: any): any;
        getFrozenTensorIds(tensorMap: any): Set<any>;
        checkTensorForDisposal(nodeName: any, node: any, tensorMap: any, context: any, tensorsToKeep: any, outputNames: any, intermediateTensorConsumerCount: any): void;
        executeAsync(inputs: any, outputs: any): Promise<any>;
        _executeAsync(inputs: any, outputs: any, isFunctionExecution?: boolean, tensorArrayMap?: {}, tensorListMap?: {}): Promise<any>;
        executeFunctionAsync(inputs: any, tensorArrayMap: any, tensorListMap: any): Promise<any>;
        executeWithControlFlow(inputs: any, context: any, outputNames: any, isFunctionExecution: any): Promise<any>;
        processStack(inputNodes: any, stack2: any, context: any, tensorMap: any, added: any, tensorsToKeep: any, outputNames: any, intermediateTensorConsumerCount: any, usedNodes: any): any[];
        processChildNodes(node: any, stack2: any, context: any, tensorMap: any, added: any, usedNodes: any): void;
        dispose(): void;
        checkInputShapeAndType(inputs: any): void;
        mapInputs(inputs: any): {};
        checkInputs(inputs: any): void;
        mapOutputs(outputs: any): any;
        checkOutputs(outputs: any): void;
    } | undefined;
    save(handlerOrURL: any, config: any): Promise<any>;
    predict(inputs: any, config: any): any;
    normalizeInputs(inputs: any): any;
    normalizeOutputs(outputs: any): any[];
    execute(inputs: any, outputs: any): any;
    executeAsync(inputs: any, outputs: any): Promise<any>;
    convertTensorMapToTensorsMap(map: any): {};
    dispose(): void;
}>;
export function loadLayersModel(pathOrIOHandler: any, options: any): Promise<any>;
export function localResponseNormalization(...args: any[]): any;
export namespace localResponseNormalization { }
declare function log5(...args: any[]): any;
declare namespace log5 { }
export function log1p(...args: any[]): any;
export namespace log1p { }
export function logSigmoid(...args: any[]): any;
export namespace logSigmoid { }
export function logSoftmax(...args: any[]): any;
export namespace logSoftmax { }
export function logSumExp(...args: any[]): any;
export namespace logSumExp { }
export function logicalAnd(...args: any[]): any;
export namespace logicalAnd { }
export function logicalNot(...args: any[]): any;
export namespace logicalNot { }
export function logicalOr(...args: any[]): any;
export namespace logicalOr { }
export function logicalXor(...args: any[]): any;
export namespace logicalXor { }
export namespace losses {
    export { absoluteDifference };
    export { computeWeightedLoss };
    export { cosineDistance };
    export { hingeLoss };
    export { huberLoss };
    export { logLoss };
    export { meanSquaredError };
    export { sigmoidCrossEntropy };
    export { softmaxCrossEntropy };
}
export function matMul(...args: any[]): any;
export namespace matMul { }
declare var math_exports: {};
export function max(...args: any[]): any;
export namespace max { }
export function maxPool(...args: any[]): any;
export namespace maxPool { }
export function maxPool3d(...args: any[]): any;
export namespace maxPool3d { }
export function maxPoolWithArgmax(...args: any[]): any;
export namespace maxPoolWithArgmax { }
export function maximum(...args: any[]): any;
export namespace maximum { }
export function mean(...args: any[]): any;
export namespace mean { }
export function memory(): any;
export function meshgrid(x: any, y: any, { indexing }?: {
    indexing?: string | undefined;
}): any[];
declare var exports_metrics_exports: {};
export function min(...args: any[]): any;
export namespace min { }
export function minimum(...args: any[]): any;
export namespace minimum { }
export function mirrorPad(...args: any[]): any;
export namespace mirrorPad { }
export function mod(...args: any[]): any;
export namespace mod { }
export function model(args: any): {
    [x: string]: any;
    isTraining: boolean;
    summary(lineLength: any, positions: any, printFn?: {
        (...data: any[]): void;
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    }): void;
    compile(args: any): void;
    loss: any;
    optimizer_: any;
    isOptimizerOwned: boolean | undefined;
    lossFunctions: any;
    feedOutputNames: any[] | undefined;
    feedOutputShapes: any[] | undefined;
    feedLossFns: any[] | undefined;
    metrics: any;
    metricsNames: string[] | undefined;
    metricsTensors: any[] | undefined;
    collectedTrainableWeights: any;
    checkTrainableWeightsConsistency(): void;
    evaluate(x: any, y: any, args?: {}): any;
    evaluateDataset(dataset: any, args: any): Promise<any>;
    checkNumSamples(ins: any, batchSize: any, steps: any, stepsName?: string): any;
    execute(inputs: any, outputs: any): any;
    retrieveSymbolicTensors(symbolicTensorNames: any): any[];
    predictLoop(ins: any, batchSize?: number, verbose?: boolean): any;
    predict(x: any, args?: {}): any;
    predictOnBatch(x: any): any;
    standardizeUserDataXY(x: any, y: any, checkBatchAxis: boolean | undefined, batchSize: any): any[];
    standardizeUserData(x: any, y: any, sampleWeight: any, classWeight: any, checkBatchAxis: boolean | undefined, batchSize: any): Promise<any[]>;
    testLoop(f: any, ins: any, batchSize: any, verbose: number | undefined, steps: any): any;
    getDedupedMetricsNames(): string[];
    makeTrainFunction(): (data: any) => any[];
    makeTestFunction(): void;
    testFunction: ((data: any) => any) | undefined;
    fit(x: any, y: any, args?: {}): Promise<any>;
    fitDataset(dataset: any, args: any): Promise<any>;
    trainOnBatch(x: any, y: any): Promise<any>;
    getNamedWeights(config: any): {
        name: any;
        tensor: any;
    }[];
    stopTraining: any;
    stopTraining_: any;
    optimizer: any;
    dispose(): any;
    getLossIdentifiers(): any;
    getMetricIdentifiers(): {};
    getTrainingConfig(): {
        loss: any;
        metrics: {};
        optimizer_config: {
            class_name: any;
            config: any;
        };
    };
    loadTrainingConfig(trainingConfig: any): void;
    save(handlerOrURL: any, config: any): Promise<any>;
    setUserDefinedMetadata(userDefinedMetadata: any): void;
    userDefinedMetadata: any;
    getUserDefinedMetadata(): any;
};
declare var exports_models_exports: {};
export function moments(...args: any[]): any;
export namespace moments { }
export function movingAverage(...args: any[]): any;
export namespace movingAverage { }
export function mul(...args: any[]): any;
export namespace mul { }
export function multiRNNCell(...args: any[]): any;
export namespace multiRNNCell { }
export function multinomial(...args: any[]): any;
export namespace multinomial { }
export function neg(...args: any[]): any;
export namespace neg { }
export function nextFrame(): Promise<any>;
export function norm(...args: any[]): any;
export namespace norm { }
export function notEqual(...args: any[]): any;
export namespace notEqual { }
export function oneHot(...args: any[]): any;
export namespace oneHot { }
declare function ones2(shape: any, dtype?: string): any;
export function onesLike(...args: any[]): any;
export namespace onesLike { }
export function op(f: any): {
    (...args: any[]): any;
    readonly name: string;
};
export function outerProduct(...args: any[]): any;
export namespace outerProduct { }
export function pad(...args: any[]): any;
export namespace pad { }
export function pad1d(...args: any[]): any;
export namespace pad1d { }
export function pad2d(...args: any[]): any;
export namespace pad2d { }
export function pad3d(...args: any[]): any;
export namespace pad3d { }
export function pad4d(...args: any[]): any;
export namespace pad4d { }
export function pool(...args: any[]): any;
export namespace pool { }
export function pow(...args: any[]): any;
export namespace pow { }
export function prelu(...args: any[]): any;
export namespace prelu { }
declare function print2(x: any, verbose?: boolean): void;
export function prod(...args: any[]): any;
export namespace prod { }
export function profile(f: any): any;
export function rand(...args: any[]): any;
export namespace rand { }
export function randomGamma(...args: any[]): any;
export namespace randomGamma { }
export function randomNormal(...args: any[]): any;
export namespace randomNormal { }
export function randomUniform(...args: any[]): any;
export namespace randomUniform { }
export function range(start: any, stop: any, step5?: number, dtype?: string): any;
export function ready(): any;
export function real(...args: any[]): any;
export namespace real { }
export function reciprocal(...args: any[]): any;
export namespace reciprocal { }
export function registerBackend(name: any, factory: any, priority?: number): any;
export function registerCallbackConstructor(verbosityLevel: any, callbackConstructor: any): void;
export function registerGradient(config: any): void;
export function registerKernel(config: any): void;
export function registerOp(name: any, opFunc: any): void;
declare var exports_regularizers_exports: {};
export function relu(...args: any[]): any;
export namespace relu { }
export function relu6(...args: any[]): any;
export namespace relu6 { }
export function removeBackend(name: any): void;
export function reshape(...args: any[]): any;
export namespace reshape { }
export function reverse(...args: any[]): any;
export namespace reverse { }
export function reverse1d(...args: any[]): any;
export namespace reverse1d { }
export function reverse2d(...args: any[]): any;
export namespace reverse2d { }
export function reverse3d(...args: any[]): any;
export namespace reverse3d { }
export function reverse4d(...args: any[]): any;
export namespace reverse4d { }
export function rfft(...args: any[]): any;
export namespace rfft { }
declare function round2(...args: any[]): any;
declare namespace round2 { }
export function rsqrt(...args: any[]): any;
export namespace rsqrt { }
export function scalar(value: any, dtype: any): any;
export function scatterND(...args: any[]): any;
export namespace scatterND { }
declare var scatter_nd_util_exports: {};
export function selu(...args: any[]): any;
export namespace selu { }
export function separableConv2d(...args: any[]): any;
export namespace separableConv2d { }
export function sequential(config: any): any;
declare var serialization_exports: {};
export function setBackend(backendName: any): any;
export function setPlatform(platformName: any, platform: any): void;
export function setWasmPath(path: any, usePlatformFetch?: boolean): void;
export function setWasmPaths(prefixOrFileMap: any, usePlatformFetch?: boolean): void;
export function setWebGLContext(webGLVersion: any, gl: any): void;
export function setdiff1dAsync(x: any, y: any): Promise<any[]>;
export function sigmoid(...args: any[]): any;
export namespace sigmoid { }
export function sign(...args: any[]): any;
export namespace sign { }
export namespace signal {
    export { hammingWindow };
    export { hannWindow };
    export { frame };
    export { stft };
}
export function sin(...args: any[]): any;
export namespace sin { }
export function sinh(...args: any[]): any;
export namespace sinh { }
export function slice(...args: any[]): any;
export namespace slice { }
export function slice1d(...args: any[]): any;
export namespace slice1d { }
export function slice2d(...args: any[]): any;
export namespace slice2d { }
export function slice3d(...args: any[]): any;
export namespace slice3d { }
export function slice4d(...args: any[]): any;
export namespace slice4d { }
declare var slice_util_exports: {};
export function softmax(...args: any[]): any;
export namespace softmax { }
export function softplus(...args: any[]): any;
export namespace softplus { }
export function spaceToBatchND(...args: any[]): any;
export namespace spaceToBatchND { }
export namespace sparse {
    export { sparseFillEmptyRows };
    export { sparseReshape };
    export { sparseSegmentMean };
    export { sparseSegmentSum };
}
export function sparseToDense(...args: any[]): any;
export namespace sparseToDense { }
export namespace spectral {
    export { fft };
    export { ifft };
    export { rfft };
    export { irfft };
}
export function split(...args: any[]): any;
export namespace split { }
export function sqrt(...args: any[]): any;
export namespace sqrt { }
export function square(...args: any[]): any;
export namespace square { }
export function squaredDifference(...args: any[]): any;
export namespace squaredDifference { }
export function squeeze(...args: any[]): any;
export namespace squeeze { }
export function stack(...args: any[]): any;
export namespace stack { }
export function step(...args: any[]): any;
export namespace step { }
export function stridedSlice(...args: any[]): any;
export namespace stridedSlice { }
export namespace string {
    export { stringNGrams };
    export { stringSplit };
    export { stringToHashBucketFast };
}
export function sub(...args: any[]): any;
export namespace sub { }
declare function sum2(...args: any[]): any;
declare namespace sum2 { }
export function sumOutType(type: any): any;
export function tan(...args: any[]): any;
export namespace tan { }
declare function tanh2(...args: any[]): any;
declare namespace tanh2 { }
export function tensor(values: any, shape: any, dtype: any): any;
export function tensor1d(values: any, dtype: any): any;
export function tensor2d(values: any, shape: any, dtype: any): any;
export function tensor3d(values: any, shape: any, dtype: any): any;
export function tensor4d(values: any, shape: any, dtype: any): any;
export function tensor5d(values: any, shape: any, dtype: any): any;
export function tensor6d(values: any, shape: any, dtype: any): any;
declare var tensor_util_exports: {};
declare var test_util_exports: {};
export function tidy(nameOrFn: any, fn: any): any;
export function tile(...args: any[]): any;
export namespace tile { }
export function time(f: any): any;
export function topk(...args: any[]): any;
export namespace topk { }
export namespace train {
    import sgd = OptimizerConstructors.sgd;
    export { sgd };
    import momentum = OptimizerConstructors.momentum;
    export { momentum };
    import adadelta = OptimizerConstructors.adadelta;
    export { adadelta };
    import adagrad = OptimizerConstructors.adagrad;
    export { adagrad };
    import rmsprop = OptimizerConstructors.rmsprop;
    export { rmsprop };
    import adamax = OptimizerConstructors.adamax;
    export { adamax };
    import adam = OptimizerConstructors.adam;
    export { adam };
}
export function transpose(...args: any[]): any;
export namespace transpose { }
export function truncatedNormal(...args: any[]): any;
export namespace truncatedNormal { }
export function unique(...args: any[]): any;
export namespace unique { }
export function unregisterGradient(kernelName: any): void;
export function unregisterKernel(kernelName: any, backendName: any): void;
export function unsortedSegmentSum(...args: any[]): any;
export namespace unsortedSegmentSum { }
export function unstack(...args: any[]): any;
export namespace unstack { }
export function upcastType(typeA: any, typeB: any): any;
declare var util_exports: {};
export function valueAndGrad(f: any): (x: any, dy: any) => {
    grad: any;
    value: any;
};
export function valueAndGrads(f: any): (args: any, dy: any) => any;
export function variable(initialValue: any, trainable: boolean | undefined, name: any, dtype: any): any;
export function variableGrads(f: any, varList: any): {
    value: any;
    grads: {};
};
declare var version92: {
    tfjs: string;
    "tfjs-core": string;
    "tfjs-data": string;
    "tfjs-layers": string;
    "tfjs-converter": string;
    "tfjs-backend-cpu": string;
    "tfjs-backend-webgl": string;
    "tfjs-backend-wasm": string;
};
declare var version3: string;
declare var version: string;
declare var version2: string;
declare var version8: string;
declare var version5: string;
export namespace webgl {
    export { forceHalfFloat };
}
declare var webgl_util_exports: {};
export function where(...args: any[]): any;
export namespace where { }
export function whereAsync(condition: any): Promise<any>;
export function zeros(shape: any, dtype?: string): any;
export function zerosLike(...args: any[]): any;
export namespace zerosLike { }
declare function less2(currVal: any, prevVal: any): boolean;
declare function getQueryParams(queryString: any): {};
declare function earlyStopping(args: any): {
    monitor: any;
    minDelta: number;
    patience: any;
    verbose: any;
    mode: any;
    baseline: any;
    monitorFunc: typeof less2;
    onTrainBegin(logs: any): Promise<void>;
    wait: number | undefined;
    stoppedEpoch: any;
    best: any;
    onEpochEnd(epoch: any, logs: any): Promise<void>;
    onTrainEnd(logs: any): Promise<void>;
    getMonitorValue(logs: any): any;
    model: {
        [x: string]: any;
        isTraining: boolean;
        summary(lineLength: any, positions: any, printFn?: {
            (...data: any[]): void;
            (...data: any[]): void;
            (message?: any, ...optionalParams: any[]): void;
        }): void;
        compile(args: any): void;
        loss: any;
        optimizer_: any;
        isOptimizerOwned: boolean | undefined;
        lossFunctions: any;
        feedOutputNames: any[] | undefined;
        feedOutputShapes: any[] | undefined;
        feedLossFns: any[] | undefined;
        metrics: any;
        metricsNames: string[] | undefined;
        metricsTensors: any[] | undefined;
        collectedTrainableWeights: any;
        checkTrainableWeightsConsistency(): void;
        evaluate(x: any, y: any, args?: {}): any;
        evaluateDataset(dataset: any, args: any): Promise<any>;
        checkNumSamples(ins: any, batchSize: any, steps: any, stepsName?: string): any;
        execute(inputs: any, outputs: any): any;
        retrieveSymbolicTensors(symbolicTensorNames: any): any[];
        predictLoop(ins: any, batchSize?: number, verbose?: boolean): any;
        predict(x: any, args?: {}): any;
        predictOnBatch(x: any): any;
        standardizeUserDataXY(x: any, y: any, checkBatchAxis: boolean | undefined, batchSize: any): any[];
        standardizeUserData(x: any, y: any, sampleWeight: any, classWeight: any, checkBatchAxis: boolean | undefined, batchSize: any): Promise<any[]>;
        testLoop(f: any, ins: any, batchSize: any, verbose: number | undefined, steps: any): any;
        getDedupedMetricsNames(): string[];
        makeTrainFunction(): (data: any) => any[];
        makeTestFunction(): void;
        testFunction: ((data: any) => any) | undefined;
        fit(x: any, y: any, args?: {}): Promise<any>;
        fitDataset(dataset: any, args: any): Promise<any>;
        trainOnBatch(x: any, y: any): Promise<any>;
        getNamedWeights(config: any): {
            name: any;
            tensor: any;
        }[];
        stopTraining: any;
        stopTraining_: any;
        optimizer: any;
        dispose(): any;
        getLossIdentifiers(): any;
        getMetricIdentifiers(): {};
        getTrainingConfig(): {
            loss: any;
            metrics: {};
            optimizer_config: {
                class_name: any;
                config: any;
            };
        };
        loadTrainingConfig(trainingConfig: any): void;
        save(handlerOrURL: any, config: any): Promise<any>;
        setUserDefinedMetadata(userDefinedMetadata: any): void;
        userDefinedMetadata: any;
        getUserDefinedMetadata(): any;
    } | null;
    setModel(model2: any): void;
    validationData: any;
    setParams(params: any): void;
    params: any;
    onEpochBegin(epoch: any, logs: any): Promise<void>;
    onBatchBegin(batch: any, logs: any): Promise<void>;
    onBatchEnd(batch: any, logs: any): Promise<void>;
};
declare function flipLeftRight(...args: any[]): any;
declare namespace flipLeftRight { }
declare function grayscaleToRGB(...args: any[]): any;
declare namespace grayscaleToRGB { }
declare function resizeNearestNeighbor(...args: any[]): any;
declare namespace resizeNearestNeighbor { }
declare function resizeBilinear(...args: any[]): any;
declare namespace resizeBilinear { }
declare function rotateWithOffset(...args: any[]): any;
declare namespace rotateWithOffset { }
declare function cropAndResize(...args: any[]): any;
declare namespace cropAndResize { }
declare function nonMaxSuppression(...args: any[]): any;
declare namespace nonMaxSuppression { }
declare function nonMaxSuppressionAsync(boxes: any, scores: any, maxOutputSize: any, iouThreshold?: number, scoreThreshold?: number): Promise<any>;
declare function nonMaxSuppressionWithScore(...args: any[]): any;
declare namespace nonMaxSuppressionWithScore { }
declare function nonMaxSuppressionWithScoreAsync(boxes: any, scores: any, maxOutputSize: any, iouThreshold?: number, scoreThreshold?: number, softNmsSigma?: number): Promise<{
    selectedIndices: any;
    selectedScores: any;
}>;
declare function nonMaxSuppressionPadded(...args: any[]): any;
declare namespace nonMaxSuppressionPadded { }
declare function nonMaxSuppressionPaddedAsync(boxes: any, scores: any, maxOutputSize: any, iouThreshold?: number, scoreThreshold?: number, padToMaxOutputSize?: boolean): Promise<{
    selectedIndices: any;
    validOutputs: any;
}>;
declare function threshold(...args: any[]): any;
declare namespace threshold { }
declare function transform(...args: any[]): any;
declare namespace transform { }
declare function bandPart(...args: any[]): any;
declare namespace bandPart { }
declare function gramSchmidt(...args: any[]): any;
declare namespace gramSchmidt { }
declare function qr(...args: any[]): any;
declare namespace qr { }
declare function absoluteDifference(...args: any[]): any;
declare namespace absoluteDifference { }
declare function computeWeightedLoss(...args: any[]): any;
declare namespace computeWeightedLoss { }
declare function cosineDistance(...args: any[]): any;
declare namespace cosineDistance { }
declare function hingeLoss(...args: any[]): any;
declare namespace hingeLoss { }
declare function huberLoss(...args: any[]): any;
declare namespace huberLoss { }
declare function logLoss(...args: any[]): any;
declare namespace logLoss { }
declare function meanSquaredError(...args: any[]): any;
declare namespace meanSquaredError { }
declare function sigmoidCrossEntropy(...args: any[]): any;
declare namespace sigmoidCrossEntropy { }
declare function softmaxCrossEntropy(...args: any[]): any;
declare namespace softmaxCrossEntropy { }
declare function hammingWindow(...args: any[]): any;
declare namespace hammingWindow { }
declare function hannWindow(...args: any[]): any;
declare namespace hannWindow { }
declare function frame(...args: any[]): any;
declare namespace frame { }
declare function stft(...args: any[]): any;
declare namespace stft { }
declare function sparseFillEmptyRows(...args: any[]): any;
declare namespace sparseFillEmptyRows { }
declare function sparseReshape(...args: any[]): any;
declare namespace sparseReshape { }
declare function sparseSegmentMean(...args: any[]): any;
declare namespace sparseSegmentMean { }
declare function sparseSegmentSum(...args: any[]): any;
declare namespace sparseSegmentSum { }
declare function stringNGrams(...args: any[]): any;
declare namespace stringNGrams { }
declare function stringSplit(...args: any[]): any;
declare namespace stringSplit { }
declare function stringToHashBucketFast(...args: any[]): any;
declare namespace stringToHashBucketFast { }
declare var OptimizerConstructors: {
    new (): {};
    sgd(learningRate: any): {
        learningRate: any;
        applyGradients(variableGradients: any): void;
        setLearningRate(learningRate: any): void;
        c: any;
        dispose(): void;
        getWeights(): Promise<{
            name: string;
            tensor: any;
        }[]>;
        setWeights(weightValues: any): Promise<void>;
        getConfig(): {
            learningRate: any;
        };
        minimize(f: any, returnCost: boolean | undefined, varList: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(f: any, varList: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(weightValues: any): Promise<any>;
        getClassName(): any;
    };
    momentum(learningRate: any, momentum: any, useNesterov?: boolean): {
        learningRate: any;
        momentum: any;
        useNesterov: boolean;
        accumulations: any[];
        m: any;
        applyGradients(variableGradients: any): void;
        dispose(): void;
        setMomentum(momentum: any): void;
        getWeights(): Promise<{
            name: string;
            tensor: any;
        }[]>;
        setWeights(weightValues: any): Promise<void>;
        getConfig(): {
            learningRate: any;
            momentum: any;
            useNesterov: boolean;
        };
        setLearningRate(learningRate: any): void;
        c: any;
        minimize(f: any, returnCost: boolean | undefined, varList: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(f: any, varList: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(weightValues: any): Promise<any>;
        getClassName(): any;
    };
    rmsprop(learningRate: any, decay?: number, momentum?: number, epsilon3?: null, centered?: boolean): {
        learningRate: any;
        decay: number;
        momentum: number;
        epsilon: any;
        accumulatedMeanSquares: any[];
        accumulatedMoments: any[];
        accumulatedMeanGrads: any[];
        centered: boolean;
        applyGradients(variableGradients: any): void;
        dispose(): void;
        getWeights(): Promise<{
            name: string;
            tensor: any;
        }[]>;
        setWeights(weightValues: any): Promise<void>;
        getConfig(): {
            learningRate: any;
            decay: number;
            momentum: number;
            epsilon: any;
            centered: boolean;
        };
        minimize(f: any, returnCost: boolean | undefined, varList: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(f: any, varList: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(weightValues: any): Promise<any>;
        getClassName(): any;
    };
    adam(learningRate?: number, beta1?: number, beta2?: number, epsilon3?: null): {
        learningRate: any;
        beta1: any;
        beta2: any;
        epsilon: any;
        accumulatedFirstMoment: any[];
        accumulatedSecondMoment: any[];
        accBeta1: any;
        accBeta2: any;
        applyGradients(variableGradients: any): void;
        dispose(): void;
        getWeights(): Promise<{
            name: string;
            tensor: any;
        }[]>;
        setWeights(weightValues: any): Promise<void>;
        getConfig(): {
            learningRate: any;
            beta1: any;
            beta2: any;
            epsilon: any;
        };
        minimize(f: any, returnCost: boolean | undefined, varList: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(f: any, varList: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(weightValues: any): Promise<any>;
        getClassName(): any;
    };
    adadelta(learningRate?: number, rho?: number, epsilon3?: null): {
        learningRate: any;
        rho: any;
        epsilon: any;
        accumulatedGrads: any[];
        accumulatedUpdates: any[];
        applyGradients(variableGradients: any): void;
        dispose(): void;
        getWeights(): Promise<{
            name: string;
            tensor: any;
        }[]>;
        setWeights(weightValues: any): Promise<void>;
        getConfig(): {
            learningRate: any;
            rho: any;
            epsilon: any;
        };
        minimize(f: any, returnCost: boolean | undefined, varList: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(f: any, varList: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(weightValues: any): Promise<any>;
        getClassName(): any;
    };
    adamax(learningRate?: number, beta1?: number, beta2?: number, epsilon3?: null, decay?: number): {
        learningRate: any;
        beta1: any;
        beta2: any;
        epsilon: any;
        decay: number;
        accumulatedFirstMoment: any[];
        accumulatedWeightedInfNorm: any[];
        iteration: any;
        accBeta1: any;
        applyGradients(variableGradients: any): void;
        dispose(): void;
        getWeights(): Promise<void>;
        setWeights(weightValues: any): Promise<void>;
        getConfig(): {
            learningRate: any;
            beta1: any;
            beta2: any;
            epsilon: any;
            decay: number;
        };
        minimize(f: any, returnCost: boolean | undefined, varList: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(f: any, varList: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(weightValues: any): Promise<any>;
        getClassName(): any;
    };
    adagrad(learningRate: any, initialAccumulatorValue?: number): {
        learningRate: any;
        initialAccumulatorValue: number;
        accumulatedGrads: any[];
        applyGradients(variableGradients: any): void;
        dispose(): void;
        getWeights(): Promise<{
            name: string;
            tensor: any;
        }[]>;
        setWeights(weightValues: any): Promise<void>;
        getConfig(): {
            learningRate: any;
            initialAccumulatorValue: number;
        };
        minimize(f: any, returnCost: boolean | undefined, varList: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(f: any, varList: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(weightValues: any): Promise<any>;
        getClassName(): any;
    };
};
export { add2 as add, backend_util_exports as backend_util, browser_exports as browser, exports_constraints_exports as constraints, dist_exports as data, device_util_exports as device_util, fused_ops_exports as fused, gather_nd_util_exports as gather_util, gpgpu_util_exports as gpgpu_util, exports_initializers_exports as initializers, io_exports as io, isFinite2 as isFinite, isNaN2 as isNaN, kernel_impls_exports as kernel_impls, exports_layers_exports as layers, log5 as log, math_exports as math, exports_metrics_exports as metrics, exports_models_exports as models, ones2 as ones, print2 as print, exports_regularizers_exports as regularizers, round2 as round, scatter_nd_util_exports as scatter_util, serialization_exports as serialization, slice_util_exports as slice_util, sum2 as sum, tanh2 as tanh, tensor_util_exports as tensor_util, test_util_exports as test_util, util_exports as util, version92 as version, version3 as version_converter, version as version_core, version2 as version_layers, version8 as version_wasm, version5 as version_webgl, webgl_util_exports as webgl_util };
//# sourceMappingURL=tfjs.esm.d.ts.map