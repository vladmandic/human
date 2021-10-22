declare var ti: string;
declare var Mi: string;
declare var Li: string;
declare var Hu: {
    new (e: any, t: any, n?: null): {
        learningRate: any;
        rho: any;
        epsilon: any;
        accumulatedGrads: any[];
        accumulatedUpdates: any[];
        applyGradients(e: any): void;
        dispose(): void;
        getWeights(): Promise<{
            name: string;
            tensor: any;
        }[]>;
        setWeights(e: any): Promise<void>;
        getConfig(): {
            learningRate: any;
            rho: any;
            epsilon: any;
        };
        minimize(e: any, t: boolean | undefined, n: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(e: any, t: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(e: any): Promise<any>;
        getClassName(): any;
    };
    fromConfig(e: any, t: any): any;
    className: string;
};
declare var qu: {
    new (e: any, t?: number): {
        learningRate: any;
        initialAccumulatorValue: number;
        accumulatedGrads: any[];
        applyGradients(e: any): void;
        dispose(): void;
        getWeights(): Promise<{
            name: string;
            tensor: any;
        }[]>;
        setWeights(e: any): Promise<void>;
        getConfig(): {
            learningRate: any;
            initialAccumulatorValue: number;
        };
        minimize(e: any, t: boolean | undefined, n: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(e: any, t: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(e: any): Promise<any>;
        getClassName(): any;
    };
    fromConfig(e: any, t: any): any;
    className: string;
};
declare var Ku: {
    new (e: any, t: any, n: any, o?: null): {
        learningRate: any;
        beta1: any;
        beta2: any;
        epsilon: any;
        accumulatedFirstMoment: any[];
        accumulatedSecondMoment: any[];
        accBeta1: any;
        accBeta2: any;
        applyGradients(e: any): void;
        dispose(): void;
        getWeights(): Promise<{
            name: string;
            tensor: any;
        }[]>;
        setWeights(e: any): Promise<void>;
        getConfig(): {
            learningRate: any;
            beta1: any;
            beta2: any;
            epsilon: any;
        };
        minimize(e: any, t: boolean | undefined, n: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(e: any, t: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(e: any): Promise<any>;
        getClassName(): any;
    };
    fromConfig(e: any, t: any): any;
    className: string;
};
declare var Xu: {
    new (e: any, t: any, n: any, o?: null, s?: number): {
        learningRate: any;
        beta1: any;
        beta2: any;
        epsilon: any;
        decay: number;
        accumulatedFirstMoment: any[];
        accumulatedWeightedInfNorm: any[];
        iteration: any;
        accBeta1: any;
        applyGradients(e: any): void;
        dispose(): void;
        getWeights(): Promise<void>;
        setWeights(e: any): Promise<void>;
        getConfig(): {
            learningRate: any;
            beta1: any;
            beta2: any;
            epsilon: any;
            decay: number;
        };
        minimize(e: any, t: boolean | undefined, n: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(e: any, t: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(e: any): Promise<any>;
        getClassName(): any;
    };
    fromConfig(e: any, t: any): any;
    className: string;
};
declare var jn: string;
declare var $o: string;
declare var zi: string;
declare var Bi: string;
declare var Ro: string;
declare var ml: string;
declare var Vi: string;
declare var Gi: string;
declare var Wi: string;
declare var ji: string;
declare var Ui: string;
declare var Fo: string;
declare var fl: string;
declare var Uc: string;
declare var Wc: string;
declare var xb: {
    new (e: any): {
        wasm: any;
        dataIdNextNumber: number;
        dataIdMap: {
            backend: any;
            dataMover: any;
            data: WeakMap<object, any>;
            dataIdsCount: number;
            get(e: any): any;
            set(e: any, t: any): void;
            has(e: any): boolean;
            delete(e: any): boolean;
            numDataIds(): number;
        };
        write(e: any, t: any, n: any): {
            id: number;
        };
        numDataIds(): number;
        time(e: any): Promise<{
            kernelMs: number;
        }>;
        move(e: any, t: any, n: any, o: any, s: any): void;
        read(e: any): Promise<any>;
        readSync(e: any): any;
        disposeData(e: any, t?: boolean): boolean;
        refCount(e: any): any;
        incRef(e: any): void;
        floatPrecision(): number;
        getMemoryOffset(e: any): any;
        dispose(): void;
        memory(): {
            unreliable: boolean;
        };
        makeOutput(e: any, t: any, n: any): {
            dataId: {
                id: number;
            };
            shape: any;
            dtype: any;
        };
        typedArrayFromHeap({ shape: e, dtype: t, dataId: n }: {
            shape: any;
            dtype: any;
            dataId: any;
        }): Float32Array | Int32Array | Uint8Array;
        timerAvailable(): boolean;
        epsilon(): number;
    };
};
declare var Oo: string;
declare var ri: string;
declare var jc: string;
declare var Hc: string;
declare var rN: string;
declare var Sv: {
    new (...args: any[]): {
        model: {
            [x: string]: any;
            isTraining: boolean;
            summary(e: any, t: any, n?: {
                (...data: any[]): void;
                (...data: any[]): void;
                (message?: any, ...optionalParams: any[]): void;
            }): void;
            compile(e: any): void;
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
            evaluate(e: any, t: any, n?: {}): any;
            evaluateDataset(e: any, t: any): Promise<any>;
            checkNumSamples(e: any, t: any, n: any, o?: string): any;
            execute(e: any, t: any): any;
            retrieveSymbolicTensors(e: any): any[];
            predictLoop(e: any, t?: number, n?: boolean): any;
            predict(e: any, t?: {}): any;
            predictOnBatch(e: any): any;
            standardizeUserDataXY(e: any, t: any, n: boolean | undefined, o: any): any[];
            standardizeUserData(e: any, t: any, n: any, o: any, s: boolean | undefined, a: any): Promise<any[]>;
            testLoop(e: any, t: any, n: any, o: number | undefined, s: any): any;
            getDedupedMetricsNames(): string[];
            makeTrainFunction(): (e: any) => any[];
            makeTestFunction(): void;
            testFunction: ((e: any) => any) | undefined;
            fit(e: any, t: any, n?: {}): Promise<any>;
            fitDataset(e: any, t: any): Promise<any>;
            trainOnBatch(e: any, t: any): Promise<any>;
            getNamedWeights(e: any): {
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
            loadTrainingConfig(e: any): void;
            save(e: any, t: any): Promise<any>;
            setUserDefinedMetadata(e: any): void;
            userDefinedMetadata: any;
            getUserDefinedMetadata(): any;
        } | null;
        setModel(e: any): void;
        validationData: any;
        setParams(e: any): void;
        params: any;
        onEpochBegin(e: any, t: any): Promise<void>;
        onEpochEnd(e: any, t: any): Promise<void>;
        onBatchBegin(e: any, t: any): Promise<void>;
        onBatchEnd(e: any, t: any): Promise<void>;
        onTrainBegin(e: any): Promise<void>;
        onTrainEnd(e: any): Promise<void>;
    };
};
declare var Lk: {
    new (e: any, t?: number): {
        callbacks: any;
        queueLength: number;
        append(e: any): void;
        setParams(e: any): void;
        setModel(e: any): void;
        onEpochBegin(e: any, t: any): Promise<void>;
        onEpochEnd(e: any, t: any): Promise<void>;
        onBatchBegin(e: any, t: any): Promise<void>;
        onBatchEnd(e: any, t: any): Promise<void>;
        onTrainBegin(e: any): Promise<void>;
        onTrainEnd(e: any): Promise<void>;
    };
};
declare var eo: string;
declare var Po: string;
declare var to: string;
declare var qc: string;
declare var dl: string;
declare var ni: string;
declare var Mo: string;
declare var Kc: string;
declare var Lo: string;
declare var hl: string;
declare var Xc: string;
declare var Yc: string;
declare var zo: string;
declare var Bo: string;
declare var Hi: string;
declare var Vo: string;
declare var Bk: {
    new (e: any, t: any): {
        currentEpoch: number;
        nowFunc: any;
        nextFrameFunc: any;
        yieldEvery: any;
        maybeWait(e: any, t: any, n: any): Promise<void>;
        trainBegin: any;
        trainEnd: any;
        epochBegin: any;
        epochEnd: any;
        batchBegin: any;
        batchEnd: any;
        yield: any;
        onEpochBegin(e: any, t: any): Promise<void>;
        onEpochEnd(e: any, t: any): Promise<void>;
        onBatchBegin(e: any, t: any): Promise<void>;
        onBatchEnd(e: any, t: any): Promise<void>;
        onTrainBegin(e: any): Promise<void>;
        onTrainEnd(e: any): Promise<void>;
        validationData: any;
        setParams(e: any): void;
        params: any;
        setModel(e: any): void;
    };
};
declare var pl: {
    new (e: any, t: any): {
        backend: any;
        dataMover: any;
        data: WeakMap<object, any>;
        dataIdsCount: number;
        get(e: any): any;
        set(e: any, t: any): void;
        has(e: any): boolean;
        delete(e: any): boolean;
        numDataIds(): number;
    };
};
declare var Zc: string;
declare var qi: string;
declare var Go: string;
declare var Jc: string;
declare var Qc: string;
declare var ep: string;
declare var gl: string;
declare var rf: string;
declare var tf: string;
declare var Xw: any;
declare var Nv: {
    new (e: any): {
        monitor: any;
        minDelta: number;
        patience: any;
        verbose: any;
        mode: any;
        baseline: any;
        monitorFunc: typeof Hx;
        onTrainBegin(e: any): Promise<void>;
        wait: number | undefined;
        stoppedEpoch: any;
        best: any;
        onEpochEnd(e: any, t: any): Promise<void>;
        onTrainEnd(e: any): Promise<void>;
        getMonitorValue(e: any): any;
        model: {
            [x: string]: any;
            isTraining: boolean;
            summary(e: any, t: any, n?: {
                (...data: any[]): void;
                (...data: any[]): void;
                (message?: any, ...optionalParams: any[]): void;
            }): void;
            compile(e: any): void;
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
            evaluate(e: any, t: any, n?: {}): any;
            evaluateDataset(e: any, t: any): Promise<any>;
            checkNumSamples(e: any, t: any, n: any, o?: string): any;
            execute(e: any, t: any): any;
            retrieveSymbolicTensors(e: any): any[];
            predictLoop(e: any, t?: number, n?: boolean): any;
            predict(e: any, t?: {}): any;
            predictOnBatch(e: any): any;
            standardizeUserDataXY(e: any, t: any, n: boolean | undefined, o: any): any[];
            standardizeUserData(e: any, t: any, n: any, o: any, s: boolean | undefined, a: any): Promise<any[]>;
            testLoop(e: any, t: any, n: any, o: number | undefined, s: any): any;
            getDedupedMetricsNames(): string[];
            makeTrainFunction(): (e: any) => any[];
            makeTestFunction(): void;
            testFunction: ((e: any) => any) | undefined;
            fit(e: any, t: any, n?: {}): Promise<any>;
            fitDataset(e: any, t: any): Promise<any>;
            trainOnBatch(e: any, t: any): Promise<any>;
            getNamedWeights(e: any): {
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
            loadTrainingConfig(e: any): void;
            save(e: any, t: any): Promise<any>;
            setUserDefinedMetadata(e: any): void;
            userDefinedMetadata: any;
            getUserDefinedMetadata(): any;
        } | null;
        setModel(e: any): void;
        validationData: any;
        setParams(e: any): void;
        params: any;
        onEpochBegin(e: any, t: any): Promise<void>;
        onBatchBegin(e: any, t: any): Promise<void>;
        onBatchEnd(e: any, t: any): Promise<void>;
    };
};
declare var tp: string;
declare var Uo: string;
declare var rp: string;
declare var Eg: {
    new (e: any): {
        global: any;
        flags: {};
        flagRegistry: {};
        urlFlags: {};
        getQueryParams: typeof EW;
        setPlatform(e: any, t: any): void;
        platformName: any;
        platform: any;
        registerFlag(e: any, t: any, n: any): void;
        getAsync(e: any): Promise<any>;
        get(e: any): any;
        getNumber(e: any): any;
        getBool(e: any): any;
        getFlags(): {};
        readonly features: {};
        set(e: any, t: any): void;
        evaluateFlag(e: any): any;
        setFlags(e: any): void;
        reset(): void;
        populateURLFlags(): void;
    };
};
declare var Xi: string;
declare var Ki: string;
declare var jo: string;
declare var oi: string;
declare var Yi: string;
declare var np: string;
declare var xl: string;
declare var Zi: string;
declare var Ho: string;
declare var qo: string;
declare var nf: string;
declare var Ko: string;
declare var xi: string;
declare var yi: string;
declare var Xy: {
    new (e: any): {
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
        createFloat32MatrixTexture(e: any, t: any): any;
        createFloat16MatrixTexture(e: any, t: any): any;
        createUnsignedBytesMatrixTexture(e: any, t: any): any;
        uploadPixelDataToTexture(e: any, t: any): void;
        uploadDenseMatrixToTexture(e: any, t: any, n: any, o: any): void;
        createFloat16PackedMatrixTexture(e: any, t: any): any;
        createPackedMatrixTexture(e: any, t: any): any;
        deleteMatrixTexture(e: any): void;
        downloadByteEncodedFloatMatrixFromOutputTexture(e: any, t: any, n: any): any;
        downloadPackedMatrixFromBuffer(e: any, t: any, n: any, o: any, s: any, a: any): Float32Array;
        downloadFloat32MatrixFromBuffer(e: any, t: any): Float32Array;
        createBufferFromTexture(e: any, t: any, n: any): any;
        createAndWaitForFence(): Promise<any>;
        createFence(e: any): {
            query: any;
            isFencePassed: () => any;
        };
        downloadMatrixFromPackedTexture(e: any, t: any, n: any): any;
        createProgram(e: any): any;
        vertexShader: any;
        deleteProgram(e: any): void;
        setProgram(e: any): void;
        getUniformLocation(e: any, t: any, n?: boolean): any;
        getAttributeLocation(e: any, t: any): any;
        getUniformLocationNoThrow(e: any, t: any): any;
        setInputMatrixTexture(e: any, t: any, n: any): void;
        setOutputMatrixTexture(e: any, t: any, n: any): void;
        setOutputPackedMatrixTexture(e: any, t: any, n: any): void;
        setOutputMatrixWriteRegion(e: any, t: any, n: any, o: any): void;
        setOutputPackedMatrixWriteRegion(e: any, t: any, n: any, o: any): void;
        debugValidate(): void;
        executeProgram(): void;
        blockUntilAllProgramsCompleted(): void;
        getQueryTimerExtension(): any;
        disjointQueryTimerExtension: any;
        getQueryTimerExtensionWebGL2(): any;
        getQueryTimerExtensionWebGL1(): any;
        beginQuery(): any;
        endQuery(): void;
        waitForQueryAndGetTime(e: any): Promise<number | null>;
        getQueryTime(e: any, t: any): number | null;
        isQueryAvailable(e: any, t: any): any;
        disjoint: any;
        pollFence(e: any): Promise<any>;
        pollItems(): void;
        addItemToPoll(e: any, t: any): void;
        bindTextureToFrameBuffer(e: any): void;
        unbindTextureToFrameBuffer(): void;
        downloadMatrixDriver(e: any, t: any): any;
        setOutputMatrixTextureDriver(e: any, t: any, n: any): void;
        setOutputMatrixWriteRegionDriver(e: any, t: any, n: any, o: any): void;
        throwIfDisposed(): void;
        throwIfNoProgram(): void;
    };
};
declare var Ji: string;
declare var si: string;
declare var ly: {
    new (e: any, t?: {}): {
        modelUrl: any;
        loadOptions: {};
        version: string;
        resourceManager: {
            hashTableNameToHandle: {};
            hashTableMap: {};
            addHashTable(e: any, t: any): void;
            getHashTableHandleByName(e: any): any;
            getHashTableById(e: any): any;
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
        loadSync(e: any): boolean;
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
            getCompilationKey(e: any, t: any): string;
            compile(e: any, t: any): any[];
            execute(e: any, t: any): any;
            getFrozenTensorIds(e: any): Set<any>;
            checkTensorForDisposal(e: any, t: any, n: any, o: any, s: any, a: any, i: any): void;
            executeAsync(e: any, t: any): Promise<any>;
            _executeAsync(e: any, t: any, n?: boolean, o?: {}, s?: {}): Promise<any>;
            executeFunctionAsync(e: any, t: any, n: any): Promise<any>;
            executeWithControlFlow(e: any, t: any, n: any, o: any): Promise<any>;
            processStack(e: any, t: any, n: any, o: any, s: any, a: any, i: any, l: any, u: any): any[];
            processChildNodes(e: any, t: any, n: any, o: any, s: any, a: any): void;
            dispose(): void;
            checkInputShapeAndType(e: any): void;
            mapInputs(e: any): {};
            checkInputs(e: any): void;
            mapOutputs(e: any): any;
            checkOutputs(e: any): void;
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
            getCompilationKey(e: any, t: any): string;
            compile(e: any, t: any): any[];
            execute(e: any, t: any): any;
            getFrozenTensorIds(e: any): Set<any>;
            checkTensorForDisposal(e: any, t: any, n: any, o: any, s: any, a: any, i: any): void;
            executeAsync(e: any, t: any): Promise<any>;
            _executeAsync(e: any, t: any, n?: boolean, o?: {}, s?: {}): Promise<any>;
            executeFunctionAsync(e: any, t: any, n: any): Promise<any>;
            executeWithControlFlow(e: any, t: any, n: any, o: any): Promise<any>;
            processStack(e: any, t: any, n: any, o: any, s: any, a: any, i: any, l: any, u: any): any[];
            processChildNodes(e: any, t: any, n: any, o: any, s: any, a: any): void;
            dispose(): void;
            checkInputShapeAndType(e: any): void;
            mapInputs(e: any): {};
            checkInputs(e: any): void;
            mapOutputs(e: any): any;
            checkOutputs(e: any): void;
        } | undefined;
        save(e: any, t: any): Promise<any>;
        predict(e: any, t: any): any;
        normalizeInputs(e: any): any;
        normalizeOutputs(e: any): any[];
        execute(e: any, t: any): any;
        executeAsync(e: any, t: any): Promise<any>;
        convertTensorMapToTensorsMap(e: any): {};
        dispose(): void;
    };
};
declare var Qi: string;
declare var Xo: string;
declare var zk: {
    new (): {
        onTrainBegin(e: any): Promise<void>;
        epoch: any[] | undefined;
        history: {} | undefined;
        onEpochEnd(e: any, t: any): Promise<void>;
        syncData(): Promise<void>;
        validationData: any;
        setParams(e: any): void;
        params: any;
        onEpochBegin(e: any, t: any): Promise<void>;
        onBatchBegin(e: any, t: any): Promise<void>;
        onBatchEnd(e: any, t: any): Promise<void>;
        onTrainEnd(e: any): Promise<void>;
        setModel(e: any): void;
    };
};
declare var op: string;
declare var ro: string;
declare var sp: string;
declare var Tt: {
    new (e: any): {
        dtype: any;
        shape: any;
        ndim: any;
        maxNDim: any;
        minNDim: any;
        axes: any;
    };
};
declare var ea: string;
declare var ta: string;
declare var ra: string;
declare var Js: {
    new (): {
        refCount(e: any): void;
        incRef(e: any): void;
        timerAvailable(): boolean;
        time(e: any): void;
        read(e: any): void;
        readSync(e: any): void;
        numDataIds(): void;
        disposeData(e: any, t: any): void;
        write(e: any, t: any, n: any): void;
        move(e: any, t: any, n: any, o: any, s: any): void;
        memory(): void;
        floatPrecision(): void;
        epsilon(): number;
        dispose(): void;
    };
};
declare var yl: string;
declare var ap: string;
declare var Ex: {
    new (e: any, t?: string, n?: string, o?: boolean, s?: null): {
        dtype: string;
        shape: any;
        id: number;
        originalName: string;
        name: any;
        trainable_: boolean;
        constraint: any;
        val: any;
        read(): any;
        write(e: any): any;
        dispose(): void;
        assertNotDisposed(): void;
        trainable: boolean;
    };
};
declare var Yn: {
    new (e: any): {
        [x: string]: any;
        isTraining: boolean;
        summary(e: any, t: any, n?: {
            (...data: any[]): void;
            (...data: any[]): void;
            (message?: any, ...optionalParams: any[]): void;
        }): void;
        compile(e: any): void;
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
        evaluate(e: any, t: any, n?: {}): any;
        evaluateDataset(e: any, t: any): Promise<any>;
        checkNumSamples(e: any, t: any, n: any, o?: string): any;
        execute(e: any, t: any): any;
        retrieveSymbolicTensors(e: any): any[];
        predictLoop(e: any, t?: number, n?: boolean): any;
        predict(e: any, t?: {}): any;
        predictOnBatch(e: any): any;
        standardizeUserDataXY(e: any, t: any, n: boolean | undefined, o: any): any[];
        standardizeUserData(e: any, t: any, n: any, o: any, s: boolean | undefined, a: any): Promise<any[]>;
        testLoop(e: any, t: any, n: any, o: number | undefined, s: any): any;
        getDedupedMetricsNames(): string[];
        makeTrainFunction(): (e: any) => any[];
        makeTestFunction(): void;
        testFunction: ((e: any) => any) | undefined;
        fit(e: any, t: any, n?: {}): Promise<any>;
        fitDataset(e: any, t: any): Promise<any>;
        trainOnBatch(e: any, t: any): Promise<any>;
        getNamedWeights(e: any): {
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
        loadTrainingConfig(e: any): void;
        save(e: any, t: any): Promise<any>;
        setUserDefinedMetadata(e: any): void;
        userDefinedMetadata: any;
        getUserDefinedMetadata(): any;
    };
    [x: string]: any;
    className: string;
};
declare var Yo: string;
declare var na: string;
declare var oa: string;
declare var ip: string;
declare var Zo: string;
declare var sa: string;
declare var nN: string;
declare var ia: string;
declare var au: string;
declare var lu: string;
declare var _c: {
    new (e: any): {
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
            acquireTexture(e: any, t: any, n: any): any;
            releaseTexture(e: any, t: any, n: any, o: any): void;
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
            get(e: any): any;
            set(e: any, t: any): void;
            has(e: any): boolean;
            delete(e: any): boolean;
            numDataIds(): number;
        };
        nextDataId(): number;
        numDataIds(): number;
        write(e: any, t: any, n: any): {
            id: number;
        };
        refCount(e: any): any;
        incRef(e: any): void;
        decRef(e: any): void;
        move(e: any, t: any, n: any, o: any, s: any): void;
        disposeIntermediateTensorInfo(e: any): void;
        readSync(e: any): any;
        read(e: any): any;
        bufferSync(e: any): {
            dtype: any;
            shape: any;
            size: any;
            values: any;
            strides: any[];
            set(e: any, ...t: any[]): void;
            get(...e: any[]): any;
            locToIndex(e: any): any;
            indexToLoc(e: any): any[];
            readonly rank: any;
            toTensor(): any;
        };
        checkNumericalProblems(e: any): void;
        getValuesFromTexture(e: any): any;
        timerAvailable(): boolean;
        time(e: any): Promise<{
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
        endTimer(e: any): any;
        getQueryTime(e: any): Promise<any>;
        disposeData(e: any, t?: boolean): any;
        releaseGPUData(e: any): void;
        getTexture(e: any): any;
        getDataInfo(e: any): any;
        shouldExecuteOnCPU(e: any, t?: any): any;
        getGPGPUContext(): any;
        where(e: any): any;
        packedUnaryOp(e: any, t: any, n: any): any;
        abs(e: any): any;
        makeTensorInfo(e: any, t: any, n: any): {
            dataId: {
                id: number;
            };
            shape: any;
            dtype: any;
        };
        makeOutput(e: any, t: any, n: any): any;
        unpackTensor(e: any): any;
        packTensor(e: any): any;
        packedReshape(e: any, t: any): {
            dataId: any;
            shape: any;
            dtype: any;
        };
        decode(e: any): {
            dtype: any;
            shape: any;
            dataId: any;
        };
        runWebGLProgram(e: any, t: any, n: any, o: any, s?: boolean): any;
        compileAndRun(e: any, t: any, n: any, o: any, s?: boolean): any;
        getAndSaveBinary(e: any, t: any): any;
        getTextureManager(): {
            gpgpu: any;
            numUsedTextures: number;
            numFreeTextures: number;
            _numBytesAllocated: number;
            _numBytesFree: number;
            freeTextures: {};
            logEnabled: boolean;
            usedTextures: {};
            acquireTexture(e: any, t: any, n: any): any;
            releaseTexture(e: any, t: any, n: any, o: any): void;
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
        uploadToGPU(e: any): void;
        convertAndCacheOnCPU(e: any, t: any): any;
        acquireTexture(e: any, t: any, n: any, o: any): any;
        computeBytes(e: any, t: any): number;
    };
    nextDataId: number;
};
declare var Jo: string;
declare var es: string;
declare var bl: string;
declare var up: string;
declare var lp: string;
declare var cp: string;
declare var Qo: string;
declare var ts: string;
declare var rs: string;
declare var ns: string;
declare var os: string;
declare var aa: string;
declare var Yu: {
    new (e: any, t: any, n?: boolean): {
        learningRate: any;
        momentum: any;
        useNesterov: boolean;
        accumulations: any[];
        m: any;
        applyGradients(e: any): void;
        dispose(): void;
        setMomentum(e: any): void;
        getWeights(): Promise<{
            name: string;
            tensor: any;
        }[]>;
        setWeights(e: any): Promise<void>;
        getConfig(): {
            learningRate: any;
            momentum: any;
            useNesterov: boolean;
        };
        setLearningRate(e: any): void;
        c: any;
        minimize(e: any, t: boolean | undefined, n: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(e: any, t: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(e: any): Promise<any>;
        getClassName(): any;
    };
    fromConfig(e: any, t: any): any;
    className: string;
};
declare var pp: string;
declare var ss: string;
declare var ii: string;
declare var ua: string;
declare var ca: string;
declare var pa: string;
declare var la: string;
declare var $N: string;
declare var is: string;
declare var ai: string;
declare var qr: {
    new (): {
        minimize(e: any, t: boolean | undefined, n: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(e: any, t: any): {
            value: any;
            grads: {};
        };
        dispose(): void;
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        getWeights(): Promise<void>;
        setWeights(e: any): Promise<void>;
        extractIterations(e: any): Promise<any>;
        getClassName(): any;
    };
    fromConfig(e: any, t: any): any;
};
declare var li: string;
declare var as: string;
declare var hse: string;
declare var ls: string;
declare var us: string;
declare var ma: string;
declare var Zu: {
    new (e: any, t?: number, n?: number, o?: null, s?: boolean): {
        learningRate: any;
        decay: number;
        momentum: number;
        epsilon: any;
        accumulatedMeanSquares: any[];
        accumulatedMoments: any[];
        accumulatedMeanGrads: any[];
        centered: boolean;
        applyGradients(e: any): void;
        dispose(): void;
        getWeights(): Promise<{
            name: string;
            tensor: any;
        }[]>;
        setWeights(e: any): Promise<void>;
        getConfig(): {
            learningRate: any;
            decay: number;
            momentum: number;
            epsilon: any;
            centered: boolean;
        };
        minimize(e: any, t: boolean | undefined, n: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(e: any, t: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(e: any): Promise<any>;
        getClassName(): any;
    };
    fromConfig(e: any, t: any): any;
    className: string;
};
declare var Ln: any;
declare var wl: string;
declare var s_: any;
declare var mp: string;
declare var Wo: string;
declare var fa: string;
declare var Yt: any;
declare var cs: string;
declare var ms: string;
declare var ui: string;
declare var ps: string;
declare var dp: string;
declare var _l: string;
declare var fp: string;
declare var fs: string;
declare var ka: string;
declare var ds: string;
declare var hs: string;
declare var Ga: {
    new (e: any): {
        learningRate: any;
        applyGradients(e: any): void;
        setLearningRate(e: any): void;
        c: any;
        dispose(): void;
        getWeights(): Promise<{
            name: string;
            tensor: any;
        }[]>;
        setWeights(e: any): Promise<void>;
        getConfig(): {
            learningRate: any;
        };
        minimize(e: any, t: boolean | undefined, n: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(e: any, t: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(e: any): Promise<any>;
        getClassName(): any;
    };
    fromConfig(e: any, t: any): any;
    className: string;
};
declare var da: string;
declare var ci: string;
declare var ha: string;
declare var qa: any;
declare var xs: string;
declare var xa: string;
declare var gs: string;
declare var ga: string;
declare var pi: string;
declare var ws: string;
declare var ya: string;
declare var mi: string;
declare var hp: string;
declare var gp: string;
declare var xp: string;
declare var yp: string;
declare var bp: string;
declare var fi: string;
declare var ys: string;
declare var kl: string;
declare var _s: string;
declare var no: string;
declare var ba: string;
declare var wp: string;
declare var _p: string;
declare var kp: string;
declare var ks: string;
declare var bs: string;
declare var cn: {
    new (e: any, t: any, n: any, o: any, s: any, a: any, i: any): {
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
declare var vs: string;
declare var Cs: string;
declare var Le: {
    new (e: any, t: any, n: any, o: any): {
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
        print(e?: boolean): any;
        clone(): any;
        toString(e?: boolean): string;
        cast(e: any): any;
        variable(e: boolean | undefined, t: any, n: any): any;
    };
};
declare var mt: {
    new (e: any, t: any, n: any): {
        dtype: any;
        shape: any;
        size: any;
        values: any;
        strides: any[];
        set(e: any, ...t: any[]): void;
        get(...e: any[]): any;
        locToIndex(e: any): any;
        indexToLoc(e: any): any[];
        readonly rank: any;
        toTensor(): any;
    };
};
declare var Hn: string;
declare var wa: string;
declare var _a: string;
declare var Is: string;
declare var vp: string;
declare var di: string;
declare var vl: string;
declare var Sl: {
    new (e: any, t: any, n: any, o: any): {
        trainable: any;
        name: any;
        assign(e: any): void;
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
        print(e?: boolean): any;
        clone(): any;
        toString(e?: boolean): string;
        cast(e: any): any;
        variable(e: boolean | undefined, t: any, n: any): any;
    };
};
declare var hi: string;
declare var gi: string;
declare function Ct(...s: any[]): any;
declare namespace Ct {
    const name: string;
}
declare function df(...s: any[]): any;
declare namespace df { }
declare function hf(...s: any[]): any;
declare namespace hf { }
declare function Z(...s: any[]): any;
declare namespace Z { }
declare function F_(...s: any[]): any;
declare namespace F_ { }
declare function wu(...s: any[]): any;
declare namespace wu { }
declare function El(...s: any[]): any;
declare namespace El { }
declare function As(...s: any[]): any;
declare namespace As { }
declare function gf(...s: any[]): any;
declare namespace gf { }
declare function xf(...s: any[]): any;
declare namespace xf { }
declare function yf(...s: any[]): any;
declare namespace yf { }
declare function bf(...s: any[]): any;
declare namespace bf { }
declare function wf(...s: any[]): any;
declare namespace wf { }
declare function _f(...s: any[]): any;
declare namespace _f { }
declare function Ta(...s: any[]): any;
declare namespace Ta { }
declare function kf(...s: any[]): any;
declare namespace kf { }
declare function A1(): any;
declare var I: {};
declare function IU(...s: any[]): any;
declare namespace IU { }
declare function lo(...s: any[]): any;
declare namespace lo { }
declare function L_(...s: any[]): any;
declare namespace L_ { }
declare function z_(...s: any[]): any;
declare namespace z_ { }
declare function B_(...s: any[]): any;
declare namespace B_ { }
declare function Ea(...s: any[]): any;
declare namespace Ea { }
declare function vf(...s: any[]): any;
declare namespace vf { }
declare function JSe(r: any, e: any, t: any): Promise<any>;
declare function V_(...s: any[]): any;
declare namespace V_ { }
declare function Aa(...s: any[]): any;
declare namespace Aa { }
declare var Gg: {};
declare function Ie(r: any, e: string | undefined, t: any): {
    dtype: any;
    shape: any;
    size: any;
    values: any;
    strides: any[];
    set(e: any, ...t: any[]): void;
    get(...e: any[]): any;
    locToIndex(e: any): any;
    indexToLoc(e: any): any[];
    readonly rank: any;
    toTensor(): any;
};
declare namespace PX {
    export { OX as earlyStopping };
}
declare function Y(...s: any[]): any;
declare namespace Y { }
declare function Cf(...s: any[]): any;
declare namespace Cf { }
declare function gr(...s: any[]): any;
declare namespace gr { }
declare function wn(...s: any[]): any;
declare namespace wn { }
declare function Pn(...s: any[]): any;
declare namespace Pn { }
declare function tt(...s: any[]): any;
declare namespace tt { }
declare function G_(...s: any[]): any;
declare namespace G_ { }
declare function W_(...s: any[]): any;
declare namespace W_ { }
declare function U_(...s: any[]): any;
declare namespace U_ { }
declare function j_(...s: any[]): any;
declare namespace j_ { }
declare var W2: {};
declare function vu(...s: any[]): any;
declare namespace vu { }
declare function nn(...s: any[]): any;
declare namespace nn { }
declare function Cu(...s: any[]): any;
declare namespace Cu { }
declare function If(...s: any[]): any;
declare namespace If { }
declare function H_(...s: any[]): any;
declare namespace H_ { }
declare function kse(r: any, e: any): void;
declare function Da(...s: any[]): any;
declare namespace Da { }
declare function Iu(...s: any[]): any;
declare namespace Iu { }
declare function sx(r: any, e: any, t: any): any;
declare function Su(...s: any[]): any;
declare namespace Su { }
declare function on(r: any): any;
declare var v$: {};
declare function q_(...s: any[]): any;
declare namespace q_ { }
declare function R_(r: any): void;
declare function Sf(...s: any[]): any;
declare namespace Sf { }
declare function $s(...s: any[]): any;
declare namespace $s { }
declare function LX(r: any): void;
declare var xu: {};
declare function ej(...s: any[]): any;
declare namespace ej { }
declare function Nf(...s: any[]): any;
declare namespace Nf { }
declare function sue(): void;
declare function De(r: any): void;
declare function iue(): void;
declare function ce(...s: any[]): any;
declare namespace ce { }
declare function Tf(...s: any[]): any;
declare namespace Tf { }
declare function K_(...s: any[]): any;
declare namespace K_ { }
declare function eT(...s: any[]): any;
declare namespace eT { }
declare function X_(...s: any[]): any;
declare namespace X_ { }
declare function Rs(...s: any[]): any;
declare namespace Rs { }
declare function oue(): void;
declare function nue(): void;
declare function tT(r: any): number;
declare function Es(): any;
declare function U(): any;
declare function kr(...s: any[]): any;
declare namespace kr { }
declare function Ef(...s: any[]): any;
declare namespace Ef { }
declare function Kt(...s: any[]): any;
declare namespace Kt { }
declare function mr(...s: any[]): any;
declare namespace mr { }
declare function Af(...s: any[]): any;
declare namespace Af { }
declare function Lp(...s: any[]): any;
declare namespace Lp { }
declare function Ba(...s: any[]): any;
declare namespace Ba { }
declare function Fs(r: any, e: any, t: any): any;
declare function mue(r: any): any;
declare function fue(r: any): any;
declare function Os(...s: any[]): any;
declare namespace Os { }
declare function bu(...s: any[]): any;
declare namespace bu { }
declare function XP(): void;
declare var fo: {};
declare function uo(...s: any[]): any;
declare namespace uo { }
declare function J1(...s: any[]): any;
declare namespace J1 { }
declare var Wg: {};
declare function cue(): any;
declare function Jw(r: any): any;
declare function sf(r: any, e: any): any;
declare function Ag(r: any): any[];
declare function Koe(): number;
declare var XO: {};
declare function Aj(r: any): (e: any, t: any) => any;
declare function Dj(r: any): (e: any, t: any) => any;
declare function zt(...s: any[]): any;
declare namespace zt { }
declare function kn(...s: any[]): any;
declare namespace kn { }
declare function _i(...s: any[]): any;
declare namespace _i { }
declare function Nu(...s: any[]): any;
declare namespace Nu { }
declare namespace Cn {
    export { lT as flipLeftRight };
    export { uT as grayscaleToRGB };
    export { dx as resizeNearestNeighbor };
    export { fx as resizeBilinear };
    export { cT as rotateWithOffset };
    export { aT as cropAndResize };
    export { pT as nonMaxSuppression };
    export { dT as nonMaxSuppressionAsync };
    export { hT as nonMaxSuppressionWithScore };
    export { gT as nonMaxSuppressionWithScoreAsync };
    export { xT as nonMaxSuppressionPadded };
    export { yT as nonMaxSuppressionPaddedAsync };
    export { bT as threshold };
    export { wT as transform };
}
declare function l1e(r: any, e: any, t?: number): Promise<any>;
declare var uA: {};
declare function Xk(r: any): any;
declare var Lr: {};
declare function zu(...s: any[]): any;
declare namespace zu { }
declare function Y_(...s: any[]): any;
declare namespace Y_ { }
declare function Z_(...s: any[]): any;
declare namespace Z_ { }
declare function Df(...s: any[]): any;
declare namespace Df { }
declare function Ft(r: any): any;
declare var Gr: {};
declare var UA: {};
declare function $a(...s: any[]): any;
declare namespace $a { }
declare function Tu(...s: any[]): any;
declare namespace Tu { }
declare function vn(...s: any[]): any;
declare namespace vn { }
declare namespace BT {
    export { _T as bandPart };
    export { kT as gramSchmidt };
    export { CT as qr };
}
declare function J_(r: any, e: any, t: any): any;
declare function m7(r: any, e?: {}): Promise<{
    modelUrl: any;
    loadOptions: {};
    version: string;
    resourceManager: {
        hashTableNameToHandle: {};
        hashTableMap: {};
        addHashTable(e: any, t: any): void;
        getHashTableHandleByName(e: any): any;
        getHashTableById(e: any): any;
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
    loadSync(e: any): boolean;
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
        getCompilationKey(e: any, t: any): string;
        compile(e: any, t: any): any[];
        execute(e: any, t: any): any;
        getFrozenTensorIds(e: any): Set<any>;
        checkTensorForDisposal(e: any, t: any, n: any, o: any, s: any, a: any, i: any): void;
        executeAsync(e: any, t: any): Promise<any>;
        _executeAsync(e: any, t: any, n?: boolean, o?: {}, s?: {}): Promise<any>;
        executeFunctionAsync(e: any, t: any, n: any): Promise<any>;
        executeWithControlFlow(e: any, t: any, n: any, o: any): Promise<any>;
        processStack(e: any, t: any, n: any, o: any, s: any, a: any, i: any, l: any, u: any): any[];
        processChildNodes(e: any, t: any, n: any, o: any, s: any, a: any): void;
        dispose(): void;
        checkInputShapeAndType(e: any): void;
        mapInputs(e: any): {};
        checkInputs(e: any): void;
        mapOutputs(e: any): any;
        checkOutputs(e: any): void;
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
        getCompilationKey(e: any, t: any): string;
        compile(e: any, t: any): any[];
        execute(e: any, t: any): any;
        getFrozenTensorIds(e: any): Set<any>;
        checkTensorForDisposal(e: any, t: any, n: any, o: any, s: any, a: any, i: any): void;
        executeAsync(e: any, t: any): Promise<any>;
        _executeAsync(e: any, t: any, n?: boolean, o?: {}, s?: {}): Promise<any>;
        executeFunctionAsync(e: any, t: any, n: any): Promise<any>;
        executeWithControlFlow(e: any, t: any, n: any, o: any): Promise<any>;
        processStack(e: any, t: any, n: any, o: any, s: any, a: any, i: any, l: any, u: any): any[];
        processChildNodes(e: any, t: any, n: any, o: any, s: any, a: any): void;
        dispose(): void;
        checkInputShapeAndType(e: any): void;
        mapInputs(e: any): {};
        checkInputs(e: any): void;
        mapOutputs(e: any): any;
        checkOutputs(e: any): void;
    } | undefined;
    save(e: any, t: any): Promise<any>;
    predict(e: any, t: any): any;
    normalizeInputs(e: any): any;
    normalizeOutputs(e: any): any[];
    execute(e: any, t: any): any;
    executeAsync(e: any, t: any): Promise<any>;
    convertTensorMapToTensorsMap(e: any): {};
    dispose(): void;
}>;
declare function K5(r: any, e: any): Promise<any>;
declare function $f(...s: any[]): any;
declare namespace $f { }
declare function xr(...s: any[]): any;
declare namespace xr { }
declare function Ra(...s: any[]): any;
declare namespace Ra { }
declare function Q_(...s: any[]): any;
declare namespace Q_ { }
declare function Eu(...s: any[]): any;
declare namespace Eu { }
declare function Ff(...s: any[]): any;
declare namespace Ff { }
declare function Cr(...s: any[]): any;
declare namespace Cr { }
declare function Fa(...s: any[]): any;
declare namespace Fa { }
declare function Au(...s: any[]): any;
declare namespace Au { }
declare function nk(...s: any[]): any;
declare namespace nk { }
declare namespace oFe {
    export { IT as absoluteDifference };
    export { Vr as computeWeightedLoss };
    export { ST as cosineDistance };
    export { NT as hingeLoss };
    export { TT as huberLoss };
    export { ET as logLoss };
    export { AT as meanSquaredError };
    export { DT as sigmoidCrossEntropy };
    export { $T as softmaxCrossEntropy };
}
declare function ze(...s: any[]): any;
declare namespace ze { }
declare var p1: {};
declare function Rr(...s: any[]): any;
declare namespace Rr { }
declare function Oa(...s: any[]): any;
declare namespace Oa { }
declare function Of(...s: any[]): any;
declare namespace Of { }
declare function ok(...s: any[]): any;
declare namespace ok { }
declare function sn(...s: any[]): any;
declare namespace sn { }
declare function xt(...s: any[]): any;
declare namespace xt { }
declare function ff(): any;
declare function Qj(r: any, e: any, { indexing: t }?: {
    indexing?: string | undefined;
}): any[];
declare var jA: {};
declare function Al(...s: any[]): any;
declare namespace Al { }
declare function Ps(...s: any[]): any;
declare namespace Ps { }
declare function Pf(...s: any[]): any;
declare namespace Pf { }
declare function Mf(...s: any[]): any;
declare namespace Mf { }
declare function H5(r: any): {
    [x: string]: any;
    isTraining: boolean;
    summary(e: any, t: any, n?: {
        (...data: any[]): void;
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    }): void;
    compile(e: any): void;
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
    evaluate(e: any, t: any, n?: {}): any;
    evaluateDataset(e: any, t: any): Promise<any>;
    checkNumSamples(e: any, t: any, n: any, o?: string): any;
    execute(e: any, t: any): any;
    retrieveSymbolicTensors(e: any): any[];
    predictLoop(e: any, t?: number, n?: boolean): any;
    predict(e: any, t?: {}): any;
    predictOnBatch(e: any): any;
    standardizeUserDataXY(e: any, t: any, n: boolean | undefined, o: any): any[];
    standardizeUserData(e: any, t: any, n: any, o: any, s: boolean | undefined, a: any): Promise<any[]>;
    testLoop(e: any, t: any, n: any, o: number | undefined, s: any): any;
    getDedupedMetricsNames(): string[];
    makeTrainFunction(): (e: any) => any[];
    makeTestFunction(): void;
    testFunction: ((e: any) => any) | undefined;
    fit(e: any, t: any, n?: {}): Promise<any>;
    fitDataset(e: any, t: any): Promise<any>;
    trainOnBatch(e: any, t: any): Promise<any>;
    getNamedWeights(e: any): {
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
    loadTrainingConfig(e: any): void;
    save(e: any, t: any): Promise<any>;
    setUserDefinedMetadata(e: any): void;
    userDefinedMetadata: any;
    getUserDefinedMetadata(): any;
};
declare var HA: {};
declare function zp(...s: any[]): any;
declare namespace zp { }
declare function CNe(...s: any[]): any;
declare namespace CNe { }
declare function O(...s: any[]): any;
declare namespace O { }
declare function aH(...s: any[]): any;
declare namespace aH { }
declare function sk(...s: any[]): any;
declare namespace sk { }
declare function He(...s: any[]): any;
declare namespace He { }
declare function wk(): Promise<any>;
declare function Wp(...s: any[]): any;
declare namespace Wp { }
declare function mo(...s: any[]): any;
declare namespace mo { }
declare function Ts(...s: any[]): any;
declare namespace Ts { }
declare function or(r: any, e?: string): any;
declare function fr(...s: any[]): any;
declare namespace fr { }
declare function N(r: any): {
    (...s: any[]): any;
    readonly name: string;
};
declare function mH(...s: any[]): any;
declare namespace mH { }
declare function jr(...s: any[]): any;
declare namespace jr { }
declare function hH(...s: any[]): any;
declare namespace hH { }
declare function xH(...s: any[]): any;
declare namespace xH { }
declare function bH(...s: any[]): any;
declare namespace bH { }
declare function _H(...s: any[]): any;
declare namespace _H { }
declare function ik(...s: any[]): any;
declare namespace ik { }
declare function Hr(...s: any[]): any;
declare namespace Hr { }
declare function Ma(...s: any[]): any;
declare namespace Ma { }
declare function C_(r: any, e?: boolean): void;
declare function Du(...s: any[]): any;
declare namespace Du { }
declare function aue(r: any): any;
declare function AH(...s: any[]): any;
declare namespace AH { }
declare function LH(...s: any[]): any;
declare namespace LH { }
declare function tx(...s: any[]): any;
declare namespace tx { }
declare function Ms(...s: any[]): any;
declare namespace Ms { }
declare function La(r: any, e: any, t?: number, n?: string): any;
declare function uue(): any;
declare function Dl(...s: any[]): any;
declare namespace Dl { }
declare function Lf(...s: any[]): any;
declare namespace Lf { }
declare function Op(r: any, e: any, t?: number): any;
declare function X5(r: any, e: any): void;
declare function oN(r: any): void;
declare function uu(r: any): void;
declare function MX(r: any, e: any): void;
declare var qA: {};
declare function Ir(...s: any[]): any;
declare namespace Ir { }
declare function Ru(...s: any[]): any;
declare namespace Ru { }
declare function pue(r: any): void;
declare function F(...s: any[]): any;
declare namespace F { }
declare function er(...s: any[]): any;
declare namespace er { }
declare function qH(...s: any[]): any;
declare namespace qH { }
declare function XH(...s: any[]): any;
declare namespace XH { }
declare function ZH(...s: any[]): any;
declare namespace ZH { }
declare function QH(...s: any[]): any;
declare namespace QH { }
declare function Va(...s: any[]): any;
declare namespace Va { }
declare function Fu(...s: any[]): any;
declare namespace Fu { }
declare function Ou(...s: any[]): any;
declare namespace Ou { }
declare function pe(r: any, e: any): any;
declare function Y1(...s: any[]): any;
declare namespace Y1 { }
declare var jg: {};
declare function Pu(...s: any[]): any;
declare namespace Pu { }
declare function zf(...s: any[]): any;
declare namespace zf { }
declare function q5(r: any): any;
declare var ee: {};
declare function q4(r: any): any;
declare function due(r: any, e: any): void;
declare function qoe(r: any): void;
declare function joe(r: any, e?: boolean): void;
declare function Hoe(r: any, e?: boolean): void;
declare function tC(r: any, e: any): void;
declare function xk(r: any, e: any): Promise<any[]>;
declare function zr(...s: any[]): any;
declare namespace zr { }
declare function Bf(...s: any[]): any;
declare namespace Bf { }
declare namespace DRe {
    export { sT as hammingWindow };
    export { lx as hannWindow };
    export { ux as frame };
    export { iT as stft };
}
declare function Mu(...s: any[]): any;
declare namespace Mu { }
declare function Lu(...s: any[]): any;
declare namespace Lu { }
declare function Oe(...s: any[]): any;
declare namespace Oe { }
declare function Vf(...s: any[]): any;
declare namespace Vf { }
declare function rx(...s: any[]): any;
declare namespace rx { }
declare function Gf(...s: any[]): any;
declare namespace Gf { }
declare function Vp(...s: any[]): any;
declare namespace Vp { }
declare var pr: {};
declare function za(...s: any[]): any;
declare namespace za { }
declare function co(...s: any[]): any;
declare namespace co { }
declare function Pa(...s: any[]): any;
declare namespace Pa { }
declare namespace Kf {
    export { RT as sparseFillEmptyRows };
    export { FT as sparseReshape };
    export { OT as sparseSegmentMean };
    export { PT as sparseSegmentSum };
}
declare function ox(...s: any[]): any;
declare namespace ox { }
declare namespace SRe {
    export { Ba as fft };
    export { _i as ifft };
    export { Va as rfft };
    export { zu as irfft };
}
declare function sr(...s: any[]): any;
declare namespace sr { }
declare function bt(...s: any[]): any;
declare namespace bt { }
declare function Ve(...s: any[]): any;
declare namespace Ve { }
declare function Bu(...s: any[]): any;
declare namespace Bu { }
declare function Br(...s: any[]): any;
declare namespace Br { }
declare function Xt(...s: any[]): any;
declare namespace Xt { }
declare function Ls(...s: any[]): any;
declare namespace Ls { }
declare function Wf(...s: any[]): any;
declare namespace Wf { }
declare namespace hx {
    export { MT as stringNGrams };
    export { LT as stringSplit };
    export { zT as stringToHashBucketFast };
}
declare function le(...s: any[]): any;
declare namespace le { }
declare function me(...s: any[]): any;
declare namespace me { }
declare function hu(r: any): any;
declare function Uf(...s: any[]): any;
declare namespace Uf { }
declare function Ds(...s: any[]): any;
declare namespace Ds { }
declare function Dr(r: any, e: any, t: any): any;
declare function $t(r: any, e: any): any;
declare function ki(r: any, e: any, t: any): any;
declare function T_(r: any, e: any, t: any): any;
declare function Iq(r: any, e: any, t: any): any;
declare function Sq(r: any, e: any, t: any): any;
declare function Nq(r: any, e: any, t: any): any;
declare var ao: {};
declare var T1: {};
declare function V(r: any, e: any): any;
declare function vr(...s: any[]): any;
declare namespace vr { }
declare function lue(r: any): any;
declare function jf(...s: any[]): any;
declare namespace jf { }
declare namespace Ju {
    import sgd = Wa.sgd;
    export { sgd };
    import momentum = Wa.momentum;
    export { momentum };
    import adadelta = Wa.adadelta;
    export { adadelta };
    import adagrad = Wa.adagrad;
    export { adagrad };
    import rmsprop = Wa.rmsprop;
    export { rmsprop };
    import adamax = Wa.adamax;
    export { adamax };
    import adam = Wa.adam;
    export { adam };
}
declare function Be(...s: any[]): any;
declare namespace Be { }
declare function Vu(...s: any[]): any;
declare namespace Vu { }
declare function Gp(...s: any[]): any;
declare namespace Gp { }
declare function _se(r: any): void;
declare function wse(r: any, e: any): void;
declare function Hf(...s: any[]): any;
declare namespace Hf { }
declare function yr(...s: any[]): any;
declare namespace yr { }
declare function hr(r: any, e: any): any;
declare var b: {};
declare function $j(r: any): (e: any, t: any) => {
    grad: any;
    value: any;
};
declare function Rj(r: any): (e: any, t: any) => any;
declare function yk(r: any, e: boolean | undefined, t: any, n: any): any;
declare function Zg(r: any, e: any): {
    value: any;
    grads: {};
};
declare var sse: {
    tfjs: string;
    "tfjs-core": string;
    "tfjs-data": string;
    "tfjs-layers": string;
    "tfjs-converter": string;
    "tfjs-backend-cpu": string;
    "tfjs-backend-webgl": string;
    "tfjs-backend-wasm": string;
};
declare var SD: string;
declare var E1: string;
declare var lm: string;
declare var Xoe: string;
declare var KP: string;
declare namespace LTt {
    export { XP as forceHalfFloat };
}
declare var zO: {};
declare function St(...s: any[]): any;
declare namespace St { }
declare function qf(r: any): Promise<any>;
declare function yt(r: any, e?: string): any;
declare function Se(...s: any[]): any;
declare namespace Se { }
declare function Hx(r: any, e: any): boolean;
declare function EW(r: any): {};
declare function OX(r: any): {
    monitor: any;
    minDelta: number;
    patience: any;
    verbose: any;
    mode: any;
    baseline: any;
    monitorFunc: typeof Hx;
    onTrainBegin(e: any): Promise<void>;
    wait: number | undefined;
    stoppedEpoch: any;
    best: any;
    onEpochEnd(e: any, t: any): Promise<void>;
    onTrainEnd(e: any): Promise<void>;
    getMonitorValue(e: any): any;
    model: {
        [x: string]: any;
        isTraining: boolean;
        summary(e: any, t: any, n?: {
            (...data: any[]): void;
            (...data: any[]): void;
            (message?: any, ...optionalParams: any[]): void;
        }): void;
        compile(e: any): void;
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
        evaluate(e: any, t: any, n?: {}): any;
        evaluateDataset(e: any, t: any): Promise<any>;
        checkNumSamples(e: any, t: any, n: any, o?: string): any;
        execute(e: any, t: any): any;
        retrieveSymbolicTensors(e: any): any[];
        predictLoop(e: any, t?: number, n?: boolean): any;
        predict(e: any, t?: {}): any;
        predictOnBatch(e: any): any;
        standardizeUserDataXY(e: any, t: any, n: boolean | undefined, o: any): any[];
        standardizeUserData(e: any, t: any, n: any, o: any, s: boolean | undefined, a: any): Promise<any[]>;
        testLoop(e: any, t: any, n: any, o: number | undefined, s: any): any;
        getDedupedMetricsNames(): string[];
        makeTrainFunction(): (e: any) => any[];
        makeTestFunction(): void;
        testFunction: ((e: any) => any) | undefined;
        fit(e: any, t: any, n?: {}): Promise<any>;
        fitDataset(e: any, t: any): Promise<any>;
        trainOnBatch(e: any, t: any): Promise<any>;
        getNamedWeights(e: any): {
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
        loadTrainingConfig(e: any): void;
        save(e: any, t: any): Promise<any>;
        setUserDefinedMetadata(e: any): void;
        userDefinedMetadata: any;
        getUserDefinedMetadata(): any;
    } | null;
    setModel(e: any): void;
    validationData: any;
    setParams(e: any): void;
    params: any;
    onEpochBegin(e: any, t: any): Promise<void>;
    onBatchBegin(e: any, t: any): Promise<void>;
    onBatchEnd(e: any, t: any): Promise<void>;
};
declare function lT(...s: any[]): any;
declare namespace lT { }
declare function uT(...s: any[]): any;
declare namespace uT { }
declare function dx(...s: any[]): any;
declare namespace dx { }
declare function fx(...s: any[]): any;
declare namespace fx { }
declare function cT(...s: any[]): any;
declare namespace cT { }
declare function aT(...s: any[]): any;
declare namespace aT { }
declare function pT(...s: any[]): any;
declare namespace pT { }
declare function dT(r: any, e: any, t: any, n?: number, o?: number): Promise<any>;
declare function hT(...s: any[]): any;
declare namespace hT { }
declare function gT(r: any, e: any, t: any, n?: number, o?: number, s?: number): Promise<{
    selectedIndices: any;
    selectedScores: any;
}>;
declare function xT(...s: any[]): any;
declare namespace xT { }
declare function yT(r: any, e: any, t: any, n?: number, o?: number, s?: boolean): Promise<{
    selectedIndices: any;
    validOutputs: any;
}>;
declare function bT(...s: any[]): any;
declare namespace bT { }
declare function wT(...s: any[]): any;
declare namespace wT { }
declare function _T(...s: any[]): any;
declare namespace _T { }
declare function kT(...s: any[]): any;
declare namespace kT { }
declare function CT(...s: any[]): any;
declare namespace CT { }
declare function IT(...s: any[]): any;
declare namespace IT { }
declare function Vr(...s: any[]): any;
declare namespace Vr { }
declare function ST(...s: any[]): any;
declare namespace ST { }
declare function NT(...s: any[]): any;
declare namespace NT { }
declare function TT(...s: any[]): any;
declare namespace TT { }
declare function ET(...s: any[]): any;
declare namespace ET { }
declare function AT(...s: any[]): any;
declare namespace AT { }
declare function DT(...s: any[]): any;
declare namespace DT { }
declare function $T(...s: any[]): any;
declare namespace $T { }
declare function sT(...s: any[]): any;
declare namespace sT { }
declare function lx(...s: any[]): any;
declare namespace lx { }
declare function ux(...s: any[]): any;
declare namespace ux { }
declare function iT(...s: any[]): any;
declare namespace iT { }
declare function RT(...s: any[]): any;
declare namespace RT { }
declare function FT(...s: any[]): any;
declare namespace FT { }
declare function OT(...s: any[]): any;
declare namespace OT { }
declare function PT(...s: any[]): any;
declare namespace PT { }
declare function MT(...s: any[]): any;
declare namespace MT { }
declare function LT(...s: any[]): any;
declare namespace LT { }
declare function zT(...s: any[]): any;
declare namespace zT { }
declare var Wa: {
    new (): {};
    sgd(e: any): {
        learningRate: any;
        applyGradients(e: any): void;
        setLearningRate(e: any): void;
        c: any;
        dispose(): void;
        getWeights(): Promise<{
            name: string;
            tensor: any;
        }[]>;
        setWeights(e: any): Promise<void>;
        getConfig(): {
            learningRate: any;
        };
        minimize(e: any, t: boolean | undefined, n: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(e: any, t: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(e: any): Promise<any>;
        getClassName(): any;
    };
    momentum(e: any, t: any, n?: boolean): {
        learningRate: any;
        momentum: any;
        useNesterov: boolean;
        accumulations: any[];
        m: any;
        applyGradients(e: any): void;
        dispose(): void;
        setMomentum(e: any): void;
        getWeights(): Promise<{
            name: string;
            tensor: any;
        }[]>;
        setWeights(e: any): Promise<void>;
        getConfig(): {
            learningRate: any;
            momentum: any;
            useNesterov: boolean;
        };
        setLearningRate(e: any): void;
        c: any;
        minimize(e: any, t: boolean | undefined, n: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(e: any, t: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(e: any): Promise<any>;
        getClassName(): any;
    };
    rmsprop(e: any, t?: number, n?: number, o?: null, s?: boolean): {
        learningRate: any;
        decay: number;
        momentum: number;
        epsilon: any;
        accumulatedMeanSquares: any[];
        accumulatedMoments: any[];
        accumulatedMeanGrads: any[];
        centered: boolean;
        applyGradients(e: any): void;
        dispose(): void;
        getWeights(): Promise<{
            name: string;
            tensor: any;
        }[]>;
        setWeights(e: any): Promise<void>;
        getConfig(): {
            learningRate: any;
            decay: number;
            momentum: number;
            epsilon: any;
            centered: boolean;
        };
        minimize(e: any, t: boolean | undefined, n: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(e: any, t: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(e: any): Promise<any>;
        getClassName(): any;
    };
    adam(e?: number, t?: number, n?: number, o?: null): {
        learningRate: any;
        beta1: any;
        beta2: any;
        epsilon: any;
        accumulatedFirstMoment: any[];
        accumulatedSecondMoment: any[];
        accBeta1: any;
        accBeta2: any;
        applyGradients(e: any): void;
        dispose(): void;
        getWeights(): Promise<{
            name: string;
            tensor: any;
        }[]>;
        setWeights(e: any): Promise<void>;
        getConfig(): {
            learningRate: any;
            beta1: any;
            beta2: any;
            epsilon: any;
        };
        minimize(e: any, t: boolean | undefined, n: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(e: any, t: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(e: any): Promise<any>;
        getClassName(): any;
    };
    adadelta(e?: number, t?: number, n?: null): {
        learningRate: any;
        rho: any;
        epsilon: any;
        accumulatedGrads: any[];
        accumulatedUpdates: any[];
        applyGradients(e: any): void;
        dispose(): void;
        getWeights(): Promise<{
            name: string;
            tensor: any;
        }[]>;
        setWeights(e: any): Promise<void>;
        getConfig(): {
            learningRate: any;
            rho: any;
            epsilon: any;
        };
        minimize(e: any, t: boolean | undefined, n: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(e: any, t: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(e: any): Promise<any>;
        getClassName(): any;
    };
    adamax(e?: number, t?: number, n?: number, o?: null, s?: number): {
        learningRate: any;
        beta1: any;
        beta2: any;
        epsilon: any;
        decay: number;
        accumulatedFirstMoment: any[];
        accumulatedWeightedInfNorm: any[];
        iteration: any;
        accBeta1: any;
        applyGradients(e: any): void;
        dispose(): void;
        getWeights(): Promise<void>;
        setWeights(e: any): Promise<void>;
        getConfig(): {
            learningRate: any;
            beta1: any;
            beta2: any;
            epsilon: any;
            decay: number;
        };
        minimize(e: any, t: boolean | undefined, n: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(e: any, t: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(e: any): Promise<any>;
        getClassName(): any;
    };
    adagrad(e: any, t?: number): {
        learningRate: any;
        initialAccumulatorValue: number;
        accumulatedGrads: any[];
        applyGradients(e: any): void;
        dispose(): void;
        getWeights(): Promise<{
            name: string;
            tensor: any;
        }[]>;
        setWeights(e: any): Promise<void>;
        getConfig(): {
            learningRate: any;
            initialAccumulatorValue: number;
        };
        minimize(e: any, t: boolean | undefined, n: any): any;
        readonly iterations: any;
        iterations_: any;
        incrementIterations(): void;
        computeGradients(e: any, t: any): {
            value: any;
            grads: {};
        };
        saveIterations(): Promise<{
            name: string;
            tensor: any;
        }>;
        extractIterations(e: any): Promise<any>;
        getClassName(): any;
    };
};
export { ti as Abs, Mi as Acos, Li as Acosh, Hu as AdadeltaOptimizer, qu as AdagradOptimizer, Ku as AdamOptimizer, Xu as AdamaxOptimizer, jn as Add, $o as AddN, zi as All, Bi as Any, Ro as ArgMax, ml as ArgMin, Vi as Asin, Gi as Asinh, Wi as Atan, ji as Atan2, Ui as Atanh, Fo as AvgPool, fl as AvgPool3D, Uc as AvgPool3DGrad, Wc as AvgPoolGrad, xb as BackendWasm, Oo as BatchMatMul, ri as BatchToSpaceND, jc as Bincount, Hc as BroadcastArgs, rN as BroadcastTo, Sv as Callback, Lk as CallbackList, eo as Cast, Po as Ceil, to as ClipByValue, qc as Complex, dl as ComplexAbs, ni as Concat, Mo as Conv2D, Kc as Conv2DBackpropFilter, Lo as Conv2DBackpropInput, hl as Conv3D, Xc as Conv3DBackpropFilterV2, Yc as Conv3DBackpropInputV2, zo as Cos, Bo as Cosh, Hi as CropAndResize, Vo as Cumsum, Bk as CustomCallback, pl as DataStorage, Zc as DenseBincount, qi as DepthToSpace, Go as DepthwiseConv2dNative, Jc as DepthwiseConv2dNativeBackpropFilter, Qc as DepthwiseConv2dNativeBackpropInput, ep as Diag, gl as Dilation2D, rf as Dilation2DBackpropFilter, tf as Dilation2DBackpropInput, Xw as ENV, Nv as EarlyStopping, tp as Einsum, Uo as Elu, rp as EluGrad, Eg as Environment, Xi as Equal, Ki as Erf, jo as Exp, oi as ExpandDims, Yi as Expm1, np as FFT, xl as Fill, Zi as FlipLeftRight, Ho as Floor, qo as FloorDiv, nf as FromPixels, Ko as FusedBatchNorm, xi as FusedConv2D, yi as FusedDepthwiseConv2D, Xy as GPGPUContext, Ji as GatherNd, si as GatherV2, ly as GraphModel, Qi as Greater, Xo as GreaterEqual, zk as History, op as IFFT, ro as Identity, sp as Imag, Tt as InputSpec, ea as IsFinite, ta as IsInf, ra as IsNan, Js as KernelBackend, yl as LRN, ap as LRNGrad, Ex as LayerVariable, Yn as LayersModel, Yo as LeakyRelu, na as Less, oa as LessEqual, ip as LinSpace, Zo as Log, sa as Log1p, nN as LogSoftmax, ia as LogicalAnd, au as LogicalNot, lu as LogicalOr, _c as MathBackendWebGL, Jo as Max, es as MaxPool, bl as MaxPool3D, up as MaxPool3DGrad, lp as MaxPoolGrad, cp as MaxPoolWithArgmax, Qo as Maximum, ts as Mean, rs as Min, ns as Minimum, os as MirrorPad, aa as Mod, Yu as MomentumOptimizer, pp as Multinomial, ss as Multiply, ii as Neg, ua as NonMaxSuppressionV3, ca as NonMaxSuppressionV4, pa as NonMaxSuppressionV5, la as NotEqual, $N as OP_SCOPE_SUFFIX, is as OneHot, ai as OnesLike, qr as Optimizer, li as Pack, as as PadV2, hse as Pool, ls as Pow, us as Prelu, ma as Prod, Zu as RMSPropOptimizer, Ln as RNN, wl as Range, s_ as Rank, mp as Real, Wo as RealDiv, fa as Reciprocal, Yt as Reduction, cs as Relu, ms as Relu6, ui as Reshape, ps as ResizeBilinear, dp as ResizeBilinearGrad, _l as ResizeNearestNeighbor, fp as ResizeNearestNeighborGrad, fs as Reverse, ka as RotateWithOffset, ds as Round, hs as Rsqrt, Ga as SGDOptimizer, da as ScatterNd, ci as Select, ha as Selu, qa as Sequential, xs as Sigmoid, xa as Sign, gs as Sin, ga as Sinh, pi as Slice, ws as Softmax, ya as Softplus, mi as SpaceToBatchND, hp as SparseFillEmptyRows, gp as SparseReshape, xp as SparseSegmentMean, yp as SparseSegmentSum, bp as SparseToDense, fi as SplitV, ys as Sqrt, kl as Square, _s as SquaredDifference, no as Step, ba as StridedSlice, wp as StringNGrams, _p as StringSplit, kp as StringToHashBucketFast, ks as Sub, bs as Sum, cn as SymbolicTensor, vs as Tan, Cs as Tanh, Le as Tensor, mt as TensorBuffer, Hn as Tile, wa as TopK, _a as Transform, Is as Transpose, vp as Unique, di as Unpack, vl as UnsortedSegmentSum, Sl as Variable, hi as ZerosLike, gi as _FusedMatMul, Ct as abs, df as acos, hf as acosh, Z as add, F_ as addN, wu as all, El as any, As as argMax, gf as argMin, xf as asin, yf as asinh, bf as atan, wf as atan2, _f as atanh, Ta as avgPool, kf as avgPool3d, A1 as backend, I as backend_util, IU as basicLSTMCell, lo as batchNorm, L_ as batchNorm2d, z_ as batchNorm3d, B_ as batchNorm4d, Ea as batchToSpaceND, vf as bincount, JSe as booleanMaskAsync, V_ as broadcastArgs, Aa as broadcastTo, Gg as browser, Ie as buffer, PX as callbacks, Y as cast, Cf as ceil, gr as clipByValue, wn as clone, Pn as complex, tt as concat, G_ as concat1d, W_ as concat2d, U_ as concat3d, j_ as concat4d, W2 as constraints, vu as conv1d, nn as conv2d, Cu as conv2dTranspose, If as conv3d, H_ as conv3dTranspose, kse as copyRegisteredKernels, Da as cos, Iu as cosh, sx as cosineWindow, Su as cumsum, on as customGrad, v$ as data, q_ as denseBincount, R_ as deprecationWarn, Sf as depthToSpace, $s as depthwiseConv2d, LX as deregisterOp, xu as device_util, ej as diag, Nf as dilation2d, sue as disableDeprecationWarnings, De as dispose, iue as disposeVariables, ce as div, Tf as divNoNan, K_ as dot, eT as dropout, X_ as einsum, Rs as elu, oue as enableDebugMode, nue as enableProdMode, tT as enclosingPowerOfTwo, Es as engine, U as env, kr as equal, Ef as erf, Kt as exp, mr as expandDims, Af as expm1, Lp as eye, Ba as fft, Fs as fill, mue as findBackend, fue as findBackendFactory, Os as floor, bu as floorDiv, XP as forceHalfFloat, fo as fused, uo as gather, J1 as gatherND, Wg as gather_util, cue as getBackend, Jw as getGradient, sf as getKernel, Ag as getKernelsForBackend, Koe as getThreadsCount, XO as gpgpu_util, Aj as grad, Dj as grads, zt as greater, kn as greaterEqual, _i as ifft, Nu as imag, Cn as image, l1e as inTopKAsync, uA as initializers, Xk as input, Lr as io, zu as irfft, Y_ as isFinite, Z_ as isInf, Df as isNaN, Ft as keep, Gr as kernel_impls, UA as layers, $a as leakyRelu, Tu as less, vn as lessEqual, BT as linalg, J_ as linspace, m7 as loadGraphModel, K5 as loadLayersModel, $f as localResponseNormalization, xr as log, Ra as log1p, Q_ as logSigmoid, Eu as logSoftmax, Ff as logSumExp, Cr as logicalAnd, Fa as logicalNot, Au as logicalOr, nk as logicalXor, oFe as losses, ze as matMul, p1 as math, Rr as max, Oa as maxPool, Of as maxPool3d, ok as maxPoolWithArgmax, sn as maximum, xt as mean, ff as memory, Qj as meshgrid, jA as metrics, Al as min, Ps as minimum, Pf as mirrorPad, Mf as mod, H5 as model, HA as models, zp as moments, CNe as movingAverage, O as mul, aH as multiRNNCell, sk as multinomial, He as neg, wk as nextFrame, Wp as norm, mo as notEqual, Ts as oneHot, or as ones, fr as onesLike, N as op, mH as outerProduct, jr as pad, hH as pad1d, xH as pad2d, bH as pad3d, _H as pad4d, ik as pool, Hr as pow, Ma as prelu, C_ as print, Du as prod, aue as profile, AH as rand, LH as randomGamma, tx as randomNormal, Ms as randomUniform, La as range, uue as ready, Dl as real, Lf as reciprocal, Op as registerBackend, X5 as registerCallbackConstructor, oN as registerGradient, uu as registerKernel, MX as registerOp, qA as regularizers, Ir as relu, Ru as relu6, pue as removeBackend, F as reshape, er as reverse, qH as reverse1d, XH as reverse2d, ZH as reverse3d, QH as reverse4d, Va as rfft, Fu as round, Ou as rsqrt, pe as scalar, Y1 as scatterND, jg as scatter_util, Pu as selu, zf as separableConv2d, q5 as sequential, ee as serialization, q4 as setBackend, due as setPlatform, qoe as setThreadsCount, joe as setWasmPath, Hoe as setWasmPaths, tC as setWebGLContext, xk as setdiff1dAsync, zr as sigmoid, Bf as sign, DRe as signal, Mu as sin, Lu as sinh, Oe as slice, Vf as slice1d, rx as slice2d, Gf as slice3d, Vp as slice4d, pr as slice_util, za as softmax, co as softplus, Pa as spaceToBatchND, Kf as sparse, ox as sparseToDense, SRe as spectral, sr as split, bt as sqrt, Ve as square, Bu as squaredDifference, Br as squeeze, Xt as stack, Ls as step, Wf as stridedSlice, hx as string, le as sub, me as sum, hu as sumOutType, Uf as tan, Ds as tanh, Dr as tensor, $t as tensor1d, ki as tensor2d, T_ as tensor3d, Iq as tensor4d, Sq as tensor5d, Nq as tensor6d, ao as tensor_util, T1 as test_util, V as tidy, vr as tile, lue as time, jf as topk, Ju as train, Be as transpose, Vu as truncatedNormal, Gp as unique, _se as unregisterGradient, wse as unregisterKernel, Hf as unsortedSegmentSum, yr as unstack, hr as upcastType, b as util, $j as valueAndGrad, Rj as valueAndGrads, yk as variable, Zg as variableGrads, sse as version, SD as version_converter, E1 as version_core, lm as version_layers, Xoe as version_wasm, KP as version_webgl, LTt as webgl, zO as webgl_util, St as where, qf as whereAsync, yt as zeros, Se as zerosLike };
//# sourceMappingURL=tfjs.esm.d.ts.map