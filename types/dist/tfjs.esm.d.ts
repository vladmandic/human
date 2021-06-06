declare var DE: string;
declare var EE: string;
declare var ME: string;
declare var Qp: {
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
declare var ec: {
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
declare var tc: {
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
declare var rc: {
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
declare var bx: string;
declare var FE: string;
declare var RE: string;
declare var LE: string;
declare var $E: string;
declare var PE: string;
declare var BE: string;
declare var OE: string;
declare var zE: string;
declare var WE: string;
declare var GE: string;
declare var KE: string;
declare var VE: string;
declare var bwe: string;
declare var gwe: string;
declare var WI: {
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
declare var UE: string;
declare var jE: string;
declare var HE: string;
declare var ywe: string;
declare var NN: {
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
            standardizeUserData(e: any, t: any, n: any, o: any, s: boolean | undefined, i: any): Promise<any[]>;
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
declare var $S: {
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
declare var yx: string;
declare var qE: string;
declare var XE: string;
declare var YE: string;
declare var ZE: string;
declare var JE: string;
declare var QE: string;
declare var e2: string;
declare var t2: string;
declare var r2: string;
declare var xwe: string;
declare var n2: string;
declare var o2: string;
declare var s2: string;
declare var i2: string;
declare var a2: string;
declare var BS: {
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
declare var vE: {
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
declare var l2: string;
declare var u2: string;
declare var p2: string;
declare var c2: string;
declare var m2: string;
declare var f2: string;
declare var d2: string;
declare var kwe: string;
declare var Twe: string;
declare var xw: any;
declare var AN: {
    new (e: any): {
        monitor: any;
        minDelta: number;
        patience: any;
        verbose: any;
        mode: any;
        baseline: any;
        monitorFunc: typeof bk;
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
            standardizeUserData(e: any, t: any, n: any, o: any, s: boolean | undefined, i: any): Promise<any[]>;
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
declare var g2: string;
declare var b2: string;
declare var Iwe: string;
declare var gx: {
    new (e: any): {
        global: any;
        flags: {};
        flagRegistry: {};
        urlFlags: {};
        getQueryParams: typeof r7;
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
declare var x2: string;
declare var y2: string;
declare var T2: string;
declare var k2: string;
declare var I2: string;
declare var v2: string;
declare var w2: string;
declare var _2: string;
declare var C2: string;
declare var S2: string;
declare var Iw: string;
declare var N2: string;
declare var ww: string;
declare var _w: string;
declare var TI: {
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
        downloadPackedMatrixFromBuffer(e: any, t: any, n: any, o: any, s: any, i: any): Float32Array;
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
declare var D2: string;
declare var A2: string;
declare var sA: {
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
            checkTensorForDisposal(e: any, t: any, n: any, o: any, s: any, i: any, a: any): void;
            executeAsync(e: any, t: any): Promise<any>;
            _executeAsync(e: any, t: any, n?: boolean, o?: {}, s?: {}): Promise<any>;
            executeFunctionAsync(e: any, t: any, n: any): Promise<any>;
            executeWithControlFlow(e: any, t: any, n: any, o: any): Promise<any>;
            processStack(e: any, t: any, n: any, o: any, s: any, i: any, a: any, l: any, u: any): any[];
            processChildNodes(e: any, t: any, n: any, o: any, s: any, i: any): void;
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
            checkTensorForDisposal(e: any, t: any, n: any, o: any, s: any, i: any, a: any): void;
            executeAsync(e: any, t: any): Promise<any>;
            _executeAsync(e: any, t: any, n?: boolean, o?: {}, s?: {}): Promise<any>;
            executeFunctionAsync(e: any, t: any, n: any): Promise<any>;
            executeWithControlFlow(e: any, t: any, n: any, o: any): Promise<any>;
            processStack(e: any, t: any, n: any, o: any, s: any, i: any, a: any, l: any, u: any): any[];
            processChildNodes(e: any, t: any, n: any, o: any, s: any, i: any): void;
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
declare var E2: string;
declare var M2: string;
declare var PS: {
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
declare var F2: string;
declare var xx: string;
declare var R2: string;
declare var Vt: {
    new (e: any): {
        dtype: any;
        shape: any;
        ndim: any;
        maxNDim: any;
        minNDim: any;
        axes: any;
    };
};
declare var L2: string;
declare var $2: string;
declare var P2: string;
declare var dx: {
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
declare var H2: string;
declare var wwe: string;
declare var QT: {
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
declare var Jo: {
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
        standardizeUserData(e: any, t: any, n: any, o: any, s: boolean | undefined, i: any): Promise<any[]>;
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
declare var B2: string;
declare var O2: string;
declare var z2: string;
declare var G2: string;
declare var W2: string;
declare var K2: string;
declare var vwe: string;
declare var V2: string;
declare var U2: string;
declare var j2: string;
declare var hy: {
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
};
declare var Ry: {
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
        shouldExecuteOnCPU(e: any, t?: () => any): any;
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
};
declare var q2: string;
declare var Y2: string;
declare var Z2: string;
declare var Cwe: string;
declare var _we: string;
declare var J2: string;
declare var X2: string;
declare var Q2: string;
declare var eM: string;
declare var tM: string;
declare var rM: string;
declare var nM: string;
declare var nc: {
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
declare var oM: string;
declare var sM: string;
declare var aM: string;
declare var lM: string;
declare var uM: string;
declare var pM: string;
declare var iM: string;
declare var zF: string;
declare var mM: string;
declare var cM: string;
declare var ro: {
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
declare var fM: string;
declare var dM: string;
declare var Swe: string;
declare var hM: string;
declare var gM: string;
declare var bM: string;
declare var oc: {
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
declare var _s: any;
declare var yM: string;
declare var Rw: any;
declare var xM: string;
declare var h2: string;
declare var TM: string;
declare var gr: any;
declare var kM: string;
declare var _M: string;
declare var IM: string;
declare var wM: string;
declare var Awe: string;
declare var vM: string;
declare var Nwe: string;
declare var CM: string;
declare var pF: string;
declare var SM: string;
declare var NM: string;
declare var tl: {
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
declare var AM: string;
declare var DM: string;
declare var EM: string;
declare var kd: any;
declare var $M: string;
declare var LM: string;
declare var FM: string;
declare var RM: string;
declare var MM: string;
declare var WM: string;
declare var PM: string;
declare var zM: string;
declare var KM: string;
declare var VM: string;
declare var UM: string;
declare var jM: string;
declare var HM: string;
declare var GM: string;
declare var BM: string;
declare var Dwe: string;
declare var qM: string;
declare var uF: string;
declare var XM: string;
declare var YM: string;
declare var ZM: string;
declare var JM: string;
declare var QM: string;
declare var OM: string;
declare var jn: {
    new (e: any, t: any, n: any, o: any, s: any, i: any, a: any): {
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
declare var eF: string;
declare var tF: string;
declare var Yt: {
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
declare var Pp: {
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
declare var Tx: string;
declare var rF: string;
declare var nF: string;
declare var oF: string;
declare var sF: string;
declare var aF: string;
declare var iF: string;
declare var Cu: {
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
declare var lF: string;
declare var vw: string;
declare function un(...s: any[]): any;
declare namespace un {
    const name: string;
}
declare function EY(...s: any[]): any;
declare namespace EY { }
declare function FY(...s: any[]): any;
declare namespace FY { }
declare function Re(...s: any[]): any;
declare namespace Re { }
declare function LY(...s: any[]): any;
declare namespace LY { }
declare function PY(...s: any[]): any;
declare namespace PY { }
declare function OY(...s: any[]): any;
declare namespace OY { }
declare function GY(...s: any[]): any;
declare namespace GY { }
declare function KY(...s: any[]): any;
declare namespace KY { }
declare function UY(...s: any[]): any;
declare namespace UY { }
declare function HY(...s: any[]): any;
declare namespace HY { }
declare function XY(...s: any[]): any;
declare namespace XY { }
declare function ZY(...s: any[]): any;
declare namespace ZY { }
declare function QY(...s: any[]): any;
declare namespace QY { }
declare function c_(...s: any[]): any;
declare namespace c_ { }
declare function u9(...s: any[]): any;
declare namespace u9 { }
declare function RAe(): any;
declare var t$: {};
declare function h9(...s: any[]): any;
declare namespace h9 { }
declare function Wp(...s: any[]): any;
declare namespace Wp { }
declare function x9(...s: any[]): any;
declare namespace x9 { }
declare function k9(...s: any[]): any;
declare namespace k9 { }
declare function v9(...s: any[]): any;
declare namespace v9 { }
declare function m_(...s: any[]): any;
declare namespace m_ { }
declare function f_(...s: any[]): any;
declare namespace f_ { }
declare function _je(r: any, e: any, t: any): Promise<any>;
declare function Ch(...s: any[]): any;
declare namespace Ch { }
declare var TR: {};
declare function Ln(r: any, e: string | undefined, t: any): {
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
declare namespace Bme {
    export { Pme as earlyStopping };
}
declare function ft(...s: any[]): any;
declare namespace ft { }
declare function S9(...s: any[]): any;
declare namespace S9 { }
declare function A9(...s: any[]): any;
declare namespace A9 { }
declare function Os(...s: any[]): any;
declare namespace Os { }
declare function ss(...s: any[]): any;
declare namespace ss { }
declare function Dr(...s: any[]): any;
declare namespace Dr { }
declare function E9(...s: any[]): any;
declare namespace E9 { }
declare function F9(...s: any[]): any;
declare namespace F9 { }
declare function L9(...s: any[]): any;
declare namespace L9 { }
declare function P9(...s: any[]): any;
declare namespace P9 { }
declare var iz: {};
declare function z9(...s: any[]): any;
declare namespace z9 { }
declare function Kp(...s: any[]): any;
declare namespace Kp { }
declare function K9(...s: any[]): any;
declare namespace K9 { }
declare function U9(...s: any[]): any;
declare namespace U9 { }
declare function q9(...s: any[]): any;
declare namespace q9 { }
declare function Pwe(r: any, e: any): void;
declare function Y9(...s: any[]): any;
declare namespace Y9 { }
declare function J9(...s: any[]): any;
declare namespace J9 { }
declare function Zx(r: any, e: any, t: any): any;
declare function eZ(...s: any[]): any;
declare namespace eZ { }
declare function $n(r: any): any;
declare var kA: {};
declare function rZ(...s: any[]): any;
declare namespace rZ { }
declare function wY(r: any): void;
declare function oZ(...s: any[]): any;
declare namespace oZ { }
declare function Sh(...s: any[]): any;
declare namespace Sh { }
declare function zme(r: any): void;
declare var PF: {};
declare function iZ(...s: any[]): any;
declare namespace iZ { }
declare function uZ(...s: any[]): any;
declare namespace uZ { }
declare function kAe(): void;
declare function $r(r: any): void;
declare function IAe(): void;
declare function ct(...s: any[]): any;
declare namespace ct { }
declare function hZ(...s: any[]): any;
declare namespace hZ { }
declare function bZ(...s: any[]): any;
declare namespace bZ { }
declare function PHe(...s: any[]): any;
declare namespace PHe { }
declare function xZ(...s: any[]): any;
declare namespace xZ { }
declare function g_(...s: any[]): any;
declare namespace g_ { }
declare function TAe(): void;
declare function xAe(): void;
declare function uL(r: any): number;
declare function vAe(): any;
declare function Ze(): any;
declare function h_(...s: any[]): any;
declare namespace h_ { }
declare function IZ(...s: any[]): any;
declare namespace IZ { }
declare function zs(...s: any[]): any;
declare namespace zs { }
declare function Nu(...s: any[]): any;
declare namespace Nu { }
declare function CZ(...s: any[]): any;
declare namespace CZ { }
declare function b_(...s: any[]): any;
declare namespace b_ { }
declare function Eh(...s: any[]): any;
declare namespace Eh { }
declare function Vp(r: any, e: any, t: any): any;
declare function EAe(r: any): any;
declare function MAe(r: any): any;
declare function y_(...s: any[]): any;
declare namespace y_ { }
declare function i_(...s: any[]): any;
declare namespace i_ { }
declare function S4(): void;
declare var gL: {};
declare function x_(...s: any[]): any;
declare namespace x_ { }
declare function vHe(...s: any[]): any;
declare namespace vHe { }
declare var IR: {};
declare function AAe(): any;
declare function Cw(r: any): any;
declare function bh(r: any, e: any): any;
declare function kx(r: any): any[];
declare var tU: {};
declare function XZ(r: any): (e: any, t: any) => any;
declare function YZ(r: any): (e: any, t: any) => any;
declare function qm(...s: any[]): any;
declare namespace qm { }
declare function T_(...s: any[]): any;
declare namespace T_ { }
declare function Qm(...s: any[]): any;
declare namespace Qm { }
declare function Ah(...s: any[]): any;
declare namespace Ah { }
declare namespace iZe {
    export { TL as flipLeftRight };
    export { EL as resizeNearestNeighbor };
    export { DL as resizeBilinear };
    export { kL as rotateWithOffset };
    export { xL as cropAndResize };
    export { IL as nonMaxSuppression };
    export { _L as nonMaxSuppressionAsync };
    export { CL as nonMaxSuppressionWithScore };
    export { SL as nonMaxSuppressionWithScoreAsync };
    export { NL as nonMaxSuppressionPadded };
    export { AL as nonMaxSuppressionPaddedAsync };
    export { ML as threshold };
    export { FL as transform };
}
declare function VHe(r: any, e: any, t?: number): Promise<any>;
declare var Sz: {};
declare function HS(r: any): any;
declare var gR: {};
declare function H_(...s: any[]): any;
declare namespace H_ { }
declare function LZ(...s: any[]): any;
declare namespace LZ { }
declare function PZ(...s: any[]): any;
declare namespace PZ { }
declare function OZ(...s: any[]): any;
declare namespace OZ { }
declare function zR(r: any): any;
declare var r$: {};
declare var l3: {};
declare function k_(...s: any[]): any;
declare namespace k_ { }
declare function WZ(...s: any[]): any;
declare namespace WZ { }
declare function Dh(...s: any[]): any;
declare namespace Dh { }
declare namespace cZe {
    export { RL as bandPart };
    export { LL as gramSchmidt };
    export { PL as qr };
}
declare function VZ(r: any, e: any, t: any): any;
declare function dfe(r: any, e?: {}): Promise<{
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
        checkTensorForDisposal(e: any, t: any, n: any, o: any, s: any, i: any, a: any): void;
        executeAsync(e: any, t: any): Promise<any>;
        _executeAsync(e: any, t: any, n?: boolean, o?: {}, s?: {}): Promise<any>;
        executeFunctionAsync(e: any, t: any, n: any): Promise<any>;
        executeWithControlFlow(e: any, t: any, n: any, o: any): Promise<any>;
        processStack(e: any, t: any, n: any, o: any, s: any, i: any, a: any, l: any, u: any): any[];
        processChildNodes(e: any, t: any, n: any, o: any, s: any, i: any): void;
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
        checkTensorForDisposal(e: any, t: any, n: any, o: any, s: any, i: any, a: any): void;
        executeAsync(e: any, t: any): Promise<any>;
        _executeAsync(e: any, t: any, n?: boolean, o?: {}, s?: {}): Promise<any>;
        executeFunctionAsync(e: any, t: any, n: any): Promise<any>;
        executeWithControlFlow(e: any, t: any, n: any, o: any): Promise<any>;
        processStack(e: any, t: any, n: any, o: any, s: any, i: any, a: any, l: any, u: any): any[];
        processChildNodes(e: any, t: any, n: any, o: any, s: any, i: any): void;
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
declare function Zpe(r: any, e: any): Promise<any>;
declare function jZ(...s: any[]): any;
declare namespace jZ { }
declare function Au(...s: any[]): any;
declare namespace Au { }
declare function I_(...s: any[]): any;
declare namespace I_ { }
declare function rJ(...s: any[]): any;
declare namespace rJ { }
declare function iJ(...s: any[]): any;
declare namespace iJ { }
declare function C_(...s: any[]): any;
declare namespace C_ { }
declare function Xm(...s: any[]): any;
declare namespace Xm { }
declare function S_(...s: any[]): any;
declare namespace S_ { }
declare function N_(...s: any[]): any;
declare namespace N_ { }
declare function yJ(...s: any[]): any;
declare namespace yJ { }
declare namespace kZe {
    export { BL as absoluteDifference };
    export { cn as computeWeightedLoss };
    export { OL as cosineDistance };
    export { zL as hingeLoss };
    export { GL as huberLoss };
    export { WL as logLoss };
    export { KL as meanSquaredError };
    export { VL as sigmoidCrossEntropy };
    export { UL as softmaxCrossEntropy };
}
declare function gt(...s: any[]): any;
declare namespace gt { }
declare var yR: {};
declare function Yi(...s: any[]): any;
declare namespace Yi { }
declare function A_(...s: any[]): any;
declare namespace A_ { }
declare function kJ(...s: any[]): any;
declare namespace kJ { }
declare function vJ(...s: any[]): any;
declare namespace vJ { }
declare function D_(...s: any[]): any;
declare namespace D_ { }
declare function Ym(...s: any[]): any;
declare namespace Ym { }
declare function wAe(): any;
declare function CJ(r: any, e: any, { indexing: t }?: {
    indexing?: string | undefined;
}): any[];
declare var u3: {};
declare function Ux(...s: any[]): any;
declare namespace Ux { }
declare function E_(...s: any[]): any;
declare namespace E_ { }
declare function DJ(...s: any[]): any;
declare namespace DJ { }
declare function MJ(...s: any[]): any;
declare namespace MJ { }
declare function Xpe(r: any): {
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
    standardizeUserData(e: any, t: any, n: any, o: any, s: boolean | undefined, i: any): Promise<any[]>;
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
declare var p3: {};
declare function LJ(...s: any[]): any;
declare namespace LJ { }
declare function Zje(...s: any[]): any;
declare namespace Zje { }
declare function fe(...s: any[]): any;
declare namespace fe { }
declare function PJ(...s: any[]): any;
declare namespace PJ { }
declare function OJ(...s: any[]): any;
declare namespace OJ { }
declare function Ao(...s: any[]): any;
declare namespace Ao { }
declare function zte(): Promise<any>;
declare function Yx(...s: any[]): any;
declare namespace Yx { }
declare function M_(...s: any[]): any;
declare namespace M_ { }
declare function Lx(...s: any[]): any;
declare namespace Lx { }
declare function Qi(r: any, e?: string): any;
declare function WJ(...s: any[]): any;
declare namespace WJ { }
declare function E(r: any): {
    (...s: any[]): any;
    readonly name: string;
};
declare function VJ(...s: any[]): any;
declare namespace VJ { }
declare function el(...s: any[]): any;
declare namespace el { }
declare function HJ(...s: any[]): any;
declare namespace HJ { }
declare function XJ(...s: any[]): any;
declare namespace XJ { }
declare function ZJ(...s: any[]): any;
declare namespace ZJ { }
declare function QJ(...s: any[]): any;
declare namespace QJ { }
declare function oQ(...s: any[]): any;
declare namespace oQ { }
declare function Du(...s: any[]): any;
declare namespace Du { }
declare function R_(...s: any[]): any;
declare namespace R_ { }
declare function Qw(r: any, e?: boolean): void;
declare function lQ(...s: any[]): any;
declare namespace lQ { }
declare function _Ae(r: any): any;
declare function pQ(...s: any[]): any;
declare namespace pQ { }
declare function yQ(...s: any[]): any;
declare namespace yQ { }
declare function TQ(...s: any[]): any;
declare namespace TQ { }
declare function V_(...s: any[]): any;
declare namespace V_ { }
declare function jp(r: any, e: any, t?: number, n?: string): any;
declare function NAe(): any;
declare function Jm(...s: any[]): any;
declare namespace Jm { }
declare function wQ(...s: any[]): any;
declare namespace wQ { }
declare function FAe(r: any, e: any, t?: number): any;
declare function Jpe(r: any, e: any): void;
declare function Rwe(r: any): void;
declare function a7(r: any): void;
declare function Ome(r: any, e: any): void;
declare var c3: {};
declare function Hp(...s: any[]): any;
declare namespace Hp { }
declare function U_(...s: any[]): any;
declare namespace U_ { }
declare function DAe(r: any): void;
declare function te(...s: any[]): any;
declare namespace te { }
declare function as(...s: any[]): any;
declare namespace as { }
declare function AQ(...s: any[]): any;
declare namespace AQ { }
declare function EQ(...s: any[]): any;
declare namespace EQ { }
declare function FQ(...s: any[]): any;
declare namespace FQ { }
declare function LQ(...s: any[]): any;
declare namespace LQ { }
declare function Mh(...s: any[]): any;
declare namespace Mh { }
declare function j_(...s: any[]): any;
declare namespace j_ { }
declare function BQ(...s: any[]): any;
declare namespace BQ { }
declare function Je(r: any, e: any): any;
declare function aHe(...s: any[]): any;
declare namespace aHe { }
declare var wR: {};
declare function zQ(...s: any[]): any;
declare namespace zQ { }
declare function WQ(...s: any[]): any;
declare namespace WQ { }
declare function Ype(r: any): any;
declare var LR: {};
declare function SAe(r: any): any;
declare function LAe(r: any, e: any): void;
declare function Jve(r: any, e?: boolean): void;
declare function Qve(r: any, e?: boolean): void;
declare function a0(r: any, e: any): void;
declare function VQ(r: any, e: any): Promise<any[]>;
declare var gW: {};
declare function Xi(...s: any[]): any;
declare namespace Xi { }
declare function jQ(...s: any[]): any;
declare namespace jQ { }
declare namespace H9e {
    export { bL as hammingWindow };
    export { Jx as hannWindow };
    export { Qx as frame };
    export { yL as stft };
}
declare function qQ(...s: any[]): any;
declare namespace qQ { }
declare function YQ(...s: any[]): any;
declare namespace YQ { }
declare function kt(...s: any[]): any;
declare namespace kt { }
declare function JQ(...s: any[]): any;
declare namespace JQ { }
declare function eee(...s: any[]): any;
declare namespace eee { }
declare function ree(...s: any[]): any;
declare namespace ree { }
declare function oee(...s: any[]): any;
declare namespace oee { }
declare var Bx: {};
declare function aee(...s: any[]): any;
declare namespace aee { }
declare function w_(...s: any[]): any;
declare namespace w_ { }
declare function F_(...s: any[]): any;
declare namespace F_ { }
declare namespace CZe {
    export { jL as sparseFillEmptyRows };
    export { HL as sparseReshape };
    export { qL as sparseSegmentMean };
    export { XL as sparseSegmentSum };
}
declare function gHe(...s: any[]): any;
declare namespace gHe { }
declare namespace W9e {
    export { Eh as fft };
    export { Qm as ifft };
    export { Mh as rfft };
    export { H_ as irfft };
}
declare function Eu(...s: any[]): any;
declare namespace Eu { }
declare function To(...s: any[]): any;
declare namespace To { }
declare function pn(...s: any[]): any;
declare namespace pn { }
declare function q_(...s: any[]): any;
declare namespace q_ { }
declare function Fh(...s: any[]): any;
declare namespace Fh { }
declare function Mu(...s: any[]): any;
declare namespace Mu { }
declare function X_(...s: any[]): any;
declare namespace X_ { }
declare function yee(...s: any[]): any;
declare namespace yee { }
declare namespace DZe {
    export { YL as stringNGrams };
    export { ZL as stringSplit };
    export { JL as stringToHashBucketFast };
}
declare function We(...s: any[]): any;
declare namespace We { }
declare function It(...s: any[]): any;
declare namespace It { }
declare function k7(r: any): any;
declare function Tee(...s: any[]): any;
declare namespace Tee { }
declare function Wx(...s: any[]): any;
declare namespace Wx { }
declare function Vi(r: any, e: any, t: any): any;
declare function Pn(r: any, e: any): any;
declare function qp(r: any, e: any, t: any): any;
declare function n_(r: any, e: any, t: any): any;
declare function kee(r: any, e: any, t: any): any;
declare function Iee(r: any, e: any, t: any): any;
declare function vee(r: any, e: any, t: any): any;
declare var $F: {};
declare var OR: {};
declare function mr(r: any, e: any): any;
declare function Nh(...s: any[]): any;
declare namespace Nh { }
declare function CAe(r: any): any;
declare function _ee(...s: any[]): any;
declare namespace _ee { }
declare namespace Ant {
    import sgd = rl.sgd;
    export { sgd };
    import momentum = rl.momentum;
    export { momentum };
    import adadelta = rl.adadelta;
    export { adadelta };
    import adagrad = rl.adagrad;
    export { adagrad };
    import rmsprop = rl.rmsprop;
    export { rmsprop };
    import adamax = rl.adamax;
    export { adamax };
    import adam = rl.adam;
    export { adam };
}
declare function _h(...s: any[]): any;
declare namespace _h { }
declare function See(...s: any[]): any;
declare namespace See { }
declare function Aee(...s: any[]): any;
declare namespace Aee { }
declare function $we(r: any): void;
declare function Lwe(r: any, e: any): void;
declare function Eee(...s: any[]): any;
declare namespace Eee { }
declare function Rh(...s: any[]): any;
declare namespace Rh { }
declare function Wm(r: any, e: any): any;
declare var _F: {};
declare function ZZ(r: any): (e: any, t: any) => {
    grad: any;
    value: any;
};
declare function JZ(r: any): (e: any, t: any) => any;
declare function Fee(r: any, e: boolean | undefined, t: any, n: any): any;
declare function v_(r: any, e: any): {
    value: any;
    grads: {};
};
declare var XAn: {
    tfjs: string;
    "tfjs-core": string;
    "tfjs-data": string;
    "tfjs-layers": string;
    "tfjs-converter": string;
    "tfjs-backend-cpu": string;
    "tfjs-backend-webgl": string;
    "tfjs-backend-wasm": string;
};
declare var hfe: string;
declare var vY: string;
declare var qfe: string;
declare var tb: string;
declare var ewe: string;
declare var zbe: string;
declare namespace bjr {
    export { S4 as forceHalfFloat };
}
declare var eU: {};
declare function ai(...s: any[]): any;
declare namespace ai { }
declare function Y_(r: any): Promise<any>;
declare function Ji(r: any, e?: string): any;
declare function qr(...s: any[]): any;
declare namespace qr { }
declare function bk(r: any, e: any): boolean;
declare function r7(r: any): {};
declare function Pme(r: any): {
    monitor: any;
    minDelta: number;
    patience: any;
    verbose: any;
    mode: any;
    baseline: any;
    monitorFunc: typeof bk;
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
        standardizeUserData(e: any, t: any, n: any, o: any, s: boolean | undefined, i: any): Promise<any[]>;
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
declare function TL(...s: any[]): any;
declare namespace TL { }
declare function EL(...s: any[]): any;
declare namespace EL { }
declare function DL(...s: any[]): any;
declare namespace DL { }
declare function kL(...s: any[]): any;
declare namespace kL { }
declare function xL(...s: any[]): any;
declare namespace xL { }
declare function IL(...s: any[]): any;
declare namespace IL { }
declare function _L(r: any, e: any, t: any, n?: number, o?: number): Promise<any>;
declare function CL(...s: any[]): any;
declare namespace CL { }
declare function SL(r: any, e: any, t: any, n?: number, o?: number, s?: number): Promise<{
    selectedIndices: any;
    selectedScores: any;
}>;
declare function NL(...s: any[]): any;
declare namespace NL { }
declare function AL(r: any, e: any, t: any, n?: number, o?: number, s?: boolean): Promise<{
    selectedIndices: any;
    validOutputs: any;
}>;
declare function ML(...s: any[]): any;
declare namespace ML { }
declare function FL(...s: any[]): any;
declare namespace FL { }
declare function RL(...s: any[]): any;
declare namespace RL { }
declare function LL(...s: any[]): any;
declare namespace LL { }
declare function PL(...s: any[]): any;
declare namespace PL { }
declare function BL(...s: any[]): any;
declare namespace BL { }
declare function cn(...s: any[]): any;
declare namespace cn { }
declare function OL(...s: any[]): any;
declare namespace OL { }
declare function zL(...s: any[]): any;
declare namespace zL { }
declare function GL(...s: any[]): any;
declare namespace GL { }
declare function WL(...s: any[]): any;
declare namespace WL { }
declare function KL(...s: any[]): any;
declare namespace KL { }
declare function VL(...s: any[]): any;
declare namespace VL { }
declare function UL(...s: any[]): any;
declare namespace UL { }
declare function bL(...s: any[]): any;
declare namespace bL { }
declare function Jx(...s: any[]): any;
declare namespace Jx { }
declare function Qx(...s: any[]): any;
declare namespace Qx { }
declare function yL(...s: any[]): any;
declare namespace yL { }
declare function jL(...s: any[]): any;
declare namespace jL { }
declare function HL(...s: any[]): any;
declare namespace HL { }
declare function qL(...s: any[]): any;
declare namespace qL { }
declare function XL(...s: any[]): any;
declare namespace XL { }
declare function YL(...s: any[]): any;
declare namespace YL { }
declare function ZL(...s: any[]): any;
declare namespace ZL { }
declare function JL(...s: any[]): any;
declare namespace JL { }
declare var rl: {
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
export { DE as Abs, EE as Acos, ME as Acosh, Qp as AdadeltaOptimizer, ec as AdagradOptimizer, tc as AdamOptimizer, rc as AdamaxOptimizer, bx as Add, FE as AddN, RE as All, LE as Any, $E as ArgMax, PE as ArgMin, BE as Asin, OE as Asinh, zE as Atan, WE as Atan2, GE as Atanh, KE as AvgPool, VE as AvgPool3D, bwe as AvgPool3DGrad, gwe as AvgPoolGrad, WI as BackendWasm, UE as BatchMatMul, jE as BatchToSpaceND, HE as Bincount, ywe as BroadcastTo, NN as Callback, $S as CallbackList, yx as Cast, qE as Ceil, XE as ClipByValue, YE as Complex, ZE as ComplexAbs, JE as Concat, QE as Conv2D, e2 as Conv2DBackpropFilter, t2 as Conv2DBackpropInput, r2 as Conv3D, xwe as Conv3DBackpropFilterV2, n2 as Conv3DBackpropInputV2, o2 as Cos, s2 as Cosh, i2 as CropAndResize, a2 as Cumsum, BS as CustomCallback, vE as DataStorage, l2 as DenseBincount, u2 as DepthToSpace, p2 as DepthwiseConv2dNative, c2 as DepthwiseConv2dNativeBackpropFilter, m2 as DepthwiseConv2dNativeBackpropInput, f2 as Diag, d2 as Dilation2D, kwe as Dilation2DBackpropFilter, Twe as Dilation2DBackpropInput, xw as ENV, AN as EarlyStopping, g2 as Einsum, b2 as Elu, Iwe as EluGrad, gx as Environment, x2 as Equal, y2 as Erf, T2 as Exp, k2 as ExpandDims, I2 as Expm1, v2 as FFT, w2 as Fill, _2 as FlipLeftRight, C2 as Floor, S2 as FloorDiv, Iw as FromPixels, N2 as FusedBatchNorm, ww as FusedConv2D, _w as FusedDepthwiseConv2D, TI as GPGPUContext, D2 as GatherNd, A2 as GatherV2, sA as GraphModel, E2 as Greater, M2 as GreaterEqual, PS as History, F2 as IFFT, xx as Identity, R2 as Imag, Vt as InputSpec, L2 as IsFinite, $2 as IsInf, P2 as IsNan, dx as KernelBackend, H2 as LRN, wwe as LRNGrad, QT as LayerVariable, Jo as LayersModel, B2 as LeakyRelu, O2 as Less, z2 as LessEqual, G2 as LinSpace, W2 as Log, K2 as Log1p, vwe as LogSoftmax, V2 as LogicalAnd, U2 as LogicalNot, j2 as LogicalOr, hy as MathBackendCPU, Ry as MathBackendWebGL, q2 as Max, Y2 as MaxPool, Z2 as MaxPool3D, Cwe as MaxPool3DGrad, _we as MaxPoolGrad, J2 as MaxPoolWithArgmax, X2 as Maximum, Q2 as Mean, eM as Min, tM as Minimum, rM as MirrorPad, nM as Mod, nc as MomentumOptimizer, oM as Multinomial, sM as Multiply, aM as Neg, lM as NonMaxSuppressionV3, uM as NonMaxSuppressionV4, pM as NonMaxSuppressionV5, iM as NotEqual, zF as OP_SCOPE_SUFFIX, mM as OneHot, cM as OnesLike, ro as Optimizer, fM as Pack, dM as PadV2, Swe as Pool, hM as Pow, gM as Prelu, bM as Prod, oc as RMSPropOptimizer, _s as RNN, yM as Range, Rw as Rank, xM as Real, h2 as RealDiv, TM as Reciprocal, gr as Reduction, kM as Relu, _M as Relu6, IM as Reshape, wM as ResizeBilinear, Awe as ResizeBilinearGrad, vM as ResizeNearestNeighbor, Nwe as ResizeNearestNeighborGrad, CM as Reverse, pF as RotateWithOffset, SM as Round, NM as Rsqrt, tl as SGDOptimizer, AM as ScatterNd, DM as Select, EM as Selu, kd as Sequential, $M as Sigmoid, LM as Sign, FM as Sin, RM as Sinh, MM as Slice, WM as Softmax, PM as Softplus, zM as SpaceToBatchND, KM as SparseFillEmptyRows, VM as SparseReshape, UM as SparseSegmentMean, jM as SparseSegmentSum, HM as SparseToDense, GM as SplitV, BM as Sqrt, Dwe as Square, qM as SquaredDifference, uF as Step, XM as StridedSlice, YM as StringNGrams, ZM as StringSplit, JM as StringToHashBucketFast, QM as Sub, OM as Sum, jn as SymbolicTensor, eF as Tan, tF as Tanh, Yt as Tensor, Pp as TensorBuffer, Tx as Tile, rF as TopK, nF as Transform, oF as Transpose, sF as Unique, aF as Unpack, iF as UnsortedSegmentSum, Cu as Variable, lF as ZerosLike, vw as _FusedMatMul, un as abs, EY as acos, FY as acosh, Re as add, LY as addN, PY as all, OY as any, GY as argMax, KY as argMin, UY as asin, HY as asinh, XY as atan, ZY as atan2, QY as atanh, c_ as avgPool, u9 as avgPool3d, RAe as backend, t$ as backend_util, h9 as basicLSTMCell, Wp as batchNorm, x9 as batchNorm2d, k9 as batchNorm3d, v9 as batchNorm4d, m_ as batchToSpaceND, f_ as bincount, _je as booleanMaskAsync, Ch as broadcastTo, TR as browser, Ln as buffer, Bme as callbacks, ft as cast, S9 as ceil, A9 as clipByValue, Os as clone, ss as complex, Dr as concat, E9 as concat1d, F9 as concat2d, L9 as concat3d, P9 as concat4d, iz as constraints, z9 as conv1d, Kp as conv2d, K9 as conv2dTranspose, U9 as conv3d, q9 as conv3dTranspose, Pwe as copyRegisteredKernels, Y9 as cos, J9 as cosh, Zx as cosineWindow, eZ as cumsum, $n as customGrad, kA as data, rZ as denseBincount, wY as deprecationWarn, oZ as depthToSpace, Sh as depthwiseConv2d, zme as deregisterOp, PF as device_util, iZ as diag, uZ as dilation2d, kAe as disableDeprecationWarnings, $r as dispose, IAe as disposeVariables, ct as div, hZ as divNoNan, bZ as dot, PHe as dropout, xZ as einsum, g_ as elu, TAe as enableDebugMode, xAe as enableProdMode, uL as enclosingPowerOfTwo, vAe as engine, Ze as env, h_ as equal, IZ as erf, zs as exp, Nu as expandDims, CZ as expm1, b_ as eye, Eh as fft, Vp as fill, EAe as findBackend, MAe as findBackendFactory, y_ as floor, i_ as floorDiv, S4 as forceHalfFloat, gL as fused, x_ as gather, vHe as gatherND, IR as gather_util, AAe as getBackend, Cw as getGradient, bh as getKernel, kx as getKernelsForBackend, tU as gpgpu_util, XZ as grad, YZ as grads, qm as greater, T_ as greaterEqual, Qm as ifft, Ah as imag, iZe as image, VHe as inTopKAsync, Sz as initializers, HS as input, gR as io, H_ as irfft, LZ as isFinite, PZ as isInf, OZ as isNaN, zR as keep, r$ as kernel_impls, l3 as layers, k_ as leakyRelu, WZ as less, Dh as lessEqual, cZe as linalg, VZ as linspace, dfe as loadGraphModel, Zpe as loadLayersModel, jZ as localResponseNormalization, Au as log, I_ as log1p, rJ as logSigmoid, iJ as logSoftmax, C_ as logSumExp, Xm as logicalAnd, S_ as logicalNot, N_ as logicalOr, yJ as logicalXor, kZe as losses, gt as matMul, yR as math, Yi as max, A_ as maxPool, kJ as maxPool3d, vJ as maxPoolWithArgmax, D_ as maximum, Ym as mean, wAe as memory, CJ as meshgrid, u3 as metrics, Ux as min, E_ as minimum, DJ as mirrorPad, MJ as mod, Xpe as model, p3 as models, LJ as moments, Zje as movingAverage, fe as mul, PJ as multiRNNCell, OJ as multinomial, Ao as neg, zte as nextFrame, Yx as norm, M_ as notEqual, Lx as oneHot, Qi as ones, WJ as onesLike, E as op, VJ as outerProduct, el as pad, HJ as pad1d, XJ as pad2d, ZJ as pad3d, QJ as pad4d, oQ as pool, Du as pow, R_ as prelu, Qw as print, lQ as prod, _Ae as profile, pQ as rand, yQ as randomGamma, TQ as randomNormal, V_ as randomUniform, jp as range, NAe as ready, Jm as real, wQ as reciprocal, FAe as registerBackend, Jpe as registerCallbackConstructor, Rwe as registerGradient, a7 as registerKernel, Ome as registerOp, c3 as regularizers, Hp as relu, U_ as relu6, DAe as removeBackend, te as reshape, as as reverse, AQ as reverse1d, EQ as reverse2d, FQ as reverse3d, LQ as reverse4d, Mh as rfft, j_ as round, BQ as rsqrt, Je as scalar, aHe as scatterND, wR as scatter_util, zQ as selu, WQ as separableConv2d, Ype as sequential, LR as serialization, SAe as setBackend, LAe as setPlatform, Jve as setWasmPath, Qve as setWasmPaths, a0 as setWebGLContext, VQ as setdiff1dAsync, gW as shared, Xi as sigmoid, jQ as sign, H9e as signal, qQ as sin, YQ as sinh, kt as slice, JQ as slice1d, eee as slice2d, ree as slice3d, oee as slice4d, Bx as slice_util, aee as softmax, w_ as softplus, F_ as spaceToBatchND, CZe as sparse, gHe as sparseToDense, W9e as spectral, Eu as split, To as sqrt, pn as square, q_ as squaredDifference, Fh as squeeze, Mu as stack, X_ as step, yee as stridedSlice, DZe as string, We as sub, It as sum, k7 as sumOutType, Tee as tan, Wx as tanh, Vi as tensor, Pn as tensor1d, qp as tensor2d, n_ as tensor3d, kee as tensor4d, Iee as tensor5d, vee as tensor6d, $F as tensor_util, OR as test_util, mr as tidy, Nh as tile, CAe as time, _ee as topk, Ant as train, _h as transpose, See as truncatedNormal, Aee as unique, $we as unregisterGradient, Lwe as unregisterKernel, Eee as unsortedSegmentSum, Rh as unstack, Wm as upcastType, _F as util, ZZ as valueAndGrad, JZ as valueAndGrads, Fee as variable, v_ as variableGrads, XAn as version, hfe as version_converter, vY as version_core, qfe as version_cpu, tb as version_layers, ewe as version_wasm, zbe as version_webgl, bjr as webgl, eU as webgl_util, ai as where, Y_ as whereAsync, Ji as zeros, qr as zerosLike };
