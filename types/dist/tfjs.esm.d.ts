declare var Vs: string;
declare var Ni: string;
declare var Ti: string;
declare var xp: {
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
declare var yp: {
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
declare var bp: {
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
declare var wp: {
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
declare var Wn: string;
declare var So: string;
declare var Ei: string;
declare var Ai: string;
declare var Io: string;
declare var Xa: string;
declare var $i: string;
declare var Di: string;
declare var Ri: string;
declare var Oi: string;
declare var Fi: string;
declare var No: string;
declare var Ya: string;
declare var xc: string;
declare var gc: string;
declare var My: {
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
declare var To: string;
declare var Ws: string;
declare var yc: string;
declare var Zh: string;
declare var XI: string;
declare var mv: {
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
declare var C_: {
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
declare var Qn: string;
declare var Eo: string;
declare var eo: string;
declare var bc: string;
declare var Za: string;
declare var js: string;
declare var Ao: string;
declare var wc: string;
declare var $o: string;
declare var Ja: string;
declare var kc: string;
declare var _c: string;
declare var Do: string;
declare var Ro: string;
declare var Pi: string;
declare var Fo: string;
declare var I_: {
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
declare var Ka: {
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
declare var vc: string;
declare var Mi: string;
declare var Oo: string;
declare var Cc: string;
declare var Sc: string;
declare var Ic: string;
declare var Qa: string;
declare var Dm: string;
declare var $m: string;
declare var gw: any;
declare var fv: {
    new (e: any): {
        monitor: any;
        minDelta: number;
        patience: any;
        verbose: any;
        mode: any;
        baseline: any;
        monitorFunc: typeof fx;
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
declare var Nc: string;
declare var Mo: string;
declare var Tc: string;
declare var Yh: {
    new (e: any): {
        global: any;
        flags: {};
        flagRegistry: {};
        urlFlags: {};
        getQueryParams: typeof kj;
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
declare var zi: string;
declare var Li: string;
declare var Lo: string;
declare var Gs: string;
declare var Bi: string;
declare var Ec: string;
declare var el: string;
declare var Vi: string;
declare var zo: string;
declare var Bo: string;
declare var Rm: string;
declare var Vo: string;
declare var ni: string;
declare var oi: string;
declare var hy: {
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
declare var Wi: string;
declare var Us: string;
declare var jv: {
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
declare var ji: string;
declare var Wo: string;
declare var S_: {
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
declare var Ac: string;
declare var to: string;
declare var $c: string;
declare var _t: {
    new (e: any): {
        dtype: any;
        shape: any;
        ndim: any;
        maxNDim: any;
        minNDim: any;
        axes: any;
    };
};
declare var Gi: string;
declare var Ui: string;
declare var Hi: string;
declare var Ls: {
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
declare var tl: string;
declare var Rc: string;
declare var Yg: {
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
declare var Xn: {
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
declare var jo: string;
declare var qi: string;
declare var Ki: string;
declare var Dc: string;
declare var Go: string;
declare var Xi: string;
declare var YI: string;
declare var Yi: string;
declare var jl: string;
declare var Gl: string;
declare var Pu: {
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
declare var Hu: {
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
declare var Uo: string;
declare var qo: string;
declare var rl: string;
declare var Oc: string;
declare var Fc: string;
declare var Pc: string;
declare var Ho: string;
declare var Ko: string;
declare var Xo: string;
declare var Yo: string;
declare var Zo: string;
declare var Zi: string;
declare var kp: {
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
declare var Mc: string;
declare var Jo: string;
declare var Hs: string;
declare var Qi: string;
declare var ea: string;
declare var ta: string;
declare var Ji: string;
declare var S1: string;
declare var Qo: string;
declare var qs: string;
declare var Wr: {
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
declare var Ks: string;
declare var es: string;
declare var fse: string;
declare var ts: string;
declare var rs: string;
declare var ra: string;
declare var _p: {
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
declare var On: any;
declare var nl: string;
declare var Iw: any;
declare var Lc: string;
declare var Po: string;
declare var na: string;
declare var qt: any;
declare var ns: string;
declare var ss: string;
declare var Xs: string;
declare var os: string;
declare var Bc: string;
declare var ol: string;
declare var zc: string;
declare var is: string;
declare var ma: string;
declare var as: string;
declare var ls: string;
declare var dl: {
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
declare var oa: string;
declare var Ys: string;
declare var sa: string;
declare var $a: any;
declare var cs: string;
declare var aa: string;
declare var us: string;
declare var ia: string;
declare var Zs: string;
declare var fs: string;
declare var la: string;
declare var Js: string;
declare var Vc: string;
declare var Wc: string;
declare var jc: string;
declare var Gc: string;
declare var Uc: string;
declare var Qs: string;
declare var ps: string;
declare var sl: string;
declare var ds: string;
declare var ro: string;
declare var ua: string;
declare var Hc: string;
declare var qc: string;
declare var Kc: string;
declare var hs: string;
declare var ms: string;
declare var on: {
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
declare var gs: string;
declare var xs: string;
declare var je: {
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
declare var jn: string;
declare var ca: string;
declare var pa: string;
declare var ys: string;
declare var Xc: string;
declare var ei: string;
declare var il: string;
declare var ul: {
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
declare var ti: string;
declare var ri: string;
declare function Tt(...s: any[]): any;
declare namespace Tt {
    const name: string;
}
declare function tk(...s: any[]): any;
declare namespace tk { }
declare function rk(...s: any[]): any;
declare namespace rk { }
declare function Y(...s: any[]): any;
declare namespace Y { }
declare function nk(...s: any[]): any;
declare namespace nk { }
declare function Gm(...s: any[]): any;
declare namespace Gm { }
declare function lp(...s: any[]): any;
declare namespace lp { }
declare function ba(...s: any[]): any;
declare namespace ba { }
declare function ok(...s: any[]): any;
declare namespace ok { }
declare function sk(...s: any[]): any;
declare namespace sk { }
declare function ik(...s: any[]): any;
declare namespace ik { }
declare function ak(...s: any[]): any;
declare namespace ak { }
declare function lk(...s: any[]): any;
declare namespace lk { }
declare function uk(...s: any[]): any;
declare namespace uk { }
declare function nu(...s: any[]): any;
declare namespace nu { }
declare function Um(...s: any[]): any;
declare namespace Um { }
declare function kN(): any;
declare var S: {};
declare function b4(...s: any[]): any;
declare namespace b4 { }
declare function ai(...s: any[]): any;
declare namespace ai { }
declare function fk(...s: any[]): any;
declare namespace fk { }
declare function dk(...s: any[]): any;
declare namespace dk { }
declare function hk(...s: any[]): any;
declare namespace hk { }
declare function ou(...s: any[]): any;
declare namespace ou { }
declare function Hm(...s: any[]): any;
declare namespace Hm { }
declare function XIe(r: any, e: any, t: any): Promise<any>;
declare function gk(...s: any[]): any;
declare namespace gk { }
declare function su(...s: any[]): any;
declare namespace su { }
declare var cg: {};
declare function Se(r: any, e: string | undefined, t: any): {
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
declare function J(...s: any[]): any;
declare namespace J { }
declare function xk(...s: any[]): any;
declare namespace xk { }
declare function Sr(...s: any[]): any;
declare namespace Sr { }
declare function hn(...s: any[]): any;
declare namespace hn { }
declare function $n(...s: any[]): any;
declare namespace $n { }
declare function tt(...s: any[]): any;
declare namespace tt { }
declare function yk(...s: any[]): any;
declare namespace yk { }
declare function bk(...s: any[]): any;
declare namespace bk { }
declare function wk(...s: any[]): any;
declare namespace wk { }
declare function kk(...s: any[]): any;
declare namespace kk { }
declare var PE: {};
declare function qm(...s: any[]): any;
declare namespace qm { }
declare function Dn(...s: any[]): any;
declare namespace Dn { }
declare function Km(...s: any[]): any;
declare namespace Km { }
declare function Xm(...s: any[]): any;
declare namespace Xm { }
declare function _k(...s: any[]): any;
declare namespace _k { }
declare function wse(r: any, e: any): void;
declare function iu(...s: any[]): any;
declare namespace iu { }
declare function Ym(...s: any[]): any;
declare namespace Ym { }
declare function Tg(r: any, e: any, t: any): any;
declare function Zm(...s: any[]): any;
declare namespace Zm { }
declare function Qr(r: any): any;
declare var s0: {};
declare function vk(...s: any[]): any;
declare namespace vk { }
declare function ek(r: any): void;
declare function Ck(...s: any[]): any;
declare namespace Ck { }
declare function ka(...s: any[]): any;
declare namespace ka { }
declare function LX(r: any): void;
declare var Ql: {};
declare function K4(...s: any[]): any;
declare namespace K4 { }
declare function Sk(...s: any[]): any;
declare namespace Sk { }
declare function nue(): void;
declare function Ae(r: any): void;
declare function oue(): void;
declare function ue(...s: any[]): any;
declare namespace ue { }
declare function Ik(...s: any[]): any;
declare namespace Ik { }
declare function rU(...s: any[]): any;
declare namespace rU { }
declare function UN(...s: any[]): any;
declare namespace UN { }
declare function Nk(...s: any[]): any;
declare namespace Nk { }
declare function _a(...s: any[]): any;
declare namespace _a { }
declare function rue(): void;
declare function tue(): void;
declare function HN(r: any): number;
declare function ks(): any;
declare function j(): any;
declare function Dr(...s: any[]): any;
declare namespace Dr { }
declare function Tk(...s: any[]): any;
declare namespace Tk { }
declare function tr(...s: any[]): any;
declare namespace tr { }
declare function gr(...s: any[]): any;
declare namespace gr { }
declare function Ek(...s: any[]): any;
declare namespace Ek { }
declare function pp(...s: any[]): any;
declare namespace pp { }
declare function gu(...s: any[]): any;
declare namespace gu { }
declare function _s(r: any, e: any, t: any): any;
declare function cue(r: any): any;
declare function pue(r: any): any;
declare function va(...s: any[]): any;
declare namespace va { }
declare function jm(...s: any[]): any;
declare namespace jm { }
declare function BP(): void;
declare var lo: {};
declare function li(...s: any[]): any;
declare namespace li { }
declare function jN(...s: any[]): any;
declare namespace jN { }
declare var pg: {};
declare function lue(): any;
declare function bw(r: any): any;
declare function Om(r: any, e: any): any;
declare function Jh(r: any): any[];
declare var VO: {};
declare function NU(r: any): (e: any, t: any) => any;
declare function TU(r: any): (e: any, t: any) => any;
declare function Ht(...s: any[]): any;
declare namespace Ht { }
declare function Un(...s: any[]): any;
declare namespace Un { }
declare function fl(...s: any[]): any;
declare namespace fl { }
declare function au(...s: any[]): any;
declare namespace au { }
declare namespace bn {
    export { QN as flipLeftRight };
    export { eT as grayscaleToRGB };
    export { pT as resizeNearestNeighbor };
    export { cT as resizeBilinear };
    export { tT as rotateWithOffset };
    export { JN as cropAndResize };
    export { rT as nonMaxSuppression };
    export { sT as nonMaxSuppressionAsync };
    export { iT as nonMaxSuppressionWithScore };
    export { aT as nonMaxSuppressionWithScoreAsync };
    export { lT as nonMaxSuppressionPadded };
    export { uT as nonMaxSuppressionPaddedAsync };
    export { mT as threshold };
    export { fT as transform };
}
declare function sNe(r: any, e: any, t?: number): Promise<any>;
declare var rA: {};
declare function O_(r: any): any;
declare var $r: {};
declare function ff(...s: any[]): any;
declare namespace ff { }
declare function xU(...s: any[]): any;
declare namespace xU { }
declare function bU(...s: any[]): any;
declare namespace bU { }
declare function Ak(...s: any[]): any;
declare namespace Ak { }
declare function Dt(r: any): any;
declare var Mr: {};
declare var MA: {};
declare function lu(...s: any[]): any;
declare namespace lu { }
declare function Jm(...s: any[]): any;
declare namespace Jm { }
declare function Hn(...s: any[]): any;
declare namespace Hn { }
declare namespace RT {
    export { dT as bandPart };
    export { hT as gramSchmidt };
    export { xT as qr };
}
declare function $k(r: any, e: any, t: any): any;
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
declare function Dk(...s: any[]): any;
declare namespace Dk { }
declare function Ir(...s: any[]): any;
declare namespace Ir { }
declare function uu(...s: any[]): any;
declare namespace uu { }
declare function FU(...s: any[]): any;
declare namespace FU { }
declare function Qm(...s: any[]): any;
declare namespace Qm { }
declare function Pk(...s: any[]): any;
declare namespace Pk { }
declare function Fr(...s: any[]): any;
declare namespace Fr { }
declare function cu(...s: any[]): any;
declare namespace cu { }
declare function tf(...s: any[]): any;
declare namespace tf { }
declare function HU(...s: any[]): any;
declare namespace HU { }
declare namespace tFe {
    export { yT as absoluteDifference };
    export { Pr as computeWeightedLoss };
    export { bT as cosineDistance };
    export { wT as hingeLoss };
    export { kT as huberLoss };
    export { _T as logLoss };
    export { vT as meanSquaredError };
    export { CT as sigmoidCrossEntropy };
    export { ST as softmaxCrossEntropy };
}
declare function Me(...s: any[]): any;
declare namespace Me { }
declare var oN: {};
declare function Vr(...s: any[]): any;
declare namespace Vr { }
declare function pu(...s: any[]): any;
declare namespace pu { }
declare function rf(...s: any[]): any;
declare namespace rf { }
declare function Mk(...s: any[]): any;
declare namespace Mk { }
declare function Rn(...s: any[]): any;
declare namespace Rn { }
declare function Ct(...s: any[]): any;
declare namespace Ct { }
declare function Wm(): any;
declare function JU(r: any, e: any, { indexing: t }?: {
    indexing?: string | undefined;
}): any[];
declare var LA: {};
declare function mp(...s: any[]): any;
declare namespace mp { }
declare function Ca(...s: any[]): any;
declare namespace Ca { }
declare function Lk(...s: any[]): any;
declare namespace Lk { }
declare function zk(...s: any[]): any;
declare namespace zk { }
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
declare var zA: {};
declare function fp(...s: any[]): any;
declare namespace fp { }
declare function k1e(...s: any[]): any;
declare namespace k1e { }
declare function F(...s: any[]): any;
declare namespace F { }
declare function iH(...s: any[]): any;
declare namespace iH { }
declare function Bk(...s: any[]): any;
declare namespace Bk { }
declare function Ke(...s: any[]): any;
declare namespace Ke { }
declare function xf(): Promise<any>;
declare function Ig(...s: any[]): any;
declare namespace Ig { }
declare function ci(...s: any[]): any;
declare namespace ci { }
declare function xa(...s: any[]): any;
declare namespace xa { }
declare function rr(r: any, e?: string): any;
declare function xr(...s: any[]): any;
declare namespace xr { }
declare function I(r: any): {
    (...s: any[]): any;
    readonly name: string;
};
declare function pH(...s: any[]): any;
declare namespace pH { }
declare function xn(...s: any[]): any;
declare namespace xn { }
declare function dH(...s: any[]): any;
declare namespace dH { }
declare function gH(...s: any[]): any;
declare namespace gH { }
declare function yH(...s: any[]): any;
declare namespace yH { }
declare function wH(...s: any[]): any;
declare namespace wH { }
declare function SH(...s: any[]): any;
declare namespace SH { }
declare function yn(...s: any[]): any;
declare namespace yn { }
declare function fu(...s: any[]): any;
declare namespace fu { }
declare function Gw(r: any, e?: boolean): void;
declare function nf(...s: any[]): any;
declare namespace nf { }
declare function sue(r: any): any;
declare function AH(...s: any[]): any;
declare namespace AH { }
declare function LH(...s: any[]): any;
declare namespace LH { }
declare function _g(...s: any[]): any;
declare namespace _g { }
declare function vs(...s: any[]): any;
declare namespace vs { }
declare function Sa(r: any, e: any, t?: number, n?: string): any;
declare function aue(): any;
declare function ml(...s: any[]): any;
declare namespace ml { }
declare function Zk(...s: any[]): any;
declare namespace Zk { }
declare function ap(r: any, e: any, t?: number): any;
declare function X5(r: any, e: any): void;
declare function ZI(r: any): void;
declare function Ul(r: any): void;
declare function MX(r: any, e: any): void;
declare var BA: {};
declare function Or(...s: any[]): any;
declare namespace Or { }
declare function of(...s: any[]): any;
declare namespace of { }
declare function uue(r: any): void;
declare function O(...s: any[]): any;
declare namespace O { }
declare function lr(...s: any[]): any;
declare namespace lr { }
declare function qH(...s: any[]): any;
declare namespace qH { }
declare function XH(...s: any[]): any;
declare namespace XH { }
declare function ZH(...s: any[]): any;
declare namespace ZH { }
declare function QH(...s: any[]): any;
declare namespace QH { }
declare function xu(...s: any[]): any;
declare namespace xu { }
declare function sf(...s: any[]): any;
declare namespace sf { }
declare function af(...s: any[]): any;
declare namespace af { }
declare function ce(r: any, e: any): any;
declare function VN(...s: any[]): any;
declare namespace VN { }
declare var fg: {};
declare function lf(...s: any[]): any;
declare namespace lf { }
declare function Jk(...s: any[]): any;
declare namespace Jk { }
declare function q5(r: any): any;
declare var ee: {};
declare function VG(r: any): any;
declare function mue(r: any, e: any): void;
declare function Hoe(r: any, e?: boolean): void;
declare function qoe(r: any, e?: boolean): void;
declare function W0(r: any, e: any): void;
declare function Qk(r: any, e: any): Promise<any[]>;
declare var Yx: {};
declare function Jr(...s: any[]): any;
declare namespace Jr { }
declare function e_(...s: any[]): any;
declare namespace e_ { }
declare namespace TRe {
    export { YN as hammingWindow };
    export { $g as hannWindow };
    export { Dg as frame };
    export { ZN as stft };
}
declare function uf(...s: any[]): any;
declare namespace uf { }
declare function cf(...s: any[]): any;
declare namespace cf { }
declare function Oe(...s: any[]): any;
declare namespace Oe { }
declare function pf(...s: any[]): any;
declare namespace pf { }
declare function vg(...s: any[]): any;
declare namespace vg { }
declare function mf(...s: any[]): any;
declare namespace mf { }
declare function hp(...s: any[]): any;
declare namespace hp { }
declare var ar: {};
declare function hu(...s: any[]): any;
declare namespace hu { }
declare function ui(...s: any[]): any;
declare namespace ui { }
declare function mu(...s: any[]): any;
declare namespace mu { }
declare namespace gf {
    export { IT as sparseFillEmptyRows };
    export { NT as sparseReshape };
    export { TT as sparseSegmentMean };
    export { ET as sparseSegmentSum };
}
declare function Ng(...s: any[]): any;
declare namespace Ng { }
declare namespace vRe {
    export { gu as fft };
    export { fl as ifft };
    export { xu as rfft };
    export { ff as irfft };
}
declare function mr(...s: any[]): any;
declare namespace mr { }
declare function St(...s: any[]): any;
declare namespace St { }
declare function We(...s: any[]): any;
declare namespace We { }
declare function df(...s: any[]): any;
declare namespace df { }
declare function en(...s: any[]): any;
declare namespace en { }
declare function nr(...s: any[]): any;
declare namespace nr { }
declare function Ia(...s: any[]): any;
declare namespace Ia { }
declare function t_(...s: any[]): any;
declare namespace t_ { }
declare namespace Pg {
    export { AT as stringNGrams };
    export { $T as stringSplit };
    export { DT as stringToHashBucketFast };
}
declare function le(...s: any[]): any;
declare namespace le { }
declare function me(...s: any[]): any;
declare namespace me { }
declare function Zl(r: any): any;
declare function r_(...s: any[]): any;
declare namespace r_ { }
declare function wa(...s: any[]): any;
declare namespace wa { }
declare function vr(r: any, e: any, t: any): any;
declare function At(r: any, e: any): any;
declare function pi(r: any, e: any, t: any): any;
declare function Kw(r: any, e: any, t: any): any;
declare function Sq(r: any, e: any, t: any): any;
declare function Iq(r: any, e: any, t: any): any;
declare function Nq(r: any, e: any, t: any): any;
declare var io: {};
declare var wN: {};
declare function z(r: any, e: any): any;
declare function Rr(...s: any[]): any;
declare namespace Rr { }
declare function iue(r: any): any;
declare function n_(...s: any[]): any;
declare namespace n_ { }
declare namespace vu {
    import sgd = Na.sgd;
    export { sgd };
    import momentum = Na.momentum;
    export { momentum };
    import adadelta = Na.adadelta;
    export { adadelta };
    import adagrad = Na.adagrad;
    export { adagrad };
    import rmsprop = Na.rmsprop;
    export { rmsprop };
    import adamax = Na.adamax;
    export { adamax };
    import adam = Na.adam;
    export { adam };
}
declare function Ve(...s: any[]): any;
declare namespace Ve { }
declare function yu(...s: any[]): any;
declare namespace yu { }
declare function Cg(...s: any[]): any;
declare namespace Cg { }
declare function bse(r: any): void;
declare function yse(r: any, e: any): void;
declare function o_(...s: any[]): any;
declare namespace o_ { }
declare function Nr(...s: any[]): any;
declare namespace Nr { }
declare function pr(r: any, e: any): any;
declare var b: {};
declare function EU(r: any): (e: any, t: any) => {
    grad: any;
    value: any;
};
declare function AU(r: any): (e: any, t: any) => any;
declare function s_(r: any, e: boolean | undefined, t: any, n: any): any;
declare function yg(r: any, e: any): {
    value: any;
    grads: {};
};
declare var FWt: {
    tfjs: string;
    "tfjs-core": string;
    "tfjs-data": string;
    "tfjs-layers": string;
    "tfjs-converter": string;
    "tfjs-backend-cpu": string;
    "tfjs-backend-webgl": string;
    "tfjs-backend-wasm": string;
};
declare var f7: string;
declare var BG: string;
declare var q7: string;
declare var Vf: string;
declare var Koe: string;
declare var PJ: string;
declare namespace Cwt {
    export { BP as forceHalfFloat };
}
declare var $O: {};
declare function Et(...s: any[]): any;
declare namespace Et { }
declare function hf(r: any): Promise<any>;
declare function ht(r: any, e?: string): any;
declare function Ie(...s: any[]): any;
declare namespace Ie { }
declare function fx(r: any, e: any): boolean;
declare function kj(r: any): {};
declare function OX(r: any): {
    monitor: any;
    minDelta: number;
    patience: any;
    verbose: any;
    mode: any;
    baseline: any;
    monitorFunc: typeof fx;
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
declare function QN(...s: any[]): any;
declare namespace QN { }
declare function eT(...s: any[]): any;
declare namespace eT { }
declare function pT(...s: any[]): any;
declare namespace pT { }
declare function cT(...s: any[]): any;
declare namespace cT { }
declare function tT(...s: any[]): any;
declare namespace tT { }
declare function JN(...s: any[]): any;
declare namespace JN { }
declare function rT(...s: any[]): any;
declare namespace rT { }
declare function sT(r: any, e: any, t: any, n?: number, o?: number): Promise<any>;
declare function iT(...s: any[]): any;
declare namespace iT { }
declare function aT(r: any, e: any, t: any, n?: number, o?: number, s?: number): Promise<{
    selectedIndices: any;
    selectedScores: any;
}>;
declare function lT(...s: any[]): any;
declare namespace lT { }
declare function uT(r: any, e: any, t: any, n?: number, o?: number, s?: boolean): Promise<{
    selectedIndices: any;
    validOutputs: any;
}>;
declare function mT(...s: any[]): any;
declare namespace mT { }
declare function fT(...s: any[]): any;
declare namespace fT { }
declare function dT(...s: any[]): any;
declare namespace dT { }
declare function hT(...s: any[]): any;
declare namespace hT { }
declare function xT(...s: any[]): any;
declare namespace xT { }
declare function yT(...s: any[]): any;
declare namespace yT { }
declare function Pr(...s: any[]): any;
declare namespace Pr { }
declare function bT(...s: any[]): any;
declare namespace bT { }
declare function wT(...s: any[]): any;
declare namespace wT { }
declare function kT(...s: any[]): any;
declare namespace kT { }
declare function _T(...s: any[]): any;
declare namespace _T { }
declare function vT(...s: any[]): any;
declare namespace vT { }
declare function CT(...s: any[]): any;
declare namespace CT { }
declare function ST(...s: any[]): any;
declare namespace ST { }
declare function YN(...s: any[]): any;
declare namespace YN { }
declare function $g(...s: any[]): any;
declare namespace $g { }
declare function Dg(...s: any[]): any;
declare namespace Dg { }
declare function ZN(...s: any[]): any;
declare namespace ZN { }
declare function IT(...s: any[]): any;
declare namespace IT { }
declare function NT(...s: any[]): any;
declare namespace NT { }
declare function TT(...s: any[]): any;
declare namespace TT { }
declare function ET(...s: any[]): any;
declare namespace ET { }
declare function AT(...s: any[]): any;
declare namespace AT { }
declare function $T(...s: any[]): any;
declare namespace $T { }
declare function DT(...s: any[]): any;
declare namespace DT { }
declare var Na: {
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
export { Vs as Abs, Ni as Acos, Ti as Acosh, xp as AdadeltaOptimizer, yp as AdagradOptimizer, bp as AdamOptimizer, wp as AdamaxOptimizer, Wn as Add, So as AddN, Ei as All, Ai as Any, Io as ArgMax, Xa as ArgMin, $i as Asin, Di as Asinh, Ri as Atan, Oi as Atan2, Fi as Atanh, No as AvgPool, Ya as AvgPool3D, xc as AvgPool3DGrad, gc as AvgPoolGrad, My as BackendWasm, To as BatchMatMul, Ws as BatchToSpaceND, yc as Bincount, Zh as BroadcastArgs, XI as BroadcastTo, mv as Callback, C_ as CallbackList, Qn as Cast, Eo as Ceil, eo as ClipByValue, bc as Complex, Za as ComplexAbs, js as Concat, Ao as Conv2D, wc as Conv2DBackpropFilter, $o as Conv2DBackpropInput, Ja as Conv3D, kc as Conv3DBackpropFilterV2, _c as Conv3DBackpropInputV2, Do as Cos, Ro as Cosh, Pi as CropAndResize, Fo as Cumsum, I_ as CustomCallback, Ka as DataStorage, vc as DenseBincount, Mi as DepthToSpace, Oo as DepthwiseConv2dNative, Cc as DepthwiseConv2dNativeBackpropFilter, Sc as DepthwiseConv2dNativeBackpropInput, Ic as Diag, Qa as Dilation2D, Dm as Dilation2DBackpropFilter, $m as Dilation2DBackpropInput, gw as ENV, fv as EarlyStopping, Nc as Einsum, Mo as Elu, Tc as EluGrad, Yh as Environment, zi as Equal, Li as Erf, Lo as Exp, Gs as ExpandDims, Bi as Expm1, Ec as FFT, el as Fill, Vi as FlipLeftRight, zo as Floor, Bo as FloorDiv, Rm as FromPixels, Vo as FusedBatchNorm, ni as FusedConv2D, oi as FusedDepthwiseConv2D, hy as GPGPUContext, Wi as GatherNd, Us as GatherV2, jv as GraphModel, ji as Greater, Wo as GreaterEqual, S_ as History, Ac as IFFT, to as Identity, $c as Imag, _t as InputSpec, Gi as IsFinite, Ui as IsInf, Hi as IsNan, Ls as KernelBackend, tl as LRN, Rc as LRNGrad, Yg as LayerVariable, Xn as LayersModel, jo as LeakyRelu, qi as Less, Ki as LessEqual, Dc as LinSpace, Go as Log, Xi as Log1p, YI as LogSoftmax, Yi as LogicalAnd, jl as LogicalNot, Gl as LogicalOr, Pu as MathBackendCPU, Hu as MathBackendWebGL, Uo as Max, qo as MaxPool, rl as MaxPool3D, Oc as MaxPool3DGrad, Fc as MaxPoolGrad, Pc as MaxPoolWithArgmax, Ho as Maximum, Ko as Mean, Xo as Min, Yo as Minimum, Zo as MirrorPad, Zi as Mod, kp as MomentumOptimizer, Mc as Multinomial, Jo as Multiply, Hs as Neg, Qi as NonMaxSuppressionV3, ea as NonMaxSuppressionV4, ta as NonMaxSuppressionV5, Ji as NotEqual, S1 as OP_SCOPE_SUFFIX, Qo as OneHot, qs as OnesLike, Wr as Optimizer, Ks as Pack, es as PadV2, fse as Pool, ts as Pow, rs as Prelu, ra as Prod, _p as RMSPropOptimizer, On as RNN, nl as Range, Iw as Rank, Lc as Real, Po as RealDiv, na as Reciprocal, qt as Reduction, ns as Relu, ss as Relu6, Xs as Reshape, os as ResizeBilinear, Bc as ResizeBilinearGrad, ol as ResizeNearestNeighbor, zc as ResizeNearestNeighborGrad, is as Reverse, ma as RotateWithOffset, as as Round, ls as Rsqrt, dl as SGDOptimizer, oa as ScatterNd, Ys as Select, sa as Selu, $a as Sequential, cs as Sigmoid, aa as Sign, us as Sin, ia as Sinh, Zs as Slice, fs as Softmax, la as Softplus, Js as SpaceToBatchND, Vc as SparseFillEmptyRows, Wc as SparseReshape, jc as SparseSegmentMean, Gc as SparseSegmentSum, Uc as SparseToDense, Qs as SplitV, ps as Sqrt, sl as Square, ds as SquaredDifference, ro as Step, ua as StridedSlice, Hc as StringNGrams, qc as StringSplit, Kc as StringToHashBucketFast, hs as Sub, ms as Sum, on as SymbolicTensor, gs as Tan, xs as Tanh, je as Tensor, ct as TensorBuffer, jn as Tile, ca as TopK, pa as Transform, ys as Transpose, Xc as Unique, ei as Unpack, il as UnsortedSegmentSum, ul as Variable, ti as ZerosLike, ri as _FusedMatMul, Tt as abs, tk as acos, rk as acosh, Y as add, nk as addN, Gm as all, lp as any, ba as argMax, ok as argMin, sk as asin, ik as asinh, ak as atan, lk as atan2, uk as atanh, nu as avgPool, Um as avgPool3d, kN as backend, S as backend_util, b4 as basicLSTMCell, ai as batchNorm, fk as batchNorm2d, dk as batchNorm3d, hk as batchNorm4d, ou as batchToSpaceND, Hm as bincount, XIe as booleanMaskAsync, gk as broadcastArgs, su as broadcastTo, cg as browser, Se as buffer, PX as callbacks, J as cast, xk as ceil, Sr as clipByValue, hn as clone, $n as complex, tt as concat, yk as concat1d, bk as concat2d, wk as concat3d, kk as concat4d, PE as constraints, qm as conv1d, Dn as conv2d, Km as conv2dTranspose, Xm as conv3d, _k as conv3dTranspose, wse as copyRegisteredKernels, iu as cos, Ym as cosh, Tg as cosineWindow, Zm as cumsum, Qr as customGrad, s0 as data, vk as denseBincount, ek as deprecationWarn, Ck as depthToSpace, ka as depthwiseConv2d, LX as deregisterOp, Ql as device_util, K4 as diag, Sk as dilation2d, nue as disableDeprecationWarnings, Ae as dispose, oue as disposeVariables, ue as div, Ik as divNoNan, rU as dot, UN as dropout, Nk as einsum, _a as elu, rue as enableDebugMode, tue as enableProdMode, HN as enclosingPowerOfTwo, ks as engine, j as env, Dr as equal, Tk as erf, tr as exp, gr as expandDims, Ek as expm1, pp as eye, gu as fft, _s as fill, cue as findBackend, pue as findBackendFactory, va as floor, jm as floorDiv, BP as forceHalfFloat, lo as fused, li as gather, jN as gatherND, pg as gather_util, lue as getBackend, bw as getGradient, Om as getKernel, Jh as getKernelsForBackend, VO as gpgpu_util, NU as grad, TU as grads, Ht as greater, Un as greaterEqual, fl as ifft, au as imag, bn as image, sNe as inTopKAsync, rA as initializers, O_ as input, $r as io, ff as irfft, xU as isFinite, bU as isInf, Ak as isNaN, Dt as keep, Mr as kernel_impls, MA as layers, lu as leakyRelu, Jm as less, Hn as lessEqual, RT as linalg, $k as linspace, m7 as loadGraphModel, K5 as loadLayersModel, Dk as localResponseNormalization, Ir as log, uu as log1p, FU as logSigmoid, Qm as logSoftmax, Pk as logSumExp, Fr as logicalAnd, cu as logicalNot, tf as logicalOr, HU as logicalXor, tFe as losses, Me as matMul, oN as math, Vr as max, pu as maxPool, rf as maxPool3d, Mk as maxPoolWithArgmax, Rn as maximum, Ct as mean, Wm as memory, JU as meshgrid, LA as metrics, mp as min, Ca as minimum, Lk as mirrorPad, zk as mod, H5 as model, zA as models, fp as moments, k1e as movingAverage, F as mul, iH as multiRNNCell, Bk as multinomial, Ke as neg, xf as nextFrame, Ig as norm, ci as notEqual, xa as oneHot, rr as ones, xr as onesLike, I as op, pH as outerProduct, xn as pad, dH as pad1d, gH as pad2d, yH as pad3d, wH as pad4d, SH as pool, yn as pow, fu as prelu, Gw as print, nf as prod, sue as profile, AH as rand, LH as randomGamma, _g as randomNormal, vs as randomUniform, Sa as range, aue as ready, ml as real, Zk as reciprocal, ap as registerBackend, X5 as registerCallbackConstructor, ZI as registerGradient, Ul as registerKernel, MX as registerOp, BA as regularizers, Or as relu, of as relu6, uue as removeBackend, O as reshape, lr as reverse, qH as reverse1d, XH as reverse2d, ZH as reverse3d, QH as reverse4d, xu as rfft, sf as round, af as rsqrt, ce as scalar, VN as scatterND, fg as scatter_util, lf as selu, Jk as separableConv2d, q5 as sequential, ee as serialization, VG as setBackend, mue as setPlatform, Hoe as setWasmPath, qoe as setWasmPaths, W0 as setWebGLContext, Qk as setdiff1dAsync, Yx as shared, Jr as sigmoid, e_ as sign, TRe as signal, uf as sin, cf as sinh, Oe as slice, pf as slice1d, vg as slice2d, mf as slice3d, hp as slice4d, ar as slice_util, hu as softmax, ui as softplus, mu as spaceToBatchND, gf as sparse, Ng as sparseToDense, vRe as spectral, mr as split, St as sqrt, We as square, df as squaredDifference, en as squeeze, nr as stack, Ia as step, t_ as stridedSlice, Pg as string, le as sub, me as sum, Zl as sumOutType, r_ as tan, wa as tanh, vr as tensor, At as tensor1d, pi as tensor2d, Kw as tensor3d, Sq as tensor4d, Iq as tensor5d, Nq as tensor6d, io as tensor_util, wN as test_util, z as tidy, Rr as tile, iue as time, n_ as topk, vu as train, Ve as transpose, yu as truncatedNormal, Cg as unique, bse as unregisterGradient, yse as unregisterKernel, o_ as unsortedSegmentSum, Nr as unstack, pr as upcastType, b as util, EU as valueAndGrad, AU as valueAndGrads, s_ as variable, yg as variableGrads, FWt as version, f7 as version_converter, BG as version_core, q7 as version_cpu, Vf as version_layers, Koe as version_wasm, PJ as version_webgl, Cwt as webgl, $O as webgl_util, Et as where, hf as whereAsync, ht as zeros, Ie as zerosLike };
