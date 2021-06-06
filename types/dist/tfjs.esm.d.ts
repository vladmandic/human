declare var Js: string;
declare var Ri: string;
declare var Fi: string;
declare var qu: {
    new (e: any, t: any, n?: any): {
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
declare var Hu: {
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
    new (e: any, t: any, n: any, o?: any): {
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
    new (e: any, t: any, n: any, o?: any, s?: number): {
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
declare var Oi: string;
declare var Pi: string;
declare var Ro: string;
declare var ll: string;
declare var Mi: string;
declare var Li: string;
declare var zi: string;
declare var Vi: string;
declare var Bi: string;
declare var Fo: string;
declare var ul: string;
declare var jc: string;
declare var Wc: string;
declare var fy: {
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
declare var cl: string;
declare var Uc: string;
declare var x1: string;
declare var DI: {
    new (...args: any[]): {
        model: {
            [x: string]: any;
            isTraining: boolean;
            summary(e: any, t: any, n?: {
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
declare var WC: {
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
declare var to: string;
declare var Po: string;
declare var ro: string;
declare var qc: string;
declare var pl: string;
declare var Qs: string;
declare var Mo: string;
declare var Hc: string;
declare var Lo: string;
declare var ml: string;
declare var Kc: string;
declare var Xc: string;
declare var zo: string;
declare var Gi: string;
declare var Wi: string;
declare var Bo: string;
declare var UC: {
    new (e: any, t: any): {
        currentEpoch: number;
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
declare var al: {
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
declare var Yc: string;
declare var ji: string;
declare var Vo: string;
declare var Zc: string;
declare var Jc: string;
declare var Qc: string;
declare var fl: string;
declare var nf: string;
declare var rf: string;
declare var Gw: any;
declare var $I: {
    new (e: any): {
        monitor: any;
        minDelta: number;
        patience: any;
        verbose: any;
        mode: any;
        baseline: any;
        monitorFunc: typeof jy;
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
declare var ep: string;
declare var Ui: string;
declare var tp: string;
declare var Ng: {
    new (e: any): {
        global: any;
        flags: {};
        flagRegistry: {};
        urlFlags: {};
        getQueryParams: typeof Ij;
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
declare var Hi: string;
declare var qi: string;
declare var Wo: string;
declare var ei: string;
declare var Ki: string;
declare var rp: string;
declare var dl: string;
declare var Xi: string;
declare var jo: string;
declare var Uo: string;
declare var of: string;
declare var qo: string;
declare var mi: string;
declare var fi: string;
declare var qx: {
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
declare var Yi: string;
declare var ti: string;
declare var lS: {
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
declare var Zi: string;
declare var Ho: string;
declare var jC: {
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
declare var np: string;
declare var no: string;
declare var op: string;
declare var St: {
    new (e: any): {
        dtype: any;
        shape: any;
        ndim: any;
        maxNDim: any;
        minNDim: any;
        axes: any;
    };
};
declare var Ji: string;
declare var Qi: string;
declare var ea: string;
declare var Xs: {
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
declare var hl: string;
declare var ip: string;
declare var Ny: {
    new (e: any, t?: string, n?: string, o?: boolean, s?: any): {
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
declare var Jn: {
    new (e: any): {
        [x: string]: any;
        isTraining: boolean;
        summary(e: any, t: any, n?: {
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
declare var Ko: string;
declare var ta: string;
declare var ra: string;
declare var sp: string;
declare var Xo: string;
declare var na: string;
declare var y1: string;
declare var oa: string;
declare var iu: string;
declare var au: string;
declare var Qu: {
    new (): {
        blockSize: number;
        firstUse: boolean;
        data: {
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
        write(e: any, t: any, n: any): {
            id: number;
        };
        makeTensorInfo(e: any, t: any, n: any): {
            dataId: {
                id: number;
            };
            shape: any;
            dtype: any;
        };
        refCount(e: any): any;
        incRef(e: any): void;
        decRef(e: any): void;
        move(e: any, t: any, n: any, o: any, s: any): void;
        numDataIds(): number;
        read(e: any): Promise<any>;
        readSync(e: any): any;
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
        makeOutput(e: any, t: any, n: any): any;
        disposeData(e: any, t?: boolean): boolean;
        disposeIntermediateTensorInfo(e: any): void;
        time(e: any): Promise<{
            kernelMs: number;
        }>;
        memory(): {
            unreliable: boolean;
            reasons: string[];
        };
        where(e: any): any;
        dispose(): void;
        floatPrecision(): number;
        epsilon(): number;
        timerAvailable(): boolean;
    };
    nextDataId: number;
};
declare var lc: {
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
declare var Yo: string;
declare var Jo: string;
declare var gl: string;
declare var lp: string;
declare var ap: string;
declare var up: string;
declare var Zo: string;
declare var Qo: string;
declare var es: string;
declare var ts: string;
declare var rs: string;
declare var sa: string;
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
declare var cp: string;
declare var ns: string;
declare var ri: string;
declare var aa: string;
declare var la: string;
declare var ua: string;
declare var ia: string;
declare var H1: string;
declare var os: string;
declare var ni: string;
declare var Ur: {
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
declare var oi: string;
declare var ss: string;
declare var Xse: string;
declare var is: string;
declare var as: string;
declare var ca: string;
declare var Zu: {
    new (e: any, t?: number, n?: number, o?: any, s?: boolean): {
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
declare var Bn: any;
declare var xl: string;
declare var Jw: any;
declare var pp: string;
declare var Go: string;
declare var pa: string;
declare var Kt: any;
declare var ls: string;
declare var cs: string;
declare var si: string;
declare var us: string;
declare var fp: string;
declare var yl: string;
declare var mp: string;
declare var ps: string;
declare var wa: string;
declare var ms: string;
declare var fs: string;
declare var za: {
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
declare var ma: string;
declare var ii: string;
declare var fa: string;
declare var Ja: any;
declare var hs: string;
declare var ha: string;
declare var ds: string;
declare var da: string;
declare var ai: string;
declare var ys: string;
declare var ga: string;
declare var bl: string;
declare var dp: string;
declare var hp: string;
declare var gp: string;
declare var xp: string;
declare var yp: string;
declare var li: string;
declare var gs: string;
declare var wl: string;
declare var bs: string;
declare var oo: string;
declare var xa: string;
declare var bp: string;
declare var wp: string;
declare var _p: string;
declare var ws: string;
declare var xs: string;
declare var mn: {
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
declare var _s: string;
declare var ks: string;
declare var Me: {
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
declare var ct: {
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
declare var Un: string;
declare var ya: string;
declare var ba: string;
declare var vs: string;
declare var kp: string;
declare var ui: string;
declare var _l: string;
declare var Cl: {
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
declare var ci: string;
declare var pi: string;
declare function Tt(...s: any[]): any;
declare namespace Tt {
    const name: string;
}
declare function hf(...s: any[]): any;
declare namespace hf { }
declare function gf(...s: any[]): any;
declare namespace gf { }
declare function J(...s: any[]): any;
declare namespace J { }
declare function S_(...s: any[]): any;
declare namespace S_ { }
declare function bu(...s: any[]): any;
declare namespace bu { }
declare function Nl(...s: any[]): any;
declare namespace Nl { }
declare function Tl(...s: any[]): any;
declare namespace Tl { }
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
declare function kf(...s: any[]): any;
declare namespace kf { }
declare function Sa(...s: any[]): any;
declare namespace Sa { }
declare function vf(...s: any[]): any;
declare namespace vf { }
declare function WT(): any;
declare var I: {};
declare function _U(...s: any[]): any;
declare namespace _U { }
declare function uo(...s: any[]): any;
declare namespace uo { }
declare function A_(...s: any[]): any;
declare namespace A_ { }
declare function D_(...s: any[]): any;
declare namespace D_ { }
declare function $_(...s: any[]): any;
declare namespace $_ { }
declare function Na(...s: any[]): any;
declare namespace Na { }
declare function Cf(...s: any[]): any;
declare namespace Cf { }
declare function vNe(r: any, e: any, t: any): Promise<any>;
declare function Ta(...s: any[]): any;
declare namespace Ta { }
declare var zg: {};
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
declare namespace ese {
    export { Qoe as earlyStopping };
}
declare function oe(...s: any[]): any;
declare namespace oe { }
declare function If(...s: any[]): any;
declare namespace If { }
declare function fr(...s: any[]): any;
declare namespace fr { }
declare function qn(...s: any[]): any;
declare namespace qn { }
declare function Fn(...s: any[]): any;
declare namespace Fn { }
declare function et(...s: any[]): any;
declare namespace et { }
declare function R_(...s: any[]): any;
declare namespace R_ { }
declare function F_(...s: any[]): any;
declare namespace F_ { }
declare function O_(...s: any[]): any;
declare namespace O_ { }
declare function P_(...s: any[]): any;
declare namespace P_ { }
declare var NB: {};
declare function ku(...s: any[]): any;
declare namespace ku { }
declare function on(...s: any[]): any;
declare namespace on { }
declare function vu(...s: any[]): any;
declare namespace vu { }
declare function Sf(...s: any[]): any;
declare namespace Sf { }
declare function M_(...s: any[]): any;
declare namespace M_ { }
declare function tie(r: any, e: any): void;
declare function Ea(...s: any[]): any;
declare namespace Ea { }
declare function Cu(...s: any[]): any;
declare namespace Cu { }
declare function rx(r: any, e: any, t: any): any;
declare function Iu(...s: any[]): any;
declare namespace Iu { }
declare function sn(r: any): any;
declare var vS: {};
declare function L_(...s: any[]): any;
declare namespace L_ { }
declare function I_(r: any): void;
declare function Nf(...s: any[]): any;
declare namespace Nf { }
declare function Es(...s: any[]): any;
declare namespace Es { }
declare function rse(r: any): void;
declare var gu: {};
declare function XU(...s: any[]): any;
declare namespace XU { }
declare function Tf(...s: any[]): any;
declare namespace Tf { }
declare function Oue(): void;
declare function De(r: any): void;
declare function Pue(): void;
declare function ue(...s: any[]): any;
declare namespace ue { }
declare function Ef(...s: any[]): any;
declare namespace Ef { }
declare function z_(...s: any[]): any;
declare namespace z_ { }
declare function fE(...s: any[]): any;
declare namespace fE { }
declare function B_(...s: any[]): any;
declare namespace B_ { }
declare function As(...s: any[]): any;
declare namespace As { }
declare function Fue(): void;
declare function Rue(): void;
declare function dE(r: any): number;
declare function Ns(): any;
declare function W(): any;
declare function On(...s: any[]): any;
declare namespace On { }
declare function Af(...s: any[]): any;
declare namespace Af { }
declare function nr(...s: any[]): any;
declare namespace nr { }
declare function dr(...s: any[]): any;
declare namespace dr { }
declare function Df(...s: any[]): any;
declare namespace Df { }
declare function Pp(...s: any[]): any;
declare namespace Pp { }
declare function Ma(...s: any[]): any;
declare namespace Ma { }
declare function Ds(r: any, e: any, t: any): any;
declare function Gue(r: any): any;
declare function Wue(r: any): any;
declare function $s(...s: any[]): any;
declare namespace $s { }
declare function yu(...s: any[]): any;
declare namespace yu { }
declare function yR(): void;
declare var ho: {};
declare function co(...s: any[]): any;
declare namespace co { }
declare function pE(...s: any[]): any;
declare namespace pE { }
declare var Bg: {};
declare function Bue(): any;
declare function Uw(r: any): any;
declare function af(r: any, e: any): any;
declare function Tg(r: any): any[];
declare var f$: {};
declare function Iq(r: any): (e: any, t: any) => any;
declare function Sq(r: any): (e: any, t: any) => any;
declare function qt(...s: any[]): any;
declare namespace qt { }
declare function _n(...s: any[]): any;
declare namespace _n { }
declare function gi(...s: any[]): any;
declare namespace gi { }
declare function Su(...s: any[]): any;
declare namespace Su { }
declare namespace yi {
    export { _E as flipLeftRight };
    export { px as resizeNearestNeighbor };
    export { cx as resizeBilinear };
    export { kE as rotateWithOffset };
    export { wE as cropAndResize };
    export { vE as nonMaxSuppression };
    export { SE as nonMaxSuppressionAsync };
    export { NE as nonMaxSuppressionWithScore };
    export { TE as nonMaxSuppressionWithScoreAsync };
    export { EE as nonMaxSuppressionPadded };
    export { AE as nonMaxSuppressionPaddedAsync };
    export { DE as threshold };
    export { $E as transform };
}
declare function R1e(r: any, e: any, t?: number): Promise<any>;
declare var HB: {};
declare function eI(r: any): any;
declare var Or: {};
declare function zu(...s: any[]): any;
declare namespace zu { }
declare function V_(...s: any[]): any;
declare namespace V_ { }
declare function G_(...s: any[]): any;
declare namespace G_ { }
declare function $f(...s: any[]): any;
declare namespace $f { }
declare function Rt(r: any): any;
declare var zr: {};
declare var TV: {};
declare function Aa(...s: any[]): any;
declare namespace Aa { }
declare function Nu(...s: any[]): any;
declare namespace Nu { }
declare function kn(...s: any[]): any;
declare namespace kn { }
declare namespace JE {
    export { RE as bandPart };
    export { FE as gramSchmidt };
    export { PE as qr };
}
declare function W_(r: any, e: any, t: any): any;
declare function Ase(r: any, e?: {}): Promise<{
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
declare function mne(r: any, e: any): Promise<any>;
declare function Rf(...s: any[]): any;
declare namespace Rf { }
declare function hr(...s: any[]): any;
declare namespace hr { }
declare function Tu(...s: any[]): any;
declare namespace Tu { }
declare function j_(...s: any[]): any;
declare namespace j_ { }
declare function Eu(...s: any[]): any;
declare namespace Eu { }
declare function Of(...s: any[]): any;
declare namespace Of { }
declare function _r(...s: any[]): any;
declare namespace _r { }
declare function Da(...s: any[]): any;
declare namespace Da { }
declare function Au(...s: any[]): any;
declare namespace Au { }
declare function K_(...s: any[]): any;
declare namespace K_ { }
declare namespace vFe {
    export { ME as absoluteDifference };
    export { Lr as computeWeightedLoss };
    export { LE as cosineDistance };
    export { zE as hingeLoss };
    export { BE as huberLoss };
    export { VE as logLoss };
    export { GE as meanSquaredError };
    export { WE as sigmoidCrossEntropy };
    export { jE as softmaxCrossEntropy };
}
declare function Be(...s: any[]): any;
declare namespace Be { }
declare var IT: {};
declare function Er(...s: any[]): any;
declare namespace Er { }
declare function $a(...s: any[]): any;
declare namespace $a { }
declare function Pf(...s: any[]): any;
declare namespace Pf { }
declare function X_(...s: any[]): any;
declare namespace X_ { }
declare function an(...s: any[]): any;
declare namespace an { }
declare function ht(...s: any[]): any;
declare namespace ht { }
declare function df(): any;
declare function Kq(r: any, e: any, { indexing: t }?: {
    indexing?: string | undefined;
}): any[];
declare var EV: {};
declare function El(...s: any[]): any;
declare namespace El { }
declare function Rs(...s: any[]): any;
declare namespace Rs { }
declare function Mf(...s: any[]): any;
declare namespace Mf { }
declare function Lf(...s: any[]): any;
declare namespace Lf { }
declare function cne(r: any): {
    [x: string]: any;
    isTraining: boolean;
    summary(e: any, t: any, n?: {
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
declare var AV: {};
declare function Mp(...s: any[]): any;
declare namespace Mp { }
declare function XNe(...s: any[]): any;
declare namespace XNe { }
declare function P(...s: any[]): any;
declare namespace P { }
declare function rH(...s: any[]): any;
declare namespace rH { }
declare function Y_(...s: any[]): any;
declare namespace Y_ { }
declare function Ke(...s: any[]): any;
declare namespace Ke { }
declare function Yf(): Promise<any>;
declare function Vp(...s: any[]): any;
declare namespace Vp { }
declare function fo(...s: any[]): any;
declare namespace fo { }
declare function Ss(...s: any[]): any;
declare namespace Ss { }
declare function or(r: any, e?: string): any;
declare function ur(...s: any[]): any;
declare namespace ur { }
declare function S(r: any): {
    (...s: any[]): any;
    readonly name: string;
};
declare function aH(...s: any[]): any;
declare namespace aH { }
declare function Wr(...s: any[]): any;
declare namespace Wr { }
declare function cH(...s: any[]): any;
declare namespace cH { }
declare function mH(...s: any[]): any;
declare namespace mH { }
declare function dH(...s: any[]): any;
declare namespace dH { }
declare function gH(...s: any[]): any;
declare namespace gH { }
declare function Z_(...s: any[]): any;
declare namespace Z_ { }
declare function jr(...s: any[]): any;
declare namespace jr { }
declare function Fa(...s: any[]): any;
declare namespace Fa { }
declare function g_(r: any, e?: boolean): void;
declare function Du(...s: any[]): any;
declare namespace Du { }
declare function Mue(r: any): any;
declare function IH(...s: any[]): any;
declare namespace IH { }
declare function RH(...s: any[]): any;
declare namespace RH { }
declare function Jg(...s: any[]): any;
declare namespace Jg { }
declare function Fs(...s: any[]): any;
declare namespace Fs { }
declare function Oa(r: any, e: any, t?: number, n?: string): any;
declare function zue(): any;
declare function Al(...s: any[]): any;
declare namespace Al { }
declare function zf(...s: any[]): any;
declare namespace zf { }
declare function Rp(r: any, e: any, t?: number): any;
declare function fne(r: any, e: any): void;
declare function b1(r: any): void;
declare function lu(r: any): void;
declare function tse(r: any, e: any): void;
declare var DV: {};
declare function Mr(...s: any[]): any;
declare namespace Mr { }
declare function Ru(...s: any[]): any;
declare namespace Ru { }
declare function Vue(r: any): void;
declare function L(...s: any[]): any;
declare namespace L { }
declare function Jt(...s: any[]): any;
declare namespace Jt { }
declare function GH(...s: any[]): any;
declare namespace GH { }
declare function jH(...s: any[]): any;
declare namespace jH { }
declare function qH(...s: any[]): any;
declare namespace qH { }
declare function KH(...s: any[]): any;
declare namespace KH { }
declare function La(...s: any[]): any;
declare namespace La { }
declare function Fu(...s: any[]): any;
declare namespace Fu { }
declare function Ou(...s: any[]): any;
declare namespace Ou { }
declare function pe(r: any, e: any): any;
declare function uE(...s: any[]): any;
declare namespace uE { }
declare var Gg: {};
declare function Pu(...s: any[]): any;
declare namespace Pu { }
declare function Bf(...s: any[]): any;
declare namespace Bf { }
declare function pne(r: any): any;
declare var Q: {};
declare function W4(r: any): any;
declare function jue(r: any, e: any): void;
declare function Mte(r: any, e?: boolean): void;
declare function Lte(r: any, e?: boolean): void;
declare function Jk(r: any, e: any): void;
declare function lk(r: any, e: any): Promise<any[]>;
declare var Tx: {};
declare function Pr(...s: any[]): any;
declare namespace Pr { }
declare function Vf(...s: any[]): any;
declare namespace Vf { }
declare namespace ZRe {
    export { yE as hammingWindow };
    export { sx as hannWindow };
    export { ix as frame };
    export { bE as stft };
}
declare function Mu(...s: any[]): any;
declare namespace Mu { }
declare function Lu(...s: any[]): any;
declare namespace Lu { }
declare function Fe(...s: any[]): any;
declare namespace Fe { }
declare function Gf(...s: any[]): any;
declare namespace Gf { }
declare function Qg(...s: any[]): any;
declare namespace Qg { }
declare function Wf(...s: any[]): any;
declare namespace Wf { }
declare function zp(...s: any[]): any;
declare namespace zp { }
declare var lr: {};
declare function Pa(...s: any[]): any;
declare namespace Pa { }
declare function po(...s: any[]): any;
declare namespace po { }
declare function Ra(...s: any[]): any;
declare namespace Ra { }
declare namespace Xf {
    export { UE as sparseFillEmptyRows };
    export { qE as sparseReshape };
    export { HE as sparseSegmentMean };
    export { KE as sparseSegmentSum };
}
declare function tx(...s: any[]): any;
declare namespace tx { }
declare namespace qRe {
    export { Ma as fft };
    export { gi as ifft };
    export { La as rfft };
    export { zu as irfft };
}
declare function sr(...s: any[]): any;
declare namespace sr { }
declare function xt(...s: any[]): any;
declare namespace xt { }
declare function Le(...s: any[]): any;
declare namespace Le { }
declare function Bu(...s: any[]): any;
declare namespace Bu { }
declare function Pn(...s: any[]): any;
declare namespace Pn { }
declare function Ht(...s: any[]): any;
declare namespace Ht { }
declare function Os(...s: any[]): any;
declare namespace Os { }
declare function jf(...s: any[]): any;
declare namespace jf { }
declare namespace mx {
    export { XE as stringNGrams };
    export { YE as stringSplit };
    export { ZE as stringToHashBucketFast };
}
declare function ce(...s: any[]): any;
declare namespace ce { }
declare function de(...s: any[]): any;
declare namespace de { }
declare function du(r: any): any;
declare function Uf(...s: any[]): any;
declare namespace Uf { }
declare function Ts(...s: any[]): any;
declare namespace Ts { }
declare function Nr(r: any, e: any, t: any): any;
declare function Dt(r: any, e: any): any;
declare function xi(r: any, e: any, t: any): any;
declare function w_(r: any, e: any, t: any): any;
declare function wK(r: any, e: any, t: any): any;
declare function _K(r: any, e: any, t: any): any;
declare function kK(r: any, e: any, t: any): any;
declare var lo: {};
declare var GT: {};
declare function B(r: any, e: any): any;
declare function Kn(...s: any[]): any;
declare namespace Kn { }
declare function Lue(r: any): any;
declare function qf(...s: any[]): any;
declare namespace qf { }
declare namespace Ju {
    import sgd = Ba.sgd;
    export { sgd };
    import momentum = Ba.momentum;
    export { momentum };
    import adadelta = Ba.adadelta;
    export { adadelta };
    import adagrad = Ba.adagrad;
    export { adagrad };
    import rmsprop = Ba.rmsprop;
    export { rmsprop };
    import adamax = Ba.adamax;
    export { adamax };
    import adam = Ba.adam;
    export { adam };
}
declare function qe(...s: any[]): any;
declare namespace qe { }
declare function Vu(...s: any[]): any;
declare namespace Vu { }
declare function Bp(...s: any[]): any;
declare namespace Bp { }
declare function eie(r: any): void;
declare function Qse(r: any, e: any): void;
declare function Hf(...s: any[]): any;
declare namespace Hf { }
declare function gr(...s: any[]): any;
declare namespace gr { }
declare function mr(r: any, e: any): any;
declare var y: {};
declare function Nq(r: any): (e: any, t: any) => {
    grad: any;
    value: any;
};
declare function Tq(r: any): (e: any, t: any) => any;
declare function uk(r: any, e: boolean | undefined, t: any, n: any): any;
declare function Kg(r: any, e: any): {
    value: any;
    grads: {};
};
declare var OKt: {
    tfjs: any;
    "tfjs-core": any;
    "tfjs-data": any;
    "tfjs-layers": any;
    "tfjs-converter": any;
    "tfjs-backend-cpu": string | undefined;
    "tfjs-backend-webgl": string | undefined;
    "tfjs-backend-wasm": string | undefined;
};
declare var Dse: string;
declare var G4: string;
declare var Mk: string;
declare var Ud: string;
declare var EC: string;
declare var Hv: string;
declare namespace bJe {
    export { yR as forceHalfFloat };
}
declare var m$: {};
declare function Ct(...s: any[]): any;
declare namespace Ct { }
declare function Kf(r: any): Promise<any>;
declare function gt(r: any, e?: string): any;
declare function Se(...s: any[]): any;
declare namespace Se { }
declare function jy(r: any, e: any): boolean;
declare function Ij(r: any): {};
declare function Qoe(r: any): {
    monitor: any;
    minDelta: number;
    patience: any;
    verbose: any;
    mode: any;
    baseline: any;
    monitorFunc: typeof jy;
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
declare function _E(...s: any[]): any;
declare namespace _E { }
declare function px(...s: any[]): any;
declare namespace px { }
declare function cx(...s: any[]): any;
declare namespace cx { }
declare function kE(...s: any[]): any;
declare namespace kE { }
declare function wE(...s: any[]): any;
declare namespace wE { }
declare function vE(...s: any[]): any;
declare namespace vE { }
declare function SE(r: any, e: any, t: any, n?: number, o?: number): Promise<any>;
declare function NE(...s: any[]): any;
declare namespace NE { }
declare function TE(r: any, e: any, t: any, n?: number, o?: number, s?: number): Promise<{
    selectedIndices: any;
    selectedScores: any;
}>;
declare function EE(...s: any[]): any;
declare namespace EE { }
declare function AE(r: any, e: any, t: any, n?: number, o?: number, s?: boolean): Promise<{
    selectedIndices: any;
    validOutputs: any;
}>;
declare function DE(...s: any[]): any;
declare namespace DE { }
declare function $E(...s: any[]): any;
declare namespace $E { }
declare function RE(...s: any[]): any;
declare namespace RE { }
declare function FE(...s: any[]): any;
declare namespace FE { }
declare function PE(...s: any[]): any;
declare namespace PE { }
declare function ME(...s: any[]): any;
declare namespace ME { }
declare function Lr(...s: any[]): any;
declare namespace Lr { }
declare function LE(...s: any[]): any;
declare namespace LE { }
declare function zE(...s: any[]): any;
declare namespace zE { }
declare function BE(...s: any[]): any;
declare namespace BE { }
declare function VE(...s: any[]): any;
declare namespace VE { }
declare function GE(...s: any[]): any;
declare namespace GE { }
declare function WE(...s: any[]): any;
declare namespace WE { }
declare function jE(...s: any[]): any;
declare namespace jE { }
declare function yE(...s: any[]): any;
declare namespace yE { }
declare function sx(...s: any[]): any;
declare namespace sx { }
declare function ix(...s: any[]): any;
declare namespace ix { }
declare function bE(...s: any[]): any;
declare namespace bE { }
declare function UE(...s: any[]): any;
declare namespace UE { }
declare function qE(...s: any[]): any;
declare namespace qE { }
declare function HE(...s: any[]): any;
declare namespace HE { }
declare function KE(...s: any[]): any;
declare namespace KE { }
declare function XE(...s: any[]): any;
declare namespace XE { }
declare function YE(...s: any[]): any;
declare namespace YE { }
declare function ZE(...s: any[]): any;
declare namespace ZE { }
declare var Ba: {
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
    rmsprop(e: any, t?: number, n?: number, o?: any, s?: boolean): {
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
    adam(e?: number, t?: number, n?: number, o?: any): {
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
    adadelta(e?: number, t?: number, n?: any): {
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
    adamax(e?: number, t?: number, n?: number, o?: any, s?: number): {
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
export { Js as Abs, Ri as Acos, Fi as Acosh, qu as AdadeltaOptimizer, Hu as AdagradOptimizer, Ku as AdamOptimizer, Xu as AdamaxOptimizer, jn as Add, $o as AddN, Oi as All, Pi as Any, Ro as ArgMax, ll as ArgMin, Mi as Asin, Li as Asinh, zi as Atan, Vi as Atan2, Bi as Atanh, Fo as AvgPool, ul as AvgPool3D, jc as AvgPool3DGrad, Wc as AvgPoolGrad, fy as BackendWasm, Oo as BatchMatMul, cl as BatchToSpaceND, Uc as Bincount, x1 as BroadcastTo, DI as Callback, WC as CallbackList, to as Cast, Po as Ceil, ro as ClipByValue, qc as Complex, pl as ComplexAbs, Qs as Concat, Mo as Conv2D, Hc as Conv2DBackpropFilter, Lo as Conv2DBackpropInput, ml as Conv3D, Kc as Conv3DBackpropFilterV2, Xc as Conv3DBackpropInputV2, zo as Cos, Gi as Cosh, Wi as CropAndResize, Bo as Cumsum, UC as CustomCallback, al as DataStorage, Yc as DenseBincount, ji as DepthToSpace, Vo as DepthwiseConv2dNative, Zc as DepthwiseConv2dNativeBackpropFilter, Jc as DepthwiseConv2dNativeBackpropInput, Qc as Diag, fl as Dilation2D, nf as Dilation2DBackpropFilter, rf as Dilation2DBackpropInput, Gw as ENV, $I as EarlyStopping, ep as Einsum, Ui as Elu, tp as EluGrad, Ng as Environment, Hi as Equal, qi as Erf, Wo as Exp, ei as ExpandDims, Ki as Expm1, rp as FFT, dl as Fill, Xi as FlipLeftRight, jo as Floor, Uo as FloorDiv, of as FromPixels, qo as FusedBatchNorm, mi as FusedConv2D, fi as FusedDepthwiseConv2D, qx as GPGPUContext, Yi as GatherNd, ti as GatherV2, lS as GraphModel, Zi as Greater, Ho as GreaterEqual, jC as History, np as IFFT, no as Identity, op as Imag, St as InputSpec, Ji as IsFinite, Qi as IsInf, ea as IsNan, Xs as KernelBackend, hl as LRN, ip as LRNGrad, Ny as LayerVariable, Jn as LayersModel, Ko as LeakyRelu, ta as Less, ra as LessEqual, sp as LinSpace, Xo as Log, na as Log1p, y1 as LogSoftmax, oa as LogicalAnd, iu as LogicalNot, au as LogicalOr, Qu as MathBackendCPU, lc as MathBackendWebGL, Yo as Max, Jo as MaxPool, gl as MaxPool3D, lp as MaxPool3DGrad, ap as MaxPoolGrad, up as MaxPoolWithArgmax, Zo as Maximum, Qo as Mean, es as Min, ts as Minimum, rs as MirrorPad, sa as Mod, Yu as MomentumOptimizer, cp as Multinomial, ns as Multiply, ri as Neg, aa as NonMaxSuppressionV3, la as NonMaxSuppressionV4, ua as NonMaxSuppressionV5, ia as NotEqual, H1 as OP_SCOPE_SUFFIX, os as OneHot, ni as OnesLike, Ur as Optimizer, oi as Pack, ss as PadV2, Xse as Pool, is as Pow, as as Prelu, ca as Prod, Zu as RMSPropOptimizer, Bn as RNN, xl as Range, Jw as Rank, pp as Real, Go as RealDiv, pa as Reciprocal, Kt as Reduction, ls as Relu, cs as Relu6, si as Reshape, us as ResizeBilinear, fp as ResizeBilinearGrad, yl as ResizeNearestNeighbor, mp as ResizeNearestNeighborGrad, ps as Reverse, wa as RotateWithOffset, ms as Round, fs as Rsqrt, za as SGDOptimizer, ma as ScatterNd, ii as Select, fa as Selu, Ja as Sequential, hs as Sigmoid, ha as Sign, ds as Sin, da as Sinh, ai as Slice, ys as Softmax, ga as Softplus, bl as SpaceToBatchND, dp as SparseFillEmptyRows, hp as SparseReshape, gp as SparseSegmentMean, xp as SparseSegmentSum, yp as SparseToDense, li as SplitV, gs as Sqrt, wl as Square, bs as SquaredDifference, oo as Step, xa as StridedSlice, bp as StringNGrams, wp as StringSplit, _p as StringToHashBucketFast, ws as Sub, xs as Sum, mn as SymbolicTensor, _s as Tan, ks as Tanh, Me as Tensor, ct as TensorBuffer, Un as Tile, ya as TopK, ba as Transform, vs as Transpose, kp as Unique, ui as Unpack, _l as UnsortedSegmentSum, Cl as Variable, ci as ZerosLike, pi as _FusedMatMul, Tt as abs, hf as acos, gf as acosh, J as add, S_ as addN, bu as all, Nl as any, Tl as argMax, xf as argMin, yf as asin, bf as asinh, wf as atan, _f as atan2, kf as atanh, Sa as avgPool, vf as avgPool3d, WT as backend, I as backend_util, _U as basicLSTMCell, uo as batchNorm, A_ as batchNorm2d, D_ as batchNorm3d, $_ as batchNorm4d, Na as batchToSpaceND, Cf as bincount, vNe as booleanMaskAsync, Ta as broadcastTo, zg as browser, Ie as buffer, ese as callbacks, oe as cast, If as ceil, fr as clipByValue, qn as clone, Fn as complex, et as concat, R_ as concat1d, F_ as concat2d, O_ as concat3d, P_ as concat4d, NB as constraints, ku as conv1d, on as conv2d, vu as conv2dTranspose, Sf as conv3d, M_ as conv3dTranspose, tie as copyRegisteredKernels, Ea as cos, Cu as cosh, rx as cosineWindow, Iu as cumsum, sn as customGrad, vS as data, L_ as denseBincount, I_ as deprecationWarn, Nf as depthToSpace, Es as depthwiseConv2d, rse as deregisterOp, gu as device_util, XU as diag, Tf as dilation2d, Oue as disableDeprecationWarnings, De as dispose, Pue as disposeVariables, ue as div, Ef as divNoNan, z_ as dot, fE as dropout, B_ as einsum, As as elu, Fue as enableDebugMode, Rue as enableProdMode, dE as enclosingPowerOfTwo, Ns as engine, W as env, On as equal, Af as erf, nr as exp, dr as expandDims, Df as expm1, Pp as eye, Ma as fft, Ds as fill, Gue as findBackend, Wue as findBackendFactory, $s as floor, yu as floorDiv, yR as forceHalfFloat, ho as fused, co as gather, pE as gatherND, Bg as gather_util, Bue as getBackend, Uw as getGradient, af as getKernel, Tg as getKernelsForBackend, f$ as gpgpu_util, Iq as grad, Sq as grads, qt as greater, _n as greaterEqual, gi as ifft, Su as imag, yi as image, R1e as inTopKAsync, HB as initializers, eI as input, Or as io, zu as irfft, V_ as isFinite, G_ as isInf, $f as isNaN, Rt as keep, zr as kernel_impls, TV as layers, Aa as leakyRelu, Nu as less, kn as lessEqual, JE as linalg, W_ as linspace, Ase as loadGraphModel, mne as loadLayersModel, Rf as localResponseNormalization, hr as log, Tu as log1p, j_ as logSigmoid, Eu as logSoftmax, Of as logSumExp, _r as logicalAnd, Da as logicalNot, Au as logicalOr, K_ as logicalXor, vFe as losses, Be as matMul, IT as math, Er as max, $a as maxPool, Pf as maxPool3d, X_ as maxPoolWithArgmax, an as maximum, ht as mean, df as memory, Kq as meshgrid, EV as metrics, El as min, Rs as minimum, Mf as mirrorPad, Lf as mod, cne as model, AV as models, Mp as moments, XNe as movingAverage, P as mul, rH as multiRNNCell, Y_ as multinomial, Ke as neg, Yf as nextFrame, Vp as norm, fo as notEqual, Ss as oneHot, or as ones, ur as onesLike, S as op, aH as outerProduct, Wr as pad, cH as pad1d, mH as pad2d, dH as pad3d, gH as pad4d, Z_ as pool, jr as pow, Fa as prelu, g_ as print, Du as prod, Mue as profile, IH as rand, RH as randomGamma, Jg as randomNormal, Fs as randomUniform, Oa as range, zue as ready, Al as real, zf as reciprocal, Rp as registerBackend, fne as registerCallbackConstructor, b1 as registerGradient, lu as registerKernel, tse as registerOp, DV as regularizers, Mr as relu, Ru as relu6, Vue as removeBackend, L as reshape, Jt as reverse, GH as reverse1d, jH as reverse2d, qH as reverse3d, KH as reverse4d, La as rfft, Fu as round, Ou as rsqrt, pe as scalar, uE as scatterND, Gg as scatter_util, Pu as selu, Bf as separableConv2d, pne as sequential, Q as serialization, W4 as setBackend, jue as setPlatform, Mte as setWasmPath, Lte as setWasmPaths, Jk as setWebGLContext, lk as setdiff1dAsync, Tx as shared, Pr as sigmoid, Vf as sign, ZRe as signal, Mu as sin, Lu as sinh, Fe as slice, Gf as slice1d, Qg as slice2d, Wf as slice3d, zp as slice4d, lr as slice_util, Pa as softmax, po as softplus, Ra as spaceToBatchND, Xf as sparse, tx as sparseToDense, qRe as spectral, sr as split, xt as sqrt, Le as square, Bu as squaredDifference, Pn as squeeze, Ht as stack, Os as step, jf as stridedSlice, mx as string, ce as sub, de as sum, du as sumOutType, Uf as tan, Ts as tanh, Nr as tensor, Dt as tensor1d, xi as tensor2d, w_ as tensor3d, wK as tensor4d, _K as tensor5d, kK as tensor6d, lo as tensor_util, GT as test_util, B as tidy, Kn as tile, Lue as time, qf as topk, Ju as train, qe as transpose, Vu as truncatedNormal, Bp as unique, eie as unregisterGradient, Qse as unregisterKernel, Hf as unsortedSegmentSum, gr as unstack, mr as upcastType, y as util, Nq as valueAndGrad, Tq as valueAndGrads, uk as variable, Kg as variableGrads, OKt as version, Dse as version_converter, G4 as version_core, Mk as version_cpu, Ud as version_layers, EC as version_wasm, Hv as version_webgl, bJe as webgl, m$ as webgl_util, Ct as where, Kf as whereAsync, gt as zeros, Se as zerosLike };
