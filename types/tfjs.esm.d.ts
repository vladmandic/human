
import { backend_util } from './tfjs-core';
import { BackendTimingInfo } from './tfjs-core';
import { BackendValues } from './tfjs-core';
import { DataId as DataId_2 } from './tfjs-core';
import { DataStorage } from './tfjs-core';
import { DataToGPUWebGLOption } from './tfjs-core';
import { DataType } from './tfjs-core';
import { DataTypeFor } from './tfjs-core';
import { DataTypeMap } from './tfjs-core';
import { GPUData } from './tfjs-core';
import { InferenceModel } from './tfjs-core';
import { io } from './tfjs-core';
import { KernelBackend } from './tfjs-core';
import { MemoryInfo } from './tfjs-core';
import { ModelPredictConfig } from './tfjs-core';
import { NamedAttrMap } from './tfjs-core';
import { NamedTensorMap } from './tfjs-core';
import { NumericDataType } from './tfjs-core';
import { Optimizer } from './tfjs-core';
import { PixelData } from './tfjs-core';
import { Rank } from './tfjs-core';
import { Scalar } from './tfjs-core';
import { serialization } from './tfjs-core';
import { Tensor } from './tfjs-core';
import { Tensor2D } from './tfjs-core';
import { Tensor3D } from './tfjs-core';
import { Tensor4D } from './tfjs-core';
import { TensorBuffer } from './tfjs-core';
import { TensorInfo as TensorInfo_2 } from './tfjs-core';
import * as tfc from './tfjs-core';
import { TimingInfo } from './tfjs-core';
import { TypedArray } from './tfjs-core';
import { WebGLData } from './tfjs-core';
import { WebGPUData } from './tfjs-core';

/**
 * Base class for Activations.
 *
 * Special note: due to cross-language compatibility reasons, the
 * static readonly className field in this family of classes must be set to
 * the initialLowerCamelCase name of the activation.
 */
declare abstract class Activation extends serialization.Serializable {
    abstract apply(tensor: Tensor, axis?: number): Tensor;
    getConfig(): serialization.ConfigDict;
}

/**
 * Applies an activation function to an output.
 *
 * This layer applies element-wise activation function.  Other layers, notably
 * `dense` can also apply activation functions.  Use this isolated activation
 * function to extract the values before and after the
 * activation. For instance:
 *
 * ```js
 * const input = tf.input({shape: [5]});
 * const denseLayer = tf.layers.dense({units: 1});
 * const activationLayer = tf.layers.activation({activation: 'relu6'});
 *
 * // Obtain the output symbolic tensors by applying the layers in order.
 * const denseOutput = denseLayer.apply(input);
 * const activationOutput = activationLayer.apply(denseOutput);
 *
 * // Create the model based on the inputs.
 * const model = tf.model({
 *     inputs: input,
 *     outputs: [denseOutput, activationOutput]
 * });
 *
 * // Collect both outputs and print separately.
 * const [denseOut, activationOut] = model.predict(tf.randomNormal([6, 5]));
 * denseOut.print();
 * activationOut.print();
 * ```
 *
 * @doc {heading: 'Layers', subheading: 'Basic', namespace: 'layers'}
 */
declare function activation(args: ActivationLayerArgs): Activation_2;

declare class Activation_2 extends Layer {
    /** @nocollapse */
    static className: string;
    activation: Activation;
    constructor(args: ActivationLayerArgs);
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}

/** @docinline */
declare type ActivationIdentifier = 'elu' | 'hardSigmoid' | 'linear' | 'relu' | 'relu6' | 'selu' | 'sigmoid' | 'softmax' | 'softplus' | 'softsign' | 'tanh' | 'swish' | 'mish';

declare interface ActivationLayerArgs extends LayerArgs {
    /**
     * Name of the activation function to use.
     */
    activation: ActivationIdentifier;
}

declare type AdadeltaOptimizerConfig = {
    learning_rate: number;
    rho: number;
    epsilon: number;
};

declare type AdadeltaSerialization = BaseSerialization<'Adadelta', AdadeltaOptimizerConfig>;

declare type AdagradOptimizerConfig = {
    learning_rate: number;
    initial_accumulator_value?: number;
};

declare type AdagradSerialization = BaseSerialization<'Adagrad', AdagradOptimizerConfig>;

declare type AdamaxOptimizerConfig = {
    learning_rate: number;
    beta1: number;
    beta2: number;
    epsilon?: number;
    decay?: number;
};

declare type AdamaxSerialization = BaseSerialization<'Adamax', AdamaxOptimizerConfig>;

declare type AdamOptimizerConfig = {
    learning_rate: number;
    beta1: number;
    beta2: number;
    epsilon?: number;
};

declare type AdamSerialization = BaseSerialization<'Adam', AdamOptimizerConfig>;

/**
 * @license
 * Copyright 2022 Google LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
declare class AdapterInfo {
    private vendor;
    private architecture;
    intelGPUGeneration: number;
    constructor(adapterInfo: GPUAdapterInfo);
    private getIntelGPUGeneration;
    isIntel(): boolean;
}

declare class Add extends Merge {
    /** @nocollapse */
    static className: string;
    constructor(args?: LayerArgs);
    protected mergeFunction(inputs: Tensor[]): Tensor;
}

/**
 * Layer that performs element-wise addition on an `Array` of inputs.
 *
 * It takes as input a list of tensors, all of the same shape, and returns a
 * single tensor (also of the same shape). The inputs are specified as an
 * `Array` when the `apply` method of the `Add` layer instance is called. For
 * example:
 *
 * ```js
 * const input1 = tf.input({shape: [2, 2]});
 * const input2 = tf.input({shape: [2, 2]});
 * const addLayer = tf.layers.add();
 * const sum = addLayer.apply([input1, input2]);
 * console.log(JSON.stringify(sum.shape));
 * // You get [null, 2, 2], with the first dimension as the undetermined batch
 * // dimension.
 * ```
 *
 * @doc {heading: 'Layers', subheading: 'Merge', namespace: 'layers'}
 */
declare function add(args?: LayerArgs): Add;

declare const addImpl: SimpleBinaryKernelImpl;

/**
 * Applies Alpha Dropout to the input.
 *
 * As it is a regularization layer, it is only active at training time.
 *
 * Alpha Dropout is a `Dropout` that keeps mean and variance of inputs
 * to their original values, in order to ensure the self-normalizing property
 * even after this dropout.
 * Alpha Dropout fits well to Scaled Exponential Linear Units
 * by randomly setting activations to the negative saturation value.
 *
 * Arguments:
 *   - `rate`: float, drop probability (as with `Dropout`).
 *     The multiplicative noise will have
 *     standard deviation `sqrt(rate / (1 - rate))`.
 *   - `noise_shape`: A 1-D `Tensor` of type `int32`, representing the
 *     shape for randomly generated keep/drop flags.
 *
 * Input shape:
 *   Arbitrary. Use the keyword argument `inputShape`
 *   (tuple of integers, does not include the samples axis)
 *   when using this layer as the first layer in a model.
 *
 * Output shape:
 *   Same shape as input.
 *
 * References:
 *   - [Self-Normalizing Neural Networks](https://arxiv.org/abs/1706.02515)
 */
declare class AlphaDropout extends Layer {
    /** @nocollapse */
    static className: string;
    readonly rate: number;
    readonly noiseShape: Shape;
    constructor(args: AlphaDropoutArgs);
    _getNoiseShape(inputs: Tensor | Tensor[]): any;
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getConfig(): {
        rate: number;
    };
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
}

/**
 * Applies Alpha Dropout to the input.
 *
 * As it is a regularization layer, it is only active at training time.
 *
 * Alpha Dropout is a `Dropout` that keeps mean and variance of inputs
 * to their original values, in order to ensure the self-normalizing property
 * even after this dropout.
 * Alpha Dropout fits well to Scaled Exponential Linear Units
 * by randomly setting activations to the negative saturation value.
 *
 * Arguments:
 *   - `rate`: float, drop probability (as with `Dropout`).
 *     The multiplicative noise will have
 *     standard deviation `sqrt(rate / (1 - rate))`.
 *   - `noise_shape`: A 1-D `Tensor` of type `int32`, representing the
 *     shape for randomly generated keep/drop flags.
 *
 * Input shape:
 *   Arbitrary. Use the keyword argument `inputShape`
 *   (tuple of integers, does not include the samples axis)
 *   when using this layer as the first layer in a model.
 *
 * Output shape:
 *   Same shape as input.
 *
 * References:
 *   - [Self-Normalizing Neural Networks](https://arxiv.org/abs/1706.02515)
 *
 * @doc {heading: 'Layers', subheading: 'Noise', namespace: 'layers'}
 */
declare function alphaDropout(args: AlphaDropoutArgs): AlphaDropout;

declare interface AlphaDropoutArgs extends LayerArgs {
    /** drop probability.  */
    rate: number;
    /**
     * A 1-D `Tensor` of type `int32`, representing the
     * shape for randomly generated keep/drop flags.
     */
    noiseShape?: Shape;
}

declare function assertNotComplex(tensor: TensorInfo_2 | TensorInfo_2[], opName: string): void;

declare function assertNotComplex_2(tensor: TensorInfo_2 | TensorInfo_2[], opName: string): void;

declare namespace AttrValue {
    /** Properties of a ListValue. */
    interface IListValue {
        /** ListValue s */
        s?: (string[] | null);
        /** ListValue i */
        i?: ((number | string)[] | null);
        /** ListValue f */
        f?: (number[] | null);
        /** ListValue b */
        b?: (boolean[] | null);
        /** ListValue type */
        type?: (DataType_2[] | null);
        /** ListValue shape */
        shape?: (ITensorShape[] | null);
        /** ListValue tensor */
        tensor?: (ITensor[] | null);
        /** ListValue func */
        func?: (INameAttrList[] | null);
    }
}

declare class Average extends Merge {
    /** @nocollapse */
    static className: string;
    constructor(args?: LayerArgs);
    protected mergeFunction(inputs: Tensor[]): Tensor;
}

/**
 * Layer that performs element-wise averaging on an `Array` of inputs.
 *
 * It takes as input a list of tensors, all of the same shape, and returns a
 * single tensor (also of the same shape). For example:
 *
 * ```js
 * const input1 = tf.input({shape: [2, 2]});
 * const input2 = tf.input({shape: [2, 2]});
 * const averageLayer = tf.layers.average();
 * const average = averageLayer.apply([input1, input2]);
 * console.log(JSON.stringify(average.shape));
 * // You get [null, 2, 2], with the first dimension as the undetermined batch
 * // dimension.
 * ```
 *
 * @doc {heading: 'Layers', subheading: 'Merge', namespace: 'layers'}
 */
declare function average(args?: LayerArgs): Average;

declare class AveragePooling1D extends Pooling1D {
    /** @nocollapse */
    static className: string;
    constructor(args: Pooling1DLayerArgs);
    protected poolingFunction(inputs: Tensor, poolSize: [number, number], strides: [number, number], padding: PaddingMode, dataFormat: DataFormat): Tensor;
}

/**
 * Average pooling operation for spatial data.
 *
 * Input shape: `[batchSize, inLength, channels]`
 *
 * Output shape: `[batchSize, pooledLength, channels]`
 *
 * `tf.avgPool1d` is an alias.
 *
 * @doc {heading: 'Layers', subheading: 'Pooling', namespace: 'layers'}
 */
declare function averagePooling1d(args: Pooling1DLayerArgs): AveragePooling1D;

declare class AveragePooling2D extends Pooling2D {
    /** @nocollapse */
    static className: string;
    constructor(args: Pooling2DLayerArgs);
    protected poolingFunction(inputs: Tensor, poolSize: [number, number], strides: [number, number], padding: PaddingMode, dataFormat: DataFormat): Tensor;
}

/**
 * Average pooling operation for spatial data.
 *
 * Input shape:
 *  - If `dataFormat === CHANNEL_LAST`:
 *      4D tensor with shape:
 *      `[batchSize, rows, cols, channels]`
 *  - If `dataFormat === CHANNEL_FIRST`:
 *      4D tensor with shape:
 *      `[batchSize, channels, rows, cols]`
 *
 * Output shape
 *  - If `dataFormat === CHANNEL_LAST`:
 *      4D tensor with shape:
 *      `[batchSize, pooledRows, pooledCols, channels]`
 *  - If `dataFormat === CHANNEL_FIRST`:
 *      4D tensor with shape:
 *      `[batchSize, channels, pooledRows, pooledCols]`
 *
 * `tf.avgPool2d` is an alias.
 *
 * @doc {heading: 'Layers', subheading: 'Pooling', namespace: 'layers'}
 */
declare function averagePooling2d(args: Pooling2DLayerArgs): AveragePooling2D;

declare class AveragePooling3D extends Pooling3D {
    /** @nocollapse */
    static className: string;
    constructor(args: Pooling3DLayerArgs);
    protected poolingFunction(inputs: Tensor, poolSize: [number, number, number], strides: [number, number, number], padding: PaddingMode, dataFormat: DataFormat): Tensor;
}

/**
 * Average pooling operation for 3D data.
 *
 * Input shape
 *   - If `dataFormat === channelsLast`:
 *       5D tensor with shape:
 *       `[batchSize, depths, rows, cols, channels]`
 *   - If `dataFormat === channelsFirst`:
 *      4D tensor with shape:
 *       `[batchSize, channels, depths, rows, cols]`
 *
 * Output shape
 *   - If `dataFormat=channelsLast`:
 *       5D tensor with shape:
 *       `[batchSize, pooledDepths, pooledRows, pooledCols, channels]`
 *   - If `dataFormat=channelsFirst`:
 *       5D tensor with shape:
 *       `[batchSize, channels, pooledDepths, pooledRows, pooledCols]`
 *
 * @doc {heading: 'Layers', subheading: 'Pooling', namespace: 'layers'}
 */
declare function averagePooling3d(args: Pooling3DLayerArgs): AveragePooling3D;

declare function avgPool1d(args: Pooling1DLayerArgs): AveragePooling1D;

declare function avgPool2d(args: Pooling2DLayerArgs): AveragePooling2D;

declare function avgPool3d(args: Pooling3DLayerArgs): AveragePooling3D;

declare function avgPooling1d(args: Pooling1DLayerArgs): AveragePooling1D;

declare function avgPooling2d(args: Pooling2DLayerArgs): AveragePooling2D;

declare function avgPooling3d(args: Pooling3DLayerArgs): AveragePooling3D;

export declare class BackendWasm extends KernelBackend {
    wasm: BackendWasmModule | BackendWasmThreadedSimdModule;
    private dataIdNextNumber;
    dataIdMap: DataStorage<TensorData_2>;
    constructor(wasm: BackendWasmModule | BackendWasmThreadedSimdModule);
    write(values: backend_util.BackendValues | null, shape: number[], dtype: DataType): DataId_3;
    numDataIds(): number;
    time(f: () => void): Promise<BackendTimingInfo>;
    move(dataId: DataId_3, values: backend_util.BackendValues | null, shape: number[], dtype: DataType, refCount: number): void;
    read(dataId: DataId_3): Promise<backend_util.BackendValues>;
    readSync(dataId: DataId_3, start?: number, end?: number): backend_util.BackendValues;
    /**
     * Dispose the memory if the dataId has 0 refCount. Return true if the memory
     * is released, false otherwise.
     * @param dataId
     * @oaram force Optional, remove the data regardless of refCount
     */
    disposeData(dataId: DataId_3, force?: boolean): boolean;
    /** Return refCount of a `TensorData`. */
    refCount(dataId: DataId_3): number;
    incRef(dataId: DataId_3): void;
    floatPrecision(): 32;
    getMemoryOffset(dataId: DataId_3): number;
    dispose(): void;
    memory(): {
        unreliable: boolean;
    };
    /**
     * Make a tensor info for the output of an op. If `memoryOffset` is not
     * present, this method allocates memory on the WASM heap. If `memoryOffset`
     * is present, the memory was allocated elsewhere (in c++) and we just record
     * the pointer where that memory lives.
     */
    makeOutput(shape: number[], dtype: DataType, memoryOffset?: number, values?: backend_util.BackendValues): TensorInfo_2;
    typedArrayFromHeap({ shape, dtype, dataId }: TensorInfo_2): backend_util.TypedArray;
}

/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

declare interface BackendWasmModule extends EmscriptenModule {
    // Using the tfjs namespace to avoid conflict with emscripten's API.
    tfjs: {
        init(): void,
        initWithThreadsCount(threadsCount: number): void,
        getThreadsCount(): number,
        registerTensor(id: number, size: number, memoryOffset: number): void,
        // Disposes the data behind the data bucket.
        disposeData(id: number): void,
        // Disposes the backend and all of its associated data.
        dispose(): void,
    }
}

declare interface BackendWasmThreadedSimdModule extends BackendWasmModule {
    PThread: {
        // Terminates all webworkers
        terminateAllThreads(): void,
    };
}

/**
 * Abstract base class used to build new callbacks.
 *
 * The `logs` dictionary that callback methods take as argument will contain
 * keys for quantities relevant to the current batch or epoch.
 *
 * Currently, the `.fit()` method of the `Sequential` model class
 * will include the following quantities in the `logs` that
 * it passes to its callbacks:
 *
 * onEpochEnd: Logs include `acc` and `loss`, and optionally include `valLoss`
 *   (if validation is enabled in `fit`), and `valAcc` (if validation and
 *   accuracy monitoring are enabled).
 * onBatchBegin: Logs include `size`, the number of samples in the current
 *   batch.
 * onBatchEnd: Logs include `loss`, and optionally `acc` (if accuracy monitoring
 *   is enabled).
 */
declare abstract class BaseCallback {
    validationData: Tensor | Tensor[];
    /**
     * Training parameters (eg. verbosity, batch size, number of epochs...).
     */
    params: Params;
    setParams(params: Params): void;
    onEpochBegin(epoch: number, logs?: UnresolvedLogs): Promise<void>;
    onEpochEnd(epoch: number, logs?: UnresolvedLogs): Promise<void>;
    onBatchBegin(batch: number, logs?: UnresolvedLogs): Promise<void>;
    onBatchEnd(batch: number, logs?: UnresolvedLogs): Promise<void>;
    onTrainBegin(logs?: UnresolvedLogs): Promise<void>;
    onTrainEnd(logs?: UnresolvedLogs): Promise<void>;
    setModel(model: Container): void;
}

declare type BaseCallbackConstructor = {
    new (): BaseCallback;
};

/**
 * Abstract convolution layer.
 */
declare abstract class BaseConv extends Layer {
    protected readonly rank: number;
    protected readonly kernelSize: number[];
    protected readonly strides: number[];
    protected readonly padding: PaddingMode;
    protected readonly dataFormat: DataFormat;
    protected readonly activation: Activation;
    protected readonly useBias: boolean;
    protected readonly dilationRate: number[];
    protected readonly biasInitializer?: Initializer;
    protected readonly biasConstraint?: Constraint;
    protected readonly biasRegularizer?: Regularizer;
    protected bias: LayerVariable;
    readonly DEFAULT_KERNEL_INITIALIZER: InitializerIdentifier;
    readonly DEFAULT_BIAS_INITIALIZER: InitializerIdentifier;
    constructor(rank: number, args: BaseConvLayerArgs);
    protected static verifyArgs(args: BaseConvLayerArgs): void;
    getConfig(): serialization.ConfigDict;
}

/**
 * Base LayerConfig for depthwise and non-depthwise convolutional layers.
 */
declare interface BaseConvLayerArgs extends LayerArgs {
    /**
     * The dimensions of the convolution window. If kernelSize is a number, the
     * convolutional window will be square.
     */
    kernelSize: number | number[];
    /**
     * The strides of the convolution in each dimension. If strides is a number,
     * strides in both dimensions are equal.
     *
     * Specifying any stride value != 1 is incompatible with specifying any
     * `dilationRate` value != 1.
     */
    strides?: number | number[];
    /**
     * Padding mode.
     */
    padding?: PaddingMode;
    /**
     * Format of the data, which determines the ordering of the dimensions in
     * the inputs.
     *
     * `channels_last` corresponds to inputs with shape
     *   `(batch, ..., channels)`
     *
     *  `channels_first` corresponds to inputs with shape `(batch, channels,
     * ...)`.
     *
     * Defaults to `channels_last`.
     */
    dataFormat?: DataFormat;
    /**
     * The dilation rate to use for the dilated convolution in each dimension.
     * Should be an integer or array of two or three integers.
     *
     * Currently, specifying any `dilationRate` value != 1 is incompatible with
     * specifying any `strides` value != 1.
     */
    dilationRate?: number | [number] | [number, number] | [number, number, number];
    /**
     * Activation function of the layer.
     *
     * If you don't specify the activation, none is applied.
     */
    activation?: ActivationIdentifier;
    /**
     * Whether the layer uses a bias vector. Defaults to `true`.
     */
    useBias?: boolean;
    /**
     * Initializer for the convolutional kernel weights matrix.
     */
    kernelInitializer?: InitializerIdentifier | Initializer;
    /**
     * Initializer for the bias vector.
     */
    biasInitializer?: InitializerIdentifier | Initializer;
    /**
     * Constraint for the convolutional kernel weights.
     */
    kernelConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Constraint for the bias vector.
     */
    biasConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Regularizer function applied to the kernel weights matrix.
     */
    kernelRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Regularizer function applied to the bias vector.
     */
    biasRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Regularizer function applied to the activation.
     */
    activityRegularizer?: RegularizerIdentifier | Regularizer;
}

declare abstract class BaseRandomLayer extends Layer {
    /** @nocollapse */
    static className: string;
    protected randomGenerator: RandomSeed;
    constructor(args: BaseRandomLayerArgs);
    getConfig(): serialization.ConfigDict;
}

declare interface BaseRandomLayerArgs extends LayerArgs {
    seed?: number;
}

declare interface BaseRNNLayerArgs extends LayerArgs {
    /**
     * A RNN cell instance. A RNN cell is a class that has:
     *   - a `call()` method, which takes `[Tensor, Tensor]` as the
     *     first input argument. The first item is the input at time t, and
     *     second item is the cell state at time t.
     *     The `call()` method returns `[outputAtT, statesAtTPlus1]`.
     *     The `call()` method of the cell can also take the argument `constants`,
     *     see section "Note on passing external constants" below.
     *     Porting Node: PyKeras overrides the `call()` signature of RNN cells,
     *       which are Layer subtypes, to accept two arguments. tfjs-layers does
     *       not do such overriding. Instead we preseve the `call()` signature,
     *       which due to its `Tensor|Tensor[]` argument and return value is
     *       flexible enough to handle the inputs and states.
     *   - a `stateSize` attribute. This can be a single integer (single state)
     *     in which case it is the size of the recurrent state (which should be
     *     the same as the size of the cell output). This can also be an Array of
     *     integers (one size per state). In this case, the first entry
     *     (`stateSize[0]`) should be the same as the size of the cell output.
     * It is also possible for `cell` to be a list of RNN cell instances, in which
     * case the cells get stacked on after the other in the RNN, implementing an
     * efficient stacked RNN.
     */
    cell?: RNNCell | RNNCell[];
    /**
     * Whether to return the last output in the output sequence, or the full
     * sequence.
     */
    returnSequences?: boolean;
    /**
     * Whether to return the last state in addition to the output.
     */
    returnState?: boolean;
    /**
     * If `true`, process the input sequence backwards and return the reversed
     * sequence (default: `false`).
     */
    goBackwards?: boolean;
    /**
     * If `true`, the last state for each sample at index i in a batch will be
     * used as initial state of the sample of index i in the following batch
     * (default: `false`).
     *
     * You can set RNN layers to be "stateful", which means that the states
     * computed for the samples in one batch will be reused as initial states
     * for the samples in the next batch. This assumes a one-to-one mapping
     * between samples in different successive batches.
     *
     * To enable "statefulness":
     *   - specify `stateful: true` in the layer constructor.
     *   - specify a fixed batch size for your model, by passing
     *     - if sequential model:
     *       `batchInputShape: [...]` to the first layer in your model.
     *     - else for functional model with 1 or more Input layers:
     *       `batchShape: [...]` to all the first layers in your model.
     *     This is the expected shape of your inputs
     *     *including the batch size*.
     *     It should be a tuple of integers, e.g., `[32, 10, 100]`.
     *   - specify `shuffle: false` when calling `LayersModel.fit()`.
     *
     * To reset the state of your model, call `resetStates()` on either the
     * specific layer or on the entire model.
     */
    stateful?: boolean;
    /**
     * If `true`, the network will be unrolled, else a symbolic loop will be
     * used. Unrolling can speed up a RNN, although it tends to be more
     * memory-intensive. Unrolling is only suitable for short sequences (default:
     * `false`).
     * Porting Note: tfjs-layers has an imperative backend. RNNs are executed with
     *   normal TypeScript control flow. Hence this property is inapplicable and
     *   ignored in tfjs-layers.
     */
    unroll?: boolean;
    /**
     * Dimensionality of the input (integer).
     *   This option (or alternatively, the option `inputShape`) is required when
     *   this layer is used as the first layer in a model.
     */
    inputDim?: number;
    /**
     * Length of the input sequences, to be specified when it is constant.
     * This argument is required if you are going to connect `Flatten` then
     * `Dense` layers upstream (without it, the shape of the dense outputs cannot
     * be computed). Note that if the recurrent layer is not the first layer in
     * your model, you would need to specify the input length at the level of the
     * first layer (e.g., via the `inputShape` option).
     */
    inputLength?: number;
}

/**
 * A Keras JSON entry representing a Keras object such as a Layer.
 *
 * The Keras JSON convention is to provide the `class_name` (e.g., the layer
 * type) at the top level, and then to place the class-specific configuration in
 * a `config` subtree.  These class-specific configurations are provided by
 * subtypes of `PyJsonDict`.  Thus, this `*Serialization` has a type parameter
 * giving the specific type of the wrapped `PyJsonDict`.
 */
declare interface BaseSerialization<N extends string, T extends PyJson<Extract<keyof T, string>>> extends PyJsonDict {
    class_name: N;
    config: T;
}

declare class BatchNormalization extends Layer {
    /** @nocollapse */
    static className: string;
    private readonly axis;
    private readonly momentum;
    private readonly epsilon;
    private readonly center;
    private readonly scale;
    private readonly betaInitializer;
    private readonly gammaInitializer;
    private readonly movingMeanInitializer;
    private readonly movingVarianceInitializer;
    private readonly betaConstraint;
    private readonly gammaConstraint;
    private readonly betaRegularizer;
    private readonly gammaRegularizer;
    private gamma;
    private beta;
    private movingMean;
    private movingVariance;
    constructor(args?: BatchNormalizationLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}

/**
 * Batch normalization layer (Ioffe and Szegedy, 2014).
 *
 * Normalize the activations of the previous layer at each batch,
 * i.e. applies a transformation that maintains the mean activation
 * close to 0 and the activation standard deviation close to 1.
 *
 * Input shape:
 *   Arbitrary. Use the keyword argument `inputShape` (Array of integers, does
 *   not include the sample axis) when calling the constructor of this class,
 *   if this layer is used as a first layer in a model.
 *
 * Output shape:
 *   Same shape as input.
 *
 * References:
 *   - [Batch Normalization: Accelerating Deep Network Training by Reducing
 * Internal Covariate Shift](https://arxiv.org/abs/1502.03167)
 *
 * @doc {heading: 'Layers', subheading: 'Normalization', namespace: 'layers'}
 */
declare function batchNormalization(args?: BatchNormalizationLayerArgs): BatchNormalization;

declare interface BatchNormalizationLayerArgs extends LayerArgs {
    /**
     * The integer axis that should be normalized (typically the features axis).
     * Defaults to -1.
     *
     * For instance, after a `Conv2D` layer with `data_format="channels_first"`,
     * set `axis=1` in `batchNormalization`.
     */
    axis?: number;
    /**
     * Momentum of the moving average. Defaults to 0.99.
     */
    momentum?: number;
    /**
     * Small float added to the variance to avoid dividing by zero. Defaults to
     * 1e-3.
     */
    epsilon?: number;
    /**
     * If `true`, add offset of `beta` to normalized tensor.
     * If `false`, `beta` is ignored.
     * Defaults to `true`.
     */
    center?: boolean;
    /**
     * If `true`, multiply by `gamma`.
     * If `false`, `gamma` is not used.
     * When the next layer is linear (also e.g. `nn.relu`),
     * this can be disabled since the scaling will be done by the next layer.
     * Defaults to `true`.
     */
    scale?: boolean;
    /**
     * Initializer for the beta weight.
     *  Defaults to 'zeros'.
     */
    betaInitializer?: InitializerIdentifier | Initializer;
    /**
     * Initializer for the gamma weight.
     *  Defaults to `ones`.
     */
    gammaInitializer?: InitializerIdentifier | Initializer;
    /**
     * Initializer for the moving mean.
     * Defaults to `zeros`
     */
    movingMeanInitializer?: InitializerIdentifier | Initializer;
    /**
     * Initializer for the moving variance.
     *  Defaults to 'Ones'.
     */
    movingVarianceInitializer?: InitializerIdentifier | Initializer;
    /**
     * Constraint for the beta weight.
     */
    betaConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Constraint for gamma weight.
     */
    gammaConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Regularizer for the beta weight.
     */
    betaRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Regularizer for the gamma weight.
     */
    gammaRegularizer?: RegularizerIdentifier | Regularizer;
}

declare class Bidirectional extends Wrapper {
    /** @nocollapse */
    static className: string;
    mergeMode: BidirectionalMergeMode;
    private forwardLayer;
    private backwardLayer;
    private returnSequences;
    private returnState;
    private numConstants?;
    private _trainable;
    constructor(args: BidirectionalLayerArgs);
    get trainable(): boolean;
    set trainable(value: boolean);
    getWeights(): Tensor[];
    setWeights(weights: Tensor[]): void;
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    apply(inputs: Tensor | Tensor[] | SymbolicTensor | SymbolicTensor[], kwargs?: Kwargs): Tensor | Tensor[] | SymbolicTensor | SymbolicTensor[];
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    resetStates(states?: Tensor | Tensor[]): void;
    build(inputShape: Shape | Shape[]): void;
    computeMask(inputs: Tensor | Tensor[], mask?: Tensor | Tensor[]): Tensor | Tensor[];
    get trainableWeights(): LayerVariable[];
    get nonTrainableWeights(): LayerVariable[];
    setFastWeightInitDuringBuild(value: boolean): void;
    getConfig(): serialization.ConfigDict;
    /** @nocollapse */
    static fromConfig<T extends serialization.Serializable>(cls: serialization.SerializableConstructor<T>, config: serialization.ConfigDict): T;
}

/** @doc {heading: 'Layers', subheading: 'Wrapper', namespace: 'layers'} */
declare function bidirectional(args: BidirectionalLayerArgs): Bidirectional;

declare interface BidirectionalLayerArgs extends WrapperLayerArgs {
    /**
     * The instance of an `RNN` layer to be wrapped.
     */
    layer: RNN;
    /**
     * Mode by which outputs of the forward and backward RNNs are
     * combined. If `null` or `undefined`, the output will not be
     * combined, they will be returned as an `Array`.
     *
     * If `undefined` (i.e., not provided), defaults to `'concat'`.
     */
    mergeMode?: BidirectionalMergeMode;
}

/** @docinline */
declare type BidirectionalMergeMode = 'sum' | 'mul' | 'concat' | 'ave';

/**
 * Binary accuracy metric function.
 *
 * `yTrue` and `yPred` can have 0-1 values. Example:
 * ```js
 * const x = tf.tensor2d([[1, 1, 1, 1], [0, 0, 0, 0]], [2, 4]);
 * const y = tf.tensor2d([[1, 0, 1, 0], [0, 0, 0, 1]], [2, 4]);
 * const accuracy = tf.metrics.binaryAccuracy(x, y);
 * accuracy.print();
 * ```
 *
 * `yTrue` and `yPred` can also have floating-number values between 0 and 1, in
 * which case the values will be thresholded at 0.5 to yield 0-1 values (i.e.,
 * a value >= 0.5 and <= 1.0 is interpreted as 1).
 *
 * Example:
 * ```js
 * const x = tf.tensor1d([1, 1, 1, 1, 0, 0, 0, 0]);
 * const y = tf.tensor1d([0.2, 0.4, 0.6, 0.8, 0.2, 0.3, 0.4, 0.7]);
 * const accuracy = tf.metrics.binaryAccuracy(x, y);
 * accuracy.print();
 * ```
 *
 * @param yTrue Binary Tensor of truth.
 * @param yPred Binary Tensor of prediction.
 * @return Accuracy Tensor.
 *
 * @doc {heading: 'Metrics', namespace: 'metrics'}
 */
declare function binaryAccuracy(yTrue: Tensor, yPred: Tensor): Tensor;

/**
 * Binary crossentropy metric function.
 *
 * Example:
 * ```js
 * const x = tf.tensor2d([[0], [1], [1], [1]]);
 * const y = tf.tensor2d([[0], [0], [0.5], [1]]);
 * const crossentropy = tf.metrics.binaryCrossentropy(x, y);
 * crossentropy.print();
 * ```
 *
 * @param yTrue Binary Tensor of truth.
 * @param yPred Binary Tensor of prediction, probabilities for the `1` case.
 * @return Accuracy Tensor.
 *
 * @doc {heading: 'Metrics', namespace: 'metrics'}
 */
declare function binaryCrossentropy(yTrue: Tensor, yPred: Tensor): Tensor;

declare function bincountImpl(xVals: TypedArray, weightsVals: TypedArray, weightsDtype: DataType, weightsShape: number[], size: number): TypedArray;

declare function bincountReduceImpl<R extends Rank>(xBuf: TensorBuffer<R>, weightsBuf: TensorBuffer<R>, size: number, binaryOutput?: boolean): TensorBuffer<R>;

declare function bindCanvasToFramebuffer(gl: WebGLRenderingContext): void;

declare function bindColorTextureToFramebuffer(gl: WebGLRenderingContext, texture: WebGLTexture, framebuffer: WebGLFramebuffer): void;

declare function bindTextureToProgramUniformSampler(gl: WebGLRenderingContext, texture: WebGLTexture, uniformSamplerLocation: WebGLUniformLocation, textureUnit: number): void;

declare function bindTextureUnit(gl: WebGLRenderingContext, texture: WebGLTexture, textureUnit: number): void;

declare function bindVertexBufferToProgramAttribute(gl: WebGLRenderingContext, program: WebGLProgram, attribute: string, buffer: WebGLBuffer, arrayEntriesPerItem: number, itemStrideInBytes: number, itemOffsetInBytes: number): boolean;

declare function bindVertexProgramAttributeStreams(gl: WebGLRenderingContext, program: WebGLProgram, vertexBuffer: WebGLBuffer): boolean;

declare const bitwiseAndImpl: SimpleBinaryKernelImpl;

/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
declare class BufferManager {
    private device;
    private numUsedBuffers;
    private numFreeBuffers;
    private freeBuffers;
    private usedBuffers;
    numBytesUsed: number;
    numBytesAllocated: number;
    constructor(device: GPUDevice);
    acquireBuffer(size: number, usage: GPUBufferUsageFlags, mappedAtCreation?: boolean, reuse?: boolean): any;
    releaseBuffer(buffer: GPUBuffer, reuse?: boolean): void;
    getNumUsedBuffers(): number;
    getNumFreeBuffers(): number;
    dispose(): void;
}

declare function callAndCheck<T>(gl: WebGLRenderingContext, func: () => T): T;

export declare abstract class Callback extends BaseCallback {
    /** Instance of `keras.models.Model`. Reference of the model being trained. */
    model: LayersModel;
    setModel(model: Container): void;
}

/**
 * Container abstracting a list of callbacks.
 */
export declare class CallbackList {
    callbacks: BaseCallback[];
    queueLength: number;
    /**
     * Constructor of CallbackList.
     * @param callbacks Array of `Callback` instances.
     * @param queueLength Queue length for keeping running statistics over
     *   callback execution time.
     */
    constructor(callbacks?: BaseCallback[], queueLength?: number);
    append(callback: BaseCallback): void;
    setParams(params: Params): void;
    setModel(model: Container): void;
    /**
     * Called at the start of an epoch.
     * @param epoch Index of epoch.
     * @param logs Dictionary of logs.
     */
    onEpochBegin(epoch: number, logs?: UnresolvedLogs): Promise<void>;
    /**
     * Called at the end of an epoch.
     * @param epoch Index of epoch.
     * @param logs Dictionary of logs.
     */
    onEpochEnd(epoch: number, logs?: UnresolvedLogs): Promise<void>;
    /**
     * Called  right before processing a batch.
     * @param batch Index of batch within the current epoch.
     * @param logs Dictionary of logs.
     */
    onBatchBegin(batch: number, logs?: UnresolvedLogs): Promise<void>;
    /**
     * Called at the end of a batch.
     * @param batch Index of batch within the current epoch.
     * @param logs Dictionary of logs.
     */
    onBatchEnd(batch: number, logs?: UnresolvedLogs): Promise<void>;
    /**
     * Called at the beginning of training.
     * @param logs Dictionary of logs.
     */
    onTrainBegin(logs?: UnresolvedLogs): Promise<void>;
    /**
     * Called at the end of training.
     * @param logs Dictionary of logs.
     */
    onTrainEnd(logs?: UnresolvedLogs): Promise<void>;
}

export declare const callbacks: {
    earlyStopping: typeof earlyStopping;
};

declare type CallHook = (inputs: Tensor | Tensor[], kwargs: Kwargs) => void;

declare function canBeRepresented(num: number): boolean;

declare function castImpl(values: TypedArray, shape: number[], inputType: DataType, dtype: DataType): [number[], DataType, TypedArray];

/**
 * Categorical accuracy metric function.
 *
 * Example:
 * ```js
 * const x = tf.tensor2d([[0, 0, 0, 1], [0, 0, 0, 1]]);
 * const y = tf.tensor2d([[0.1, 0.8, 0.05, 0.05], [0.1, 0.05, 0.05, 0.8]]);
 * const accuracy = tf.metrics.categoricalAccuracy(x, y);
 * accuracy.print();
 * ```
 *
 * @param yTrue Binary Tensor of truth: one-hot encoding of categories.
 * @param yPred Binary Tensor of prediction: probabilities or logits for the
 *   same categories as in `yTrue`.
 * @return Accuracy Tensor.
 *
 * @doc {heading: 'Metrics', namespace: 'metrics'}
 */
declare function categoricalAccuracy(yTrue: Tensor, yPred: Tensor): Tensor;

/**
 * Categorical crossentropy between an output tensor and a target tensor.
 *
 * @param target A tensor of the same shape as `output`.
 * @param output A tensor resulting from a softmax (unless `fromLogits` is
 *  `true`, in which case `output` is expected to be the logits).
 * @param fromLogits Boolean, whether `output` is the result of a softmax, or is
 *   a tensor of logits.
 *
 * @doc {heading: 'Metrics', namespace: 'metrics'}
 */
declare function categoricalCrossentropy(yTrue: Tensor, yPred: Tensor): Tensor;

declare class CategoryEncoding extends Layer {
    /** @nocollapse */
    static className: string;
    private readonly numTokens;
    private readonly outputMode;
    constructor(args: CategoryEncodingArgs);
    getConfig(): serialization.ConfigDict;
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor[] | Tensor;
}

/**
 * A preprocessing layer which encodes integer features.
 *
 * This layer provides options for condensing data into a categorical encoding
 * when the total number of tokens are known in advance. It accepts integer
 * values as inputs, and it outputs a dense representation of those
 * inputs.
 *
 * Arguments:
 *
 * numTokens: The total number of tokens the layer should support. All
 *  inputs to the layer must integers in the range `0 <= value <
 *  numTokens`, or an error will be thrown.
 *
 * outputMode: Specification for the output of the layer.
 *  Defaults to `multiHot`. Values can be `oneHot`, `multiHot` or
 *  `count`, configuring the layer as follows:
 *
 *    oneHot: Encodes each individual element in the input into an
 *      array of `numTokens` size, containing a 1 at the element index. If
 *      the last dimension is size 1, will encode on that dimension. If the
 *      last dimension is not size 1, will append a new dimension for the
 *      encoded output.
 *
 *    multiHot: Encodes each sample in the input into a single array
 *     of `numTokens` size, containing a 1 for each vocabulary term
 *     present in the sample. Treats the last dimension as the sample
 *     dimension, if input shape is `(..., sampleLength)`, output shape
 *     will be `(..., numTokens)`.
 *
 *    count: Like `multiHot`, but the int array contains a count of
 *     the number of times the token at that index appeared in the sample.
 *
 *  For all output modes, currently only output up to rank 2 is supported.
 *   Call arguments:
 *    inputs: A 1D or 2D tensor of integer inputs.
 *    countWeights: A tensor in the same shape as `inputs` indicating the
 *    weight for each sample value when summing up in `count` mode. Not used
 *    in `multiHot` or `oneHot` modes.
 *
 *
 * @doc {heading: 'Layers', subheading: 'CategoryEncoding', namespace: 'layers'}
 */
declare function categoryEncoding(args: CategoryEncodingArgs): CategoryEncoding;

declare interface CategoryEncodingArgs extends LayerArgs {
    numTokens: number;
    outputMode?: OutputMode;
}

declare const ceilImpl: SimpleUnaryImpl<number, number>;

declare class CenterCrop extends Layer {
    /** @nocollapse */
    static className: string;
    private readonly height;
    private readonly width;
    constructor(args: CenterCropArgs);
    centerCrop(inputs: Tensor3D | Tensor4D, hBuffer: number, wBuffer: number, height: number, width: number, inputHeight: number, inputWidth: number, dtype: DataType): Tensor | Tensor[];
    upsize(inputs: Tensor3D | Tensor4D, height: number, width: number, dtype: DataType): Tensor | Tensor[];
    call(inputs: Tensor3D | Tensor4D, kwargs: Kwargs): Tensor[] | Tensor;
    getConfig(): serialization.ConfigDict;
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
}

/**
 *  A preprocessing layer which center crops images.
 *
 *   This layers crops the central portion of the images to a target size. If an
 *   image is smaller than the target size, it will be resized and cropped so as
 *   to return the largest possible window in the image that matches the target
 *   aspect ratio.
 *
 *   Input pixel values can be of any range (e.g. `[0., 1.)` or `[0, 255]`) and
 *   of integer or floating point dtype.
 *
 *   If the input height/width is even and the target height/width is odd (or
 *   inversely), the input image is left-padded by 1 pixel.
 *
 *   Arguments:
 *     `height`: Integer, the height of the output shape.
 *     `width`: Integer, the width of the output shape.
 *
 *   Input shape:
 *     3D (unbatched) or 4D (batched) tensor with shape:
 *     `(..., height, width, channels)`, in `channelsLast` format.
 *
 *   Output shape:
 *     3D (unbatched) or 4D (batched) tensor with shape:
 *     `(..., targetHeight, targetWidth, channels)`.
 *
 *
 *  @doc {heading: 'Layers', subheading: 'CenterCrop', namespace: 'layers'}
 */
declare function centerCrop(args?: CenterCropArgs): CenterCrop;

declare interface CenterCropArgs extends LayerArgs {
    height: number;
    width: number;
}

/**
 * For multi-class classification problems, this object is designed to store a
 * mapping from class index to the "weight" of the class, where higher weighted
 * classes have larger impact on loss, accuracy, and other metrics.
 *
 * This is useful for cases in which you want the model to "pay more attention"
 * to examples from an under-represented class, e.g., in unbalanced datasets.
 */
export declare type ClassWeight = {
    [classIndex: number]: number;
};

/**
 * Class weighting for a model with multiple outputs.
 *
 * This object maps each output name to a class-weighting object.
 */
export declare type ClassWeightMap = {
    [outputName: string]: ClassWeight;
};

declare const compileProgram: (device: GPUDevice, program: WebGPUProgram, inputsData: InputInfo[], output: TensorInfo_2, parallelCompilation: boolean) => GPUComputePipeline | Promise<GPUComputePipeline>;

declare type ComplexBinaryKernelImpl = (aShape: number[], bShape: number[], aRealVals: Float32Array, aImagVals: Float32Array, bRealVals: Float32Array, bImagVals: Float32Array) => [TypedArray, TypedArray, number[]];

declare function computeDispatch(layout: {
    x: number[];
    y?: number[];
    z?: number[];
}, outputShape: number[], workgroupSize?: [number, number, number], elementsPerThread?: [number, number, number]): [number, number, number];

declare function computeWorkgroupInfoForMatMul(dimAOuter: number, dimInner: number, dimBOuter: number, transposeA?: boolean): WorkgroupInfo;

declare function computeWorkgroupSizeForConv2d(layout: {
    x: number[];
    y?: number[];
    z?: number[];
}, outputShape: number[], isVec4?: boolean): [number, number, number];

declare function computeWorkPerThreadForConv2d(layout: {
    x: number[];
    y?: number[];
    z?: number[];
}, outputShape: number[], isVec4?: boolean): [number, number, number];

declare class Concatenate extends Merge {
    /** @nocollapse */
    static className: string;
    readonly DEFAULT_AXIS = -1;
    private readonly axis;
    constructor(args?: ConcatenateLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    protected mergeFunction(inputs: Tensor[]): Tensor;
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    computeMask(inputs: Tensor | Tensor[], mask?: Tensor | Tensor[]): Tensor;
    getConfig(): serialization.ConfigDict;
}

/**
 * Layer that concatenates an `Array` of inputs.
 *
 * It takes a list of tensors, all of the same shape except for the
 * concatenation axis, and returns a single tensor, the concatenation
 * of all inputs. For example:
 *
 * ```js
 * const input1 = tf.input({shape: [2, 2]});
 * const input2 = tf.input({shape: [2, 3]});
 * const concatLayer = tf.layers.concatenate();
 * const output = concatLayer.apply([input1, input2]);
 * console.log(JSON.stringify(output.shape));
 * // You get [null, 2, 5], with the first dimension as the undetermined batch
 * // dimension. The last dimension (5) is the result of concatenating the
 * // last dimensions of the inputs (2 and 3).
 * ```
 *
 * @doc {heading: 'Layers', subheading: 'Merge', namespace: 'layers'}
 */
declare function concatenate(args?: ConcatenateLayerArgs): Concatenate;

declare interface ConcatenateLayerArgs extends LayerArgs {
    /**
     * Axis along which to concatenate.
     */
    axis?: number;
}

declare function concatImpl(inputs: Array<{
    vals: BackendValues;
    shape: number[];
}>, outShape: number[], dtype: DataType, simplyConcat: boolean): TypedArray | string[];

/**
 * Initializer that generates values initialized to some constant.
 *
 * @doc {heading: 'Initializers', namespace: 'initializers'}
 */
declare function constant(args: ConstantArgs): Initializer;

declare interface ConstantArgs {
    /** The value for each element in the variable. */
    value: number;
}

/**
 * Base class for functions that impose constraints on weight values
 *
 * @doc {
 *   heading: 'Constraints',
 *   subheading: 'Classes',
 *   namespace: 'constraints'
 * }
 */
declare abstract class Constraint extends serialization.Serializable {
    abstract apply(w: Tensor): Tensor;
    getConfig(): serialization.ConfigDict;
}

/** @docinline */
declare type ConstraintIdentifier = 'maxNorm' | 'minMaxNorm' | 'nonNeg' | 'unitNorm' | string;

declare namespace constraints {
    export {
        maxNorm,
        unitNorm,
        nonNeg,
        minMaxNorm
    }
}
export { constraints }

/**
 * A Container is a directed acyclic graph of layers.
 *
 * It is the topological form of a "model". A LayersModel
 * is simply a Container with added training routines.
 *
 */
declare abstract class Container extends Layer {
    inputs: SymbolicTensor[];
    outputs: SymbolicTensor[];
    inputLayers: Layer[];
    inputLayersNodeIndices: number[];
    inputLayersTensorIndices: number[];
    outputLayers: Layer[];
    outputLayersNodeIndices: number[];
    outputLayersTensorIndices: number[];
    layers: Layer[];
    layersByDepth: {
        [depth: string]: Layer[];
    };
    nodesByDepth: {
        [depth: string]: Node_2[];
    };
    internalContainerRefs: Container[];
    containerNodes: Set<string>;
    inputNames: string[];
    outputNames: string[];
    feedInputShapes: Shape[];
    protected internalInputShapes: Shape[];
    protected internalOutputShapes: Shape[];
    protected feedInputNames: string[];
    protected feedOutputNames: string[];
    constructor(args: ContainerArgs);
    protected assertNotDisposed(): void;
    /**
     * Attempt to dispose a LayersModel's weights.
     *
     * This method decrease the reference count of the LayersModel object by 1.
     *
     * A LayersModel is reference-counted. Its reference count is incremented by 1
     * when it is first constructed and when it is used as a Layer of another
     * LayersModel.
     *
     * If the reference count of a LayersModel becomes 0, the `dispose` method of
     * all its constituent `Layer`s will be called.
     *
     * Note: If the reference count is greater than 0 after the decrement, the
     * `dispose` method of its constituent `Layer`s will *not* be called.
     *
     * After a LayersModel is disposed, it cannot be used in calls such as
     * 'predict`, `evaluate` or `fit` anymore.
     *
     * @returns A DisposeResult Object with the following fields:
     *   - refCountAfterDispose: The reference count of the LayersModel after this
     *     `dispose()` call.
     *   - numDisposedVariables: Number of `tf.Variable`s (i.e., weights) disposed
     *     during this `dispose()` call.
     * @throws {Error} If the layer is not built yet, or if the LayersModel has
     *   already been disposed.
     */
    dispose(): DisposeResult;
    get trainable(): boolean;
    set trainable(trainable: boolean);
    get trainableWeights(): LayerVariable[];
    get nonTrainableWeights(): LayerVariable[];
    get weights(): LayerVariable[];
    /**
     * Loads all layer weights from a JSON object.
     *
     * Porting Note: HDF5 weight files cannot be directly loaded in JavaScript /
     *   TypeScript. The utility script at `scripts/pykeras.py` offers means
     *   to convert them into JSON strings compatible with this method.
     * Porting Note: TensorFlow.js Layers supports only loading by name currently.
     *
     * @param weights A JSON mapping weight names to weight values as nested
     *   arrays of numbers, or a `NamedTensorMap`, i.e., a JSON mapping weight
     *   names to `tf.Tensor` objects.
     * @param strict Require that the provided weights exactly match those
     *   required by the container.  Default: `true`.  Passing `false` means that
     *   extra weights and missing weights will be silently ignored.
     */
    loadWeights(weights: NamedTensorMap, strict?: boolean): void;
    protected parseWeights(weights: NamedTensorMap): void;
    /**
     * Util shared between different serialization methods.
     * @returns LayersModel config with Keras version information added.
     */
    protected updatedConfig(): serialization.ConfigDict;
    /**
     * Returns a JSON string containing the network configuration.
     *
     * To load a network from a JSON save file, use
     * models.modelFromJSON(jsonString);
     * @param extraJsonArgs Unused in tfjs-layers, maintained for PyKeras
     * @param returnString Whether the return value should be stringified
     *    (default: `true`).
     * @returns a JSON string if `returnString` (default), or a JSON object if
     *   `!returnString`.
     */
    toJSON(unused?: any, returnString?: boolean): string | PyJsonDict;
    /**
     * Call the model on new inputs.
     *
     * In this case `call` just reapplies all ops in the graph to the new inputs
     * (e.g. build a new computational graph from the provided inputs).
     *
     * @param inputs A tensor or list of tensors.
     * @param mask A mask or list of masks. A mask can be either a tensor or null
     *   (no mask).
     *
     * @return A tensor if there is a single output, or a list of tensors if there
     *   are more than one outputs.
     */
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    /**
     * Computes an output mask tensor.
     *
     * @param inputs Tensor or list of tensors.
     * @param mask Tensor or list of tensors.
     *
     * @return null or a tensor (or list of tensors, one per output tensor of the
     * layer).
     */
    computeMask(inputs: Tensor | Tensor[], mask?: Tensor | Tensor[]): Tensor | Tensor[];
    /**
     * Computes the output shape of the layer.
     *
     * Assumes that the layer will be built to match that input shape provided.
     *
     * @param inputShape A shape (tuple of integers) or a list of shape tuples
     *   (one per output tensor of the layer). Shape tuples can include null for
     *   free dimensions, instead of an integer.
     */
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    /**
     * Computes output tensors for new inputs.
     *
     * Note:
     *   - Expects `inputs` to be a list (potentially with 1 element).
     *
     * @param inputs List of tensors
     * @param masks List of masks (tensors or null).
     * @return Three lists: outputTensors, outputMasks, outputShapes
     */
    protected runInternalGraph(inputs: Tensor[], masks?: Tensor[]): [
    Tensor[],
    Tensor[],
    Shape[]
    ];
    /**
     * Builds a map of internal node keys to node ordering.
     * Used in serializaion a node orderings may change as unused nodes are
     * dropped. Porting Note:  This helper method was pulled out of getConfig to
     * improve readability.
     * @param layers An array of Layers in the model.
     * @returns Map of Node Keys to index order within the layer.
     */
    private buildNodeConversionMap;
    /**
     * Retrieves a layer based on either its name (unique) or index.
     *
     * Indices are based on order of horizontal graph traversal (bottom-up).
     *
     * If both `name` and `index` are specified, `index` takes precedence.
     *
     * @param name Name of layer.
     * @param index Index of layer.
     * @returns A Layer instance.
     * @throws ValueError: In case of invalid layer name or index.
     *
     * @doc {
     *    heading: 'Layers',
     *    subheading: 'Classes',
     *    namespace: 'layers',
     *    subclasses: ['LayersModel']
     * }
     */
    getLayer(name: string): Layer;
    getLayer(index: number): Layer;
    getLayer(name: string, index: number): Layer;
    findLayer(index: number): Layer;
    /**
     * Retrieves the Container's current loss values.
     *
     * Used for regularizers during training.
     */
    calculateLosses(): Scalar[];
    getConfig(): serialization.ConfigDict;
    /**
     * Instantiates a LayersModel from its config (output of `get_config()`).
     * @param cls the class to create
     * @param config LayersModel config dictionary.
     * @param customObjects An optional dictionary of custom objects.
     * @param fastWeightInit Optional flag to use fast weight initialization
     *   during deserialization. This is applicable to cases in which
     *   the initialization will be immediately overwritten by loaded weight
     *   values. Default: `false`.
     * @returns A LayersModel instance.
     * @throws ValueError: In case of improperly formatted config dict.
     */
    /** @nocollapse */
    static fromConfig<T extends serialization.Serializable>(cls: serialization.SerializableConstructor<T>, config: serialization.ConfigDict, customObjects?: serialization.ConfigDict, fastWeightInit?: boolean): T;
    /**
     * Determine whether the container is stateful.
     *
     * Porting Note: this is the equivalent of the stateful @property of
     *   the Container class in PyKeras.
     */
    get stateful(): boolean;
    /**
     * Reset the state of all stateful constituent layers (if any).
     *
     * Examples of stateful layers include RNN layers whose `stateful` property
     * is set as `true`.
     */
    resetStates(): void;
}

/** Constructor config for Container. */
declare interface ContainerArgs {
    inputs: SymbolicTensor | SymbolicTensor[];
    outputs: SymbolicTensor | SymbolicTensor[];
    name?: string;
}

/**
 * Abstract nD convolution layer.  Ancestor of convolution layers which reduce
 * across channels, i.e., Conv1D and Conv2D, but not DepthwiseConv2D.
 */
declare abstract class Conv extends BaseConv {
    protected readonly filters: number;
    protected kernel: LayerVariable;
    protected readonly kernelInitializer?: Initializer;
    protected readonly kernelConstraint?: Constraint;
    protected readonly kernelRegularizer?: Regularizer;
    constructor(rank: number, args: ConvLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getConfig(): serialization.ConfigDict;
    protected static verifyArgs(args: ConvLayerArgs): void;
}

declare class Conv1D extends Conv {
    /** @nocollapse */
    static className: string;
    constructor(args: ConvLayerArgs);
    getConfig(): serialization.ConfigDict;
    protected static verifyArgs(args: ConvLayerArgs): void;
}

/**
 * 1D convolution layer (e.g., temporal convolution).
 *
 * This layer creates a convolution kernel that is convolved
 * with the layer input over a single spatial (or temporal) dimension
 * to produce a tensor of outputs.
 *
 * If `use_bias` is True, a bias vector is created and added to the outputs.
 *
 * If `activation` is not `null`, it is applied to the outputs as well.
 *
 * When using this layer as the first layer in a model, provide an
 * `inputShape` argument `Array` or `null`.
 *
 * For example, `inputShape` would be:
 * - `[10, 128]` for sequences of 10 vectors of 128-dimensional vectors
 * - `[null, 128]` for variable-length sequences of 128-dimensional vectors.
 *
 * @doc {heading: 'Layers', subheading: 'Convolutional',  namespace: 'layers'}
 */
declare function conv1d(args: ConvLayerArgs): Conv1D;

declare class Conv2D extends Conv {
    /** @nocollapse */
    static className: string;
    constructor(args: ConvLayerArgs);
    getConfig(): serialization.ConfigDict;
    protected static verifyArgs(args: ConvLayerArgs): void;
}

/**
 * 2D convolution layer (e.g. spatial convolution over images).
 *
 * This layer creates a convolution kernel that is convolved
 * with the layer input to produce a tensor of outputs.
 *
 * If `useBias` is True, a bias vector is created and added to the outputs.
 *
 * If `activation` is not `null`, it is applied to the outputs as well.
 *
 * When using this layer as the first layer in a model,
 * provide the keyword argument `inputShape`
 * (Array of integers, does not include the sample axis),
 * e.g. `inputShape=[128, 128, 3]` for 128x128 RGB pictures
 * in `dataFormat='channelsLast'`.
 *
 * @doc {heading: 'Layers', subheading: 'Convolutional', namespace: 'layers'}
 */
declare function conv2d(args: ConvLayerArgs): Conv2D;

declare class Conv2DTranspose extends Conv2D {
    /** @nocollapse */
    static className: string;
    constructor(args: ConvLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getConfig(): serialization.ConfigDict;
}

/**
 * Transposed convolutional layer (sometimes called Deconvolution).
 *
 * The need for transposed convolutions generally arises
 * from the desire to use a transformation going in the opposite direction of
 * a normal convolution, i.e., from something that has the shape of the output
 * of some convolution to something that has the shape of its input while
 * maintaining a connectivity pattern that is compatible with said
 * convolution.
 *
 * When using this layer as the first layer in a model, provide the
 * configuration `inputShape` (`Array` of integers, does not include the
 * sample axis), e.g., `inputShape: [128, 128, 3]` for 128x128 RGB pictures in
 * `dataFormat: 'channelsLast'`.
 *
 * Input shape:
 *   4D tensor with shape:
 *   `[batch, channels, rows, cols]` if `dataFormat` is `'channelsFirst'`.
 *   or 4D tensor with shape
 *   `[batch, rows, cols, channels]` if `dataFormat` is `'channelsLast'`.
 *
 * Output shape:
 *   4D tensor with shape:
 *   `[batch, filters, newRows, newCols]` if `dataFormat` is
 * `'channelsFirst'`. or 4D tensor with shape:
 *   `[batch, newRows, newCols, filters]` if `dataFormat` is `'channelsLast'`.
 *
 * References:
 *   - [A guide to convolution arithmetic for deep
 * learning](https://arxiv.org/abs/1603.07285v1)
 *   - [Deconvolutional
 * Networks](http://www.matthewzeiler.com/pubs/cvpr2010/cvpr2010.pdf)
 *
 * @doc {heading: 'Layers', subheading: 'Convolutional', namespace: 'layers'}
 */
declare function conv2dTranspose(args: ConvLayerArgs): Conv2DTranspose;

declare class Conv3D extends Conv {
    /** @nocollapse */
    static className: string;
    constructor(args: ConvLayerArgs);
    getConfig(): serialization.ConfigDict;
    protected static verifyArgs(args: ConvLayerArgs): void;
}

/**
 * 3D convolution layer (e.g. spatial convolution over volumes).
 *
 * This layer creates a convolution kernel that is convolved
 * with the layer input to produce a tensor of outputs.
 *
 * If `useBias` is True, a bias vector is created and added to the outputs.
 *
 * If `activation` is not `null`, it is applied to the outputs as well.
 *
 * When using this layer as the first layer in a model,
 * provide the keyword argument `inputShape`
 * (Array of integers, does not include the sample axis),
 * e.g. `inputShape=[128, 128, 128, 1]` for 128x128x128 grayscale volumes
 * in `dataFormat='channelsLast'`.
 *
 * @doc {heading: 'Layers', subheading: 'Convolutional', namespace: 'layers'}
 */
declare function conv3d(args: ConvLayerArgs): Conv3D;

declare function conv3dTranspose(args: ConvLayerArgs): Layer;

/**
 * LayerConfig for non-depthwise convolutional layers.
 * Applies to non-depthwise convolution of all ranks (e.g, Conv1D, Conv2D,
 * Conv3D).
 */
declare interface ConvLayerArgs extends BaseConvLayerArgs {
    /**
     * The dimensionality of the output space (i.e. the number of filters in the
     * convolution).
     */
    filters: number;
}

declare class ConvLSTM2D extends ConvRNN2D {
    /** @nocollapse */
    static className: string;
    constructor(args: ConvLSTM2DArgs);
    /** @nocollapse */
    static fromConfig<T extends tfc.serialization.Serializable>(cls: tfc.serialization.SerializableConstructor<T>, config: tfc.serialization.ConfigDict): T;
}

/**
 * Convolutional LSTM layer - Xingjian Shi 2015.
 *
 * This is a `ConvRNN2D` layer consisting of one `ConvLSTM2DCell`. However,
 * unlike the underlying `ConvLSTM2DCell`, the `apply` method of `ConvLSTM2D`
 * operates on a sequence of inputs. The shape of the input (not including the
 * first, batch dimension) needs to be 4-D, with the first dimension being time
 * steps. For example:
 *
 * ```js
 * const filters = 3;
 * const kernelSize = 3;
 *
 * const batchSize = 4;
 * const sequenceLength = 2;
 * const size = 5;
 * const channels = 3;
 *
 * const inputShape = [batchSize, sequenceLength, size, size, channels];
 * const input = tf.ones(inputShape);
 *
 * const layer = tf.layers.convLstm2d({filters, kernelSize});
 *
 * const output = layer.apply(input);
 * ```
 */
/** @doc {heading: 'Layers', subheading: 'Recurrent', namespace: 'layers'} */
declare function convLstm2d(args: ConvLSTM2DArgs): ConvLSTM2D;

declare interface ConvLSTM2DArgs extends Omit<LSTMLayerArgs, 'units' | 'cell'>, ConvRNN2DLayerArgs {
}

declare class ConvLSTM2DCell extends LSTMCell implements ConvRNN2DCell {
    /** @nocollapse */
    static className: string;
    readonly filters: number;
    readonly kernelSize: number[];
    readonly strides: number[];
    readonly padding: PaddingMode;
    readonly dataFormat: DataFormat;
    readonly dilationRate: number[];
    constructor(args: ConvLSTM2DCellArgs);
    build(inputShape: Shape | Shape[]): void;
    call(inputs: tfc.Tensor[], kwargs: Kwargs): tfc.Tensor[];
    getConfig(): tfc.serialization.ConfigDict;
    inputConv(x: Tensor, w: Tensor, b?: Tensor, padding?: PaddingMode): any;
    recurrentConv(x: Tensor, w: Tensor): any;
}

/**
 * Cell class for `ConvLSTM2D`.
 *
 * `ConvLSTM2DCell` is distinct from the `ConvRNN2D` subclass `ConvLSTM2D` in
 * that its `call` method takes the input data of only a single time step and
 * returns the cell's output at the time step, while `ConvLSTM2D` takes the
 * input data over a number of time steps. For example:
 *
 * ```js
 * const filters = 3;
 * const kernelSize = 3;
 *
 * const sequenceLength = 1;
 * const size = 5;
 * const channels = 3;
 *
 * const inputShape = [sequenceLength, size, size, channels];
 * const input = tf.ones(inputShape);
 *
 * const cell = tf.layers.convLstm2dCell({filters, kernelSize});
 *
 * cell.build(input.shape);
 *
 * const outputSize = size - kernelSize + 1;
 * const outShape = [sequenceLength, outputSize, outputSize, filters];
 *
 * const initialH = tf.zeros(outShape);
 * const initialC = tf.zeros(outShape);
 *
 * const [o, h, c] = cell.call([input, initialH, initialC], {});
 * ```
 */
/** @doc {heading: 'Layers', subheading: 'Recurrent', namespace: 'layers'} */
declare function convLstm2dCell(args: ConvLSTM2DCellArgs): ConvLSTM2DCell;

declare interface ConvLSTM2DCellArgs extends Omit<LSTMCellLayerArgs, 'units'>, ConvRNN2DCellArgs {
}

/**
 * Base class for convolutional-recurrent layers.
 */
declare class ConvRNN2D extends RNN {
    /** @nocollapse */
    static className: string;
    readonly cell: ConvRNN2DCell;
    constructor(args: ConvRNN2DLayerArgs);
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    computeOutputShape(inputShape: Shape): Shape | Shape[];
    getInitialState(inputs: tfc.Tensor): tfc.Tensor[];
    resetStates(states?: Tensor | Tensor[], training?: boolean): void;
    protected computeSingleOutputShape(inputShape: Shape): Shape;
}

declare abstract class ConvRNN2DCell extends RNNCell {
    readonly filters: number;
    readonly kernelSize: number[];
    readonly strides: number[];
    readonly padding: PaddingMode;
    readonly dataFormat: DataFormat;
    readonly dilationRate: number[];
    readonly activation: Activation;
    readonly useBias: boolean;
    readonly kernelInitializer: Initializer;
    readonly recurrentInitializer: Initializer;
    readonly biasInitializer: Initializer;
    readonly kernelConstraint: Constraint;
    readonly recurrentConstraint: Constraint;
    readonly biasConstraint: Constraint;
    readonly kernelRegularizer: Regularizer;
    readonly recurrentRegularizer: Regularizer;
    readonly biasRegularizer: Regularizer;
    readonly dropout: number;
    readonly recurrentDropout: number;
}

declare interface ConvRNN2DCellArgs extends Omit<SimpleRNNCellLayerArgs, 'units'> {
    /**
     * The dimensionality of the output space (i.e. the number of filters in the
     * convolution).
     */
    filters: number;
    /**
     * The dimensions of the convolution window. If kernelSize is a number, the
     * convolutional window will be square.
     */
    kernelSize: number | number[];
    /**
     * The strides of the convolution in each dimension. If strides is a number,
     * strides in both dimensions are equal.
     *
     * Specifying any stride value != 1 is incompatible with specifying any
     * `dilationRate` value != 1.
     */
    strides?: number | number[];
    /**
     * Padding mode.
     */
    padding?: PaddingMode;
    /**
     * Format of the data, which determines the ordering of the dimensions in
     * the inputs.
     *
     * `channels_last` corresponds to inputs with shape
     *   `(batch, ..., channels)`
     *
     *  `channels_first` corresponds to inputs with shape `(batch, channels,
     * ...)`.
     *
     * Defaults to `channels_last`.
     */
    dataFormat?: DataFormat;
    /**
     * The dilation rate to use for the dilated convolution in each dimension.
     * Should be an integer or array of two or three integers.
     *
     * Currently, specifying any `dilationRate` value != 1 is incompatible with
     * specifying any `strides` value != 1.
     */
    dilationRate?: number | [number] | [number, number];
}

declare interface ConvRNN2DLayerArgs extends BaseRNNLayerArgs, ConvRNN2DCellArgs {
}

/**
 * Loss or metric function: Cosine proximity.
 *
 * Mathematically, cosine proximity is defined as:
 *   `-sum(l2Normalize(yTrue) * l2Normalize(yPred))`,
 * wherein `l2Normalize()` normalizes the L2 norm of the input to 1 and `*`
 * represents element-wise multiplication.
 *
 * ```js
 * const yTrue = tf.tensor2d([[1, 0], [1, 0]]);
 * const yPred = tf.tensor2d([[1 / Math.sqrt(2), 1 / Math.sqrt(2)], [0, 1]]);
 * const proximity = tf.metrics.cosineProximity(yTrue, yPred);
 * proximity.print();
 * ```
 *
 * @param yTrue Truth Tensor.
 * @param yPred Prediction Tensor.
 * @return Cosine proximity Tensor.
 *
 * @doc {heading: 'Metrics', namespace: 'metrics'}
 */
declare function cosineProximity(yTrue: Tensor, yPred: Tensor): Tensor;

declare function createBufferFromOutputTexture(gl2: WebGL2RenderingContext, rows: number, columns: number, textureConfig: TextureConfig): WebGLBuffer;

declare function createFloat16MatrixTexture(gl: WebGLRenderingContext, rows: number, columns: number, textureConfig: TextureConfig): Texture;

declare function createFloat16PackedMatrixTexture(gl: WebGLRenderingContext, rows: number, columns: number, textureConfig: TextureConfig): Texture;

declare function createFloat32MatrixTexture(gl: WebGLRenderingContext, rows: number, columns: number, textureConfig: TextureConfig): Texture;

declare function createFragmentShader(gl: WebGLRenderingContext, fragmentShaderSource: string): WebGLShader;

declare function createFramebuffer(gl: WebGLRenderingContext): WebGLFramebuffer;

declare function createIndexBuffer(gl: WebGLRenderingContext): WebGLBuffer;

declare function createPackedMatrixTexture(gl: WebGLRenderingContext, rows: number, columns: number, textureConfig: TextureConfig): Texture;

declare function createProgram(gl: WebGLRenderingContext): WebGLProgram;

declare function createStaticIndexBuffer(gl: WebGLRenderingContext, data: Uint16Array): WebGLBuffer;

declare function createStaticVertexBuffer(gl: WebGLRenderingContext, data: Float32Array): WebGLBuffer;

declare function createTexture(gl: WebGLRenderingContext): WebGLTexture;

declare function createUnsignedBytesMatrixTexture(gl: WebGLRenderingContext, rows: number, columns: number, textureConfig: TextureConfig): Texture;

declare function createVertexBuffer(gl: WebGLRenderingContext): WebGLBuffer;

declare function createVertexShader(gl: WebGLRenderingContext): WebGLShader;

declare function createVertexShader_2(gl: WebGLRenderingContext, vertexShaderSource: string): WebGLShader;

declare class Cropping2D extends Layer {
    /** @nocollapse */
    static className: string;
    protected readonly cropping: [[number, number], [number, number]];
    protected readonly dataFormat: DataFormat;
    constructor(args: Cropping2DLayerArgs);
    computeOutputShape(inputShape: Shape): Shape;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}

/**
 * Cropping layer for 2D input (e.g., image).
 *
 * This layer can crop an input
 * at the top, bottom, left and right side of an image tensor.
 *
 * Input shape:
 *   4D tensor with shape:
 *   - If `dataFormat` is `"channelsLast"`:
 *     `[batch, rows, cols, channels]`
 *   - If `data_format` is `"channels_first"`:
 *     `[batch, channels, rows, cols]`.
 *
 * Output shape:
 *   4D with shape:
 *   - If `dataFormat` is `"channelsLast"`:
 *     `[batch, croppedRows, croppedCols, channels]`
 *    - If `dataFormat` is `"channelsFirst"`:
 *     `[batch, channels, croppedRows, croppedCols]`.
 *
 * Examples
 * ```js
 *
 * const model = tf.sequential();
 * model.add(tf.layers.cropping2D({cropping:[[2, 2], [2, 2]],
 *                                inputShape: [128, 128, 3]}));
 * //now output shape is [batch, 124, 124, 3]
 * ```
 *
 * @doc {heading: 'Layers', subheading: 'Convolutional', namespace: 'layers'}
 */
declare function cropping2D(args: Cropping2DLayerArgs): Cropping2D;

declare interface Cropping2DLayerArgs extends LayerArgs {
    /**
     * Dimension of the cropping along the width and the height.
     * - If integer: the same symmetric cropping
     *  is applied to width and height.
     * - If list of 2 integers:
     *   interpreted as two different
     *   symmetric cropping values for height and width:
     *   `[symmetric_height_crop, symmetric_width_crop]`.
     * - If a list of 2 lists of 2 integers:
     *   interpreted as
     *   `[[top_crop, bottom_crop], [left_crop, right_crop]]`
     */
    cropping: number | [number, number] | [[number, number], [number, number]];
    /**
     * Format of the data, which determines the ordering of the dimensions in
     * the inputs.
     *
     * `channels_last` corresponds to inputs with shape
     *   `(batch, ..., channels)`
     *
     * `channels_first` corresponds to inputs with shape
     *   `(batch, channels, ...)`
     *
     * Defaults to `channels_last`.
     */
    dataFormat?: DataFormat;
}

/**
 * Custom callback for training.
 */
export declare class CustomCallback extends BaseCallback {
    protected readonly trainBegin: (logs?: Logs) => void | Promise<void>;
    protected readonly trainEnd: (logs?: Logs) => void | Promise<void>;
    protected readonly epochBegin: (epoch: number, logs?: Logs) => void | Promise<void>;
    protected readonly epochEnd: (epoch: number, logs?: Logs) => void | Promise<void>;
    protected readonly batchBegin: (batch: number, logs?: Logs) => void | Promise<void>;
    protected readonly batchEnd: (batch: number, logs?: Logs) => void | Promise<void>;
    protected readonly yield: (epoch: number, batch: number, logs: Logs) => void | Promise<void>;
    private yieldEvery;
    private currentEpoch;
    nowFunc: Function;
    nextFrameFunc: Function;
    constructor(args: CustomCallbackArgs, yieldEvery?: YieldEveryOptions);
    maybeWait(epoch: number, batch: number, logs: UnresolvedLogs): Promise<void>;
    onEpochBegin(epoch: number, logs?: UnresolvedLogs): Promise<void>;
    onEpochEnd(epoch: number, logs?: UnresolvedLogs): Promise<void>;
    onBatchBegin(batch: number, logs?: UnresolvedLogs): Promise<void>;
    onBatchEnd(batch: number, logs?: UnresolvedLogs): Promise<void>;
    onTrainBegin(logs?: UnresolvedLogs): Promise<void>;
    onTrainEnd(logs?: UnresolvedLogs): Promise<void>;
}

export declare interface CustomCallbackArgs {
    onTrainBegin?: (logs?: Logs) => void | Promise<void>;
    onTrainEnd?: (logs?: Logs) => void | Promise<void>;
    onEpochBegin?: (epoch: number, logs?: Logs) => void | Promise<void>;
    onEpochEnd?: (epoch: number, logs?: Logs) => void | Promise<void>;
    onBatchBegin?: (batch: number, logs?: Logs) => void | Promise<void>;
    onBatchEnd?: (batch: number, logs?: Logs) => void | Promise<void>;
    onYield?: (epoch: number, batch: number, logs: Logs) => void | Promise<void>;
    nowFunc?: Function;
    nextFrameFunc?: Function;
}

/** @docinline */
declare type DataFormat = 'channelsFirst' | 'channelsLast';

declare interface DataId {
}

declare type DataId_3 = object;

declare interface DataId_4 {
}

declare abstract class Dataset<T> {
    abstract iterator(): Promise<LazyIterator<T>>;
    size: number;
}

/** DataType enum. */
declare enum DataType_2 {
    DT_INVALID = 0,
    DT_FLOAT = 1,
    DT_DOUBLE = 2,
    DT_INT32 = 3,
    DT_UINT8 = 4,
    DT_INT16 = 5,
    DT_INT8 = 6,
    DT_STRING = 7,
    DT_COMPLEX64 = 8,
    DT_INT64 = 9,
    DT_BOOL = 10,
    DT_QINT8 = 11,
    DT_QUINT8 = 12,
    DT_QINT32 = 13,
    DT_BFLOAT16 = 14,
    DT_QINT16 = 15,
    DT_QUINT16 = 16,
    DT_UINT16 = 17,
    DT_COMPLEX128 = 18,
    DT_HALF = 19,
    DT_RESOURCE = 20,
    DT_VARIANT = 21,
    DT_UINT32 = 22,
    DT_UINT64 = 23,
    DT_FLOAT_REF = 101,
    DT_DOUBLE_REF = 102,
    DT_INT32_REF = 103,
    DT_UINT8_REF = 104,
    DT_INT16_REF = 105,
    DT_INT8_REF = 106,
    DT_STRING_REF = 107,
    DT_COMPLEX64_REF = 108,
    DT_INT64_REF = 109,
    DT_BOOL_REF = 110,
    DT_QINT8_REF = 111,
    DT_QUINT8_REF = 112,
    DT_QINT32_REF = 113,
    DT_BFLOAT16_REF = 114,
    DT_QINT16_REF = 115,
    DT_QUINT16_REF = 116,
    DT_UINT16_REF = 117,
    DT_COMPLEX128_REF = 118,
    DT_HALF_REF = 119,
    DT_RESOURCE_REF = 120,
    DT_VARIANT_REF = 121,
    DT_UINT32_REF = 122,
    DT_UINT64_REF = 123
}

declare function dataTypeToGPUType(type: DataType, component?: number): string;

declare interface DefaultValueTypeMap {
    bool: boolean;
    int32: number;
    float32: number;
    string: string;
}

declare class Dense extends Layer {
    /** @nocollapse */
    static className: string;
    private units;
    private activation;
    private useBias;
    private kernelInitializer;
    private biasInitializer;
    private kernel;
    private bias;
    readonly DEFAULT_KERNEL_INITIALIZER: InitializerIdentifier;
    readonly DEFAULT_BIAS_INITIALIZER: InitializerIdentifier;
    private readonly kernelConstraint?;
    private readonly biasConstraint?;
    private readonly kernelRegularizer?;
    private readonly biasRegularizer?;
    constructor(args: DenseLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}

/**
 * Creates a dense (fully connected) layer.
 *
 * This layer implements the operation:
 *   `output = activation(dot(input, kernel) + bias)`
 *
 * `activation` is the element-wise activation function
 *   passed as the `activation` argument.
 *
 * `kernel` is a weights matrix created by the layer.
 *
 * `bias` is a bias vector created by the layer (only applicable if `useBias`
 * is `true`).
 *
 * **Input shape:**
 *
 *   nD `tf.Tensor` with shape: `(batchSize, ..., inputDim)`.
 *
 *   The most common situation would be
 *   a 2D input with shape `(batchSize, inputDim)`.
 *
 * **Output shape:**
 *
 *   nD tensor with shape: `(batchSize, ..., units)`.
 *
 *   For instance, for a 2D input with shape `(batchSize, inputDim)`,
 *   the output would have shape `(batchSize, units)`.
 *
 * Note: if the input to the layer has a rank greater than 2, then it is
 * flattened prior to the initial dot product with the kernel.
 *
 * @doc {heading: 'Layers', subheading: 'Basic', namespace: 'layers'}
 */
declare function dense(args: DenseLayerArgs): Dense;

declare interface DenseLayerArgs extends LayerArgs {
    /** Positive integer, dimensionality of the output space. */
    units: number;
    /**
     * Activation function to use.
     *
     * If unspecified, no activation is applied.
     */
    activation?: ActivationIdentifier;
    /** Whether to apply a bias. */
    useBias?: boolean;
    /**
     * Initializer for the dense kernel weights matrix.
     */
    kernelInitializer?: InitializerIdentifier | Initializer;
    /**
     * Initializer for the bias vector.
     */
    biasInitializer?: InitializerIdentifier | Initializer;
    /**
     * If specified, defines inputShape as `[inputDim]`.
     */
    inputDim?: number;
    /**
     * Constraint for the kernel weights.
     */
    kernelConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Constraint for the bias vector.
     */
    biasConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Regularizer function applied to the dense kernel weights matrix.
     */
    kernelRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Regularizer function applied to the bias vector.
     */
    biasRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Regularizer function applied to the activation.
     */
    activityRegularizer?: RegularizerIdentifier | Regularizer;
}

declare class DepthwiseConv2D extends BaseConv {
    /** @nocollapse */
    static className: string;
    private readonly depthMultiplier;
    private readonly depthwiseInitializer;
    private readonly depthwiseConstraint;
    private readonly depthwiseRegularizer;
    private depthwiseKernel;
    constructor(args: DepthwiseConv2DLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getConfig(): serialization.ConfigDict;
}

/**
 * Depthwise separable 2D convolution.
 *
 * Depthwise Separable convolutions consists in performing just the first step
 * in a depthwise spatial convolution (which acts on each input channel
 * separately). The `depthMultiplier` argument controls how many output channels
 * are generated per input channel in the depthwise step.
 *
 * @doc {heading: 'Layers', subheading: 'Convolutional', namespace: 'layers'}
 */
declare function depthwiseConv2d(args: DepthwiseConv2DLayerArgs): DepthwiseConv2D;

declare interface DepthwiseConv2DLayerArgs extends BaseConvLayerArgs {
    /**
     * An integer or Array of 2 integers, specifying the width and height of the
     * 2D convolution window. Can be a single integer to specify the same value
     * for all spatial dimensions.
     */
    kernelSize: number | [number, number];
    /**
     * The number of depthwise convolution output channels for each input
     * channel.
     * The total number of depthwise convolution output channels will be equal to
     * `filtersIn * depthMultiplier`.
     * Default: 1.
     */
    depthMultiplier?: number;
    /**
     * Initializer for the depthwise kernel matrix.
     * Default: GlorotNormal.
     */
    depthwiseInitializer?: InitializerIdentifier | Initializer;
    /**
     * Constraint for the depthwise kernel matrix.
     */
    depthwiseConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Regularizer function for the depthwise kernel matrix.
     */
    depthwiseRegularizer?: RegularizerIdentifier | Regularizer;
}

/**
 * Deregister the Op for graph model executor.
 *
 * @param name The Tensorflow Op name.
 *
 * @doc {heading: 'Models', subheading: 'Op Registry'}
 */
export declare function deregisterOp(name: string): void;

/**
 * The type of the return value of Layer.dispose() and Container.dispose().
 */
declare interface DisposeResult {
    /**
     * Reference count after the dispose call.
     */
    refCountAfterDispose: number;
    /**
     * Number of variables dispose in this dispose call.
     */
    numDisposedVariables: number;
}

/** @docinline */
declare type Distribution = 'normal' | 'uniform' | 'truncatedNormal';

declare class Dot extends Merge {
    /** @nocollapse */
    static className: string;
    private axes;
    private normalize;
    constructor(args: DotLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    protected mergeFunction(inputs: Tensor[]): Tensor;
    private interpretAxes;
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    computeMask(inputs: Tensor | Tensor[], mask?: Tensor | Tensor[]): Tensor;
    getConfig(): serialization.ConfigDict;
}

/**
 * Layer that computes a dot product between samples in two tensors.
 *
 * E.g., if applied to a list of two tensors `a` and `b` both of shape
 * `[batchSize, n]`, the output will be a tensor of shape `[batchSize, 1]`,
 * where each entry at index `[i, 0]` will be the dot product between
 * `a[i, :]` and `b[i, :]`.
 *
 * Example:
 *
 * ```js
 * const dotLayer = tf.layers.dot({axes: -1});
 * const x1 = tf.tensor2d([[10, 20], [30, 40]]);
 * const x2 = tf.tensor2d([[-1, -2], [-3, -4]]);
 *
 * // Invoke the layer's apply() method in eager (imperative) mode.
 * const y = dotLayer.apply([x1, x2]);
 * y.print();
 * ```
 *
 * @doc {heading: 'Layers', subheading: 'Merge', namespace: 'layers'}
 */
declare function dot(args: DotLayerArgs): Dot;

declare interface DotLayerArgs extends LayerArgs {
    /**
     * Axis or axes along which the dot product will be taken.
     *
     * Integer or an Array of integers.
     */
    axes: number | [number, number];
    /**
     * Whether to L2-normalize samples along the dot product axis
     * before taking the dot product.
     *
     * If set to `true`, the output of the dot product is the cosine
     * proximity between the two samples.
     */
    normalize?: boolean;
}

declare function downloadByteEncodedFloatMatrixFromOutputTexture(gl: WebGLRenderingContext, rows: number, columns: number, textureConfig: TextureConfig): Float32Array;

declare function downloadFloat32MatrixFromBuffer(gl: WebGLRenderingContext, buffer: WebGLBuffer, size: number): Float32Array;

declare function downloadMatrixFromPackedOutputTexture(gl: WebGLRenderingContext, physicalRows: number, physicalCols: number): Float32Array;

declare function downloadPackedMatrixFromBuffer(gl: WebGLRenderingContext, buffer: WebGLBuffer, batch: number, rows: number, cols: number, physicalRows: number, physicalCols: number, textureConfig: TextureConfig): Float32Array;

declare class Dropout extends Layer {
    /** @nocollapse */
    static className: string;
    private readonly rate;
    private readonly noiseShape;
    private readonly seed;
    constructor(args: DropoutLayerArgs);
    protected getNoiseShape(input: Tensor): Shape;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
    dispose(): DisposeResult;
}

/**
 * Applies
 * [dropout](http://www.cs.toronto.edu/~rsalakhu/papers/srivastava14a.pdf) to
 * the input.
 *
 * Dropout consists in randomly setting a fraction `rate` of input units to 0 at
 * each update during training time, which helps prevent overfitting.
 *
 * @doc {heading: 'Layers', subheading: 'Basic', namespace: 'layers'}
 */
declare function dropout(args: DropoutLayerArgs): Dropout;

declare interface DropoutLayerArgs extends LayerArgs {
    /** Float between 0 and 1. Fraction of the input units to drop. */
    rate: number;
    /**
     * Integer array representing the shape of the binary dropout mask that will
     * be multiplied with the input.
     *
     * For instance, if your inputs have shape `(batchSize, timesteps, features)`
     * and you want the dropout mask to be the same for all timesteps, you can use
     * `noise_shape=(batch_size, 1, features)`.
     */
    noiseShape?: number[];
    /** An integer to use as random seed. */
    seed?: number;
}

/**
 * A Callback that stops training when a monitored quantity has stopped
 * improving.
 */
export declare class EarlyStopping extends Callback {
    protected readonly monitor: string;
    protected readonly minDelta: number;
    protected readonly patience: number;
    protected readonly baseline: number;
    protected readonly verbose: number;
    protected readonly mode: 'auto' | 'min' | 'max';
    protected monitorFunc: (currVal: number, prevVal: number) => boolean;
    private wait;
    private stoppedEpoch;
    private best;
    constructor(args?: EarlyStoppingCallbackArgs);
    onTrainBegin(logs?: Logs): Promise<void>;
    onEpochEnd(epoch: number, logs?: Logs): Promise<void>;
    onTrainEnd(logs?: Logs): Promise<void>;
    private getMonitorValue;
}

/**
 * Factory function for a Callback that stops training when a monitored
 * quantity has stopped improving.
 *
 * Early stopping is a type of regularization, and protects model against
 * overfitting.
 *
 * The following example based on fake data illustrates how this callback
 * can be used during `tf.LayersModel.fit()`:
 *
 * ```js
 * const model = tf.sequential();
 * model.add(tf.layers.dense({
 *   units: 3,
 *   activation: 'softmax',
 *   kernelInitializer: 'ones',
 *   inputShape: [2]
 * }));
 * const xs = tf.tensor2d([1, 2, 3, 4], [2, 2]);
 * const ys = tf.tensor2d([[1, 0, 0], [0, 1, 0]], [2, 3]);
 * const xsVal = tf.tensor2d([4, 3, 2, 1], [2, 2]);
 * const ysVal = tf.tensor2d([[0, 0, 1], [0, 1, 0]], [2, 3]);
 * model.compile(
 *     {loss: 'categoricalCrossentropy', optimizer: 'sgd', metrics: ['acc']});
 *
 * // Without the EarlyStopping callback, the val_acc value would be:
 * //   0.5, 0.5, 0.5, 0.5, ...
 * // With val_acc being monitored, training should stop after the 2nd epoch.
 * const history = await model.fit(xs, ys, {
 *   epochs: 10,
 *   validationData: [xsVal, ysVal],
 *   callbacks: tf.callbacks.earlyStopping({monitor: 'val_acc'})
 * });
 *
 * // Expect to see a length-2 array.
 * console.log(history.history.val_acc);
 * ```
 *
 * @doc {
 *   heading: 'Callbacks',
 *   namespace: 'callbacks'
 * }
 */
declare function earlyStopping(args?: EarlyStoppingCallbackArgs): EarlyStopping;

export declare interface EarlyStoppingCallbackArgs {
    /**
     * Quantity to be monitored.
     *
     * Defaults to 'val_loss'.
     */
    monitor?: string;
    /**
     * Minimum change in the monitored quantity to qualify as improvement,
     * i.e., an absolute change of less than `minDelta` will count as no
     * improvement.
     *
     * Defaults to 0.
     */
    minDelta?: number;
    /**
     * Number of epochs with no improvement after which training will be stopped.
     *
     * Defaults to 0.
     */
    patience?: number;
    /** Verbosity mode. */
    verbose?: number;
    /**
     * Mode: one of 'min', 'max', and 'auto'.
     * - In 'min' mode, training will be stopped when the quantity monitored has
     *   stopped decreasing.
     * - In 'max' mode, training will be stopped when the quantity monitored has
     *   stopped increasing.
     * - In 'auto' mode, the direction is inferred automatically from the name of
     *   the monitored quantity.
     *
     * Defaults to 'auto'.
     */
    mode?: 'auto' | 'min' | 'max';
    /**
     * Baseline value of the monitored quantity.
     *
     * If specified, training will be stopped if the model doesn't show
     * improvement over the baseline.
     */
    baseline?: number;
    /**
     * Whether to restore model weights from the epoch with the best value
     * of the monitored quantity. If `False`, the model weights obtained at the
     * last step of training are used.
     *
     * **`True` is not supported yet.**
     */
    restoreBestWeights?: boolean;
}

declare class ELU extends Layer {
    /** @nocollapse */
    static className: string;
    readonly alpha: number;
    readonly DEFAULT_ALPHA = 1;
    constructor(args?: ELULayerArgs);
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getConfig(): serialization.ConfigDict;
}

/**
 * Exponential Linear Unit (ELU).
 *
 * It follows:
 * `f(x) =  alpha * (exp(x) - 1.) for x < 0`,
 * `f(x) = x for x >= 0`.
 *
 * Input shape:
 *   Arbitrary. Use the configuration `inputShape` when using this layer as the
 *   first layer in a model.
 *
 * Output shape:
 *   Same shape as the input.
 *
 * References:
 *   - [Fast and Accurate Deep Network Learning by Exponential Linear Units
 * (ELUs)](https://arxiv.org/abs/1511.07289v1)
 *
 * @doc {
 *   heading: 'Layers',
 *   subheading: 'Advanced Activation',
 *   namespace: 'layers'
 * }
 */
declare function elu(args?: ELULayerArgs): ELU;

declare interface ELULayerArgs extends LayerArgs {
    /**
     * Float `>= 0`. Negative slope coefficient. Defaults to `1.0`.
     */
    alpha?: number;
}

declare class Embedding extends Layer {
    /** @nocollapse */
    static className: string;
    private inputDim;
    private outputDim;
    private embeddingsInitializer;
    private maskZero;
    private inputLength;
    private embeddings;
    readonly DEFAULT_EMBEDDINGS_INITIALIZER: InitializerIdentifier;
    private readonly embeddingsRegularizer?;
    private readonly embeddingsConstraint?;
    constructor(args: EmbeddingLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    protected warnOnIncompatibleInputShape(inputShape: Shape): void;
    computeMask(inputs: Tensor | Tensor[], mask?: Tensor | Tensor[]): Tensor;
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}

/**
 * Maps positive integers (indices) into dense vectors of fixed size.
 * E.g. [[4], [20]] -> [[0.25, 0.1], [0.6, -0.2]]
 *
 * **Input shape:** 2D tensor with shape: `[batchSize, sequenceLength]`.
 *
 * **Output shape:** 3D tensor with shape: `[batchSize, sequenceLength,
 * outputDim]`.
 *
 * @doc {heading: 'Layers', subheading: 'Basic', namespace: 'layers'}
 */
declare function embedding(args: EmbeddingLayerArgs): Embedding;

declare interface EmbeddingLayerArgs extends LayerArgs {
    /**
     * Integer > 0. Size of the vocabulary, i.e. maximum integer index + 1.
     */
    inputDim: number;
    /**
     * Integer >= 0. Dimension of the dense embedding.
     */
    outputDim: number;
    /**
     * Initializer for the `embeddings` matrix.
     */
    embeddingsInitializer?: InitializerIdentifier | Initializer;
    /**
     * Regularizer function applied to the `embeddings` matrix.
     */
    embeddingsRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Regularizer function applied to the activation.
     */
    activityRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Constraint function applied to the `embeddings` matrix.
     */
    embeddingsConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Whether the input value 0 is a special "padding" value that should be
     * masked out. This is useful when using recurrent layers which may take
     * variable length input.
     *
     * If this is `True` then all subsequent layers in the model need to support
     * masking or an exception will be raised. If maskZero is set to `True`, as a
     * consequence, index 0 cannot be used in the vocabulary (inputDim should
     * equal size of vocabulary + 1).
     */
    maskZero?: boolean;
    /**
     * Length of input sequences, when it is constant.
     *
     * This argument is required if you are going to connect `flatten` then
     * `dense` layers upstream (without it, the shape of the dense outputs cannot
     * be computed).
     */
    inputLength?: number | number[];
}

declare const equalImpl: SimpleBinaryKernelImpl;

declare const expImpl: SimpleUnaryImpl<number, number>;

declare const expm1Impl: SimpleUnaryImpl<number, number>;

/** @docinline */
declare type FanMode = 'fanIn' | 'fanOut' | 'fanAvg';

declare interface FenceContext {
    query: WebGLQuery | WebGLSync;
    isFencePassed(): boolean;
}

declare function flatDispatchLayout(shape: number[]): {
    x: number[];
};

declare class Flatten extends Layer {
    private dataFormat;
    /** @nocollapse */
    static className: string;
    constructor(args?: FlattenLayerArgs);
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}

/**
 * Flattens the input. Does not affect the batch size.
 *
 * A `Flatten` layer flattens each batch in its inputs to 1D (making the output
 * 2D).
 *
 * For example:
 *
 * ```js
 * const input = tf.input({shape: [4, 3]});
 * const flattenLayer = tf.layers.flatten();
 * // Inspect the inferred output shape of the flatten layer, which
 * // equals `[null, 12]`. The 2nd dimension is 4 * 3, i.e., the result of the
 * // flattening. (The 1st dimension is the undermined batch size.)
 * console.log(JSON.stringify(flattenLayer.apply(input).shape));
 * ```
 *
 * @doc {heading: 'Layers', subheading: 'Basic', namespace: 'layers'}
 */
declare function flatten(args?: FlattenLayerArgs): Flatten;

declare interface FlattenLayerArgs extends LayerArgs {
    /** Image data format: channelsLast (default) or channelsFirst. */
    dataFormat?: DataFormat;
}

declare const floorDivImpl: SimpleBinaryKernelImpl;

declare const floorImpl: SimpleUnaryImpl<number, number>;

/**
 * Enforce use of half precision textures if available on the platform.
 *
 * @doc {heading: 'Environment', namespace: 'webgl'}
 */
export declare function forceHalfFloat(): void;

declare function gatherNdImpl<R extends Rank>(indicesData: TypedArray, paramsBuf: TensorBuffer<R>, dtype: DataType, numSlices: number, sliceRank: number, sliceSize: number, strides: number[], paramsShape: number[], paramsSize: number): TensorBuffer<R>;

declare function gatherV2Impl<R extends Rank, D extends DataType>(xBuf: TensorBuffer<R, D>, indicesBuf: TensorBuffer<R, D>, flattenOutputShape: number[]): TensorBuffer<R, D>;

declare class GaussianDropout extends Layer {
    /** @nocollapse */
    static className: string;
    readonly rate: number;
    constructor(args: GaussianDropoutArgs);
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getConfig(): {
        rate: number;
    };
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
}

/**
 * Apply multiplicative 1-centered Gaussian noise.
 *
 * As it is a regularization layer, it is only active at training time.
 *
 * Arguments:
 *   - `rate`: float, drop probability (as with `Dropout`).
 *     The multiplicative noise will have
 *     standard deviation `sqrt(rate / (1 - rate))`.
 *
 * Input shape:
 *   Arbitrary. Use the keyword argument `inputShape`
 *   (tuple of integers, does not include the samples axis)
 *   when using this layer as the first layer in a model.
 *
 * Output shape:
 *   Same shape as input.
 *
 * References:
 *   - [Dropout: A Simple Way to Prevent Neural Networks from Overfitting](
 *      http://www.cs.toronto.edu/~rsalakhu/papers/srivastava14a.pdf)
 *
 * @doc {heading: 'Layers', subheading: 'Noise', namespace: 'layers'}
 */
declare function gaussianDropout(args: GaussianDropoutArgs): GaussianDropout;

declare interface GaussianDropoutArgs extends LayerArgs {
    /** drop probability.  */
    rate: number;
}

declare class GaussianNoise extends Layer {
    /** @nocollapse */
    static className: string;
    readonly stddev: number;
    constructor(args: GaussianNoiseArgs);
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getConfig(): {
        stddev: number;
    };
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
}

/**
 * Apply additive zero-centered Gaussian noise.
 *
 * As it is a regularization layer, it is only active at training time.
 *
 * This is useful to mitigate overfitting
 * (you could see it as a form of random data augmentation).
 * Gaussian Noise (GS) is a natural choice as corruption process
 * for real valued inputs.
 *
 * # Arguments
 * stddev: float, standard deviation of the noise distribution.
 *
 * # Input shape
 * Arbitrary. Use the keyword argument `input_shape`
 * (tuple of integers, does not include the samples axis)
 * when using this layer as the first layer in a model.
 *
 * # Output shape
 * Same shape as input.
 *
 * @doc {heading: 'Layers', subheading: 'Noise', namespace: 'layers'}
 */
declare function gaussianNoise(args: GaussianNoiseArgs): GaussianNoise;

declare interface GaussianNoiseArgs extends LayerArgs {
    /** Standard Deviation.  */
    stddev: number;
}

declare function getBatchDim(shape: number[], dimsToSkip?: number): number;

declare function getCoordsDataType(rank: number): string;

/**
 * Derives logical coordinates from a flat index. Performs integer division
 * with each stride and decrements the index until the index equals the final
 * dimension coordinate.
 */
declare function getCoordsFromIndexSnippet(shape: number[], name?: string): string;

declare function getCoordsXYZ(index: number): string;

declare function getExtensionOrThrow(gl: WebGLRenderingContext, extensionName: string): {};

declare function getFramebufferErrorMessage(gl: WebGLRenderingContext, status: number): string;

declare function getInternalFormatForFloat16MatrixTexture(textureConfig: TextureConfig): number;

declare function getInternalFormatForFloat16PackedMatrixTexture(textureConfig: TextureConfig): number;

declare function getInternalFormatForFloat32MatrixTexture(textureConfig: TextureConfig): number;

declare function getInternalFormatForPackedMatrixTexture(textureConfig: TextureConfig): number;

declare function getInternalFormatForUnsignedBytesMatrixTexture(textureConfig: TextureConfig): number;

declare function getMainHeaderString(): string;

declare function getMainHeaderString(index: string): string;

declare function getMaxTexturesInShader(webGLVersion: number): number;

declare function getNumChannels(): number;

declare function getProgramUniformLocation(gl: WebGLRenderingContext, program: WebGLProgram, uniformName: string): WebGLUniformLocation;

declare function getProgramUniformLocationOrThrow(gl: WebGLRenderingContext, program: WebGLProgram, uniformName: string): WebGLUniformLocation;

declare function getRowsCols(shape: number[]): [number, number];

declare function getShapeAs3D(shape: number[]): [number, number, number];

declare function getStartHeaderString(useGlobalIndex: boolean, program: WebGPUProgram): string;

declare function getTextureShapeFromLogicalShape(logShape: number[], isPacked?: boolean): [number, number];

/**
 * Gets the actual threads count that is used by XNNPACK.
 *
 * It is set after the backend is intialized.
 */
export declare function getThreadsCount(): number;

declare function getWebGLDisjointQueryTimerVersion(webGLVersion: number): number;

declare function getWebGLErrorMessage(gl: WebGLRenderingContext, status: number): string;

declare function getWebGLMaxTextureSize(webGLVersion: number): number;

declare function getWorkgroupSizeString(program: WebGPUProgram): string;

declare class GlobalAveragePooling1D extends GlobalPooling1D {
    /** @nocollapse */
    static className: string;
    constructor(args?: LayerArgs);
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
}

/**
 * Global average pooling operation for temporal data.
 *
 * Input Shape: 3D tensor with shape: `[batchSize, steps, features]`.
 *
 * Output Shape: 2D tensor with shape: `[batchSize, features]`.
 *
 * @doc {heading: 'Layers', subheading: 'Pooling', namespace: 'layers'}
 */
declare function globalAveragePooling1d(args?: LayerArgs): GlobalAveragePooling1D;

declare class GlobalAveragePooling2D extends GlobalPooling2D {
    /** @nocollapse */
    static className: string;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
}

/**
 * Global average pooling operation for spatial data.
 *
 * Input shape:
 *   - If `dataFormat` is `CHANNEL_LAST`:
 *       4D tensor with shape: `[batchSize, rows, cols, channels]`.
 *   - If `dataFormat` is `CHANNEL_FIRST`:
 *       4D tensor with shape: `[batchSize, channels, rows, cols]`.
 *
 * Output shape:
 *   2D tensor with shape: `[batchSize, channels]`.
 *
 * @doc {heading: 'Layers', subheading: 'Pooling', namespace: 'layers'}
 */
declare function globalAveragePooling2d(args: GlobalPooling2DLayerArgs): GlobalAveragePooling2D;

declare const globalMaxPool1d: typeof globalMaxPooling1d;

declare const globalMaxPool2d: typeof globalMaxPooling2d;

declare class GlobalMaxPooling1D extends GlobalPooling1D {
    /** @nocollapse */
    static className: string;
    constructor(args: LayerArgs);
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
}

/**
 * Global max pooling operation for temporal data.
 *
 * Input Shape: 3D tensor with shape: `[batchSize, steps, features]`.
 *
 * Output Shape: 2D tensor with shape: `[batchSize, features]`.
 *
 * @doc {heading: 'Layers', subheading: 'Pooling', namespace: 'layers'}
 */
declare function globalMaxPooling1d(args?: LayerArgs): GlobalMaxPooling1D;

declare class GlobalMaxPooling2D extends GlobalPooling2D {
    /** @nocollapse */
    static className: string;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
}

/**
 * Global max pooling operation for spatial data.
 *
 * Input shape:
 *   - If `dataFormat` is `CHANNEL_LAST`:
 *       4D tensor with shape: `[batchSize, rows, cols, channels]`.
 *   - If `dataFormat` is `CHANNEL_FIRST`:
 *       4D tensor with shape: `[batchSize, channels, rows, cols]`.
 *
 * Output shape:
 *   2D tensor with shape: `[batchSize, channels]`.
 *
 * @doc {heading: 'Layers', subheading: 'Pooling', namespace: 'layers'}
 */
declare function globalMaxPooling2d(args: GlobalPooling2DLayerArgs): GlobalMaxPooling2D;

/**
 * Abstract class for different global pooling 1D layers.
 */
declare abstract class GlobalPooling1D extends Layer {
    constructor(args: LayerArgs);
    computeOutputShape(inputShape: Shape): Shape;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
}

/**
 * Abstract class for different global pooling 2D layers.
 */
declare abstract class GlobalPooling2D extends Layer {
    protected dataFormat: DataFormat;
    constructor(args: GlobalPooling2DLayerArgs);
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}

declare interface GlobalPooling2DLayerArgs extends LayerArgs {
    /**
     * One of `CHANNEL_LAST` (default) or `CHANNEL_FIRST`.
     *
     * The ordering of the dimensions in the inputs. `CHANNEL_LAST` corresponds
     * to inputs with shape `[batch, height, width, channels]` while
     * `CHANNEL_FIRST` corresponds to inputs with shape
     * `[batch, channels, height, width]`.
     */
    dataFormat?: DataFormat;
}

/**
 * Glorot normal initializer, also called Xavier normal initializer.
 * It draws samples from a truncated normal distribution centered on 0
 * with `stddev = sqrt(2 / (fan_in + fan_out))`
 * where `fan_in` is the number of input units in the weight tensor
 * and `fan_out` is the number of output units in the weight tensor.
 *
 * Reference:
 *   Glorot & Bengio, AISTATS 2010
 *       http://jmlr.org/proceedings/papers/v9/glorot10a/glorot10a.pdf
 *
 * @doc {heading: 'Initializers', namespace: 'initializers'}
 */
declare function glorotNormal(args: SeedOnlyInitializerArgs): Initializer;

/**
 * Glorot uniform initializer, also called Xavier uniform initializer.
 * It draws samples from a uniform distribution within [-limit, limit]
 * where `limit` is `sqrt(6 / (fan_in + fan_out))`
 * where `fan_in` is the number of input units in the weight tensor
 * and `fan_out` is the number of output units in the weight tensor
 *
 * Reference:
 *   Glorot & Bengio, AISTATS 2010
 *       http://jmlr.org/proceedings/papers/v9/glorot10a/glorot10a.pdf.
 *
 * @doc {heading: 'Initializers', namespace: 'initializers'}
 */
declare function glorotUniform(args: SeedOnlyInitializerArgs): Initializer;

declare namespace gpgpu_util {
    export {
        createVertexShader,
        createVertexBuffer,
        createIndexBuffer,
        getInternalFormatForFloat32MatrixTexture,
        createFloat32MatrixTexture,
        getInternalFormatForFloat16MatrixTexture,
        createFloat16MatrixTexture,
        getInternalFormatForUnsignedBytesMatrixTexture,
        createUnsignedBytesMatrixTexture,
        getInternalFormatForPackedMatrixTexture,
        createPackedMatrixTexture,
        getInternalFormatForFloat16PackedMatrixTexture,
        createFloat16PackedMatrixTexture,
        bindVertexProgramAttributeStreams,
        uploadDenseMatrixToTexture,
        uploadPixelDataToTexture,
        createBufferFromOutputTexture,
        downloadFloat32MatrixFromBuffer,
        downloadByteEncodedFloatMatrixFromOutputTexture,
        downloadPackedMatrixFromBuffer,
        downloadMatrixFromPackedOutputTexture
    }
}
export { gpgpu_util }

export declare class GPGPUContext {
    gl: WebGLRenderingContext;
    textureFloatExtension: {};
    textureHalfFloatExtension: {};
    colorBufferFloatExtension: {};
    colorBufferHalfFloatExtension: {};
    disjointQueryTimerExtension: WebGL2DisjointQueryTimerExtension | WebGL1DisjointQueryTimerExtension;
    parallelCompilationExtension: WebGLParallelCompilationExtension;
    vertexBuffer: WebGLBuffer;
    indexBuffer: WebGLBuffer;
    framebuffer: WebGLFramebuffer;
    outputTexture: WebGLTexture | null;
    program: GPGPUContextProgram | null;
    private disposed;
    private disjoint;
    private vertexShader;
    textureConfig: TextureConfig;
    createVertexArray: () => WebGLVao | null;
    bindVertexArray: (vao: WebGLVao | null) => void;
    deleteVertexArray: (vao: WebGLVao | null) => void;
    getVertexArray: () => WebGLVao | null;
    constructor(gl?: WebGLRenderingContext);
    private get debug();
    dispose(): void;
    createFloat32MatrixTexture(rows: number, columns: number): Texture;
    createFloat16MatrixTexture(rows: number, columns: number): Texture;
    createUnsignedBytesMatrixTexture(rows: number, columns: number): Texture;
    uploadPixelDataToTexture(texture: WebGLTexture, pixels: PixelData | ImageData | HTMLImageElement | HTMLCanvasElement | ImageBitmap): void;
    uploadDenseMatrixToTexture(texture: WebGLTexture, width: number, height: number, data: TypedArray): void;
    createFloat16PackedMatrixTexture(rows: number, columns: number): Texture;
    createPackedMatrixTexture(rows: number, columns: number): Texture;
    deleteMatrixTexture(texture: WebGLTexture): void;
    downloadByteEncodedFloatMatrixFromOutputTexture(texture: WebGLTexture, rows: number, columns: number): Float32Array;
    downloadPackedMatrixFromBuffer(buffer: WebGLBuffer, batch: number, rows: number, columns: number, physicalRows: number, physicalCols: number): Float32Array;
    downloadFloat32MatrixFromBuffer(buffer: WebGLBuffer, size: number): Float32Array;
    createBufferFromTexture(texture: WebGLTexture, rows: number, columns: number): WebGLBuffer;
    createAndWaitForFence(): Promise<void>;
    private createFence;
    downloadMatrixFromPackedTexture(texture: WebGLTexture, physicalRows: number, physicalCols: number): Float32Array;
    createProgram(fragmentShader: WebGLShader): GPGPUContextProgram;
    buildVao(program: GPGPUContextProgram): void;
    deleteProgram(program: GPGPUContextProgram): void;
    setProgram(program: GPGPUContextProgram | null): void;
    getUniformLocation(program: WebGLProgram, uniformName: string, shouldThrow?: boolean): WebGLUniformLocation;
    getAttributeLocation(program: WebGLProgram, attribute: string): number;
    getUniformLocationNoThrow(program: WebGLProgram, uniformName: string): WebGLUniformLocation;
    setInputMatrixTexture(inputMatrixTexture: WebGLTexture, uniformLocation: WebGLUniformLocation, textureUnit: number): void;
    setOutputMatrixTexture(outputMatrixTexture: WebGLTexture, rows: number, columns: number): void;
    setOutputPackedMatrixTexture(outputPackedMatrixTexture: WebGLTexture, rows: number, columns: number): void;
    setOutputMatrixWriteRegion(startRow: number, numRows: number, startColumn: number, numColumns: number): void;
    setOutputPackedMatrixWriteRegion(startRow: number, numRows: number, startColumn: number, numColumns: number): void;
    debugValidate(): void;
    executeProgram(): void;
    blockUntilAllProgramsCompleted(): void;
    private getQueryTimerExtension;
    private getQueryTimerExtensionWebGL2;
    private getQueryTimerExtensionWebGL1;
    beginQuery(): WebGLQuery;
    endQuery(): void;
    waitForQueryAndGetTime(query: WebGLQuery): Promise<number>;
    private getQueryTime;
    private isQueryAvailable;
    pollFence(fenceContext: FenceContext): Promise<void>;
    private itemsToPoll;
    pollItems(): void;
    private addItemToPoll;
    private bindTextureToFrameBuffer;
    private unbindTextureToFrameBuffer;
    private downloadMatrixDriver;
    private setOutputMatrixTextureDriver;
    private setOutputMatrixWriteRegionDriver;
    private throwIfDisposed;
    private throwIfNoProgram;
}

declare interface GPGPUContextProgram extends WebGLProgram {
    vao: WebGLVao;
}

export declare interface GPGPUProgram {
    variableNames: string[];
    outputShape: number[];
    userCode: string;
    enableShapeUniforms?: boolean;
    /** If true, this program expects packed input textures. Defaults to false. */
    packedInputs?: boolean;
    /** If true, this program produces a packed texture. Defaults to false. */
    packedOutput?: boolean;
    /**
     * Affects what type of texture we allocate for the output. Defaults to
     * `TextureUsage.RENDER`.
     */
    outTexUsage?: TextureUsage;
    /**
     * The type of scheme to use when packing texels for the output values.
     * See `PackingScheme` for details. Defaults to `PackingScheme.SHARED_BATCH`.
     */
    outPackingScheme?: PackingScheme;
    customUniforms?: Array<{
        name: string;
        arrayIndex?: number;
        type: UniformType;
    }>;
}

declare function GPUBytesPerElement(dtype: DataType): number;

/**
 * A `tf.GraphModel` is a directed, acyclic graph built from a
 * SavedModel GraphDef and allows inference execution.
 *
 * A `tf.GraphModel` can only be created by loading from a model converted from
 * a [TensorFlow SavedModel](https://www.tensorflow.org/guide/saved_model) using
 * the command line converter tool and loaded via `tf.loadGraphModel`.
 *
 * @doc {heading: 'Models', subheading: 'Classes'}
 */
export declare class GraphModel<ModelURL extends Url = string | io.IOHandler> implements InferenceModel {
    private modelUrl;
    private loadOptions;
    private executor;
    private version;
    private handler;
    private artifacts;
    private initializer;
    private resourceIdToCapturedInput;
    private resourceManager;
    private signature;
    private initializerSignature;
    private structuredOutputKeys;
    private readonly io;
    get modelVersion(): string;
    get inputNodes(): string[];
    get outputNodes(): string[];
    get inputs(): TensorInfo[];
    get outputs(): TensorInfo[];
    get weights(): NamedTensorsMap;
    get metadata(): {};
    get modelSignature(): {};
    get modelStructuredOutputKeys(): {};
    /**
     * @param modelUrl url for the model, or an `io.IOHandler`.
     * @param weightManifestUrl url for the weight file generated by
     * scripts/convert.py script.
     * @param requestOption options for Request, which allows to send credentials
     * and custom headers.
     * @param onProgress Optional, progress callback function, fired periodically
     * before the load is completed.
     */
    constructor(modelUrl: ModelURL, loadOptions?: io.LoadOptions, tfio?: any);
    private findIOHandler;
    /**
     * Loads the model and weight files, construct the in memory weight map and
     * compile the inference graph.
     */
    load(): UrlIOHandler<ModelURL> extends io.IOHandlerSync ? boolean : Promise<boolean>;
    /**
     * Synchronously construct the in memory weight map and
     * compile the inference graph.
     *
     * @doc {heading: 'Models', subheading: 'Classes', ignoreCI: true}
     */
    loadSync(artifacts: io.ModelArtifacts): boolean;
    /**
     * Save the configuration and/or weights of the GraphModel.
     *
     * An `IOHandler` is an object that has a `save` method of the proper
     * signature defined. The `save` method manages the storing or
     * transmission of serialized data ("artifacts") that represent the
     * model's topology and weights onto or via a specific medium, such as
     * file downloads, local storage, IndexedDB in the web browser and HTTP
     * requests to a server. TensorFlow.js provides `IOHandler`
     * implementations for a number of frequently used saving mediums, such as
     * `tf.io.browserDownloads` and `tf.io.browserLocalStorage`. See `tf.io`
     * for more details.
     *
     * This method also allows you to refer to certain types of `IOHandler`s
     * as URL-like string shortcuts, such as 'localstorage://' and
     * 'indexeddb://'.
     *
     * Example 1: Save `model`'s topology and weights to browser [local
     * storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage);
     * then load it back.
     *
     * ```js
     * const modelUrl =
     *    'https://storage.googleapis.com/tfjs-models/savedmodel/mobilenet_v2_1.0_224/model.json';
     * const model = await tf.loadGraphModel(modelUrl);
     * const zeros = tf.zeros([1, 224, 224, 3]);
     * model.predict(zeros).print();
     *
     * const saveResults = await model.save('localstorage://my-model-1');
     *
     * const loadedModel = await tf.loadGraphModel('localstorage://my-model-1');
     * console.log('Prediction from loaded model:');
     * model.predict(zeros).print();
     * ```
     *
     * @param handlerOrURL An instance of `IOHandler` or a URL-like,
     * scheme-based string shortcut for `IOHandler`.
     * @param config Options for saving the model.
     * @returns A `Promise` of `SaveResult`, which summarizes the result of
     * the saving, such as byte sizes of the saved artifacts for the model's
     *   topology and weight values.
     *
     * @doc {heading: 'Models', subheading: 'Classes', ignoreCI: true}
     */
    save(handlerOrURL: io.IOHandler | string, config?: io.SaveConfig): Promise<io.SaveResult>;
    private addStructuredOutputNames;
    /**
     * Execute the inference for the input tensors.
     *
     * @param input The input tensors, when there is single input for the model,
     * inputs param should be a `tf.Tensor`. For models with mutliple inputs,
     * inputs params should be in either `tf.Tensor`[] if the input order is
     * fixed, or otherwise NamedTensorMap format.
     *
     * For model with multiple inputs, we recommend you use NamedTensorMap as the
     * input type, if you use `tf.Tensor`[], the order of the array needs to
     * follow the
     * order of inputNodes array. @see {@link GraphModel.inputNodes}
     *
     * You can also feed any intermediate nodes using the NamedTensorMap as the
     * input type. For example, given the graph
     *    InputNode => Intermediate => OutputNode,
     * you can execute the subgraph Intermediate => OutputNode by calling
     *    model.execute('IntermediateNode' : tf.tensor(...));
     *
     * This is useful for models that uses tf.dynamic_rnn, where the intermediate
     * state needs to be fed manually.
     *
     * For batch inference execution, the tensors for each input need to be
     * concatenated together. For example with mobilenet, the required input shape
     * is [1, 244, 244, 3], which represents the [batch, height, width, channel].
     * If we are provide a batched data of 100 images, the input tensor should be
     * in the shape of [100, 244, 244, 3].
     *
     * @param config Prediction configuration for specifying the batch size.
     * Currently the batch size option is ignored for graph model.
     *
     * @returns Inference result tensors. If the model is converted and it
     * originally had structured_outputs in tensorflow, then a NamedTensorMap
     * will be returned matching the structured_outputs. If no structured_outputs
     * are present, the output will be single `tf.Tensor` if the model has single
     * output node, otherwise Tensor[].
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    predict(inputs: Tensor | Tensor[] | NamedTensorMap, config?: ModelPredictConfig): Tensor | Tensor[] | NamedTensorMap;
    /**
     * Execute the inference for the input tensors in async fashion, use this
     * method when your model contains control flow ops.
     *
     * @param input The input tensors, when there is single input for the model,
     * inputs param should be a `tf.Tensor`. For models with mutliple inputs,
     * inputs params should be in either `tf.Tensor`[] if the input order is
     * fixed, or otherwise NamedTensorMap format.
     *
     * For model with multiple inputs, we recommend you use NamedTensorMap as the
     * input type, if you use `tf.Tensor`[], the order of the array needs to
     * follow the
     * order of inputNodes array. @see {@link GraphModel.inputNodes}
     *
     * You can also feed any intermediate nodes using the NamedTensorMap as the
     * input type. For example, given the graph
     *    InputNode => Intermediate => OutputNode,
     * you can execute the subgraph Intermediate => OutputNode by calling
     *    model.execute('IntermediateNode' : tf.tensor(...));
     *
     * This is useful for models that uses tf.dynamic_rnn, where the intermediate
     * state needs to be fed manually.
     *
     * For batch inference execution, the tensors for each input need to be
     * concatenated together. For example with mobilenet, the required input shape
     * is [1, 244, 244, 3], which represents the [batch, height, width, channel].
     * If we are provide a batched data of 100 images, the input tensor should be
     * in the shape of [100, 244, 244, 3].
     *
     * @param config Prediction configuration for specifying the batch size.
     * Currently the batch size option is ignored for graph model.
     *
     * @returns A Promise of inference result tensors. If the model is converted
     * and it originally had structured_outputs in tensorflow, then a
     * NamedTensorMap will be returned matching the structured_outputs. If no
     * structured_outputs are present, the output will be single `tf.Tensor` if
     * the model has single output node, otherwise Tensor[].
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    predictAsync(inputs: Tensor | Tensor[] | NamedTensorMap, config?: ModelPredictConfig): Promise<Tensor | Tensor[] | NamedTensorMap>;
    private normalizeInputs;
    private normalizeOutputs;
    private executeInitializerGraph;
    private executeInitializerGraphAsync;
    private setResourceIdToCapturedInput;
    /**
     * Executes inference for the model for given input tensors.
     * @param inputs tensor, tensor array or tensor map of the inputs for the
     * model, keyed by the input node names.
     * @param outputs output node name from the TensorFlow model, if no
     * outputs are specified, the default outputs of the model would be used.
     * You can inspect intermediate nodes of the model by adding them to the
     * outputs array.
     *
     * @returns A single tensor if provided with a single output or no outputs
     * are provided and there is only one default output, otherwise return a
     * tensor array. The order of the tensor array is the same as the outputs
     * if provided, otherwise the order of outputNodes attribute of the model.
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    execute(inputs: Tensor | Tensor[] | NamedTensorMap, outputs?: string | string[]): Tensor | Tensor[];
    /**
     * Executes inference for the model for given input tensors in async
     * fashion, use this method when your model contains control flow ops.
     * @param inputs tensor, tensor array or tensor map of the inputs for the
     * model, keyed by the input node names.
     * @param outputs output node name from the TensorFlow model, if no outputs
     * are specified, the default outputs of the model would be used. You can
     * inspect intermediate nodes of the model by adding them to the outputs
     * array.
     *
     * @returns A Promise of single tensor if provided with a single output or
     * no outputs are provided and there is only one default output, otherwise
     * return a tensor map.
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    executeAsync(inputs: Tensor | Tensor[] | NamedTensorMap, outputs?: string | string[]): Promise<Tensor | Tensor[]>;
    /**
     * Get intermediate tensors for model debugging mode (flag
     * KEEP_INTERMEDIATE_TENSORS is true).
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    getIntermediateTensors(): NamedTensorsMap;
    /**
     * Dispose intermediate tensors for model debugging mode (flag
     * KEEP_INTERMEDIATE_TENSORS is true).
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    disposeIntermediateTensors(): void;
    private convertTensorMapToTensorsMap;
    /**
     * Releases the memory used by the weight tensors and resourceManager.
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    dispose(): void;
}

export declare interface GraphNode {
    inputs: Tensor[];
    attrs: {
        [key: string]: ValueType;
    };
}

declare const greaterEqualImpl: SimpleBinaryKernelImpl;

declare const greaterImpl: SimpleBinaryKernelImpl;

declare class GRU extends RNN {
    /** @nocollapse */
    static className: string;
    constructor(args: GRULayerArgs);
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    /** @nocollapse */
    static fromConfig<T extends serialization.Serializable>(cls: serialization.SerializableConstructor<T>, config: serialization.ConfigDict): T;
}

/**
 * Gated Recurrent Unit - Cho et al. 2014.
 *
 * This is an `RNN` layer consisting of one `GRUCell`. However, unlike
 * the underlying `GRUCell`, the `apply` method of `SimpleRNN` operates
 * on a sequence of inputs. The shape of the input (not including the first,
 * batch dimension) needs to be at least 2-D, with the first dimension being
 * time steps. For example:
 *
 * ```js
 * const rnn = tf.layers.gru({units: 8, returnSequences: true});
 *
 * // Create an input with 10 time steps.
 * const input = tf.input({shape: [10, 20]});
 * const output = rnn.apply(input);
 *
 * console.log(JSON.stringify(output.shape));
 * // [null, 10, 8]: 1st dimension is unknown batch size; 2nd dimension is the
 * // same as the sequence length of `input`, due to `returnSequences`: `true`;
 * // 3rd dimension is the `GRUCell`'s number of units.
 *
 * @doc {heading: 'Layers', subheading: 'Recurrent', namespace: 'layers'}
 */
declare function gru(args: GRULayerArgs): GRU;

declare class GRUCell extends RNNCell {
    /** @nocollapse */
    static className: string;
    readonly units: number;
    readonly activation: Activation;
    readonly recurrentActivation: Activation;
    readonly useBias: boolean;
    readonly kernelInitializer: Initializer;
    readonly recurrentInitializer: Initializer;
    readonly biasInitializer: Initializer;
    readonly kernelRegularizer: Regularizer;
    readonly recurrentRegularizer: Regularizer;
    readonly biasRegularizer: Regularizer;
    readonly kernelConstraint: Constraint;
    readonly recurrentConstraint: Constraint;
    readonly biasConstraint: Constraint;
    readonly dropout: number;
    readonly recurrentDropout: number;
    readonly dropoutFunc: Function;
    readonly stateSize: number;
    readonly implementation: number;
    readonly DEFAULT_ACTIVATION = "tanh";
    readonly DEFAULT_RECURRENT_ACTIVATION: ActivationIdentifier;
    readonly DEFAULT_KERNEL_INITIALIZER = "glorotNormal";
    readonly DEFAULT_RECURRENT_INITIALIZER = "orthogonal";
    readonly DEFAULT_BIAS_INITIALIZER: InitializerIdentifier;
    kernel: LayerVariable;
    recurrentKernel: LayerVariable;
    bias: LayerVariable;
    constructor(args: GRUCellLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}

/**
 * Cell class for `GRU`.
 *
 * `GRUCell` is distinct from the `RNN` subclass `GRU` in that its
 * `apply` method takes the input data of only a single time step and returns
 * the cell's output at the time step, while `GRU` takes the input data
 * over a number of time steps. For example:
 *
 * ```js
 * const cell = tf.layers.gruCell({units: 2});
 * const input = tf.input({shape: [10]});
 * const output = cell.apply(input);
 *
 * console.log(JSON.stringify(output.shape));
 * // [null, 10]: This is the cell's output at a single time step. The 1st
 * // dimension is the unknown batch size.
 * ```
 *
 * Instance(s) of `GRUCell` can be used to construct `RNN` layers. The
 * most typical use of this workflow is to combine a number of cells into a
 * stacked RNN cell (i.e., `StackedRNNCell` internally) and use it to create an
 * RNN. For example:
 *
 * ```js
 * const cells = [
 *   tf.layers.gruCell({units: 4}),
 *   tf.layers.gruCell({units: 8}),
 * ];
 * const rnn = tf.layers.rnn({cell: cells, returnSequences: true});
 *
 * // Create an input with 10 time steps and a length-20 vector at each step.
 * const input = tf.input({shape: [10, 20]});
 * const output = rnn.apply(input);
 *
 * console.log(JSON.stringify(output.shape));
 * // [null, 10, 8]: 1st dimension is unknown batch size; 2nd dimension is the
 * // same as the sequence length of `input`, due to `returnSequences`: `true`;
 * // 3rd dimension is the last `gruCell`'s number of units.
 * ```
 *
 * To create an `RNN` consisting of only *one* `GRUCell`, use the
 * `tf.layers.gru`.
 *
 * @doc {heading: 'Layers', subheading: 'Recurrent', namespace: 'layers'}
 */
declare function gruCell(args: GRUCellLayerArgs): GRUCell;

export declare interface GRUCellLayerArgs extends SimpleRNNCellLayerArgs {
    /**
     * Activation function to use for the recurrent step.
     *
     * Defaults to hard sigmoid (`hardSigmoid`).
     *
     * If `null`, no activation is applied.
     */
    recurrentActivation?: ActivationIdentifier;
    /**
     * Implementation mode, either 1 or 2.
     *
     * Mode 1 will structure its operations as a larger number of
     *   smaller dot products and additions.
     *
     * Mode 2 will batch them into fewer, larger operations. These modes will
     * have different performance profiles on different hardware and
     * for different applications.
     *
     * Note: For superior performance, TensorFlow.js always uses implementation
     * 2, regardless of the actual value of this configuration field.
     */
    implementation?: number;
    /**
     * GRU convention (whether to apply reset gate after or before matrix
     * multiplication). false = "before", true = "after" (only false is
     * supported).
     */
    resetAfter?: boolean;
}

export declare interface GRULayerArgs extends SimpleRNNLayerArgs {
    /**
     * Activation function to use for the recurrent step.
     *
     * Defaults to hard sigmoid (`hardSigmoid`).
     *
     * If `null`, no activation is applied.
     */
    recurrentActivation?: ActivationIdentifier;
    /**
     * Implementation mode, either 1 or 2.
     *
     * Mode 1 will structure its operations as a larger number of
     * smaller dot products and additions.
     *
     * Mode 2 will batch them into fewer, larger operations. These modes will
     * have different performance profiles on different hardware and
     * for different applications.
     *
     * Note: For superior performance, TensorFlow.js always uses implementation
     * 2, regardless of the actual value of this configuration field.
     */
    implementation?: number;
}

declare function hasExtension(gl: WebGLRenderingContext, extensionName: string): boolean;

/**
 * He normal initializer.
 *
 * It draws samples from a truncated normal distribution centered on 0
 * with `stddev = sqrt(2 / fanIn)`
 * where `fanIn` is the number of input units in the weight tensor.
 *
 * Reference:
 *     He et al., http://arxiv.org/abs/1502.01852
 *
 * @doc {heading: 'Initializers', namespace: 'initializers'}
 */
declare function heNormal(args: SeedOnlyInitializerArgs): Initializer;

/**
 * He uniform initializer.
 *
 * It draws samples from a uniform distribution within [-limit, limit]
 * where `limit` is `sqrt(6 / fan_in)`
 * where `fanIn` is the number of input units in the weight tensor.
 *
 * Reference:
 *     He et al., http://arxiv.org/abs/1502.01852
 *
 * @doc {heading: 'Initializers',namespace: 'initializers'}
 */
declare function heUniform(args: SeedOnlyInitializerArgs): Initializer;

/**
 * Callback that records events into a `History` object. This callback is
 * automatically applied to every TF.js Layers model. The `History` object
 * gets returned by the `fit` method of models.
 */
declare class History_2 extends BaseCallback {
    epoch: number[];
    history: {
        [key: string]: Array<number | Tensor>;
    };
    onTrainBegin(logs?: UnresolvedLogs): Promise<void>;
    onEpochEnd(epoch: number, logs?: UnresolvedLogs): Promise<void>;
    /**
     * Await the values of all losses and metrics.
     */
    syncData(): Promise<void>;
}
export { History_2 as History }

/** Properties of an AttrValue. */
export declare interface IAttrValue {
    /** AttrValue list */
    list?: (AttrValue.IListValue | null);
    /** AttrValue s */
    s?: (string | null);
    /** AttrValue i */
    i?: (number | string | null);
    /** AttrValue f */
    f?: (number | null);
    /** AttrValue b */
    b?: (boolean | null);
    /** AttrValue type */
    type?: (DataType_2 | null);
    /** AttrValue shape */
    shape?: (ITensorShape | null);
    /** AttrValue tensor */
    tensor?: (ITensor | null);
    /** AttrValue placeholder */
    placeholder?: (string | null);
    /** AttrValue func */
    func?: (INameAttrList | null);
}

/**
 * Initializer that generates the identity matrix.
 * Only use for square 2D matrices.
 *
 * @doc {heading: 'Initializers', namespace: 'initializers'}
 */
declare function identity(args: IdentityArgs): Initializer;

declare interface IdentityArgs {
    /**
     * Multiplicative factor to apply to the identity matrix.
     */
    gain?: number;
}

/** Properties of a NameAttrList. */
export declare interface INameAttrList {
    /** NameAttrList name */
    name?: (string | null);
    /** NameAttrList attr */
    attr?: ({
        [k: string]: IAttrValue;
    } | null);
}

/**
 * Initializer base class.
 *
 * @doc {
 *   heading: 'Initializers', subheading: 'Classes', namespace: 'initializers'}
 */
declare abstract class Initializer extends serialization.Serializable {
    fromConfigUsesCustomObjects(): boolean;
    /**
     * Generate an initial value.
     * @param shape
     * @param dtype
     * @return The init value.
     */
    abstract apply(shape: Shape, dtype?: DataType): Tensor;
    getConfig(): serialization.ConfigDict;
}

/** @docinline */
declare type InitializerIdentifier = 'constant' | 'glorotNormal' | 'glorotUniform' | 'heNormal' | 'heUniform' | 'identity' | 'leCunNormal' | 'leCunUniform' | 'ones' | 'orthogonal' | 'randomNormal' | 'randomUniform' | 'truncatedNormal' | 'varianceScaling' | 'zeros' | string;

declare namespace initializers {
    export {
        zeros,
        ones,
        constant,
        randomUniform,
        randomNormal,
        truncatedNormal,
        identity,
        varianceScaling,
        glorotUniform,
        glorotNormal,
        heNormal,
        heUniform,
        leCunNormal,
        leCunUniform,
        orthogonal
    }
}
export { initializers }

/** Properties of a NodeDef. */
export declare interface INodeDef {
    /** NodeDef name */
    name?: (string | null);
    /** NodeDef op */
    op?: (string | null);
    /** NodeDef input */
    input?: (string[] | null);
    /** NodeDef device */
    device?: (string | null);
    /** NodeDef attr */
    attr?: ({
        [k: string]: IAttrValue;
    } | null);
}

/**
 * Used to instantiate an input to a model as a `tf.SymbolicTensor`.
 *
 * Users should call the `input` factory function for
 * consistency with other generator functions.
 *
 * Example:
 *
 * ```js
 * // Defines a simple logistic regression model with 32 dimensional input
 * // and 3 dimensional output.
 * const x = tf.input({shape: [32]});
 * const y = tf.layers.dense({units: 3, activation: 'softmax'}).apply(x);
 * const model = tf.model({inputs: x, outputs: y});
 * model.predict(tf.ones([2, 32])).print();
 * ```
 *
 * Note: `input` is only necessary when using `model`. When using
 * `sequential`, specify `inputShape` for the first layer or use `inputLayer`
 * as the first layer.
 *
 * @doc {heading: 'Models', subheading: 'Inputs'}
 */
export declare function input(config: InputConfig): SymbolicTensor;

/**
 * Config for the Input function.
 *
 * Note: You should provide only shape or batchShape (not both).
 * If only shape is provided, then the batchShape becomes
 * [null].concat(inputShape).
 */
declare interface InputConfig {
    /**
     * A shape, not including the batch size. For instance, `shape=[32]`
     * indicates that the expected input will be batches of 32-dimensional
     * vectors.
     */
    shape?: Shape;
    /**
     * A shape tuple (integer), including the batch size. For instance,
     * `batchShape=[10, 32]` indicates that the expected input will be batches of
     * 10 32-dimensional vectors. `batchShape=[null, 32]` indicates batches of an
     * arbitrary number of 32-dimensional vectors.
     */
    batchShape?: Shape;
    /**
     * An optional name string for the layer. Should be unique in a model (do not
     * reuse the same name twice). It will be autogenerated if it isn't provided.
     */
    name?: string;
    dtype?: DataType;
    /**
     * A boolean specifying whether the placeholder to be created is sparse.
     */
    sparse?: boolean;
}

declare type InputInfo = {
    dtype: DataType;
    shape: number[];
    name: string;
};

declare class InputLayer extends Layer {
    /** @nocollapse */
    static readonly className = "InputLayer";
    sparse: boolean;
    constructor(args: InputLayerArgs);
    apply(inputs: Tensor | Tensor[] | SymbolicTensor | SymbolicTensor[], kwargs?: Kwargs): Tensor | Tensor[] | SymbolicTensor;
    dispose(): DisposeResult;
    getConfig(): serialization.ConfigDict;
}

/**
 * An input layer is an entry point into a `tf.LayersModel`.
 *
 * `InputLayer` is generated automatically for `tf.Sequential` models by
 * specifying the `inputshape` or `batchInputShape` for the first layer.  It
 * should not be specified explicitly. However, it can be useful sometimes,
 * e.g., when constructing a sequential model from a subset of another
 * sequential model's layers. Like the code snippet below shows.
 *
 * ```js
 * // Define a model which simply adds two inputs.
 * const model1 = tf.sequential();
 * model1.add(tf.layers.dense({inputShape: [4], units: 3, activation: 'relu'}));
 * model1.add(tf.layers.dense({units: 1, activation: 'sigmoid'}));
 * model1.summary();
 * model1.predict(tf.zeros([1, 4])).print();
 *
 * // Construct another model, reusing the second layer of `model1` while
 * // not using the first layer of `model1`. Note that you cannot add the second
 * // layer of `model` directly as the first layer of the new sequential model,
 * // because doing so will lead to an error related to the fact that the layer
 * // is not an input layer. Instead, you need to create an `inputLayer` and add
 * // it to the new sequential model before adding the reused layer.
 * const model2 = tf.sequential();
 * // Use an inputShape that matches the input shape of `model1`'s second
 * // layer.
 * model2.add(tf.layers.inputLayer({inputShape: [3]}));
 * model2.add(model1.layers[1]);
 * model2.summary();
 * model2.predict(tf.zeros([1, 3])).print();
 * ```
 *
 * @doc {heading: 'Layers', subheading: 'Inputs', namespace: 'layers'}
 */
declare function inputLayer(args: InputLayerArgs): InputLayer;

/**
 * Constructor arguments for InputLayer.
 *
 * Note: You should provide only inputShape or batchInputShape (not both).
 * If only inputShape is provided, then the batchInputShape is determined by
 * the batchSize argument and the inputShape: [batchSize].concat(inputShape).
 */
declare interface InputLayerArgs {
    /** Input shape, not including the batch axis. */
    inputShape?: Shape;
    /** Optional input batch size (integer or null). */
    batchSize?: number;
    /** Batch input shape, including the batch axis. */
    batchInputShape?: Shape;
    /** Datatype of the input.  */
    dtype?: DataType;
    /**
     * Whether the placeholder created is meant to be sparse.
     */
    sparse?: boolean;
    /** Name of the layer. */
    name?: string;
}

/**
 * Specifies the ndim, dtype and shape of every input to a layer.
 *
 * Every layer should expose (if appropriate) an `inputSpec` attribute:
 * a list of instances of InputSpec (one per input tensor).
 *
 * A null entry in a shape is compatible with any dimension,
 * a null shape is compatible with any shape.
 */
export declare class InputSpec {
    /** Expected datatype of the input. */
    dtype?: DataType;
    /** Expected shape of the input (may include null for unchecked axes). */
    shape?: Shape;
    /** Expected rank of the input. */
    ndim?: number;
    /** Maximum rank of the input. */
    maxNDim?: number;
    /** Minimum rank of the input. */
    minNDim?: number;
    /** Dictionary mapping integer axes to a specific dimension value. */
    axes?: {
        [axis: number]: number;
    };
    constructor(args: InputSpecArgs);
}

/**
 * Constructor arguments for InputSpec.
 */
declare interface InputSpecArgs {
    /** Expected datatype of the input. */
    dtype?: DataType;
    /** Expected shape of the input (may include null for unchecked axes). */
    shape?: Shape;
    /** Expected rank of the input. */
    ndim?: number;
    /** Maximum rank of the input. */
    maxNDim?: number;
    /** Minimum rank of the input. */
    minNDim?: number;
    /** Dictionary mapping integer axes to a specific dimension value. */
    axes?: {
        [axis: number]: number;
    };
}

declare const INTERPOLATION_KEYS: readonly ["bilinear", "nearest"];

declare const INTERPOLATION_KEYS_2: readonly ["bilinear", "nearest"];

declare type InterpolationFormat = 'nearest' | 'bilinear';

declare type InterpolationType = typeof INTERPOLATION_KEYS[number];

declare type InterpolationType_2 = typeof INTERPOLATION_KEYS_2[number];

declare function isCapableOfRenderingToFloatTexture(webGLVersion: number): boolean;

/**
 * Check if we can download values from a float/half-float texture.
 *
 * Note that for performance reasons we use binding a texture to a framebuffer
 * as a proxy for ability to download float values later using readPixels. The
 * texture params of this texture will not match those in readPixels exactly
 * but if we are unable to bind some kind of float texture to the frameBuffer
 * then we definitely will not be able to read float values from it.
 */
declare function isDownloadFloatTextureEnabled(webGLVersion: number): boolean;

/**
 * This determines whether reshaping a packed texture requires rearranging
 * the data within the texture, assuming 2x2 packing.
 */
declare function isReshapeFree(shape1: number[], shape2: number[]): boolean;

declare function isWebGLFenceEnabled(webGLVersion: number): boolean;

declare function isWebGLVersionEnabled(webGLVersion: 1 | 2): boolean;

declare function isWebGPUSupported(): boolean;

/** Properties of a Tensor. */
export declare interface ITensor {
    /** Tensor dtype */
    dtype?: (DataType_2 | null);
    /** Tensor tensorShape */
    tensorShape?: (ITensorShape | null);
    /** Tensor versionNumber */
    versionNumber?: (number | null);
    /** Tensor tensorContent */
    tensorContent?: (Uint8Array | null);
    /** Tensor floatVal */
    floatVal?: (number[] | null);
    /** Tensor doubleVal */
    doubleVal?: (number[] | null);
    /** Tensor intVal */
    intVal?: (number[] | null);
    /** Tensor stringVal */
    stringVal?: (Uint8Array[] | null);
    /** Tensor scomplexVal */
    scomplexVal?: (number[] | null);
    /** Tensor int64Val */
    int64Val?: ((number | string)[] | null);
    /** Tensor boolVal */
    boolVal?: (boolean[] | null);
    /** Tensor uint32Val */
    uint32Val?: (number[] | null);
    /** Tensor uint64Val */
    uint64Val?: ((number | string)[] | null);
}

/** Properties of a TensorShape. */
export declare interface ITensorShape {
    /** TensorShape dim */
    dim?: (TensorShape.IDim[] | null);
    /** TensorShape unknownRank */
    unknownRank?: (boolean | null);
}

/**
 * Type representing a loosely-typed bundle of keyword arguments.
 *
 * This is a looser type than PyJsonDict/serialization.ConfigDict as it
 * can contain arbitrary objects as its values.  It is most appropriate
 * for functions that pass through keyword arguments to other functions
 * without knowledge of the structure.  If the function can place type
 * restrictions on the keyword arguments, it should via the Config
 * interface convention used throughout.
 */
declare type Kwargs = {
    [key: string]: any;
};

/**
 * Regularizer for L1 regularization.
 *
 * Adds a term to the loss to penalize large weights:
 * loss += sum(l1 * abs(x))
 * @param args l1 config.
 *
 * @doc {heading: 'Regularizers', namespace: 'regularizers'}
 */
declare function l1(config?: L1Args): Regularizer;

declare interface L1Args {
    /** L1 regularization rate. Defaults to 0.01. */
    l1: number;
}

/**
 * Regularizer for L1 and L2 regularization.
 *
 * Adds a term to the loss to penalize large weights:
 * loss += sum(l1 * abs(x)) + sum(l2 * x^2)
 *
 * @doc {heading: 'Regularizers', namespace: 'regularizers'}
 */
declare function l1l2(config?: L1L2Args): Regularizer;

declare interface L1L2Args {
    /** L1 regularization rate. Defaults to 0.01. */
    l1?: number;
    /** L2 regularization rate. Defaults to 0.01. */
    l2?: number;
}

/**
 * Regularizer for L2 regularization.
 *
 * Adds a term to the loss to penalize large weights:
 * loss += sum(l2 * x^2)
 * @param args l2 config.
 *
 * @doc {heading: 'Regularizers', namespace: 'regularizers'}
 */
declare function l2(config?: L2Args): Regularizer;

declare interface L2Args {
    /** L2 regularization rate. Defaults to 0.01. */
    l2: number;
}

/**
 * A layer is a grouping of operations and weights that can be composed to
 * create a `tf.LayersModel`.
 *
 * Layers are constructed by using the functions under the
 * [tf.layers](#Layers-Basic) namespace.
 *
 * @doc {heading: 'Layers', subheading: 'Classes', namespace: 'layers'}
 */
declare abstract class Layer extends serialization.Serializable {
    /** Name for this layer. Must be unique within a model. */
    name: string;
    /**
     * List of InputSpec class instances.
     *
     * Each entry describes one required input:
     * - ndim
     * - dtype
     * A layer with `n` input tensors must have an `inputSpec` of length `n`.
     */
    inputSpec: InputSpec[];
    supportsMasking: boolean;
    /** Whether the layer weights will be updated during training. */
    protected trainable_: boolean;
    batchInputShape: Shape;
    dtype: DataType;
    initialWeights: Tensor[];
    inboundNodes: Node_2[];
    outboundNodes: Node_2[];
    activityRegularizer: Regularizer;
    protected _trainableWeights: LayerVariable[];
    private _nonTrainableWeights;
    private _losses;
    private _updates;
    private _built;
    private _callHook;
    private _addedWeightNames;
    readonly id: number;
    protected _stateful: boolean;
    protected _refCount: number | null;
    private fastWeightInitDuringBuild;
    constructor(args?: LayerArgs);
    /**
     * Converts a layer and its index to a unique (immutable type) name.
     * This function is used internally with `this.containerNodes`.
     * @param layer The layer.
     * @param nodeIndex The layer's position (e.g. via enumerate) in a list of
     *   nodes.
     *
     * @returns The unique name.
     */
    protected static nodeKey(layer: Layer, nodeIndex: number): string;
    /**
     * Returns this.inboundNode at index nodeIndex.
     *
     * Porting note: This is a replacement for _get_node_attribute_at_index()
     * @param nodeIndex
     * @param attrName The name of the attribute related to request for this node.
     */
    private getNodeAtIndex;
    /**
     * Retrieves the input tensor(s) of a layer at a given node.
     *
     * @param nodeIndex Integer, index of the node from which to retrieve the
     *   attribute. E.g. `nodeIndex=0` will correspond to the first time the layer
     *   was called.
     *
     * @return A tensor (or list of tensors if the layer has multiple inputs).
     */
    getInputAt(nodeIndex: number): SymbolicTensor | SymbolicTensor[];
    /**
     * Retrieves the output tensor(s) of a layer at a given node.
     *
     * @param nodeIndex Integer, index of the node from which to retrieve the
     *   attribute. E.g. `nodeIndex=0` will correspond to the first time the layer
     *   was called.
     *
     * @return A tensor (or list of tensors if the layer has multiple outputs).
     */
    getOutputAt(nodeIndex: number): SymbolicTensor | SymbolicTensor[];
    /**
     * Retrieves the input tensor(s) of a layer.
     *
     * Only applicable if the layer has exactly one inbound node,
     * i.e. if it is connected to one incoming layer.
     *
     * @return Input tensor or list of input tensors.
     *
     * @exception AttributeError if the layer is connected to more than one
     *   incoming layers.
     */
    get input(): SymbolicTensor | SymbolicTensor[];
    /**
     * Retrieves the output tensor(s) of a layer.
     *
     * Only applicable if the layer has exactly one inbound node,
     * i.e. if it is connected to one incoming layer.
     *
     * @return Output tensor or list of output tensors.
     *
     * @exception AttributeError if the layer is connected to more than one
     *   incoming layers.
     */
    get output(): SymbolicTensor | SymbolicTensor[];
    get losses(): RegularizerFn[];
    /**
     * Retrieves the Layer's current loss values.
     *
     * Used for regularizers during training.
     */
    calculateLosses(): Scalar[];
    get updates(): Tensor[];
    get built(): boolean;
    set built(built: boolean);
    get trainable(): boolean;
    set trainable(trainable: boolean);
    get trainableWeights(): LayerVariable[];
    set trainableWeights(weights: LayerVariable[]);
    get nonTrainableWeights(): LayerVariable[];
    set nonTrainableWeights(weights: LayerVariable[]);
    /**
     * The concatenation of the lists trainableWeights and nonTrainableWeights
     * (in this order).
     */
    get weights(): LayerVariable[];
    get stateful(): boolean;
    /**
     * Reset the states of the layer.
     *
     * This method of the base Layer class is essentially a no-op.
     * Subclasses that are stateful (e.g., stateful RNNs) should override this
     * method.
     */
    resetStates(): void;
    /**
     * Checks compatibility between the layer and provided inputs.
     *
     * This checks that the tensor(s) `input`
     * verify the input assumptions of the layer
     * (if any). If not, exceptions are raised.
     *
     * @param inputs Input tensor or list of input tensors.
     *
     * @exception ValueError in case of mismatch between
     *   the provided inputs and the expectations of the layer.
     */
    protected assertInputCompatibility(inputs: Tensor | Tensor[] | SymbolicTensor | SymbolicTensor[]): void;
    /**
     * This is where the layer's logic lives.
     *
     * @param inputs Input tensor, or list/tuple of input tensors.
     * @param kwargs Additional keyword arguments.
     *
     * @return A tensor or list/tuple of tensors.
     */
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    protected invokeCallHook(inputs: Tensor | Tensor[], kwargs: Kwargs): void;
    /**
     * Set call hook.
     * This is currently used for testing only.
     * @param callHook
     */
    setCallHook(callHook: CallHook): void;
    /**
     * Clear call hook.
     * This is currently used for testing only.
     */
    clearCallHook(): void;
    /**
     * Builds or executes a `Layer`'s logic.
     *
     * When called with `tf.Tensor`(s), execute the `Layer`'s computation and
     * return Tensor(s). For example:
     *
     * ```js
     * const denseLayer = tf.layers.dense({
     *   units: 1,
     *   kernelInitializer: 'zeros',
     *   useBias: false
     * });
     *
     * // Invoke the layer's apply() method with a `tf.Tensor` (with concrete
     * // numeric values).
     * const input = tf.ones([2, 2]);
     * const output = denseLayer.apply(input);
     *
     * // The output's value is expected to be [[0], [0]], due to the fact that
     * // the dense layer has a kernel initialized to all-zeros and does not have
     * // a bias.
     * output.print();
     * ```
     *
     * When called with `tf.SymbolicTensor`(s), this will prepare the layer for
     * future execution.  This entails internal book-keeping on shapes of
     * expected Tensors, wiring layers together, and initializing weights.
     *
     * Calling `apply` with `tf.SymbolicTensor`s are typically used during the
     * building of non-`tf.Sequential` models. For example:
     *
     * ```js
     * const flattenLayer = tf.layers.flatten();
     * const denseLayer = tf.layers.dense({units: 1});
     *
     * // Use tf.layers.input() to obtain a SymbolicTensor as input to apply().
     * const input = tf.input({shape: [2, 2]});
     * const output1 = flattenLayer.apply(input);
     *
     * // output1.shape is [null, 4]. The first dimension is the undetermined
     * // batch size. The second dimension comes from flattening the [2, 2]
     * // shape.
     * console.log(JSON.stringify(output1.shape));
     *
     * // The output SymbolicTensor of the flatten layer can be used to call
     * // the apply() of the dense layer:
     * const output2 = denseLayer.apply(output1);
     *
     * // output2.shape is [null, 1]. The first dimension is the undetermined
     * // batch size. The second dimension matches the number of units of the
     * // dense layer.
     * console.log(JSON.stringify(output2.shape));
     *
     * // The input and output can be used to construct a model that consists
     * // of the flatten and dense layers.
     * const model = tf.model({inputs: input, outputs: output2});
     * ```
     *
     * @param inputs a `tf.Tensor` or `tf.SymbolicTensor` or an Array of them.
     * @param kwargs Additional keyword arguments to be passed to `call()`.
     *
     * @return Output of the layer's `call` method.
     *
     * @exception ValueError error in case the layer is missing shape information
     *   for its `build` call.
     *
     * @doc {heading: 'Models', 'subheading': 'Classes'}
     */
    apply(inputs: Tensor | Tensor[] | SymbolicTensor | SymbolicTensor[], kwargs?: Kwargs): Tensor | Tensor[] | SymbolicTensor | SymbolicTensor[];
    /**
     * Check compatibility between input shape and this layer's batchInputShape.
     *
     * Print warning if any incompatibility is found.
     *
     * @param inputShape Input shape to be checked.
     */
    protected warnOnIncompatibleInputShape(inputShape: Shape): void;
    /**
     * Retrieves the output shape(s) of a layer.
     *
     * Only applicable if the layer has only one inbound node, or if all inbound
     * nodes have the same output shape.
     *
     * @returns Output shape or shapes.
     * @throws AttributeError: if the layer is connected to more than one incoming
     *   nodes.
     *
     * @doc {heading: 'Models', 'subheading': 'Classes'}
     */
    get outputShape(): Shape | Shape[];
    /**
     * Counts the total number of numbers (e.g., float32, int32) in the
     * weights.
     *
     * @returns An integer count.
     * @throws RuntimeError: If the layer is not built yet (in which case its
     *   weights are not defined yet.)
     *
     * @doc {heading: 'Models', 'subheading': 'Classes'}
     */
    countParams(): number;
    /**
     * Creates the layer weights.
     *
     * Must be implemented on all layers that have weights.
     *
     * Called when apply() is called to construct the weights.
     *
     * @param inputShape A `Shape` or array of `Shape` (unused).
     *
     * @doc {heading: 'Models', 'subheading': 'Classes'}
     */
    build(inputShape: Shape | Shape[]): void;
    /**
     * Returns the current values of the weights of the layer.
     *
     * @param trainableOnly Whether to get the values of only trainable weights.
     * @returns Weight values as an `Array` of `tf.Tensor`s.
     *
     * @doc {heading: 'Models', 'subheading': 'Classes'}
     */
    getWeights(trainableOnly?: boolean): Tensor[];
    /**
     * Sets the weights of the layer, from Tensors.
     *
     * @param weights a list of Tensors. The number of arrays and their shape
     *   must match number of the dimensions of the weights of the layer (i.e.
     *   it should match the output of `getWeights`).
     *
     * @exception ValueError If the provided weights list does not match the
     *   layer's specifications.
     *
     * @doc {heading: 'Models', 'subheading': 'Classes'}
     */
    setWeights(weights: Tensor[]): void;
    /**
     * Adds a weight variable to the layer.
     *
     * @param name Name of the new weight variable.
     * @param shape The shape of the weight.
     * @param dtype The dtype of the weight.
     * @param initializer An initializer instance.
     * @param regularizer A regularizer instance.
     * @param trainable Whether the weight should be trained via backprop or not
     *   (assuming that the layer itself is also trainable).
     * @param constraint An optional trainable.
     * @return The created weight variable.
     *
     * @doc {heading: 'Models', 'subheading': 'Classes'}
     */
    protected addWeight(name: string, shape: Shape, dtype?: DataType, initializer?: Initializer, regularizer?: Regularizer, trainable?: boolean, constraint?: Constraint, getInitializerFunc?: Function): LayerVariable;
    /**
     * Set the fast-weight-initialization flag.
     *
     * In cases where the initialized weight values will be immediately
     * overwritten by loaded weight values during model loading, setting
     * the flag to `true` saves unnecessary calls to potentially expensive
     * initializers and speeds up the loading process.
     *
     * @param value Target value of the flag.
     */
    setFastWeightInitDuringBuild(value: boolean): void;
    /**
     * Add losses to the layer.
     *
     * The loss may potentially be conditional on some inputs tensors,
     * for instance activity losses are conditional on the layer's inputs.
     *
     * @doc {heading: 'Models', 'subheading': 'Classes'}
     */
    addLoss(losses: RegularizerFn | RegularizerFn[]): void;
    /**
     * Computes the output shape of the layer.
     *
     * Assumes that the layer will be built to match that input shape provided.
     *
     * @param inputShape A shape (tuple of integers) or a list of shape tuples
     *   (one per output tensor of the layer). Shape tuples can include null for
     *   free dimensions, instead of an integer.
     *
     * @doc {heading: 'Models', 'subheading': 'Classes'}
     */
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    /**
     * Computes an output mask tensor.
     *
     * @param inputs Tensor or list of tensors.
     * @param mask Tensor or list of tensors.
     *
     * @return null or a tensor (or list of tensors, one per output tensor of the
     * layer).
     */
    computeMask(inputs: Tensor | Tensor[], mask?: Tensor | Tensor[]): Tensor | Tensor[];
    private setMaskMetadata;
    /**
     * Internal method to create an inbound node for the layer.
     *
     * @param inputTensors List of input tensors.
     * @param outputTensors List of output tensors.
     * @param inputMasks List of input masks (a mask can be a tensor, or null).
     * @param outputMasks List of output masks (a mask can be a tensor, or null).
     * @param inputShapes List of input shape tuples.
     * @param outputShapes List of output shape tuples.
     * @param kwargs Dictionary of keyword arguments that were passed to the
     *   `call` method of the layer at the call that created the node.
     */
    private addInboundNode;
    /**
     * Returns the config of the layer.
     *
     * A layer config is a TS dictionary (serializable)
     * containing the configuration of a layer.
     * The same layer can be reinstantiated later
     * (without its trained weights) from this configuration.
     *
     * The config of a layer does not include connectivity
     * information, nor the layer class name.  These are handled
     * by 'Container' (one layer of abstraction above).
     *
     * Porting Note: The TS dictionary follows TS naming standards for
     * keys, and uses tfjs-layers type-safe Enums.  Serialization methods
     * should use a helper function to convert to the pythonic storage
     * standard. (see serialization_utils.convertTsToPythonic)
     *
     * @returns TS dictionary of configuration.
     *
     * @doc {heading: 'Models', 'subheading': 'Classes'}
     */
    getConfig(): serialization.ConfigDict;
    /**
     * Dispose the weight variables that this Layer instance holds.
     *
     * @returns {number} Number of disposed variables.
     */
    protected disposeWeights(): number;
    protected assertNotDisposed(): void;
    /**
     * Attempt to dispose layer's weights.
     *
     * This method decreases the reference count of the Layer object by 1.
     *
     * A Layer is reference-counted. Its reference count is incremented by 1
     * the first item its `apply()` method is called and when it becomes a part
     * of a new `Node` (through calling the `apply()` method on a
     * `tf.SymbolicTensor`).
     *
     * If the reference count of a Layer becomes 0, all the weights will be
     * disposed and the underlying memory (e.g., the textures allocated in WebGL)
     * will be freed.
     *
     * Note: If the reference count is greater than 0 after the decrement, the
     * weights of the Layer will *not* be disposed.
     *
     * After a Layer is disposed, it cannot be used in calls such as `apply()`,
     * `getWeights()` or `setWeights()` anymore.
     *
     * @returns A DisposeResult Object with the following fields:
     *   - refCountAfterDispose: The reference count of the Container after this
     *     `dispose()` call.
     *   - numDisposedVariables: Number of `tf.Variable`s (i.e., weights) disposed
     *     during this `dispose()` call.
     * @throws {Error} If the layer is not built yet, or if the layer has already
     *   been disposed.
     *
     * @doc {heading: 'Models', 'subheading': 'Classes'}
     */
    dispose(): DisposeResult;
}

/** Constructor arguments for Layer. */
declare interface LayerArgs {
    /**
     * If defined, will be used to create an input layer to insert before this
     * layer. If both `inputShape` and `batchInputShape` are defined,
     * `batchInputShape` will be used. This argument is only applicable to input
     * layers (the first layer of a model).
     */
    inputShape?: Shape;
    /**
     * If defined, will be used to create an input layer to insert before this
     * layer. If both `inputShape` and `batchInputShape` are defined,
     * `batchInputShape` will be used. This argument is only applicable to input
     * layers (the first layer of a model).
     */
    batchInputShape?: Shape;
    /**
     * If `inputShape` is specified and `batchInputShape` is *not* specified,
     * `batchSize` is used to construct the `batchInputShape`: `[batchSize,
     * ...inputShape]`
     */
    batchSize?: number;
    /**
     * The data-type for this layer. Defaults to 'float32'.
     * This argument is only applicable to input layers (the first layer of a
     * model).
     */
    dtype?: DataType;
    /** Name for this layer. */
    name?: string;
    /**
     * Whether the weights of this layer are updatable by `fit`.
     * Defaults to true.
     */
    trainable?: boolean;
    /**
     * Initial weight values of the layer.
     */
    weights?: Tensor[];
    /** Legacy support. Do not use for new code. */
    inputDType?: DataType;
}

/** Constructor arguments for Layer. */
declare interface LayerConfig extends PyJsonDict {
    input_shape?: Shape;
    batch_input_shape?: Shape;
    batch_size?: number;
    dtype?: DataType;
    name?: string;
    trainable?: boolean;
    input_dtype?: DataType;
}

declare class LayerNormalization extends Layer {
    /** @nocollapse */
    static className: string;
    private axis;
    readonly epsilon: number;
    readonly center: boolean;
    readonly scale: boolean;
    readonly betaInitializer: Initializer;
    readonly gammaInitializer: Initializer;
    readonly betaRegularizer: Regularizer;
    readonly gammaRegularizer: Regularizer;
    private gamma;
    private beta;
    constructor(args?: LayerNormalizationLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}

/**
 * Layer-normalization layer (Ba et al., 2016).
 *
 * Normalizes the activations of the previous layer for each given example in a
 * batch independently, instead of across a batch like in `batchNormalization`.
 * In other words, this layer applies a transformation that maintains the mean
 * activation within each example close to 0 and activation variance close to 1.
 *
 * Input shape:
 *   Arbitrary. Use the argument `inputShape` when using this layer as the first
 *   layer in a model.
 *
 * Output shape:
 *   Same as input.
 *
 * References:
 *   - [Layer Normalization](https://arxiv.org/abs/1607.06450)
 *
 * @doc {heading: 'Layers', subheading: 'Normalization', namespace: 'layers'}
 */
declare function layerNormalization(args?: LayerNormalizationLayerArgs): LayerNormalization;

declare interface LayerNormalizationLayerArgs extends LayerArgs {
    /**
     * The axis or axes that should be normalized (typically, the feature axis).
     * Defaults to -1 (the last axis).
     */
    axis?: number | number[];
    /**
     * A small positive float added to variance to avoid divison by zero.
     * Defaults to 1e-3.
     */
    epsilon?: number;
    /**
     * If `true`, add offset of `beta` to normalized tensor.
     * If `false`, `beta` is ignored.
     * Default: `true`.
     */
    center?: boolean;
    /**
     * If `true`, multiply output by `gamma`.
     * If `false`, `gamma` is not used.
     * When the next layer is linear, this can be disabled since scaling will
     * be done by the next layer.
     * Default: `true`.
     */
    scale?: boolean;
    /**
     * Initializer for the beta weight.
     * Default: `'zeros'`.
     */
    betaInitializer?: InitializerIdentifier | Initializer;
    /**
     * Initializer for the gamma weight.
     * Default: `'ones'`.
     */
    gammaInitializer?: InitializerIdentifier | Initializer;
    /** Regularizer for the beta weight. */
    betaRegularizer?: RegularizerIdentifier | Regularizer;
    /** Regularizer for the gamma weight. */
    gammaRegularizer?: RegularizerIdentifier | Regularizer;
}

declare namespace layers {
    export {
        inputLayer,
        elu,
        reLU,
        leakyReLU,
        prelu,
        softmax,
        thresholdedReLU,
        conv1d,
        conv2d,
        conv2dTranspose,
        conv3d,
        conv3dTranspose,
        separableConv2d,
        cropping2D,
        upSampling2d,
        depthwiseConv2d,
        activation,
        dense,
        dropout,
        spatialDropout1d,
        flatten,
        repeatVector,
        reshape,
        permute,
        embedding,
        add,
        average,
        concatenate,
        maximum,
        minimum,
        multiply,
        dot,
        batchNormalization,
        layerNormalization,
        zeroPadding2d,
        averagePooling1d,
        avgPool1d,
        avgPooling1d,
        averagePooling2d,
        avgPool2d,
        avgPooling2d,
        averagePooling3d,
        avgPool3d,
        avgPooling3d,
        globalAveragePooling1d,
        globalAveragePooling2d,
        globalMaxPooling1d,
        globalMaxPooling2d,
        maxPooling1d,
        maxPooling2d,
        maxPooling3d,
        gru,
        gruCell,
        lstm,
        lstmCell,
        simpleRNN,
        simpleRNNCell,
        convLstm2d,
        convLstm2dCell,
        rnn,
        stackedRNNCells,
        bidirectional,
        timeDistributed,
        gaussianNoise,
        gaussianDropout,
        alphaDropout,
        masking,
        rescaling,
        centerCrop,
        resizing,
        categoryEncoding,
        randomWidth,
        globalMaxPool1d,
        globalMaxPool2d,
        maxPool1d,
        maxPool2d,
        Layer,
        RNN,
        RNNCell,
        input
    }
}
export { layers }

/**
 * A `tf.LayersModel` is a directed, acyclic graph of `tf.Layer`s plus methods
 * for training, evaluation, prediction and saving.
 *
 * `tf.LayersModel` is the basic unit of training, inference and evaluation in
 * TensorFlow.js. To create a `tf.LayersModel`, use `tf.LayersModel`.
 *
 * See also:
 *   `tf.Sequential`, `tf.loadLayersModel`.
 *
 * @doc {heading: 'Models', subheading: 'Classes'}
 */
export declare class LayersModel extends Container implements tfc.InferenceModel {
    /** @nocollapse */
    static className: string;
    protected optimizer_: Optimizer;
    protected isOptimizerOwned: boolean;
    loss: string | string[] | {
        [outputName: string]: string;
    } | LossOrMetricFn | LossOrMetricFn[] | {
        [outputName: string]: LossOrMetricFn;
    };
    lossFunctions: LossOrMetricFn[];
    private feedOutputShapes;
    private feedLossFns;
    private collectedTrainableWeights;
    private testFunction;
    history: History_2;
    protected stopTraining_: boolean;
    protected isTraining: boolean;
    metrics: string | LossOrMetricFn | Array<string | LossOrMetricFn> | {
        [outputName: string]: string | LossOrMetricFn;
    };
    metricsNames: string[];
    metricsTensors: Array<[LossOrMetricFn, number]>;
    private userDefinedMetadata;
    constructor(args: ContainerArgs);
    /**
     * Print a text summary of the model's layers.
     *
     * The summary includes
     * - Name and type of all layers that comprise the model.
     * - Output shape(s) of the layers
     * - Number of weight parameters of each layer
     * - If the model has non-sequential-like topology, the inputs each layer
     *   receives
     * - The total number of trainable and non-trainable parameters of the model.
     *
     * ```js
     * const input1 = tf.input({shape: [10]});
     * const input2 = tf.input({shape: [20]});
     * const dense1 = tf.layers.dense({units: 4}).apply(input1);
     * const dense2 = tf.layers.dense({units: 8}).apply(input2);
     * const concat = tf.layers.concatenate().apply([dense1, dense2]);
     * const output =
     *     tf.layers.dense({units: 3, activation: 'softmax'}).apply(concat);
     *
     * const model = tf.model({inputs: [input1, input2], outputs: output});
     * model.summary();
     * ```
     *
     * @param lineLength Custom line length, in number of characters.
     * @param positions Custom widths of each of the columns, as either
     *   fractions of `lineLength` (e.g., `[0.5, 0.75, 1]`) or absolute number
     *   of characters (e.g., `[30, 50, 65]`). Each number corresponds to
     *   right-most (i.e., ending) position of a column.
     * @param printFn Custom print function. Can be used to replace the default
     *   `console.log`. For example, you can use `x => {}` to mute the printed
     *   messages in the console.
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    summary(lineLength?: number, positions?: number[], printFn?: (message?: any, ...optionalParams: any[]) => void): void;
    /**
     * Configures and prepares the model for training and evaluation.  Compiling
     * outfits the model with an optimizer, loss, and/or metrics.  Calling `fit`
     * or `evaluate` on an un-compiled model will throw an error.
     *
     * @param args a `ModelCompileArgs` specifying the loss, optimizer, and
     * metrics to be used for fitting and evaluating this model.
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    compile(args: ModelCompileArgs): void;
    /**
     * Check trainable weights count consistency.
     *
     * This will raise a warning if `this.trainableWeights` and
     * `this.collectedTrainableWeights` are inconsistent (i.e., have different
     * numbers of parameters).
     * Inconsistency will typically arise when one modifies `model.trainable`
     * without calling `model.compile()` again.
     */
    protected checkTrainableWeightsConsistency(): void;
    /**
     * Returns the loss value & metrics values for the model in test mode.
     *
     * Loss and metrics are specified during `compile()`, which needs to happen
     * before calls to `evaluate()`.
     *
     * Computation is done in batches.
     *
     * ```js
     * const model = tf.sequential({
     *   layers: [tf.layers.dense({units: 1, inputShape: [10]})]
     * });
     * model.compile({optimizer: 'sgd', loss: 'meanSquaredError'});
     * const result = model.evaluate(
     *     tf.ones([8, 10]), tf.ones([8, 1]), {batchSize: 4});
     * result.print();
     * ```
     *
     * @param x `tf.Tensor` of test data, or an `Array` of `tf.Tensor`s if the
     * model has multiple inputs.
     * @param y `tf.Tensor` of target data, or an `Array` of `tf.Tensor`s if the
     * model has multiple outputs.
     * @param args A `ModelEvaluateArgs`, containing optional fields.
     *
     * @return `Scalar` test loss (if the model has a single output and no
     *   metrics) or `Array` of `Scalar`s (if the model has multiple outputs
     *   and/or metrics). The attribute `model.metricsNames`
     *   will give you the display labels for the scalar outputs.
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    evaluate(x: Tensor | Tensor[], y: Tensor | Tensor[], args?: ModelEvaluateArgs): Scalar | Scalar[];
    /**
     * Evaluate model using a dataset object.
     *
     * Note: Unlike `evaluate()`, this method is asynchronous (`async`).
     *
     * @param dataset A dataset object. Its `iterator()` method is expected
     *   to generate a dataset iterator object, the `next()` method of which
     *   is expected to produce data batches for evaluation. The return value
     *   of the `next()` call ought to contain a boolean `done` field and a
     *   `value` field. The `value` field is expected to be an array of two
     *   `tf.Tensor`s or an array of two nested `tf.Tensor` structures. The former
     *   case is for models with exactly one input and one output (e.g.
     *   a sequential model). The latter case is for models with multiple
     *   inputs and/or multiple outputs. Of the two items in the array, the
     *   first is the input feature(s) and the second is the output target(s).
     * @param args A configuration object for the dataset-based evaluation.
     * @returns Loss and metric values as an Array of `Scalar` objects.
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    evaluateDataset(dataset: Dataset<{}>, args?: ModelEvaluateDatasetArgs): Promise<Scalar | Scalar[]>;
    /**
     * Get number of samples provided for training, evaluation or prediction.
     *
     * @param ins Input `tf.Tensor`.
     * @param batchSize Integer batch size, optional.
     * @param steps Total number of steps (batches of samples) before
     * declaring loop finished. Optional.
     * @param stepsName The public API's parameter name for `steps`.
     * @returns Number of samples provided.
     */
    private checkNumSamples;
    /**
     * Execute internal tensors of the model with input data feed.
     * @param inputs Input data feed. Must match the inputs of the model.
     * @param outputs Names of the output tensors to be fetched. Must match
     *   names of the SymbolicTensors that belong to the graph.
     * @returns Fetched values for `outputs`.
     */
    execute(inputs: Tensor | Tensor[] | NamedTensorMap, outputs: string | string[]): Tensor | Tensor[];
    /**
     * Retrieve the model's internal symbolic tensors from symbolic-tensor names.
     */
    private retrieveSymbolicTensors;
    /**
     * Helper method to loop over some data in batches.
     *
     * Porting Note: Not using the functional approach in the Python equivalent
     *   due to the imperative backend.
     * Porting Note: Does not support step mode currently.
     *
     * @param ins: input data
     * @param batchSize: integer batch size.
     * @param verbose: verbosity model
     * @returns: Predictions as `tf.Tensor` (if a single output) or an `Array` of
     *   `tf.Tensor` (if multipe outputs).
     */
    private predictLoop;
    /**
     * Generates output predictions for the input samples.
     *
     * Computation is done in batches.
     *
     * Note: the "step" mode of predict() is currently not supported.
     *   This is because the TensorFlow.js core backend is imperative only.
     *
     * ```js
     * const model = tf.sequential({
     *   layers: [tf.layers.dense({units: 1, inputShape: [10]})]
     * });
     * model.predict(tf.ones([8, 10]), {batchSize: 4}).print();
     * ```
     *
     * @param x The input data, as a Tensor, or an `Array` of `tf.Tensor`s if
     *   the model has multiple inputs.
     * @param args A `ModelPredictArgs` object containing optional fields.
     *
     * @return Prediction results as a `tf.Tensor`(s).
     *
     * @exception ValueError In case of mismatch between the provided input data
     *   and the model's expectations, or in case a stateful model receives a
     *   number of samples that is not a multiple of the batch size.
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    predict(x: Tensor | Tensor[], args?: ModelPredictConfig): Tensor | Tensor[];
    /**
     * Returns predictions for a single batch of samples.
     *
     * ```js
     * const model = tf.sequential({
     *   layers: [tf.layers.dense({units: 1, inputShape: [10]})]
     * });
     * model.predictOnBatch(tf.ones([8, 10])).print();
     * ```
     * @param x: Input samples, as a Tensor (for models with exactly one
     *   input) or an array of Tensors (for models with more than one input).
     * @return Tensor(s) of predictions
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    predictOnBatch(x: Tensor | Tensor[]): Tensor | Tensor[];
    protected standardizeUserDataXY(x: Tensor | Tensor[] | {
        [inputName: string]: Tensor;
    }, y: Tensor | Tensor[] | {
        [inputName: string]: Tensor;
    }, checkBatchAxis?: boolean, batchSize?: number): [Tensor[], Tensor[]];
    protected standardizeUserData(x: Tensor | Tensor[] | {
        [inputName: string]: Tensor;
    }, y: Tensor | Tensor[] | {
        [inputName: string]: Tensor;
    }, sampleWeight?: Tensor | Tensor[] | {
        [outputName: string]: Tensor;
    }, classWeight?: ClassWeight | ClassWeight[] | ClassWeightMap, checkBatchAxis?: boolean, batchSize?: number): Promise<[Tensor[], Tensor[], Tensor[]]>;
    /**
     * Loop over some test data in batches.
     * @param f A Function returning a list of tensors.
     * @param ins Array of tensors to be fed to `f`.
     * @param batchSize Integer batch size or `null` / `undefined`.
     * @param verbose verbosity mode.
     * @param steps Total number of steps (batches of samples) before
     * declaring test finished. Ignored with the default value of `null` /
     * `undefined`.
     * @returns Array of Scalars.
     */
    private testLoop;
    protected getDedupedMetricsNames(): string[];
    /**
     * Creates a function that performs the following actions:
     *
     * 1. computes the losses
     * 2. sums them to get the total loss
     * 3. call the optimizer computes the gradients of the LayersModel's
     *    trainable weights w.r.t. the total loss and update the variables
     * 4. calculates the metrics
     * 5. returns the values of the losses and metrics.
     */
    protected makeTrainFunction(): (data: Tensor[]) => Scalar[];
    /**
     * Create a function which, when invoked with an array of `tf.Tensor`s as a
     * batch of inputs, returns the prespecified loss and metrics of the model
     * under the batch of input data.
     */
    private makeTestFunction;
    /**
     * Trains the model for a fixed number of epochs (iterations on a
     * dataset).
     *
     * ```js
     * const model = tf.sequential({
     *     layers: [tf.layers.dense({units: 1, inputShape: [10]})]
     * });
     * model.compile({optimizer: 'sgd', loss: 'meanSquaredError'});
     * for (let i = 1; i < 5 ; ++i) {
     *   const h = await model.fit(tf.ones([8, 10]), tf.ones([8, 1]), {
     *       batchSize: 4,
     *       epochs: 3
     *   });
     *   console.log("Loss after Epoch " + i + " : " + h.history.loss[0]);
     * }
     * ```
     *
     * @param x `tf.Tensor` of training data, or an array of `tf.Tensor`s if the
     * model has multiple inputs. If all inputs in the model are named, you
     * can also pass a dictionary mapping input names to `tf.Tensor`s.
     * @param y `tf.Tensor` of target (label) data, or an array of `tf.Tensor`s if
     * the model has multiple outputs. If all outputs in the model are named,
     * you can also pass a dictionary mapping output names to `tf.Tensor`s.
     * @param args A `ModelFitArgs`, containing optional fields.
     *
     * @return A `History` instance. Its `history` attribute contains all
     *   information collected during training.
     *
     * @exception ValueError In case of mismatch between the provided input
     * data and what the model expects.
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    fit(x: Tensor | Tensor[] | {
        [inputName: string]: Tensor;
    }, y: Tensor | Tensor[] | {
        [inputName: string]: Tensor;
    }, args?: ModelFitArgs): Promise<History_2>;
    /**
     * Abstract fit function for `f(ins)`.
     * @param f A Function returning a list of tensors. For training, this
     *   function is expected to perform the updates to the variables.
     * @param ins List of tensors to be fed to `f`.
     * @param outLabels List of strings, display names of the outputs of `f`.
     * @param batchSize Integer batch size or `== null` if unknown. Default : 32.
     * @param epochs Number of times to iterate over the data. Default : 1.
     * @param verbose Verbosity mode: 0, 1, or 2. Default: 1.
     * @param callbacks List of callbacks to be called during training.
     * @param valF Function to call for validation.
     * @param valIns List of tensors to be fed to `valF`.
     * @param shuffle Whether to shuffle the data at the beginning of every
     * epoch. Default : true.
     * @param callbackMetrics List of strings, the display names of the metrics
     *   passed to the callbacks. They should be the concatenation of the
     *   display names of the outputs of `f` and the list of display names
     *   of the outputs of `valF`.
     * @param initialEpoch Epoch at which to start training (useful for
     *   resuming a previous training run). Default : 0.
     * @param stepsPerEpoch Total number of steps (batches on samples) before
     *   declaring one epoch finished and starting the next epoch. Ignored with
     *   the default value of `undefined` or `null`.
     * @param validationSteps Number of steps to run validation for (only if
     *   doing validation from data tensors). Not applicable for tfjs-layers.
     * @returns A `History` object.
     */
    fitLoop(f: (data: Tensor[]) => Scalar[], ins: Tensor[], outLabels?: string[], batchSize?: number, epochs?: number, verbose?: number, callbacks?: BaseCallback[], valF?: (data: Tensor[]) => Scalar[], valIns?: Tensor[], shuffle?: boolean | string, callbackMetrics?: string[], initialEpoch?: number, stepsPerEpoch?: number, validationSteps?: number): Promise<History_2>;
    /**
     * Trains the model using a dataset object.
     *
     * @param dataset A dataset object. Its `iterator()` method is expected
     *   to generate a dataset iterator object, the `next()` method of which
     *   is expected to produce data batches for training. The return value
     *   of the `next()` call ought to contain a boolean `done` field and a
     *   `value` field. The `value` field is expected to be an array of two
     *   `tf.Tensor`s or an array of two nested `tf.Tensor` structures. The former
     *   case is for models with exactly one input and one output (e.g.
     *   a sequential model). The latter case is for models with multiple
     *   inputs and/or multiple outputs.
     *   Of the two items in the array, the first is the input feature(s) and
     *   the second is the output target(s).
     * @param args A `ModelFitDatasetArgs`, containing optional fields.
     *
     * @return A `History` instance. Its `history` attribute contains all
     *   information collected during training.
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    fitDataset<T>(dataset: Dataset<T>, args: ModelFitDatasetArgs<T>): Promise<History_2>;
    /**
     * Runs a single gradient update on a single batch of data.
     *
     * This method differs from `fit()` and `fitDataset()` in the following
     * regards:
     *   - It operates on exactly one batch of data.
     *   - It returns only the loss and metric values, instead of
     *     returning the batch-by-batch loss and metric values.
     *   - It doesn't support fine-grained options such as verbosity and
     *     callbacks.
     *
     * @param x Input data. It could be one of the following:
     *   - A `tf.Tensor`, or an Array of `tf.Tensor`s (in case the model has
     *     multiple inputs).
     *   - An Object mapping input names to corresponding `tf.Tensor` (if the
     *     model has named inputs).
     * @param y Target data. It could be either a `tf.Tensor` or multiple
     *   `tf.Tensor`s. It should be consistent with `x`.
     * @returns Training loss or losses (in case the model has
     *   multiple outputs), along with metrics (if any), as numbers.
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    trainOnBatch(x: Tensor | Tensor[] | {
        [inputName: string]: Tensor;
    }, y: Tensor | Tensor[] | {
        [inputName: string]: Tensor;
    }): Promise<number | number[]>;
    /**
     * Extract weight values of the model.
     *
     * @param config: An instance of `io.SaveConfig`, which specifies
     * model-saving options such as whether only trainable weights are to be
     * saved.
     * @returns A `NamedTensorMap` mapping original weight names (i.e.,
     *   non-uniqueified weight names) to their values.
     */
    protected getNamedWeights(config?: io.SaveConfig): NamedTensor[];
    /**
     * Setter used for force stopping of LayersModel.fit() (i.e., training).
     *
     * Example:
     *
     * ```js
     * const input = tf.input({shape: [10]});
     * const output = tf.layers.dense({units: 1}).apply(input);
     * const model = tf.model({inputs: [input], outputs: [output]});
     * model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});
     * const xs = tf.ones([8, 10]);
     * const ys = tf.zeros([8, 1]);
     *
     * const history = await model.fit(xs, ys, {
     *   epochs: 10,
     *   callbacks: {
     *     onEpochEnd: async (epoch, logs) => {
     *       if (epoch === 2) {
     *         model.stopTraining = true;
     *       }
     *     }
     *   }
     * });
     *
     * // There should be only 3 values in the loss array, instead of 10
     * values,
     * // due to the stopping after 3 epochs.
     * console.log(history.history.loss);
     * ```
     */
    set stopTraining(stop: boolean);
    get stopTraining(): boolean;
    get optimizer(): Optimizer;
    set optimizer(optimizer: Optimizer);
    dispose(): DisposeResult;
    private getLossIdentifiers;
    private getMetricIdentifiers;
    protected getTrainingConfig(): TrainingConfig;
    loadTrainingConfig(trainingConfig: TrainingConfig): void;
    /**
     * Save the configuration and/or weights of the LayersModel.
     *
     * An `IOHandler` is an object that has a `save` method of the proper
     * signature defined. The `save` method manages the storing or
     * transmission of serialized data ("artifacts") that represent the
     * model's topology and weights onto or via a specific medium, such as
     * file downloads, local storage, IndexedDB in the web browser and HTTP
     * requests to a server. TensorFlow.js provides `IOHandler`
     * implementations for a number of frequently used saving mediums, such as
     * `tf.io.browserDownloads` and `tf.io.browserLocalStorage`. See `tf.io`
     * for more details.
     *
     * This method also allows you to refer to certain types of `IOHandler`s
     * as URL-like string shortcuts, such as 'localstorage://' and
     * 'indexeddb://'.
     *
     * Example 1: Save `model`'s topology and weights to browser [local
     * storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage);
     * then load it back.
     *
     * ```js
     * const model = tf.sequential(
     *     {layers: [tf.layers.dense({units: 1, inputShape: [3]})]});
     * console.log('Prediction from original model:');
     * model.predict(tf.ones([1, 3])).print();
     *
     * const saveResults = await model.save('localstorage://my-model-1');
     *
     * const loadedModel = await tf.loadLayersModel('localstorage://my-model-1');
     * console.log('Prediction from loaded model:');
     * loadedModel.predict(tf.ones([1, 3])).print();
     * ```
     *
     * Example 2. Saving `model`'s topology and weights to browser
     * [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API);
     * then load it back.
     *
     * ```js
     * const model = tf.sequential(
     *     {layers: [tf.layers.dense({units: 1, inputShape: [3]})]});
     * console.log('Prediction from original model:');
     * model.predict(tf.ones([1, 3])).print();
     *
     * const saveResults = await model.save('indexeddb://my-model-1');
     *
     * const loadedModel = await tf.loadLayersModel('indexeddb://my-model-1');
     * console.log('Prediction from loaded model:');
     * loadedModel.predict(tf.ones([1, 3])).print();
     * ```
     *
     * Example 3. Saving `model`'s topology and weights as two files
     * (`my-model-1.json` and `my-model-1.weights.bin`) downloaded from
     * browser.
     *
     * ```js
     * const model = tf.sequential(
     *     {layers: [tf.layers.dense({units: 1, inputShape: [3]})]});
     * const saveResults = await model.save('downloads://my-model-1');
     * ```
     *
     * Example 4. Send  `model`'s topology and weights to an HTTP server.
     * See the documentation of `tf.io.http` for more details
     * including specifying request parameters and implementation of the
     * server.
     *
     * ```js
     * const model = tf.sequential(
     *     {layers: [tf.layers.dense({units: 1, inputShape: [3]})]});
     * const saveResults = await model.save('http://my-server/model/upload');
     * ```
     *
     * @param handlerOrURL An instance of `IOHandler` or a URL-like,
     * scheme-based string shortcut for `IOHandler`.
     * @param config Options for saving the model.
     * @returns A `Promise` of `SaveResult`, which summarizes the result of
     * the saving, such as byte sizes of the saved artifacts for the model's
     *   topology and weight values.
     *
     * @doc {heading: 'Models', subheading: 'Classes', ignoreCI: true}
     */
    save(handlerOrURL: io.IOHandler | string, config?: io.SaveConfig): Promise<io.SaveResult>;
    /**
     * Set user-defined metadata.
     *
     * The set metadata will be serialized together with the topology
     * and weights of the model during `save()` calls.
     *
     * @param setUserDefinedMetadata
     */
    setUserDefinedMetadata(userDefinedMetadata: {}): void;
    /**
     * Get user-defined metadata.
     *
     * The metadata is supplied via one of the two routes:
     *   1. By calling `setUserDefinedMetadata()`.
     *   2. Loaded during model loading (if the model is constructed
     *      via `tf.loadLayersModel()`.)
     *
     * If no user-defined metadata is available from either of the
     * two routes, this function will return `undefined`.
     */
    getUserDefinedMetadata(): {};
}

/**
 * A `tf.layers.LayerVariable` is similar to a `tf.Tensor` in that it has a
 * dtype and shape, but its value is mutable.  The value is itself represented
 * as a`tf.Tensor`, and can be read with the `read()` method and updated with
 * the `write()` method.
 */
export declare class LayerVariable {
    readonly dtype: DataType;
    readonly shape: Shape;
    readonly id: number;
    readonly name: string;
    readonly originalName: string;
    private trainable_;
    protected readonly val: tfc.Variable;
    readonly constraint: Constraint;
    /**
     * Construct Variable from a `tf.Tensor`.
     *
     * If not explicitly named, the Variable will be given a name with the
     * prefix 'Variable'. Variable names are unique. In the case of name
     * collision, suffixies '_<num>' will be added to the name.
     *
     * @param val Initial value of the Variable.
     * @param name Name of the variable. If `null` or `undefined` is provided, it
     *   will default a name with the prefix 'Variable'.
     * @param constraint Optional, projection function to be applied to the
     * variable after optimize updates
     * @throws ValueError if `name` is `null` or `undefined`.
     */
    constructor(val: Tensor, dtype?: DataType, name?: string, trainable?: boolean, constraint?: Constraint);
    /**
     * Get a snapshot of the Variable's value.
     *
     * The returned value is a snapshot of the Variable's value at the time of
     * the invocation. Future mutations in the value of the tensor will only
     * be reflected by future calls to this method.
     */
    read(): Tensor;
    /**
     * Update the value of the Variable.
     *
     * @param newVal: The new value to update to. Must be consistent with the
     *   dtype and shape of the Variable.
     * @return This Variable.
     */
    write(newVal: Tensor): this;
    /**
     * Dispose this LayersVariable instance from memory.
     */
    dispose(): void;
    protected assertNotDisposed(): void;
    get trainable(): boolean;
    set trainable(trainable: boolean);
}

/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
/**
 * Stub interfaces and classes for testing tf.LayersModel.fitDataset().
 *
 * TODO(cais, soergel): Remove this in favor of actual interfaces and classes
 *   when ready.
 */
declare abstract class LazyIterator<T> {
    abstract next(): Promise<IteratorResult<T>>;
}

declare class LeakyReLU extends Layer {
    /** @nocollapse */
    static className: string;
    readonly alpha: number;
    readonly DEFAULT_ALPHA = 0.3;
    constructor(args?: LeakyReLULayerArgs);
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getConfig(): serialization.ConfigDict;
}

/**
 * Leaky version of a rectified linear unit.
 *
 * It allows a small gradient when the unit is not active:
 * `f(x) = alpha * x for x < 0.`
 * `f(x) = x for x >= 0.`
 *
 * Input shape:
 *   Arbitrary. Use the configuration `inputShape` when using this layer as the
 *   first layer in a model.
 *
 * Output shape:
 *   Same shape as the input.
 *
 * @doc {
 *   heading: 'Layers',
 *   subheading: 'Advanced Activation',
 *   namespace: 'layers'
 * }
 */
declare function leakyReLU(args?: LeakyReLULayerArgs): LeakyReLU;

declare interface LeakyReLULayerArgs extends LayerArgs {
    /**
     * Float `>= 0`. Negative slope coefficient. Defaults to `0.3`.
     */
    alpha?: number;
}

/**
 * LeCun normal initializer.
 *
 * It draws samples from a truncated normal distribution centered on 0
 * with `stddev = sqrt(1 / fanIn)`
 * where `fanIn` is the number of input units in the weight tensor.
 *
 * References:
 *   [Self-Normalizing Neural Networks](https://arxiv.org/abs/1706.02515)
 *   [Efficient Backprop](http://yann.lecun.com/exdb/publis/pdf/lecun-98b.pdf)
 *
 * @doc {heading: 'Initializers', namespace: 'initializers'}
 */
declare function leCunNormal(args: SeedOnlyInitializerArgs): Initializer;

/**
 * LeCun uniform initializer.
 *
 * It draws samples from a uniform distribution in the interval
 * `[-limit, limit]` with `limit = sqrt(3 / fanIn)`,
 * where `fanIn` is the number of input units in the weight tensor.
 *
 * @doc {heading: 'Initializers', namespace: 'initializers'}
 */
declare function leCunUniform(args: SeedOnlyInitializerArgs): Initializer;

declare const lessEqualImpl: SimpleBinaryKernelImpl;

declare const lessImpl: SimpleBinaryKernelImpl;

declare function linkProgram(gl: WebGLRenderingContext, program: WebGLProgram): void;

declare function linSpaceImpl(start: number, stop: number, num: number): TypedArray;

/**
 * Load a graph model given a URL to the model definition.
 *
 * Example of loading MobileNetV2 from a URL and making a prediction with a
 * zeros input:
 *
 * ```js
 * const modelUrl =
 *    'https://storage.googleapis.com/tfjs-models/savedmodel/mobilenet_v2_1.0_224/model.json';
 * const model = await tf.loadGraphModel(modelUrl);
 * const zeros = tf.zeros([1, 224, 224, 3]);
 * model.predict(zeros).print();
 * ```
 *
 * Example of loading MobileNetV2 from a TF Hub URL and making a prediction
 * with a zeros input:
 *
 * ```js
 * const modelUrl =
 *    'https://tfhub.dev/google/imagenet/mobilenet_v2_140_224/classification/2';
 * const model = await tf.loadGraphModel(modelUrl, {fromTFHub: true});
 * const zeros = tf.zeros([1, 224, 224, 3]);
 * model.predict(zeros).print();
 * ```
 * @param modelUrl The url or an `io.IOHandler` that loads the model.
 * @param options Options for the HTTP request, which allows to send
 *     credentials
 *    and custom headers.
 *
 * @doc {heading: 'Models', subheading: 'Loading'}
 */
export declare function loadGraphModel(modelUrl: string | io.IOHandler, options?: io.LoadOptions, tfio?: any): Promise<GraphModel>;

/**
 * Load a graph model given a synchronous IO handler with a 'load' method.
 *
 * @param modelSource The `io.IOHandlerSync` that loads the model, or the
 *     `io.ModelArtifacts` that encode the model, or a tuple of
 *     `[io.ModelJSON, ArrayBuffer]` of which the first element encodes the
 *      model and the second contains the weights.
 *
 * @doc {heading: 'Models', subheading: 'Loading'}
 */
export declare function loadGraphModelSync(modelSource: io.IOHandlerSync | io.ModelArtifacts | [io.ModelJSON, /* Weights */ ArrayBuffer]): GraphModel<io.IOHandlerSync>;

/**
 * Load a model composed of Layer objects, including its topology and optionally
 * weights. See the Tutorial named "How to import a Keras Model" for usage
 * examples.
 *
 * This method is applicable to:
 *
 * 1. Models created with the `tf.layers.*`, `tf.sequential`, and
 * `tf.model` APIs of TensorFlow.js and later saved with the
 * `tf.LayersModel.save` method.
 * 2. Models converted from Keras or TensorFlow tf.keras using the
 * [tensorflowjs_converter](https://github.com/tensorflow/tfjs/tree/master/tfjs-converter).
 *
 * This mode is *not* applicable to TensorFlow `SavedModel`s or their converted
 * forms. For those models, use `tf.loadGraphModel`.
 *
 * Example 1. Load a model from an HTTP server.
 *
 * ```js
 * const model = await tf.loadLayersModel(
 *     'https://storage.googleapis.com/tfjs-models/tfjs/iris_v1/model.json');
 * model.summary();
 * ```
 *
 * Example 2: Save `model`'s topology and weights to browser [local
 * storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage);
 * then load it back.
 *
 * ```js
 * const model = tf.sequential(
 *     {layers: [tf.layers.dense({units: 1, inputShape: [3]})]});
 * console.log('Prediction from original model:');
 * model.predict(tf.ones([1, 3])).print();
 *
 * const saveResults = await model.save('localstorage://my-model-1');
 *
 * const loadedModel = await tf.loadLayersModel('localstorage://my-model-1');
 * console.log('Prediction from loaded model:');
 * loadedModel.predict(tf.ones([1, 3])).print();
 * ```
 *
 * Example 3. Saving `model`'s topology and weights to browser
 * [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API);
 * then load it back.
 *
 * ```js
 * const model = tf.sequential(
 *     {layers: [tf.layers.dense({units: 1, inputShape: [3]})]});
 * console.log('Prediction from original model:');
 * model.predict(tf.ones([1, 3])).print();
 *
 * const saveResults = await model.save('indexeddb://my-model-1');
 *
 * const loadedModel = await tf.loadLayersModel('indexeddb://my-model-1');
 * console.log('Prediction from loaded model:');
 * loadedModel.predict(tf.ones([1, 3])).print();
 * ```
 *
 * Example 4. Load a model from user-selected files from HTML
 * [file input
 * elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file).
 *
 * ```js
 * // Note: this code snippet will not work without the HTML elements in the
 * //   page
 * const jsonUpload = document.getElementById('json-upload');
 * const weightsUpload = document.getElementById('weights-upload');
 *
 * const model = await tf.loadLayersModel(
 *     tf.io.browserFiles([jsonUpload.files[0], weightsUpload.files[0]]));
 * ```
 *
 * @param pathOrIOHandler Can be either of the two formats
 *   1. A string path to the `ModelAndWeightsConfig` JSON describing
 *      the model in the canonical TensorFlow.js format. For file://
 *      (tfjs-node-only), http:// and https:// schemas, the path can be
 *      either absolute or relative. The content of the JSON file is assumed to
 *      be a JSON object with the following fields and values:
 *      - 'modelTopology': A JSON object that can be either of:
 *        1. a model architecture JSON consistent with the format of the return
 *            value of `keras.Model.to_json()`
 *        2. a full model JSON in the format of `keras.models.save_model()`.
 *      - 'weightsManifest': A TensorFlow.js weights manifest.
 *      See the Python converter function `save_model()` for more details.
 *      It is also assumed that model weights can be accessed from relative
 *      paths described by the `paths` fields in weights manifest.
 *   2. A `tf.io.IOHandler` object that loads model artifacts with its `load`
 *      method.
 * @param options Optional configuration arguments for the model loading,
 *   including:
 *   - `strict`: Require that the provided weights exactly match those required
 *     by the layers.  Default true.  Passing false means that both extra
 *     weights and missing weights will be silently ignored.
 *   - `onProgress`: A progress callback of the form:
 *     `(fraction: number) => void`. This callback can be used to monitor the
 *     model-loading process.
 * @returns A `Promise` of `tf.LayersModel`, with the topology and weights
 *     loaded.
 *
 * @doc {heading: 'Models', subheading: 'Loading'}
 */
export declare function loadLayersModel(pathOrIOHandler: string | io.IOHandler, options?: io.LoadOptions): Promise<LayersModel>;

declare const logImpl: SimpleUnaryImpl<number, number>;

/**
 * Logs in which values can only be numbers.
 *
 * Used when calling client-provided custom callbacks.
 */
export declare type Logs = {
    [key: string]: number;
};

declare function logShaderSourceAndInfoLog(shaderSource: string, shaderInfoLog: string): void;

/**
 * A type representing the strings that are valid loss names.
 */
declare type LossIdentifier = typeof lossOptions[number];

/**
 * List of all known loss names.
 */
declare const lossOptions: ("mean_squared_error" | "mean_absolute_error" | "mean_absolute_percentage_error" | "mean_squared_logarithmic_error" | "squared_hinge" | "hinge" | "categorical_hinge" | "logcosh" | "categorical_crossentropy" | "sparse_categorical_crossentropy" | "kullback_leibler_divergence" | "poisson" | "cosine_proximity")[];

/**
 * Type for loss a metric function.
 *
 * Takes a true value and a predicted value, and returns a loss or metric value.
 */
declare type LossOrMetricFn = (yTrue: Tensor, yPred: Tensor) => Tensor;

/**
 * a type for valid values of the `loss_weights` field.
 */
declare type LossWeights = number[] | {
    [key: string]: number;
};

declare class LSTM extends RNN {
    /** @nocollapse */
    static className: string;
    constructor(args: LSTMLayerArgs);
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    /** @nocollapse */
    static fromConfig<T extends serialization.Serializable>(cls: serialization.SerializableConstructor<T>, config: serialization.ConfigDict): T;
}

/**
 * Long-Short Term Memory layer - Hochreiter 1997.
 *
 * This is an `RNN` layer consisting of one `LSTMCell`. However, unlike
 * the underlying `LSTMCell`, the `apply` method of `LSTM` operates
 * on a sequence of inputs. The shape of the input (not including the first,
 * batch dimension) needs to be at least 2-D, with the first dimension being
 * time steps. For example:
 *
 * ```js
 * const lstm = tf.layers.lstm({units: 8, returnSequences: true});
 *
 * // Create an input with 10 time steps.
 * const input = tf.input({shape: [10, 20]});
 * const output = lstm.apply(input);
 *
 * console.log(JSON.stringify(output.shape));
 * // [null, 10, 8]: 1st dimension is unknown batch size; 2nd dimension is the
 * // same as the sequence length of `input`, due to `returnSequences`: `true`;
 * // 3rd dimension is the `LSTMCell`'s number of units.
 *
 * @doc {heading: 'Layers', subheading: 'Recurrent', namespace: 'layers'}
 */
declare function lstm(args: LSTMLayerArgs): LSTM;

declare class LSTMCell extends RNNCell {
    /** @nocollapse */
    static className: string;
    readonly units: number;
    readonly activation: Activation;
    readonly recurrentActivation: Activation;
    readonly useBias: boolean;
    readonly kernelInitializer: Initializer;
    readonly recurrentInitializer: Initializer;
    readonly biasInitializer: Initializer;
    readonly unitForgetBias: boolean;
    readonly kernelConstraint: Constraint;
    readonly recurrentConstraint: Constraint;
    readonly biasConstraint: Constraint;
    readonly kernelRegularizer: Regularizer;
    readonly recurrentRegularizer: Regularizer;
    readonly biasRegularizer: Regularizer;
    readonly dropout: number;
    readonly recurrentDropout: number;
    readonly dropoutFunc: Function;
    readonly stateSize: number[];
    readonly implementation: number;
    readonly DEFAULT_ACTIVATION = "tanh";
    readonly DEFAULT_RECURRENT_ACTIVATION = "hardSigmoid";
    readonly DEFAULT_KERNEL_INITIALIZER = "glorotNormal";
    readonly DEFAULT_RECURRENT_INITIALIZER = "orthogonal";
    readonly DEFAULT_BIAS_INITIALIZER = "zeros";
    kernel: LayerVariable;
    recurrentKernel: LayerVariable;
    bias: LayerVariable;
    constructor(args: LSTMCellLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}

/**
 * Cell class for `LSTM`.
 *
 * `LSTMCell` is distinct from the `RNN` subclass `LSTM` in that its
 * `apply` method takes the input data of only a single time step and returns
 * the cell's output at the time step, while `LSTM` takes the input data
 * over a number of time steps. For example:
 *
 * ```js
 * const cell = tf.layers.lstmCell({units: 2});
 * const input = tf.input({shape: [10]});
 * const output = cell.apply(input);
 *
 * console.log(JSON.stringify(output.shape));
 * // [null, 10]: This is the cell's output at a single time step. The 1st
 * // dimension is the unknown batch size.
 * ```
 *
 * Instance(s) of `LSTMCell` can be used to construct `RNN` layers. The
 * most typical use of this workflow is to combine a number of cells into a
 * stacked RNN cell (i.e., `StackedRNNCell` internally) and use it to create an
 * RNN. For example:
 *
 * ```js
 * const cells = [
 *   tf.layers.lstmCell({units: 4}),
 *   tf.layers.lstmCell({units: 8}),
 * ];
 * const rnn = tf.layers.rnn({cell: cells, returnSequences: true});
 *
 * // Create an input with 10 time steps and a length-20 vector at each step.
 * const input = tf.input({shape: [10, 20]});
 * const output = rnn.apply(input);
 *
 * console.log(JSON.stringify(output.shape));
 * // [null, 10, 8]: 1st dimension is unknown batch size; 2nd dimension is the
 * // same as the sequence length of `input`, due to `returnSequences`: `true`;
 * // 3rd dimension is the last `lstmCell`'s number of units.
 * ```
 *
 * To create an `RNN` consisting of only *one* `LSTMCell`, use the
 * `tf.layers.lstm`.
 *
 * @doc {heading: 'Layers', subheading: 'Recurrent', namespace: 'layers'}
 */
declare function lstmCell(args: LSTMCellLayerArgs): LSTMCell;

export declare interface LSTMCellLayerArgs extends SimpleRNNCellLayerArgs {
    /**
     * Activation function to use for the recurrent step.
     *
     * Defaults to hard sigmoid (`hardSigmoid`).
     *
     * If `null`, no activation is applied.
     */
    recurrentActivation?: ActivationIdentifier;
    /**
     * If `true`, add 1 to the bias of the forget gate at initialization.
     * Setting it to `true` will also force `biasInitializer = 'zeros'`.
     * This is recommended in
     * [Jozefowicz et
     * al.](http://www.jmlr.org/proceedings/papers/v37/jozefowicz15.pdf)
     */
    unitForgetBias?: boolean;
    /**
     * Implementation mode, either 1 or 2.
     *
     * Mode 1 will structure its operations as a larger number of
     *   smaller dot products and additions.
     *
     * Mode 2 will batch them into fewer, larger operations. These modes will
     * have different performance profiles on different hardware and
     * for different applications.
     *
     * Note: For superior performance, TensorFlow.js always uses implementation
     * 2, regardless of the actual value of this configuration field.
     */
    implementation?: number;
}

export declare interface LSTMLayerArgs extends SimpleRNNLayerArgs {
    /**
     * Activation function to use for the recurrent step.
     *
     * Defaults to hard sigmoid (`hardSigmoid`).
     *
     * If `null`, no activation is applied.
     */
    recurrentActivation?: ActivationIdentifier;
    /**
     * If `true`, add 1 to the bias of the forget gate at initialization.
     * Setting it to `true` will also force `biasInitializer = 'zeros'`.
     * This is recommended in
     * [Jozefowicz et
     * al.](http://www.jmlr.org/proceedings/papers/v37/jozefowicz15.pdf)
     */
    unitForgetBias?: boolean;
    /**
     * Implementation mode, either 1 or 2.
     *   Mode 1 will structure its operations as a larger number of
     *   smaller dot products and additions, whereas mode 2 will
     *   batch them into fewer, larger operations. These modes will
     *   have different performance profiles on different hardware and
     *   for different applications.
     *
     * Note: For superior performance, TensorFlow.js always uses implementation
     * 2, regardless of the actual value of this config field.
     */
    implementation?: number;
}

declare function makeShaderKey<R extends Rank>(program: WebGPUProgram, inputsData: InputInfo[], output: TensorInfo_2): string;

declare function MAPE(yTrue: Tensor, yPred: Tensor): Tensor;

declare function mape(yTrue: Tensor, yPred: Tensor): Tensor;

declare class Masking extends Layer {
    /** @nocollapse */
    static className: string;
    maskValue: number;
    constructor(args?: MaskingArgs);
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getConfig(): {
        maskValue: number;
    };
    computeMask(inputs: Tensor | Tensor[], mask?: Tensor | Tensor[]): Tensor;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
}

/**
 * Masks a sequence by using a mask value to skip timesteps.
 *
 * If all features for a given sample timestep are equal to `mask_value`,
 * then the sample timestep will be masked (skipped) in all downstream layers
 * (as long as they support masking).
 *
 * If any downstream layer does not support masking yet receives such
 * an input mask, an exception will be raised.
 *
 * Arguments:
 *   - `maskValue`: Either None or mask value to skip.
 *
 * Input shape:
 *   Arbitrary. Use the keyword argument `inputShape`
 *   (tuple of integers, does not include the samples axis)
 *   when using this layer as the first layer in a model.
 *
 * Output shape:
 *   Same shape as input.
 *
 * @doc {heading: 'Layers', subheading: 'Mask', namespace: 'layers'}
 */
declare function masking(args?: MaskingArgs): Masking;

declare interface MaskingArgs extends LayerArgs {
    /**
     * Masking Value. Defaults to `0.0`.
     */
    maskValue?: number;
}

export declare class MathBackendCPU extends KernelBackend {
    blockSize: number;
    data: DataStorage<TensorData<DataType>>;
    private firstUse;
    private static nextDataId;
    private nextDataId;
    constructor();
    write(values: backend_util.BackendValues, shape: number[], dtype: DataType): DataId;
    /**
     * Create a data bucket in cpu backend.
     * @param shape Shape of the `TensorInfo`.
     * @param dtype DType of the `TensorInfo`.
     * @param values The value of the `TensorInfo` stored as a flattened array.
     */
    makeTensorInfo(shape: number[], dtype: DataType, values?: backend_util.BackendValues | string[]): TensorInfo_2;
    /** Return refCount of a `TensorData`. */
    refCount(dataId: DataId): number;
    /** Increase refCount of a `TensorData`. */
    incRef(dataId: DataId): void;
    /** Decrease refCount of a `TensorData`. */
    decRef(dataId: DataId): void;
    move(dataId: DataId, values: backend_util.BackendValues, shape: number[], dtype: DataType, refCount: number): void;
    numDataIds(): number;
    read(dataId: DataId): Promise<backend_util.BackendValues>;
    readSync(dataId: DataId): backend_util.BackendValues;
    bufferSync<R extends Rank, D extends DataType>(t: TensorInfo_2): TensorBuffer<R, D>;
    makeOutput<T extends Tensor>(values: backend_util.BackendValues, shape: number[], dtype: DataType): T;
    /**
     * Dispose the memory if the dataId has 0 refCount. Return true if the memory
     * is released or memory is not managed in this backend, false if memory is
     * not cleared.
     * @param dataId
     * @oaram force Optional, remove the data regardless of refCount
     */
    disposeData(dataId: DataId, force?: boolean): boolean;
    disposeIntermediateTensorInfo(tensorInfo: TensorInfo_2): void;
    time(f: () => void): Promise<BackendTimingInfo>;
    memory(): {
        unreliable: boolean;
        reasons: string[];
    };
    where(condition: Tensor): Tensor2D;
    dispose(): void;
    floatPrecision(): 16 | 32;
    /** Returns the smallest representable number.  */
    epsilon(): number;
}

export declare class MathBackendWebGL extends KernelBackend {
    texData: DataStorage<TextureData>;
    gpgpu: GPGPUContext;
    private static nextDataId;
    private nextDataId;
    private pendingRead;
    private pendingDisposal;
    dataRefCount: WeakMap<DataId_2, number>;
    private numBytesInGPU;
    private canvas;
    private programTimersStack;
    private activeTimers;
    private uploadWaitMs;
    private downloadWaitMs;
    private lastGlFlushTime;
    private floatPrecisionValue;
    private textureManager;
    private binaryCache;
    private gpgpuCreatedLocally;
    private numMBBeforeWarning;
    private warnedAboutMemory;
    constructor(gpuResource?: GPGPUContext | HTMLCanvasElement | OffscreenCanvas);
    numDataIds(): number;
    writeTexture(texture: WebGLTexture, shape: number[], dtype: DataType, texHeight: number, texWidth: number, channels: string): DataId_2;
    write(values: BackendValues, shape: number[], dtype: DataType): DataId_2;
    /** Return refCount of a `TensorData`. */
    refCount(dataId: DataId_2): number;
    /** Increase refCount of a `TextureData`. */
    incRef(dataId: DataId_2): void;
    /** Decrease refCount of a `TextureData`. */
    decRef(dataId: DataId_2): void;
    move(dataId: DataId_2, values: BackendValues, shape: number[], dtype: DataType, refCount: number): void;
    disposeIntermediateTensorInfo(tensorInfo: TensorInfo_2): void;
    readSync(dataId: DataId_2): BackendValues;
    read(dataId: DataId_2): Promise<BackendValues>;
    /**
     * Read tensor to a new texture that is densely packed for ease of use.
     * @param dataId The source tensor.
     * @param options
     *     customTexShape: Optional. If set, will use the user defined texture
     *     shape to create the texture.
     */
    readToGPU(dataId: DataId_2, options?: DataToGPUWebGLOption): GPUData;
    bufferSync<R extends Rank, D extends DataType>(t: TensorInfo_2): TensorBuffer<R, D>;
    private checkNumericalProblems;
    private getValuesFromTexture;
    timerAvailable(): boolean;
    time(f: () => void): Promise<WebGLTimingInfo>;
    memory(): WebGLMemoryInfo;
    private startTimer;
    private endTimer;
    private getQueryTime;
    private pendingDeletes;
    /**
     * Decrease the RefCount on the dataId and dispose the memory if the dataId
     * has 0 refCount. If there are pending read on the data, the disposal would
     * added to the pending delete queue. Return true if the dataId is removed
     * from backend or the backend does not contain the dataId, false if the
     * dataId is not removed. Memory may or may not be released even when dataId
     * is removed, which also depends on dataRefCount, see `releaseGPU`.
     * @param dataId
     * @oaram force Optional, remove the data regardless of refCount
     */
    disposeData(dataId: DataId_2, force?: boolean): boolean;
    private releaseGPUData;
    getTexture(dataId: DataId_2): WebGLTexture;
    /**
     * Returns internal information for the specific data bucket. Used in unit
     * tests.
     */
    getDataInfo(dataId: DataId_2): TextureData;
    shouldExecuteOnCPU(inputs: TensorInfo_2[], sizeThreshold?: any): boolean;
    getGPGPUContext(): GPGPUContext;
    where(condition: Tensor): Tensor2D;
    private packedUnaryOp;
    abs<T extends Tensor>(x: T): T;
    makeTensorInfo(shape: number[], dtype: DataType, values?: BackendValues | string[]): TensorInfo_2;
    private makeOutput;
    unpackTensor(input: TensorInfo_2): TensorInfo_2;
    packTensor(input: TensorInfo_2): TensorInfo_2;
    private packedReshape;
    private decode;
    runWebGLProgram(program: GPGPUProgram, inputs: TensorInfo_2[], outputDtype: DataType, customUniformValues?: number[][], preventEagerUnpackingOfOutput?: boolean, customTexShape?: [number, number]): TensorInfo_2;
    compileAndRun(program: GPGPUProgram, inputs: TensorInfo_2[], outputDtype?: DataType, customUniformValues?: number[][], preventEagerUnpackingOfOutput?: boolean): TensorInfo_2;
    private getAndSaveBinary;
    getTextureManager(): TextureManager;
    private disposed;
    dispose(): void;
    floatPrecision(): 16 | 32;
    /** Returns the smallest representable number.  */
    epsilon(): number;
    uploadToGPU(dataId: DataId_2): void;
    private convertAndCacheOnCPU;
    private acquireTexture;
    private computeBytes;
    checkCompileCompletion(): void;
    checkCompileCompletionAsync(): Promise<boolean[]>;
    private checkCompletionAsync_;
    private checkCompletion_;
    getUniformLocations(): void;
    /**
     * Create a TF.js tensor out of an existing WebGL texture. A new texture will
     * be created.
     */
    createTensorFromGPUData(values: WebGLData, shape: number[], dtype: DataType): Tensor;
}

declare enum MatMulProgramType {
    MatMulReduceProgram = 0,
    MatMulSplitKProgram = 1,
    MatMulSmallOutputSizeProgram = 2,
    MatMulPackedProgram = 3,
    MatMulMax = 4
}

declare function maxImpl(aVals: TypedArray, reduceSize: number, outShape: number[], dtype: DataType): TypedArray;

declare class Maximum extends Merge {
    /** @nocollapse */
    static className: string;
    constructor(args?: LayerArgs);
    protected mergeFunction(inputs: Tensor[]): Tensor;
}

/**
 * Layer that computes the element-wise maximum of an `Array` of inputs.
 *
 * It takes as input a list of tensors, all of the same shape, and returns a
 * single tensor (also of the same shape). For example:
 *
 * ```js
 * const input1 = tf.input({shape: [2, 2]});
 * const input2 = tf.input({shape: [2, 2]});
 * const maxLayer = tf.layers.maximum();
 * const max = maxLayer.apply([input1, input2]);
 * console.log(JSON.stringify(max.shape));
 * // You get [null, 2, 2], with the first dimension as the undetermined batch
 * // dimension.
 * ```
 *
 * @doc {heading: 'Layers', subheading: 'Merge', namespace: 'layers'}
 */
declare function maximum(args?: LayerArgs): Maximum;

declare const maximumImpl: SimpleBinaryKernelImpl;

/**
 * MaxNorm weight constraint.
 *
 * Constrains the weights incident to each hidden unit
 * to have a norm less than or equal to a desired value.
 *
 * References
 *       - [Dropout: A Simple Way to Prevent Neural Networks from Overfitting
 * Srivastava, Hinton, et al.
 * 2014](http://www.cs.toronto.edu/~rsalakhu/papers/srivastava14a.pdf)
 *
 * @doc {heading: 'Constraints',namespace: 'constraints'}
 */
declare function maxNorm(args: MaxNormArgs): Constraint;

declare interface MaxNormArgs {
    /**
     * Maximum norm for incoming weights
     */
    maxValue?: number;
    /**
     * Axis along which to calculate norms.
     *
     *  For instance, in a `Dense` layer the weight matrix
     *  has shape `[inputDim, outputDim]`,
     *  set `axis` to `0` to constrain each weight vector
     *  of length `[inputDim,]`.
     *  In a `Conv2D` layer with `dataFormat="channels_last"`,
     *  the weight tensor has shape
     *  `[rows, cols, inputDepth, outputDepth]`,
     *  set `axis` to `[0, 1, 2]`
     *  to constrain the weights of each filter tensor of size
     *  `[rows, cols, inputDepth]`.
     */
    axis?: number;
}

declare const maxPool1d: typeof maxPooling1d;

declare const maxPool2d: typeof maxPooling2d;

declare class MaxPooling1D extends Pooling1D {
    /** @nocollapse */
    static className: string;
    constructor(args: Pooling1DLayerArgs);
    protected poolingFunction(inputs: Tensor, poolSize: [number, number], strides: [number, number], padding: PaddingMode, dataFormat: DataFormat): Tensor;
}

/**
 * Max pooling operation for temporal data.
 *
 * Input shape:  `[batchSize, inLength, channels]`
 *
 * Output shape: `[batchSize, pooledLength, channels]`
 *
 * @doc {heading: 'Layers', subheading: 'Pooling', namespace: 'layers'}
 */
declare function maxPooling1d(args: Pooling1DLayerArgs): MaxPooling1D;

declare class MaxPooling2D extends Pooling2D {
    /** @nocollapse */
    static className: string;
    constructor(args: Pooling2DLayerArgs);
    protected poolingFunction(inputs: Tensor, poolSize: [number, number], strides: [number, number], padding: PaddingMode, dataFormat: DataFormat): Tensor;
}

/**
 * Max pooling operation for spatial data.
 *
 * Input shape
 *   - If `dataFormat === CHANNEL_LAST`:
 *       4D tensor with shape:
 *       `[batchSize, rows, cols, channels]`
 *   - If `dataFormat === CHANNEL_FIRST`:
 *      4D tensor with shape:
 *       `[batchSize, channels, rows, cols]`
 *
 * Output shape
 *   - If `dataFormat=CHANNEL_LAST`:
 *       4D tensor with shape:
 *       `[batchSize, pooledRows, pooledCols, channels]`
 *   - If `dataFormat=CHANNEL_FIRST`:
 *       4D tensor with shape:
 *       `[batchSize, channels, pooledRows, pooledCols]`
 *
 * @doc {heading: 'Layers', subheading: 'Pooling', namespace: 'layers'}
 */
declare function maxPooling2d(args: Pooling2DLayerArgs): MaxPooling2D;

declare class MaxPooling3D extends Pooling3D {
    /** @nocollapse */
    static className: string;
    constructor(args: Pooling3DLayerArgs);
    protected poolingFunction(inputs: Tensor, poolSize: [number, number, number], strides: [number, number, number], padding: PaddingMode, dataFormat: DataFormat): Tensor;
}

/**
 * Max pooling operation for 3D data.
 *
 * Input shape
 *   - If `dataFormat === channelsLast`:
 *       5D tensor with shape:
 *       `[batchSize, depths, rows, cols, channels]`
 *   - If `dataFormat === channelsFirst`:
 *      5D tensor with shape:
 *       `[batchSize, channels, depths, rows, cols]`
 *
 * Output shape
 *   - If `dataFormat=channelsLast`:
 *       5D tensor with shape:
 *       `[batchSize, pooledDepths, pooledRows, pooledCols, channels]`
 *   - If `dataFormat=channelsFirst`:
 *       5D tensor with shape:
 *       `[batchSize, channels, pooledDepths, pooledRows, pooledCols]`
 *
 * @doc {heading: 'Layers', subheading: 'Pooling', namespace: 'layers'}
 */
declare function maxPooling3d(args: Pooling3DLayerArgs): MaxPooling3D;

/**
 * Loss or metric function: Mean absolute error.
 *
 * Mathematically, mean absolute error is defined as:
 *   `mean(abs(yPred - yTrue))`,
 * wherein the `mean` is applied over feature dimensions.
 *
 * ```js
 * const yTrue = tf.tensor2d([[0, 1], [0, 0], [2, 3]]);
 * const yPred = tf.tensor2d([[0, 1], [0, 1], [-2, -3]]);
 * const mse = tf.metrics.meanAbsoluteError(yTrue, yPred);
 * mse.print();
 * ```
 *
 * @param yTrue Truth Tensor.
 * @param yPred Prediction Tensor.
 * @return Mean absolute error Tensor.
 *
 * @doc {heading: 'Metrics', namespace: 'metrics'}
 */
declare function meanAbsoluteError(yTrue: Tensor, yPred: Tensor): Tensor;

/**
 * Loss or metric function: Mean absolute percentage error.
 *
 * ```js
 * const yTrue = tf.tensor2d([[0, 1], [10, 20]]);
 * const yPred = tf.tensor2d([[0, 1], [11, 24]]);
 * const mse = tf.metrics.meanAbsolutePercentageError(yTrue, yPred);
 * mse.print();
 * ```
 *
 * Aliases: `tf.metrics.MAPE`, `tf.metrics.mape`.
 *
 * @param yTrue Truth Tensor.
 * @param yPred Prediction Tensor.
 * @return Mean absolute percentage error Tensor.
 *
 * @doc {heading: 'Metrics', namespace: 'metrics'}
 */
declare function meanAbsolutePercentageError(yTrue: Tensor, yPred: Tensor): Tensor;

/**
 * Loss or metric function: Mean squared error.
 *
 * ```js
 * const yTrue = tf.tensor2d([[0, 1], [3, 4]]);
 * const yPred = tf.tensor2d([[0, 1], [-3, -4]]);
 * const mse = tf.metrics.meanSquaredError(yTrue, yPred);
 * mse.print();
 * ```
 *
 * Aliases: `tf.metrics.MSE`, `tf.metrics.mse`.
 *
 * @param yTrue Truth Tensor.
 * @param yPred Prediction Tensor.
 * @return Mean squared error Tensor.
 *
 * @doc {heading: 'Metrics', namespace: 'metrics'}
 */
declare function meanSquaredError(yTrue: Tensor, yPred: Tensor): Tensor;

/**
 * Generic Merge layer for element-wise merge functions.
 *
 * Used to implement `Sum`, `Average`, `Concatenate`, etc.
 */
declare abstract class Merge extends Layer {
    protected reshapeRequired: boolean;
    constructor(args?: LayerArgs);
    /**
     * Logic for merging multiple tensors, to be overridden by subclasses.
     * @param inputs
     */
    protected mergeFunction(inputs: Tensor[]): Tensor;
    /**
     * Computes the shape of the result of an elementwise operation.
     *
     * @param shape1: Shape of the first tensor.
     * @param shape2: Shape of the second tensor.
     * @returns Expected output shape when an elementwise operation is carried
     *   out on 2 tensors with shapes `shape1` and `shape2`.
     * @throws ValueError: If `shape1` and `shape2` are not compatible for
     *   element-wise operations.
     */
    private computeElementwiseOpOutputShape;
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    computeMask(inputs: Tensor | Tensor[], mask?: Tensor | Tensor[]): Tensor;
}

declare namespace metrics {
    export {
        binaryAccuracy,
        binaryCrossentropy,
        sparseCategoricalAccuracy,
        categoricalAccuracy,
        categoricalCrossentropy,
        precision,
        recall,
        cosineProximity,
        meanAbsoluteError,
        meanAbsolutePercentageError,
        MAPE,
        mape,
        meanSquaredError,
        MSE,
        mse
    }
}
export { metrics }

declare type MetricsIdentifier = string;

declare class Minimum extends Merge {
    /** @nocollapse */
    static className: string;
    constructor(args?: LayerArgs);
    protected mergeFunction(inputs: Tensor[]): Tensor;
}

/**
 * Layer that computes the element-wise minimum of an `Array` of inputs.
 *
 * It takes as input a list of tensors, all of the same shape, and returns a
 * single tensor (also of the same shape). For example:
 *
 * ```js
 * const input1 = tf.input({shape: [2, 2]});
 * const input2 = tf.input({shape: [2, 2]});
 * const minLayer = tf.layers.minimum();
 * const min = minLayer.apply([input1, input2]);
 * console.log(JSON.stringify(min.shape));
 * // You get [null, 2, 2], with the first dimension as the undetermined batch
 * // dimension.
 * ```
 *
 * @doc {heading: 'Layers', subheading: 'Merge', namespace: 'layers'}
 */
declare function minimum(args?: LayerArgs): Minimum;

declare const minimumImpl: SimpleBinaryKernelImpl;

/** @doc {heading: 'Constraints', namespace: 'constraints'} */
declare function minMaxNorm(config: MinMaxNormArgs): Constraint;

declare interface MinMaxNormArgs {
    /**
     * Minimum norm for incoming weights
     */
    minValue?: number;
    /**
     * Maximum norm for incoming weights
     */
    maxValue?: number;
    /**
     * Axis along which to calculate norms.
     * For instance, in a `Dense` layer the weight matrix
     * has shape `[inputDim, outputDim]`,
     * set `axis` to `0` to constrain each weight vector
     * of length `[inputDim,]`.
     * In a `Conv2D` layer with `dataFormat="channels_last"`,
     * the weight tensor has shape
     * `[rows, cols, inputDepth, outputDepth]`,
     * set `axis` to `[0, 1, 2]`
     * to constrain the weights of each filter tensor of size
     * `[rows, cols, inputDepth]`.
     */
    axis?: number;
    /**
     * Rate for enforcing the constraint: weights will be rescaled to yield:
     * `(1 - rate) * norm + rate * norm.clip(minValue, maxValue)`.
     * Effectively, this means that rate=1.0 stands for strict
     * enforcement of the constraint, while rate<1.0 means that
     * weights will be rescaled at each step to slowly move
     * towards a value inside the desired interval.
     */
    rate?: number;
}

/**
 * A model is a data structure that consists of `Layers` and defines inputs
 * and outputs.
 *
 * The key difference between `tf.model` and `tf.sequential` is that
 * `tf.model` is more generic, supporting an arbitrary graph (without
 * cycles) of layers. `tf.sequential` is less generic and supports only a linear
 * stack of layers.
 *
 * When creating a `tf.LayersModel`, specify its input(s) and output(s). Layers
 * are used to wire input(s) to output(s).
 *
 * For example, the following code snippet defines a model consisting of
 * two `dense` layers, with 10 and 4 units, respectively.
 *
 * ```js
 * // Define input, which has a size of 5 (not including batch dimension).
 * const input = tf.input({shape: [5]});
 *
 * // First dense layer uses relu activation.
 * const denseLayer1 = tf.layers.dense({units: 10, activation: 'relu'});
 * // Second dense layer uses softmax activation.
 * const denseLayer2 = tf.layers.dense({units: 4, activation: 'softmax'});
 *
 * // Obtain the output symbolic tensor by applying the layers on the input.
 * const output = denseLayer2.apply(denseLayer1.apply(input));
 *
 * // Create the model based on the inputs.
 * const model = tf.model({inputs: input, outputs: output});
 *
 * // The model can be used for training, evaluation and prediction.
 * // For example, the following line runs prediction with the model on
 * // some fake data.
 * model.predict(tf.ones([2, 5])).print();
 * ```
 * See also:
 *   `tf.sequential`, `tf.loadLayersModel`.
 *
 * @doc {heading: 'Models', subheading: 'Creation'}
 */
export declare function model(args: ContainerArgs): LayersModel;

/**
 * Options for loading a saved mode in TensorFlow.js format.
 */
export declare interface ModelAndWeightsConfig {
    /**
     * A JSON object or JSON string containing the model config.
     *
     * This can be either of the following two formats:
     *   - A model archiecture-only config,  i.e., a format consistent with the
     *     return value of`keras.Model.to_json()`.
     *   - A full model config, containing not only model architecture, but also
     *     training options and state, i.e., a format consistent with the return
     *     value of `keras.models.save_model()`.
     */
    modelTopology: PyJsonDict;
    /**
     * A weights manifest in TensorFlow.js format.
     */
    weightsManifest?: io.WeightsManifestConfig;
    /**
     * Path to prepend to the paths in `weightManifest` before fetching.
     *
     * The path may optionally end in a slash ('/').
     */
    pathPrefix?: string;
}

/**
 * Configuration for calls to `LayersModel.compile()`.
 */
export declare interface ModelCompileArgs {
    /**
     * An instance of `tf.train.Optimizer` or a string name for an Optimizer.
     */
    optimizer: string | Optimizer;
    /**
     * Object function(s) or name(s) of object function(s).
     * If the model has multiple outputs, you can use a different loss
     * on each output by passing a dictionary or an Array of losses.
     * The loss value that will be minimized by the model will then be the sum
     * of all individual losses.
     */
    loss: string | string[] | {
        [outputName: string]: string;
    } | LossOrMetricFn | LossOrMetricFn[] | {
        [outputName: string]: LossOrMetricFn;
    };
    /**
     * List of metrics to be evaluated by the model during training and testing.
     * Typically you will use `metrics=['accuracy']`.
     * To specify different metrics for different outputs of a multi-output
     * model, you could also pass a dictionary.
     */
    metrics?: string | LossOrMetricFn | Array<string | LossOrMetricFn> | {
        [outputName: string]: string | LossOrMetricFn;
    };
}

export declare interface ModelEvaluateArgs {
    /**
     * Batch size (Integer). If unspecified, it will default to 32.
     */
    batchSize?: number;
    /**
     * Verbosity mode.
     */
    verbose?: ModelLoggingVerbosity;
    /**
     * Tensor of weights to weight the contribution of different samples to the
     * loss and metrics.
     */
    sampleWeight?: Tensor;
    /**
     * integer: total number of steps (batches of samples)
     * before declaring the evaluation round finished. Ignored with the default
     * value of `undefined`.
     */
    steps?: number;
}

/**
 * Interface for configuring model evaluation based on a dataset object.
 */
declare interface ModelEvaluateDatasetArgs {
    /**
     * Number of batches to draw from the dataset object before ending the
     * evaluation.
     */
    batches?: number;
    /**
     * Verbosity mode.
     */
    verbose?: ModelLoggingVerbosity;
}

/**
 * Interface configuration model training based on data as `tf.Tensor`s.
 */
export declare interface ModelFitArgs {
    /**
     * Number of samples per gradient update. If unspecified, it
     * will default to 32.
     */
    batchSize?: number;
    /**
     * Integer number of times to iterate over the training data arrays.
     */
    epochs?: number;
    /**
     * Verbosity level.
     *
     * Expected to be 0, 1, or 2. Default: 1.
     *
     * 0 - No printed message during fit() call.
     * 1 - In Node.js (tfjs-node), prints the progress bar, together with
     *     real-time updates of loss and metric values and training speed.
     *     In the browser: no action. This is the default.
     * 2 - Not implemented yet.
     */
    verbose?: ModelLoggingVerbosity | 2;
    /**
     * List of callbacks to be called during training.
     * Can have one or more of the following callbacks:
     *   - `onTrainBegin(logs)`: called when training starts.
     *   - `onTrainEnd(logs)`: called when training ends.
     *   - `onEpochBegin(epoch, logs)`: called at the start of every epoch.
     *   - `onEpochEnd(epoch, logs)`: called at the end of every epoch.
     *   - `onBatchBegin(batch, logs)`: called at the start of every batch.
     *   - `onBatchEnd(batch, logs)`: called at the end of every batch.
     *   - `onYield(epoch, batch, logs)`: called every `yieldEvery` milliseconds
     *      with the current epoch, batch and logs. The logs are the same
     *      as in `onBatchEnd()`. Note that `onYield` can skip batches or
     *      epochs. See also docs for `yieldEvery` below.
     */
    callbacks?: BaseCallback[] | CustomCallbackArgs | CustomCallbackArgs[];
    /**
     * Float between 0 and 1: fraction of the training data
     * to be used as validation data. The model will set apart this fraction of
     * the training data, will not train on it, and will evaluate the loss and
     * any model metrics on this data at the end of each epoch.
     * The validation data is selected from the last samples in the `x` and `y`
     * data provided, before shuffling.
     */
    validationSplit?: number;
    /**
     * Data on which to evaluate the loss and any model
     * metrics at the end of each epoch. The model will not be trained on this
     * data. This could be a tuple [xVal, yVal] or a tuple [xVal, yVal,
     * valSampleWeights]. The model will not be trained on this data.
     * `validationData` will override `validationSplit`.
     */
    validationData?: [
    Tensor | Tensor[],
    Tensor | Tensor[]
    ] | [Tensor | Tensor[], Tensor | Tensor[], Tensor | Tensor[]];
    /**
     * Whether to shuffle the training data before each epoch. Has
     * no effect when `stepsPerEpoch` is not `null`.
     */
    shuffle?: boolean;
    /**
     * Optional object mapping class indices (integers) to
     * a weight (float) to apply to the model's loss for the samples from this
     * class during training. This can be useful to tell the model to "pay more
     * attention" to samples from an under-represented class.
     *
     * If the model has multiple outputs, a class weight can be specified for
     * each of the outputs by setting this field an array of weight object
     * or an object that maps model output names (e.g., `model.outputNames[0]`)
     * to weight objects.
     */
    classWeight?: ClassWeight | ClassWeight[] | ClassWeightMap;
    /**
     * Optional array of the same length as x, containing
     * weights to apply to the model's loss for each sample. In the case of
     * temporal data, you can pass a 2D array with shape (samples,
     * sequenceLength), to apply a different weight to every timestep of every
     * sample. In this case you should make sure to specify
     * sampleWeightMode="temporal" in compile().
     */
    sampleWeight?: Tensor;
    /**
     * Epoch at which to start training (useful for resuming a previous training
     * run). When this is used, `epochs` is the index of the "final epoch".
     * The model is not trained for a number of iterations given by `epochs`,
     * but merely until the epoch of index `epochs` is reached.
     */
    initialEpoch?: number;
    /**
     * Total number of steps (batches of samples) before
     * declaring one epoch finished and starting the next epoch. When training
     * with Input Tensors such as TensorFlow data tensors, the default `null` is
     * equal to the number of unique samples in your dataset divided by the
     * batch size, or 1 if that cannot be determined.
     */
    stepsPerEpoch?: number;
    /**
     * Only relevant if `stepsPerEpoch` is specified. Total number of steps
     * (batches of samples) to validate before stopping.
     */
    validationSteps?: number;
    /**
     * Configures the frequency of yielding the main thread to other tasks.
     *
     * In the browser environment, yielding the main thread can improve the
     * responsiveness of the page during training. In the Node.js environment,
     * it can ensure tasks queued in the event loop can be handled in a timely
     * manner.
     *
     * The value can be one of the following:
     *   - `'auto'`: The yielding happens at a certain frame rate (currently set
     *               at 125ms). This is the default.
     *   - `'batch'`: yield every batch.
     *   - `'epoch'`: yield every epoch.
     *   - any `number`: yield every `number` milliseconds.
     *   - `'never'`: never yield. (yielding can still happen through `await
     *      nextFrame()` calls in custom callbacks.)
     */
    yieldEvery?: YieldEveryOptions;
}

/**
 * Interface for configuring model training based on a dataset object.
 */
export declare interface ModelFitDatasetArgs<T> {
    /**
     * (Optional) Total number of steps (batches of samples) before
     * declaring one epoch finished and starting the next epoch. It should
     * typically be equal to the number of samples of your dataset divided by
     * the batch size, so that `fitDataset`() call can utilize the entire dataset.
     * If it is not provided, use `done` return value in `iterator.next()` as
     * signal to finish an epoch.
     */
    batchesPerEpoch?: number;
    /**
     * Integer number of times to iterate over the training dataset.
     */
    epochs: number;
    /**
     * Verbosity level.
     *
     * Expected to be 0, 1, or 2. Default: 1.
     *
     * 0 - No printed message during fit() call.
     * 1 - In Node.js (tfjs-node), prints the progress bar, together with
     *     real-time updates of loss and metric values and training speed.
     *     In the browser: no action. This is the default.
     * 2 - Not implemented yet.
     */
    verbose?: ModelLoggingVerbosity;
    /**
     * List of callbacks to be called during training.
     * Can have one or more of the following callbacks:
     *   - `onTrainBegin(logs)`: called when training starts.
     *   - `onTrainEnd(logs)`: called when training ends.
     *   - `onEpochBegin(epoch, logs)`: called at the start of every epoch.
     *   - `onEpochEnd(epoch, logs)`: called at the end of every epoch.
     *   - `onBatchBegin(batch, logs)`: called at the start of every batch.
     *   - `onBatchEnd(batch, logs)`: called at the end of every batch.
     *   - `onYield(epoch, batch, logs)`: called every `yieldEvery` milliseconds
     *      with the current epoch, batch and logs. The logs are the same
     *      as in `onBatchEnd()`. Note that `onYield` can skip batches or
     *      epochs. See also docs for `yieldEvery` below.
     */
    callbacks?: BaseCallback[] | CustomCallbackArgs | CustomCallbackArgs[];
    /**
     * Data on which to evaluate the loss and any model
     * metrics at the end of each epoch. The model will not be trained on this
     * data. This could be any of the following:
     *
     *   - An array `[xVal, yVal]`, where the two values may be `tf.Tensor`,
     *     an array of Tensors, or a map of string to Tensor.
     *   - Similarly, an array ` [xVal, yVal, valSampleWeights]`
     *     (not implemented yet).
     *   - a `Dataset` object with elements of the form `{xs: xVal, ys: yVal}`,
     *     where `xs` and `ys` are the feature and label tensors, respectively.
     *
     * If `validationData` is an Array of Tensor objects, each `tf.Tensor` will be
     * sliced into batches during validation, using the parameter
     * `validationBatchSize` (which defaults to 32). The entirety of the
     * `tf.Tensor` objects will be used in the validation.
     *
     * If `validationData` is a dataset object, and the `validationBatches`
     * parameter is specified, the validation will use `validationBatches` batches
     * drawn from the dataset object. If `validationBatches` parameter is not
     * specified, the validation will stop when the dataset is exhausted.
     *
     * The model will not be trained on this data.
     */
    validationData?: [
    TensorOrArrayOrMap,
    TensorOrArrayOrMap
    ] | [TensorOrArrayOrMap, TensorOrArrayOrMap, TensorOrArrayOrMap] | Dataset<T>;
    /**
     * Optional batch size for validation.
     *
     * Used only if `validationData` is an array of `tf.Tensor` objects, i.e., not
     * a dataset object.
     *
     * If not specified, its value defaults to 32.
     */
    validationBatchSize?: number;
    /**
     * (Optional) Only relevant if `validationData` is specified and is a dataset
     * object.
     *
     * Total number of batches of samples to draw from `validationData` for
     * validation purpose before stopping at the end of every epoch. If not
     * specified, `evaluateDataset` will use `iterator.next().done` as signal to
     * stop validation.
     */
    validationBatches?: number;
    /**
     * Configures the frequency of yielding the main thread to other tasks.
     *
     * In the browser environment, yielding the main thread can improve the
     * responsiveness of the page during training. In the Node.js environment,
     * it can ensure tasks queued in the event loop can be handled in a timely
     * manner.
     *
     * The value can be one of the following:
     *   - `'auto'`: The yielding happens at a certain frame rate (currently set
     *               at 125ms). This is the default.
     *   - `'batch'`: yield every batch.
     *   - `'epoch'`: yield every epoch.
     *   - a `number`: Will yield every `number` milliseconds.
     *   - `'never'`: never yield. (But yielding can still happen through `await
     *      nextFrame()` calls in custom callbacks.)
     */
    yieldEvery?: YieldEveryOptions;
    /**
     * Epoch at which to start training (useful for resuming a previous training
     * run). When this is used, `epochs` is the index of the "final epoch".
     * The model is not trained for a number of iterations given by `epochs`,
     * but merely until the epoch of index `epochs` is reached.
     */
    initialEpoch?: number;
    /**
     * Optional object mapping class indices (integers) to
     * a weight (float) to apply to the model's loss for the samples from this
     * class during training. This can be useful to tell the model to "pay more
     * attention" to samples from an under-represented class.
     *
     * If the model has multiple outputs, a class weight can be specified for
     * each of the outputs by setting this field an array of weight object
     * or an object that maps model output names (e.g., `model.outputNames[0]`)
     * to weight objects.
     */
    classWeight?: ClassWeight | ClassWeight[] | ClassWeightMap;
}

/**
 * Parses a JSON model configuration file and returns a model instance.
 *
 * ```js
 * // This example shows how to serialize a model using `toJSON()` and
 * // deserialize it as another model using `tf.models.modelFromJSON()`.
 * // Note: this example serializes and deserializes only the topology
 * // of the model; the weights of the loaded model will be different
 * // from those of the the original model, due to random weight
 * // initialization.
 * // To load the topology and weights of a model, use `tf.loadLayersModel()`.
 * const model1 = tf.sequential();
 * model1.add(tf.layers.repeatVector({inputShape: [2], n: 4}));
 * // Serialize `model1` as a JSON object.
 * const model1JSON = model1.toJSON(null, false);
 * model1.summary();
 *
 * const model2 = await tf.models.modelFromJSON(model1JSON);
 * model2.summary();
 * ```
 *
 *  @param modelAndWeightsConfig JSON object or string encoding a model and
 *       weights configuration. It can also be only the topology JSON of the
 *       model, in which case the weights will not be loaded.
 *  @param custom_objects Optional dictionary mapping names
 *       (strings) to custom classes or functions to be
 *       considered during deserialization.
 * @returns A TensorFlow.js Layers `tf.LayersModel` instance (uncompiled).
 */
declare function modelFromJSON(modelAndWeightsConfig: ModelAndWeightsConfig | PyJsonDict, customObjects?: serialization.ConfigDict): Promise<LayersModel>;

/** Verbosity logging level when fitting a model. */
declare enum ModelLoggingVerbosity {
    SILENT = 0,
    VERBOSE = 1
}

declare interface ModelPredictArgs {
    /**
     * Optional. Batch size (Integer). If unspecified, it will default to 32.
     */
    batchSize?: number;
    /**
     * Optional. Verbosity mode. Defaults to false.
     */
    verbose?: boolean;
}

declare namespace models {
    export {
        modelFromJSON
    }
}
export { models }

declare type MomentumOptimizerConfig = {
    learning_rate: number;
    momentum: number;
    use_nesterov?: boolean;
};

declare type MomentumSerialization = BaseSerialization<'Momentum', MomentumOptimizerConfig>;

declare function MSE(yTrue: Tensor, yPred: Tensor): Tensor;

declare function mse(yTrue: Tensor, yPred: Tensor): Tensor;

declare class Multiply extends Merge {
    /** @nocollapse */
    static className: string;
    constructor(args?: LayerArgs);
    protected mergeFunction(inputs: Tensor[]): Tensor;
}

/**
 * Layer that multiplies (element-wise) an `Array` of inputs.
 *
 * It takes as input an Array of tensors, all of the same
 * shape, and returns a single tensor (also of the same shape).
 * For example:
 *
 * ```js
 * const input1 = tf.input({shape: [2, 2]});
 * const input2 = tf.input({shape: [2, 2]});
 * const input3 = tf.input({shape: [2, 2]});
 * const multiplyLayer = tf.layers.multiply();
 * const product = multiplyLayer.apply([input1, input2, input3]);
 * console.log(product.shape);
 * // You get [null, 2, 2], with the first dimension as the undetermined batch
 * // dimension.
 *
 * @doc {heading: 'Layers', subheading: 'Merge', namespace: 'layers'}
 */
declare function multiply(args?: LayerArgs): Multiply;

declare const multiplyImpl: SimpleBinaryKernelImpl;

declare interface NamedTensor {
    name: string;
    tensor: Tensor;
}

declare type NamedTensorsMap = {
    [key: string]: Tensor[];
};

declare function negImpl(xVals: TypedArray, xShape: number[], xDtype: DataType): [
TypedArray,
number[]
];

/**
 * A `Node` describes the connectivity between two layers.
 *
 * Each time a layer is connected to some new input,
 * a node is added to `layer.inboundNodes`.
 *
 * Each time the output of a layer is used by another layer,
 * a node is added to `layer.outboundNodes`.
 *
 * `nodeIndices` and `tensorIndices` are basically fine-grained coordinates
 * describing the origin of the `inputTensors`, verifying the following:
 *
 * `inputTensors[i] ==
 * inboundLayers[i].inboundNodes[nodeIndices[i]].outputTensors[
 *   tensorIndices[i]]`
 *
 * A node from layer A to layer B is added to:
 *     A.outboundNodes
 *     B.inboundNodes
 */
declare class Node_2 {
    callArgs?: Kwargs;
    /**
     * The layer that takes `inputTensors` and turns them into `outputTensors`
     * (the node gets created when the `call` method of the layer is called).
     */
    outboundLayer: Layer;
    /**
     * A list of layers, the same length as `inputTensors`, the layers from where
     * `inputTensors` originate.
     */
    inboundLayers: Layer[];
    /**
     * A list of integers, the same length as `inboundLayers`. `nodeIndices[i]` is
     * the origin node of `inputTensors[i]` (necessary since each inbound layer
     * might have several nodes, e.g. if the layer is being shared with a
     * different data stream).
     */
    nodeIndices: number[];
    /**
     * A list of integers, the same length as `inboundLayers`. `tensorIndices[i]`
     * is the index of `inputTensors[i]` within the output of the inbound layer
     * (necessary since each inbound layer might have multiple tensor outputs,
     * with each one being independently manipulable).
     */
    tensorIndices: number[];
    /** List of input tensors. */
    inputTensors: SymbolicTensor[];
    /** List of output tensors. */
    outputTensors: SymbolicTensor[];
    /** List of input masks (a mask can be a tensor, or null). */
    inputMasks: Tensor[];
    /** List of output masks (a mask can be a tensor, or null). */
    outputMasks: Tensor[];
    /** List of input shape tuples. */
    inputShapes: Shape | Shape[];
    /** List of output shape tuples. */
    outputShapes: Shape | Shape[];
    readonly id: number;
    constructor(args: NodeArgs, callArgs?: Kwargs);
    getConfig(): serialization.ConfigDict;
}

/**
 * Constructor arguments for Node.
 */
declare interface NodeArgs {
    /**
     * The layer that takes `inputTensors` and turns them into `outputTensors`.
     * (the node gets created when the `call` method of the layer is called).
     */
    outboundLayer: Layer;
    /**
     * A list of layers, the same length as `inputTensors`, the layers from where
     * `inputTensors` originate.
     */
    inboundLayers: Layer[];
    /**
     * A list of integers, the same length as `inboundLayers`. `nodeIndices[i]` is
     * the origin node of `inputTensors[i]` (necessary since each inbound layer
     * might have several nodes, e.g. if the layer is being shared with a
     * different data stream).
     */
    nodeIndices: number[];
    /**
     * A list of integers, the same length as `inboundLayers`. `tensorIndices[i]`
     * is the index of `inputTensors[i]` within the output of the inbound layer
     * (necessary since each inbound layer might have multiple tensor outputs,
     * with each one being independently manipulable).
     */
    tensorIndices: number[];
    /** List of input tensors. */
    inputTensors: SymbolicTensor[];
    /** List of output tensors. */
    outputTensors: SymbolicTensor[];
    /** List of input masks (a mask can be a tensor, or null). */
    inputMasks: Tensor[];
    /** List of output masks (a mask can be a tensor, or null). */
    outputMasks: Tensor[];
    /** List of input shape tuples. */
    inputShapes: Shape | Shape[];
    /** List of output shape tuples. */
    outputShapes: Shape | Shape[];
}

/**
 * Constrains the weight to be non-negative.
 *
 * @doc {heading: 'Constraints', namespace: 'constraints'}
 */
declare function nonNeg(): Constraint;

declare const notEqualImpl: SimpleBinaryKernelImpl;

/**
 * Initializer that generates tensors initialized to 1.
 *
 * @doc {heading: 'Initializers', namespace: 'initializers'}
 */
declare function ones(): Initializer;

export declare interface OpExecutor {
    (node: GraphNode): Tensor | Tensor[] | Promise<Tensor | Tensor[]>;
}

declare type OptimizerSerialization = AdadeltaSerialization | AdagradSerialization | AdamSerialization | AdamaxSerialization | MomentumSerialization | RMSPropSerialization | SGDSerialization;

/**
 * Initializer that generates a random orthogonal matrix.
 *
 * Reference:
 * [Saxe et al., http://arxiv.org/abs/1312.6120](http://arxiv.org/abs/1312.6120)
 *
 * @doc {heading: 'Initializers', namespace: 'initializers'}
 */
declare function orthogonal(args: OrthogonalArgs): Initializer;

declare interface OrthogonalArgs extends SeedOnlyInitializerArgs {
    /**
     * Multiplicative factor to apply to the orthogonal matrix. Defaults to 1.
     */
    gain?: number;
}

declare type OutputMode = 'int' | 'oneHot' | 'multiHot' | 'count' | 'tfIdf';

declare enum PackingScheme {
    /**
     * All values in a single texel are densely packed without any constraints.
     *
     * This is how the shader encodes a tensor with shape = [2, 3, 4]
     * (indices are [batch, row, col]).
     *
     * 000|001   010|011   020|021
     * -------   -------   -------
     * 002|003   012|013   022|023
     *
     * 100|101   110|111   120|121
     * -------   -------   -------
     * 102|103   112|113   122|123
     *
     */
    DENSE = 0,
    /**
     * Single texels contain only values from the same batch, and from adjacent
     * rows and columns.
     *
     * This is how the shader encodes a tensor with shape = [2, 3, 5]
     * (indices are [batch, row, col]).
     *
     * 000|001   002|003   004|xxx   020|021   022|023   024|xxx
     * -------   -------   -------   -------   -------   -------
     * 010|011   012|013   014|xxx   xxx|xxx   xxx|xxx   xxx|xxx
     *
     * 100|101   102|103   104|xxx   120|121   122|123   124|xxx
     * -------   -------   -------   -------   -------   -------
     * 110|111   112|113   114|xxx   xxx|xxx   xxx|xxx   xxx|xxx
     *
     */
    SHARED_BATCH = 1
}

/** @docinline */
declare type PaddingMode = 'valid' | 'same' | 'causal';

declare type Params = {
    [key: string]: number | string | boolean | number[] | string[] | boolean[];
};

declare class Permute extends Layer {
    /** @nocollapse */
    static className: string;
    readonly dims: number[];
    private readonly dimsIncludingBatch;
    constructor(args: PermuteLayerArgs);
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}

/**
 * Permutes the dimensions of the input according to a given pattern.
 *
 * Useful for, e.g., connecting RNNs and convnets together.
 *
 * Example:
 *
 * ```js
 * const model = tf.sequential();
 * model.add(tf.layers.permute({
 *   dims: [2, 1],
 *   inputShape: [10, 64]
 * }));
 * console.log(model.outputShape);
 * // Now model's output shape is [null, 64, 10], where null is the
 * // unpermuted sample (batch) dimension.
 * ```
 *
 * Input shape:
 *   Arbitrary. Use the configuration field `inputShape` when using this
 *   layer as the first layer in a model.
 *
 * Output shape:
 *   Same rank as the input shape, but with the dimensions re-ordered (i.e.,
 *   permuted) according to the `dims` configuration of this layer.
 *
 * @doc {heading: 'Layers', subheading: 'Basic', namespace: 'layers'}
 */
declare function permute(args: PermuteLayerArgs): Permute;

declare interface PermuteLayerArgs extends LayerArgs {
    /**
     * Array of integers. Permutation pattern. Does not include the
     * sample (batch) dimension. Index starts at 1.
     * For instance, `[2, 1]` permutes the first and second dimensions
     * of the input.
     */
    dims: number[];
}

declare enum PixelsOpType {
    FROM_PIXELS = 0,
    DRAW = 1
}

/**
 * Abstract class for different pooling 1D layers.
 */
declare abstract class Pooling1D extends Layer {
    protected readonly poolSize: [number];
    protected readonly strides: [number];
    protected readonly padding: PaddingMode;
    /**
     *
     * @param args Parameters for the Pooling layer.
     *
     * config.poolSize defaults to 2.
     */
    constructor(args: Pooling1DLayerArgs);
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    protected abstract poolingFunction(inputs: Tensor, poolSize: [number, number], strides: [number, number], padding: PaddingMode, dataFormat: DataFormat): Tensor;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}

declare interface Pooling1DLayerArgs extends LayerArgs {
    /**
     * Size of the window to pool over, should be an integer.
     */
    poolSize?: number | [number];
    /**
     * Period at which to sample the pooled values.
     *
     * If `null`, defaults to `poolSize`.
     */
    strides?: number | [number];
    /** How to fill in data that's not an integer multiple of poolSize. */
    padding?: PaddingMode;
}

/**
 * Abstract class for different pooling 2D layers.
 */
declare abstract class Pooling2D extends Layer {
    protected readonly poolSize: [number, number];
    protected readonly strides: [number, number];
    protected readonly padding: PaddingMode;
    protected readonly dataFormat: DataFormat;
    constructor(args: Pooling2DLayerArgs);
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    protected abstract poolingFunction(inputs: Tensor, poolSize: [number, number], strides: [number, number], padding: PaddingMode, dataFormat: DataFormat): Tensor;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}

declare interface Pooling2DLayerArgs extends LayerArgs {
    /**
     * Factors by which to downscale in each dimension [vertical, horizontal].
     * Expects an integer or an array of 2 integers.
     *
     * For example, `[2, 2]` will halve the input in both spatial dimensions.
     * If only one integer is specified, the same window length
     * will be used for both dimensions.
     */
    poolSize?: number | [number, number];
    /**
     * The size of the stride in each dimension of the pooling window. Expects
     * an integer or an array of 2 integers. Integer, tuple of 2 integers, or
     * None.
     *
     * If `null`, defaults to `poolSize`.
     */
    strides?: number | [number, number];
    /** The padding type to use for the pooling layer. */
    padding?: PaddingMode;
    /** The data format to use for the pooling layer. */
    dataFormat?: DataFormat;
}

/**
 * Abstract class for different pooling 3D layers.
 */
declare abstract class Pooling3D extends Layer {
    protected readonly poolSize: [number, number, number];
    protected readonly strides: [number, number, number];
    protected readonly padding: PaddingMode;
    protected readonly dataFormat: DataFormat;
    constructor(args: Pooling3DLayerArgs);
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    protected abstract poolingFunction(inputs: Tensor, poolSize: [number, number, number], strides: [number, number, number], padding: PaddingMode, dataFormat: DataFormat): Tensor;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}

declare interface Pooling3DLayerArgs extends LayerArgs {
    /**
     * Factors by which to downscale in each dimension [depth, height, width].
     * Expects an integer or an array of 3 integers.
     *
     * For example, `[2, 2, 2]` will halve the input in three dimensions.
     * If only one integer is specified, the same window length
     * will be used for all dimensions.
     */
    poolSize?: number | [number, number, number];
    /**
     * The size of the stride in each dimension of the pooling window. Expects
     * an integer or an array of 3 integers. Integer, tuple of 3 integers, or
     * None.
     *
     * If `null`, defaults to `poolSize`.
     */
    strides?: number | [number, number, number];
    /** The padding type to use for the pooling layer. */
    padding?: PaddingMode;
    /** The data format to use for the pooling layer. */
    dataFormat?: DataFormat;
}

/**
 * Computes the precision of the predictions with respect to the labels.
 *
 * Example:
 * ```js
 * const x = tf.tensor2d(
 *    [
 *      [0, 0, 0, 1],
 *      [0, 1, 0, 0],
 *      [0, 0, 0, 1],
 *      [1, 0, 0, 0],
 *      [0, 0, 1, 0]
 *    ]
 * );
 *
 * const y = tf.tensor2d(
 *    [
 *      [0, 0, 1, 0],
 *      [0, 1, 0, 0],
 *      [0, 0, 0, 1],
 *      [0, 1, 0, 0],
 *      [0, 1, 0, 0]
 *    ]
 * );
 *
 * const precision = tf.metrics.precision(x, y);
 * precision.print();
 * ```
 *
 * @param yTrue The ground truth values. Expected to contain only 0-1 values.
 * @param yPred The predicted values. Expected to contain only 0-1 values.
 * @return Precision Tensor.
 *
 * @doc {heading: 'Metrics', namespace: 'metrics'}
 */
declare function precision(yTrue: Tensor, yPred: Tensor): Tensor;

declare class PReLU extends Layer {
    /** @nocollapse */
    static className: string;
    private readonly alphaInitializer;
    private readonly alphaRegularizer;
    private readonly alphaConstraint;
    private readonly sharedAxes;
    private alpha;
    readonly DEFAULT_ALPHA_INITIALIZER: InitializerIdentifier;
    constructor(args?: PReLULayerArgs);
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}

/**
 * Parameterized version of a leaky rectified linear unit.
 *
 * It follows
 * `f(x) = alpha * x for x < 0.`
 * `f(x) = x for x >= 0.`
 * wherein `alpha` is a trainable weight.
 *
 * Input shape:
 *   Arbitrary. Use the configuration `inputShape` when using this layer as the
 *   first layer in a model.
 *
 * Output shape:
 *   Same shape as the input.
 *
 * @doc {
 *   heading: 'Layers',
 *   subheading: 'Advanced Activation',
 *   namespace: 'layers'
 * }
 */
declare function prelu(args?: PReLULayerArgs): PReLU;

declare interface PReLULayerArgs extends LayerArgs {
    /**
     * Initializer for the learnable alpha.
     */
    alphaInitializer?: Initializer | InitializerIdentifier;
    /**
     * Regularizer for the learnable alpha.
     */
    alphaRegularizer?: Regularizer;
    /**
     * Constraint for the learnable alpha.
     */
    alphaConstraint?: Constraint;
    /**
     * The axes along which to share learnable parameters for the activation
     * function. For example, if the incoming feature maps are from a 2D
     * convolution with output shape `[numExamples, height, width, channels]`,
     * and you wish to share parameters across space (height and width) so that
     * each filter channels has only one set of parameters, set
     * `shared_axes: [1, 2]`.
     */
    sharedAxes?: number | number[];
}

declare function prodImpl(xShape: number[], xDtype: DataType, xVals: TypedArray, reductionAxes: number[]): {
    outVals: TypedArray;
    outShape: number[];
    outDtype: DataType;
};

declare type ProgramUniform = Array<{
    type: string;
    data: number[];
}>;

/**
 * A key-value dict like @see PyJsonDict, but with restricted keys.
 *
 * This makes it possible to create subtypes that have only the specified
 * fields, while requiring that the values are JSON-compatible.
 *
 * That is in contrast to extending `PyJsonDict`, or using an intersection type
 * `Foo & PyJsonDict`.  In both of those cases, the fields of Foo are actually
 * allowed to be of types that are incompatible with `PyJsonValue`.  Worse, the
 * index signature of `PyJsonValue` means that *any* key is accepted: eg.
 * `const foo: Foo = ...; foo.bogus = 12; const x = foo.bogus` works for both
 * reading and assignment, even if `bogus` is not a field of the type `Foo`,
 * because the index signature inherited from `PyJsonDict` accepts all strings.
 *
 * Here, we *both* restrict the keys to known values, *and* guarantee that the
 * values associated with those keys are compatible with `PyJsonValue`.
 *
 * This guarantee is easiest to apply via an additional incantation:
 *
 * ```
 * export interface Foo extends PyJson<keyof Foo> {
 *   a: SomeType;
 *   b: SomeOtherType;
 * }
 * ```
 *
 * Now instances of `Foo` have *only* the fields `a` and `b`, and furthermore,
 * if either the type `SomeType` or `SomeOtherType` is incompatible with
 * `PyJsonValue`, the compiler produces a typing error.
 */
declare type PyJson<Keys extends string> = {
    [x in Keys]?: PyJsonValue;
};

/**
 * An array of values within the JSON-serialized form of a serializable object.
 *
 * The keys of any nested dicts should be in snake_case (i.e., using Python
 * naming conventions) for compatibility with Python Keras.
 *
 * @see PyJsonDict
 */
declare interface PyJsonArray extends Array<PyJsonValue> {
}

/**
 * A key-value dict within the JSON-serialized form of a serializable object.
 *
 * Serialization/deserialization uses stringified-JSON as the storage
 * representation. Typically this should be used for materialized JSON
 * stored on disk or sent/received over the wire.
 *
 * The keys of this dict and of any nested dicts should be in snake_case (i.e.,
 * using Python naming conventions) for compatibility with Python Keras.
 *
 * Internally this is normally converted to a ConfigDict that has CamelCase keys
 * (using TypeScript naming conventions) and support for Enums.
 */
declare interface PyJsonDict {
    [key: string]: PyJsonValue;
}

/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
/**
 * A value within the JSON-serialized form of a serializable object.
 *
 * The keys of any nested dicts should be in snake_case (i.e., using Python
 * naming conventions) for compatibility with Python Keras.
 *
 * @see PyJsonDict
 */
declare type PyJsonValue = boolean | number | string | null | PyJsonArray | PyJsonDict;

declare function raggedGatherImpl(paramsNestedSplits: TypedArray[], paramsNestedSplitsShapes: number[][], paramsDenseValues: TypedArray, paramsDenseValuesShape: number[], paramsDenseValuesDType: DataType, indices: TypedArray, indicesShape: number[], outputRaggedRank: number): [TypedArray[], TypedArray, number[]];

declare function raggedRangeImpl(starts: TypedArray, startsShape: number[], startsDType: DataType, limits: TypedArray, limitsShape: number[], deltas: TypedArray, deltasShape: number[]): [TypedArray, TypedArray];

declare function raggedTensorToTensorImpl(shape: TypedArray, shapesShape: number[], values: TypedArray, valuesShape: number[], valuesDType: DataType, defaultValue: TypedArray, defaultValueShape: number[], rowPartitionValues: TypedArray[], rowPartitionValuesShapes: number[][], rowPartitionTypes: string[]): [number[], TypedArray];

/**
 * Initializer that generates random values initialized to a normal
 * distribution.
 *
 * @doc {heading: 'Initializers', namespace: 'initializers'}
 */
declare function randomNormal(args: RandomNormalArgs): Initializer;

declare interface RandomNormalArgs {
    /** Mean of the random values to generate. */
    mean?: number;
    /** Standard deviation of the random values to generate. */
    stddev?: number;
    /** Used to seed the random generator. */
    seed?: number;
}

/**
 * @license
 * Copyright 2023 CodeSmith LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
/**
 * Keeps track of seed and handles pseudorandomness
 * Instance created in BaseRandomLayer class
 * Utilized for random preprocessing layers
 */
declare class RandomSeed {
    static className: string;
    seed: number | undefined;
    constructor(seed: number | undefined);
    next(): number | undefined;
}

/**
 * Initializer that generates random values initialized to a uniform
 * distribution.
 *
 * Values will be distributed uniformly between the configured minval and
 * maxval.
 *
 * @doc {heading: 'Initializers', namespace: 'initializers'}
 */
declare function randomUniform(args: RandomUniformArgs): Initializer;

declare interface RandomUniformArgs {
    /** Lower bound of the range of random values to generate. */
    minval?: number;
    /** Upper bound of the range of random values to generate. */
    maxval?: number;
    /** Used to seed the random generator. */
    seed?: number;
}

/**
 * Preprocessing Layer with randomly varies image during training
 *
 * This layer randomly adjusts the width of a batch of images of a
 * batch of images by a random factor.
 *
 * The input should be a 3D (unbatched) or
 * 4D (batched) tensor in the `"channels_last"` image data format. Input pixel
 * values can be of any range (e.g. `[0., 1.)` or `[0, 255]`) and of interger
 * or floating point dtype. By default, the layer will output floats.
 *
 * tf methods implemented in tfjs: 'bilinear', 'nearest',
 * tf methods unimplemented in tfjs: 'bicubic', 'area', 'lanczos3', 'lanczos5',
 *                                   'gaussian', 'mitchellcubic'
 *
 */
declare class RandomWidth extends BaseRandomLayer {
    /** @nocollapse */
    static className: string;
    private readonly factor;
    private readonly interpolation?;
    private widthLower;
    private widthUpper;
    private imgHeight;
    private widthFactor;
    constructor(args: RandomWidthArgs);
    getConfig(): serialization.ConfigDict;
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    call(inputs: Tensor<Rank.R3> | Tensor<Rank.R4>, kwargs: Kwargs): Tensor[] | Tensor;
}

/**
 * A preprocessing layer which randomly varies image width during training.
 *
 * This layer will randomly adjusts the width of a batch of images of a batch
 * of images by a random factor.
 *
 * The input should be a 3D (unbatched) or 4D (batched) tensor in
 * the `"channels_last"` image data format. Input pixel values can be of any
 * range (e.g. `[0., 1.)` or `[0, 255]`) and of integer or floating point
 * dtype. By default, the layer will output floats. By default, this layer is
 * inactive during inference. For an overview and full list of preprocessing
 * layers, see the preprocessing [guide]
 * (https://www.tensorflow.org/guide/keras/preprocessing_layers).
 *
 * Arguments:
 *
 * factor:
 *   A positive float (fraction of original width), or a tuple of size 2
 *   representing lower and upper bound for resizing vertically.
 *   When represented as a single float, this value is used for both the upper
 *   and lower bound. For instance, `factor=(0.2, 0.3)` results in an output
 *   with width changed by a random amount in the range `[20%, 30%]`.
 *   `factor=(-0.2, 0.3)` results in an output with width changed by a random
 *   amount in the range `[-20%, +30%]`. `factor=0.2` results in an output
 *   with width changed by a random amount in the range `[-20%, +20%]`.
 * interpolation:
 *   String, the interpolation method.
 *   Defaults to `bilinear`.
 *   Supports `"bilinear"`, `"nearest"`.
 *   The tf methods `"bicubic"`, `"area"`, `"lanczos3"`, `"lanczos5"`,
 *   `"gaussian"`, `"mitchellcubic"` are unimplemented in tfjs.
 * seed:
 *   Integer. Used to create a random seed.
 *
 * Input shape:
 *     3D (unbatched) or 4D (batched) tensor with shape:
 *     `(..., height, width, channels)`, in `"channels_last"` format.
 * Output shape:
 *     3D (unbatched) or 4D (batched) tensor with shape:
 *     `(..., height, random_width, channels)`.
 *
 *
 * @doc {heading: 'Layers', subheading: 'RandomWidth', namespace: 'layers'}
 */
declare function randomWidth(args: RandomWidthArgs): RandomWidth;

declare interface RandomWidthArgs extends BaseRandomLayerArgs {
    factor: number | [number, number];
    interpolation?: InterpolationType_2;
    seed?: number;
    autoVectorize?: boolean;
}

declare function rangeImpl(start: number, stop: number, step: number, dtype: 'float32' | 'int32'): DataTypeMap['float32' | 'int32'];

/**
 * Computes the recall of the predictions with respect to the labels.
 *
 * Example:
 * ```js
 * const x = tf.tensor2d(
 *    [
 *      [0, 0, 0, 1],
 *      [0, 1, 0, 0],
 *      [0, 0, 0, 1],
 *      [1, 0, 0, 0],
 *      [0, 0, 1, 0]
 *    ]
 * );
 *
 * const y = tf.tensor2d(
 *    [
 *      [0, 0, 1, 0],
 *      [0, 1, 0, 0],
 *      [0, 0, 0, 1],
 *      [0, 1, 0, 0],
 *      [0, 1, 0, 0]
 *    ]
 * );
 *
 * const recall = tf.metrics.recall(x, y);
 * recall.print();
 * ```
 *
 * @param yTrue The ground truth values. Expected to contain only 0-1 values.
 * @param yPred The predicted values. Expected to contain only 0-1 values.
 * @return Recall Tensor.
 *
 * @doc {heading: 'Metrics', namespace: 'metrics'}
 */
declare function recall(yTrue: Tensor, yPred: Tensor): Tensor;

export declare function registerCallbackConstructor(verbosityLevel: number, callbackConstructor: BaseCallbackConstructor): void;

/**
 * Register an Op for graph model executor. This allows you to register
 * TensorFlow custom op or override existing op.
 *
 * Here is an example of registering a new MatMul Op.
 * ```js
 * const customMatmul = (node) =>
 *    tf.matMul(
 *        node.inputs[0], node.inputs[1],
 *        node.attrs['transpose_a'], node.attrs['transpose_b']);
 *
 * tf.registerOp('MatMul', customMatmul);
 * ```
 * The inputs and attrs of the node object are based on the TensorFlow op
 * registry.
 *
 * @param name The Tensorflow Op name.
 * @param opFunc An op function which is called with the current graph node
 * during execution and needs to return a tensor or a list of tensors. The node
 * has the following attributes:
 *    - attr: A map from attribute name to its value
 *    - inputs: A list of input tensors
 *
 * @doc {heading: 'Models', subheading: 'Op Registry'}
 */
export declare function registerOp(name: string, opFunc: OpExecutor): void;

/**
 * Regularizer base class.
 */
declare abstract class Regularizer extends serialization.Serializable {
    abstract apply(x: Tensor): Scalar;
}

/**
 * Type for a regularizer function.
 */
declare type RegularizerFn = () => Scalar;

/** @docinline */
declare type RegularizerIdentifier = 'l1l2' | string;

declare namespace regularizers {
    export {
        l1l2,
        l1,
        l2
    }
}
export { regularizers }

declare class ReLU extends Layer {
    /** @nocollapse */
    static className: string;
    maxValue: number;
    constructor(args?: ReLULayerArgs);
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getConfig(): serialization.ConfigDict;
}

/**
 * Rectified Linear Unit activation function.
 *
 * Input shape:
 *   Arbitrary. Use the config field `inputShape` (Array of integers, does
 *   not include the sample axis) when using this layer as the first layer
 *   in a model.
 *
 * Output shape:
 *   Same shape as the input.
 *
 * @doc {
 *   heading: 'Layers',
 *   subheading: 'Advanced Activation',
 *   namespace: 'layers'
 * }
 */
declare function reLU(args?: ReLULayerArgs): ReLU;

declare interface ReLULayerArgs extends LayerArgs {
    /**
     * Float, the maximum output value.
     */
    maxValue?: number;
}

declare class RepeatVector extends Layer {
    /** @nocollapse */
    static className: string;
    readonly n: number;
    constructor(args: RepeatVectorLayerArgs);
    computeOutputShape(inputShape: Shape): Shape;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}

/**
 * Repeats the input n times in a new dimension.
 *
 * ```js
 *  const model = tf.sequential();
 *  model.add(tf.layers.repeatVector({n: 4, inputShape: [2]}));
 *  const x = tf.tensor2d([[10, 20]]);
 *  // Use the model to do inference on a data point the model hasn't seen
 *  model.predict(x).print();
 *  // output shape is now [batch, 2, 4]
 * ```
 *
 * @doc {heading: 'Layers', subheading: 'Basic', namespace: 'layers'}
 */
declare function repeatVector(args: RepeatVectorLayerArgs): RepeatVector;

declare interface RepeatVectorLayerArgs extends LayerArgs {
    /**
     * The integer number of times to repeat the input.
     */
    n: number;
}

/**
 * Preprocessing Rescaling Layer
 *
 * This rescales images by a scaling and offset factor
 */
declare class Rescaling extends Layer {
    /** @nocollapse */
    static className: string;
    private readonly scale;
    private readonly offset;
    constructor(args: RescalingArgs);
    getConfig(): serialization.ConfigDict;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor[] | Tensor;
}

/**
 * A preprocessing layer which rescales input values to a new range.
 *
 * This layer rescales every value of an input (often an image) by multiplying
 * by `scale` and adding `offset`.
 *
 * For instance:
 * 1. To rescale an input in the ``[0, 255]`` range
 * to be in the `[0, 1]` range, you would pass `scale=1/255`.
 * 2. To rescale an input in the ``[0, 255]`` range to be in the `[-1, 1]`
 * range, you would pass `scale=1./127.5, offset=-1`.
 * The rescaling is applied both during training and inference. Inputs can be
 * of integer or floating point dtype, and by default the layer will output
 * floats.
 *
 * Arguments:
 *   - `scale`: Float, the scale to apply to the inputs.
 *   - `offset`: Float, the offset to apply to the inputs.
 *
 * Input shape:
 *   Arbitrary.
 *
 * Output shape:
 *   Same as input.
 *
 * @doc {heading: 'Layers', subheading: 'Rescaling', namespace: 'layers'}
 */
declare function rescaling(args?: RescalingArgs): Rescaling;

declare interface RescalingArgs extends LayerArgs {
    scale: number;
    offset?: number;
}

declare function resetMaxTexturesInShader(): void;

declare function resetMaxTextureSize(): void;

declare class Reshape extends Layer {
    /** @nocollapse */
    static className: string;
    private targetShape;
    constructor(args: ReshapeLayerArgs);
    private isUnknown;
    /**
     * Finds and replaces a missing dimension in output shape.
     *
     * This is a near direct port of the internal Numpy function
     * `_fix_unknown_dimension` in `numpy/core/src/multiarray/shape.c`.
     *
     * @param inputShape: Original shape of array begin reshape.
     * @param outputShape: Target shape of the array, with at most a single
     * `null` or negative number, which indicates an underdetermined dimension
     * that should be derived from `inputShape` and the known dimensions of
     *   `outputShape`.
     * @returns: The output shape with `null` replaced with its computed value.
     * @throws: ValueError: If `inputShape` and `outputShape` do not match.
     */
    private fixUnknownDimension;
    computeOutputShape(inputShape: Shape): Shape;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}

/**
 * Reshapes an input to a certain shape.
 *
 * ```js
 * const input = tf.input({shape: [4, 3]});
 * const reshapeLayer = tf.layers.reshape({targetShape: [2, 6]});
 * // Inspect the inferred output shape of the Reshape layer, which
 * // equals `[null, 2, 6]`. (The 1st dimension is the undermined batch size.)
 * console.log(JSON.stringify(reshapeLayer.apply(input).shape));
 * ```
 *
 * Input shape:
 *   Arbitrary, although all dimensions in the input shape must be fixed.
 *   Use the configuration `inputShape` when using this layer as the
 *   first layer in a model.
 *
 *
 * Output shape:
 *   [batchSize, targetShape[0], targetShape[1], ...,
 *    targetShape[targetShape.length - 1]].
 *
 * @doc {heading: 'Layers', subheading: 'Basic', namespace: 'layers'}
 */
declare function reshape(args: ReshapeLayerArgs): Reshape;

declare interface ReshapeLayerArgs extends LayerArgs {
    /** The target shape. Does not include the batch axis. */
    targetShape: Shape;
}

/**
 * Preprocessing Resizing Layer
 *
 * This resizes images by a scaling and offset factor
 */
declare class Resizing extends Layer {
    /** @nocollapse */
    static className: string;
    private readonly height;
    private readonly width;
    private readonly interpolation;
    private readonly cropToAspectRatio;
    constructor(args: ResizingArgs);
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getConfig(): serialization.ConfigDict;
    call(inputs: Tensor<Rank.R3> | Tensor<Rank.R4>, kwargs: Kwargs): Tensor[] | Tensor;
}

/**
 * A preprocessing layer which resizes images.
 * This layer resizes an image input to a target height and width. The input
 * should be a 4D (batched) or 3D (unbatched) tensor in `"channels_last"`
 * format.  Input pixel values can be of any range (e.g. `[0., 1.)` or `[0,
 * 255]`) and of interger or floating point dtype. By default, the layer will
 * output floats.
 *
 * Arguments:
 *   - `height`: number, the height for the output tensor.
 *   - `width`: number, the width for the output tensor.
 *   - `interpolation`: string, the method for image resizing interpolation.
 *   - `cropToAspectRatio`: boolean, whether to keep image aspect ratio.
 *
 * Input shape:
 *   Arbitrary.
 *
 * Output shape:
 *   height, width, num channels.
 *
 * @doc {heading: 'Layers', subheading: 'Resizing', namespace: 'layers'}
 */
declare function resizing(args?: ResizingArgs): Resizing;

declare interface ResizingArgs extends LayerArgs {
    height: number;
    width: number;
    interpolation?: InterpolationType;
    cropToAspectRatio?: boolean;
}

declare type RMSPropOptimizerConfig = {
    learning_rate: number;
    decay?: number;
    momentum?: number;
    epsilon?: number;
    centered?: boolean;
};

declare type RMSPropSerialization = BaseSerialization<'RMSProp', RMSPropOptimizerConfig>;

export declare class RNN extends Layer {
    /** @nocollapse */
    static className: string;
    readonly cell: RNNCell;
    readonly returnSequences: boolean;
    readonly returnState: boolean;
    readonly goBackwards: boolean;
    readonly unroll: boolean;
    stateSpec: InputSpec[];
    protected states_: Tensor[];
    protected keptStates: Tensor[][];
    private numConstants;
    constructor(args: RNNLayerArgs);
    getStates(): Tensor[];
    setStates(states: Tensor[]): void;
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    computeMask(inputs: Tensor | Tensor[], mask?: Tensor | Tensor[]): Tensor | Tensor[];
    /**
     * Get the current state tensors of the RNN.
     *
     * If the state hasn't been set, return an array of `null`s of the correct
     * length.
     */
    get states(): Tensor[];
    set states(s: Tensor[]);
    build(inputShape: Shape | Shape[]): void;
    /**
     * Reset the state tensors of the RNN.
     *
     * If the `states` argument is `undefined` or `null`, will set the
     * state tensor(s) of the RNN to all-zero tensors of the appropriate
     * shape(s).
     *
     * If `states` is provided, will set the state tensors of the RNN to its
     * value.
     *
     * @param states Optional externally-provided initial states.
     * @param training Whether this call is done during training. For stateful
     *   RNNs, this affects whether the old states are kept or discarded. In
     *   particular, if `training` is `true`, the old states will be kept so
     *   that subsequent backpropgataion through time (BPTT) may work properly.
     *   Else, the old states will be discarded.
     */
    resetStates(states?: Tensor | Tensor[], training?: boolean): void;
    apply(inputs: Tensor | Tensor[] | SymbolicTensor | SymbolicTensor[], kwargs?: Kwargs): Tensor | Tensor[] | SymbolicTensor | SymbolicTensor[];
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getInitialState(inputs: Tensor): Tensor[];
    get trainableWeights(): LayerVariable[];
    get nonTrainableWeights(): LayerVariable[];
    setFastWeightInitDuringBuild(value: boolean): void;
    getConfig(): serialization.ConfigDict;
    /** @nocollapse */
    static fromConfig<T extends serialization.Serializable>(cls: serialization.SerializableConstructor<T>, config: serialization.ConfigDict, customObjects?: serialization.ConfigDict): T;
}

/**
 * Base class for recurrent layers.
 *
 * Input shape:
 *   3D tensor with shape `[batchSize, timeSteps, inputDim]`.
 *
 * Output shape:
 *   - if `returnState`, an Array of tensors (i.e., `tf.Tensor`s). The first
 *     tensor is the output. The remaining tensors are the states at the
 *     last time step, each with shape `[batchSize, units]`.
 *   - if `returnSequences`, the output will have shape
 *     `[batchSize, timeSteps, units]`.
 *   - else, the output will have shape `[batchSize, units]`.
 *
 * Masking:
 *   This layer supports masking for input data with a variable number
 *   of timesteps. To introduce masks to your data,
 *   use an embedding layer with the `mask_zero` parameter
 *   set to `True`.
 *
 * Notes on using statefulness in RNNs:
 *   You can set RNN layers to be 'stateful', which means that the states
 *   computed for the samples in one batch will be reused as initial states
 *   for the samples in the next batch. This assumes a one-to-one mapping
 *   between samples in different successive batches.
 *
 *   To enable statefulness:
 *     - specify `stateful: true` in the layer constructor.
 *     - specify a fixed batch size for your model, by passing
 *       if sequential model:
 *         `batchInputShape=[...]` to the first layer in your model.
 *       else for functional model with 1 or more Input layers:
 *         `batchShape=[...]` to all the first layers in your model.
 *       This is the expected shape of your inputs *including the batch size*.
 *       It should be a tuple of integers, e.g. `(32, 10, 100)`.
 *     - specify `shuffle=False` when calling fit().
 *
 *   To reset the states of your model, call `.resetStates()` on either
 *   a specific layer, or on your entire model.
 *
 * Note on specifying the initial state of RNNs
 *   You can specify the initial state of RNN layers symbolically by
 *   calling them with the option `initialState`. The value of
 *   `initialState` should be a tensor or list of tensors representing
 *   the initial state of the RNN layer.
 *
 *   You can specify the initial state of RNN layers numerically by
 *   calling `resetStates` with the keyword argument `states`. The value of
 *   `states` should be a numpy array or list of numpy arrays representing
 *   the initial state of the RNN layer.
 *
 * Note on passing external constants to RNNs
 *   You can pass "external" constants to the cell using the `constants`
 *   keyword argument of `RNN.call` method. This requires that the `cell.call`
 *   method accepts the same keyword argument `constants`. Such constants
 *   can be used to condition the cell transformation on additional static
 *   inputs (not changing over time), a.k.a. an attention mechanism.
 *
 * @doc {heading: 'Layers', subheading: 'Recurrent', namespace: 'layers'}
 */
declare function rnn(args: RNNLayerArgs): RNN;

/**
 * An RNNCell layer.
 *
 * @doc {heading: 'Layers', subheading: 'Classes'}
 */
declare abstract class RNNCell extends Layer {
    /**
     * Size(s) of the states.
     * For RNN cells with only a single state, this is a single integer.
     */
    abstract stateSize: number | number[];
    dropoutMask: Tensor | Tensor[];
    recurrentDropoutMask: Tensor | Tensor[];
}

/**
 * RNNLayerConfig is identical to BaseRNNLayerConfig, except it makes the
 * `cell` property required. This interface is to be used with constructors
 * of concrete RNN layer subtypes.
 */
export declare interface RNNLayerArgs extends BaseRNNLayerArgs {
    cell: RNNCell | RNNCell[];
}

declare const rsqrtImpl: SimpleUnaryImpl<number, number>;

/** @docinline */
declare type SampleWeightMode = 'temporal';

declare function scatterImpl<R extends Rank, D extends 'float32' | 'int32' | 'bool' | 'string'>(indices: TensorBuffer<R, 'int32'>, updates: TensorBuffer<R, D>, shape: number[], outputSize: number, sliceSize: number, numUpdates: number, sliceRank: number, strides: number[], defaultValue: TensorBuffer<R, D> | DefaultValueTypeMap[D], sumDupeIndices: boolean): TensorBuffer<R, D>;

declare interface SeedOnlyInitializerArgs {
    /** Random number generator seed. */
    seed?: number;
}

declare class SeparableConv extends Conv {
    /** @nocollapse */
    static className: string;
    readonly depthMultiplier: number;
    protected readonly depthwiseInitializer?: Initializer;
    protected readonly depthwiseRegularizer?: Regularizer;
    protected readonly depthwiseConstraint?: Constraint;
    protected readonly pointwiseInitializer?: Initializer;
    protected readonly pointwiseRegularizer?: Regularizer;
    protected readonly pointwiseConstraint?: Constraint;
    readonly DEFAULT_DEPTHWISE_INITIALIZER: InitializerIdentifier;
    readonly DEFAULT_POINTWISE_INITIALIZER: InitializerIdentifier;
    protected depthwiseKernel: LayerVariable;
    protected pointwiseKernel: LayerVariable;
    constructor(rank: number, config?: SeparableConvLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}

declare class SeparableConv2D extends SeparableConv {
    /** @nocollapse */
    static className: string;
    constructor(args?: SeparableConvLayerArgs);
}

/**
 * Depthwise separable 2D convolution.
 *
 * Separable convolution consists of first performing
 * a depthwise spatial convolution
 * (which acts on each input channel separately)
 * followed by a pointwise convolution which mixes together the resulting
 * output channels. The `depthMultiplier` argument controls how many
 * output channels are generated per input channel in the depthwise step.
 *
 * Intuitively, separable convolutions can be understood as
 * a way to factorize a convolution kernel into two smaller kernels,
 * or as an extreme version of an Inception block.
 *
 * Input shape:
 *   4D tensor with shape:
 *     `[batch, channels, rows, cols]` if data_format='channelsFirst'
 *   or 4D tensor with shape:
 *     `[batch, rows, cols, channels]` if data_format='channelsLast'.
 *
 * Output shape:
 *   4D tensor with shape:
 *     `[batch, filters, newRows, newCols]` if data_format='channelsFirst'
 *   or 4D tensor with shape:
 *     `[batch, newRows, newCols, filters]` if data_format='channelsLast'.
 *     `rows` and `cols` values might have changed due to padding.
 *
 * @doc {heading: 'Layers', subheading: 'Convolutional', namespace: 'layers'}
 */
declare function separableConv2d(args: SeparableConvLayerArgs): SeparableConv2D;

declare interface SeparableConvLayerArgs extends ConvLayerArgs {
    /**
     * The number of depthwise convolution output channels for each input
     * channel.
     * The total number of depthwise convolution output channels will be equal
     * to `filtersIn * depthMultiplier`. Default: 1.
     */
    depthMultiplier?: number;
    /**
     * Initializer for the depthwise kernel matrix.
     */
    depthwiseInitializer?: InitializerIdentifier | Initializer;
    /**
     * Initializer for the pointwise kernel matrix.
     */
    pointwiseInitializer?: InitializerIdentifier | Initializer;
    /**
     * Regularizer function applied to the depthwise kernel matrix.
     */
    depthwiseRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Regularizer function applied to the pointwise kernel matrix.
     */
    pointwiseRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Constraint function applied to the depthwise kernel matrix.
     */
    depthwiseConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Constraint function applied to the pointwise kernel matrix.
     */
    pointwiseConstraint?: ConstraintIdentifier | Constraint;
}

/**
 * A model with a stack of layers, feeding linearly from one to the next.
 *
 * `tf.sequential` is a factory function that creates an instance of
 * `tf.Sequential`.
 *
 * ```js
 *  // Define a model for linear regression.
 *  const model = tf.sequential();
 *  model.add(tf.layers.dense({units: 1, inputShape: [1]}));
 *
 *  // Prepare the model for training: Specify the loss and the optimizer.
 *  model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});
 *
 *  // Generate some synthetic data for training.
 *  const xs = tf.tensor2d([1, 2, 3, 4], [4, 1]);
 *  const ys = tf.tensor2d([1, 3, 5, 7], [4, 1]);
 *
 *  // Train the model using the data then do inference on a data point the
 *  // model hasn't seen:
 *  await model.fit(xs, ys);
 *  model.predict(tf.tensor2d([5], [1, 1])).print();
 * ```
 *
 * @doc {heading: 'Models', subheading: 'Classes'}
 */
export declare class Sequential extends LayersModel {
    /** @nocollapse */
    static className: string;
    private model;
    constructor(args?: SequentialArgs);
    private checkShape;
    /**
     * Adds a layer instance on top of the layer stack.
     *
     * ```js
     *  const model = tf.sequential();
     *  model.add(tf.layers.dense({units: 8, inputShape: [1]}));
     *  model.add(tf.layers.dense({units: 4, activation: 'relu6'}));
     *  model.add(tf.layers.dense({units: 1, activation: 'relu6'}));
     *  // Note that the untrained model is random at this point.
     *  model.predict(tf.randomNormal([10, 1])).print();
     * ```
     * @param layer Layer instance.
     *
     * @exception ValueError In case the `layer` argument does not know its
     * input shape.
     * @exception ValueError In case the `layer` argument has multiple output
     *   tensors, or is already connected somewhere else (forbidden in
     *   `Sequential` models).
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    add(layer: Layer): void;
    /**
     * Removes the last layer in the model.
     *
     * @exception TypeError if there are no layers in the model.
     */
    pop(): void;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    build(inputShape?: Shape | Shape[]): void;
    countParams(): number;
    /**
     * Print a text summary of the Sequential model's layers.
     *
     * The summary includes
     * - Name and type of all layers that comprise the model.
     * - Output shape(s) of the layers
     * - Number of weight parameters of each layer
     * - The total number of trainable and non-trainable parameters of the
     * model.
     *
     * ```js
     * const model = tf.sequential();
     * model.add(
     *     tf.layers.dense({units: 100, inputShape: [10], activation: 'relu'}));
     * model.add(tf.layers.dense({units: 1, activation: 'sigmoid'}));
     *
     * model.summary();
     * ```
     *
     * @param lineLength Custom line length, in number of characters.
     * @param positions Custom widths of each of the columns, as either
     *   fractions of `lineLength` (e.g., `[0.5, 0.75, 1]`) or absolute number
     *   of characters (e.g., `[30, 50, 65]`). Each number corresponds to
     *   right-most (i.e., ending) position of a column.
     * @param printFn Custom print function. Can be used to replace the default
     *   `console.log`. For example, you can use `x => {}` to mute the printed
     *   messages in the console.
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    summary(lineLength?: number, positions?: number[], printFn?: (message?: any, ...optionalParams: any[]) => void): void;
    /**
     * Sets the weights of the model.
     *
     * @param weights Should be a list of Tensors with shapes and types matching
     *   the output of `model.getWeights()`.
     */
    setWeights(weights: Tensor[]): void;
    /**
     * Returns the loss value & metrics values for the model in test mode.
     *
     * Loss and metrics are specified during `compile()`, which needs to happen
     * before calls to `evaluate()`.
     *
     * Computation is done in batches.
     *
     * ```js
     * const model = tf.sequential({
     *   layers: [tf.layers.dense({units: 1, inputShape: [10]})]
     * });
     * model.compile({optimizer: 'sgd', loss: 'meanSquaredError'});
     * const result = model.evaluate(tf.ones([8, 10]), tf.ones([8, 1]), {
     *   batchSize: 4,
     * });
     * result.print();
     * ```
     *
     * @param x `tf.Tensor` of test data, or an `Array` of `tf.Tensor`s if the
     * model has multiple inputs.
     * @param y `tf.Tensor` of target data, or an `Array` of `tf.Tensor`s if the
     * model has multiple outputs.
     * @param args A `ModelEvaluateConfig`, containing optional fields.
     *
     * @return `Scalar` test loss (if the model has a single output and no
     *   metrics) or `Array` of `Scalar`s (if the model has multiple outputs
     *   and/or metrics). The attribute `model.metricsNames`
     *   will give you the display labels for the scalar outputs.
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    evaluate(x: Tensor | Tensor[], y: Tensor | Tensor[], args?: ModelEvaluateArgs): Scalar | Scalar[];
    /**
     * Evaluate model using a dataset object.
     *
     * Note: Unlike `evaluate()`, this method is asynchronous (`async`).
     *
     * @param dataset A dataset object. Its `iterator()` method is expected
     *   to generate a dataset iterator object, the `next()` method of which
     *   is expected to produce data batches for evaluation. The return value
     *   of the `next()` call ought to contain a boolean `done` field and a
     *   `value` field. The `value` field is expected to be an array of two
     *   `tf.Tensor`s or an array of two nested `tf.Tensor` structures. The former
     *   case is for models with exactly one input and one output (e.g.
     *   a sequential model). The latter case is for models with multiple
     *   inputs and/or multiple outputs. Of the two items in the array, the
     *   first is the input feature(s) and the second is the output target(s).
     * @param args A configuration object for the dataset-based evaluation.
     * @returns Loss and metric values as an Array of `Scalar` objects.
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    evaluateDataset(dataset: Dataset<{}>, args: ModelEvaluateDatasetArgs): Promise<Scalar | Scalar[]>;
    /**
     * Generates output predictions for the input samples.
     *
     * Computation is done in batches.
     *
     * Note: the "step" mode of predict() is currently not supported.
     *   This is because the TensorFlow.js core backend is imperative only.
     *
     * ```js
     * const model = tf.sequential({
     *   layers: [tf.layers.dense({units: 1, inputShape: [10]})]
     * });
     * model.predict(tf.ones([2, 10])).print();
     * ```
     *
     * @param x The input data, as a Tensor, or an `Array` of `tf.Tensor`s if
     *   the model has multiple inputs.
     * @param conifg A `ModelPredictConfig` object containing optional fields.
     *
     * @return `tf.Tensor`(s) of predictions.
     *
     * @exception ValueError In case of mismatch between the provided input data
     *   and the model's expectations, or in case a stateful model receives a
     *   number of samples that is not a multiple of the batch size.
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    predict(x: Tensor | Tensor[], args?: ModelPredictArgs): Tensor | Tensor[];
    /**
     * Returns predictions for a single batch of samples.
     *
     * @param x: Input samples, as a Tensor, or list of Tensors (if the model
     *   has multiple inputs).
     * @return Tensor(s) of predictions
     */
    predictOnBatch(x: Tensor): Tensor | Tensor[];
    /**
     * See `LayersModel.compile`.
     *
     * @param args
     */
    compile(args: ModelCompileArgs): void;
    get optimizer(): Optimizer;
    set optimizer(optimizer: Optimizer);
    /**
     * Trains the model for a fixed number of epochs (iterations on a dataset).
     *
     * ```js
     * const model = tf.sequential({
     *   layers: [tf.layers.dense({units: 1, inputShape: [10]})]
     * });
     * model.compile({optimizer: 'sgd', loss: 'meanSquaredError'});
     * const history = await model.fit(tf.ones([8, 10]), tf.ones([8, 1]), {
     *   batchSize: 4,
     *   epochs: 3
     * });
     * console.log(history.history.loss[0]);
     * ```
     *
     * @param x `tf.Tensor` of training data, or an array of `tf.Tensor`s if the
     * model has multiple inputs. If all inputs in the model are named, you can
     * also pass a dictionary mapping input names to `tf.Tensor`s.
     * @param y `tf.Tensor` of target (label) data, or an array of `tf.Tensor`s if
     * the model has multiple outputs. If all outputs in the model are named, you
     *  can also pass a dictionary mapping output names to `tf.Tensor`s.
     * @param args  A `ModelFitConfig`, containing optional fields.
     *
     * @return A `History` instance. Its `history` attribute contains all
     *   information collected during training.
     *
     * @exception ValueError In case of mismatch between the provided input data
     *   and what the model expects.
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    fit(x: Tensor | Tensor[] | {
        [inputName: string]: Tensor;
    }, y: Tensor | Tensor[] | {
        [inputName: string]: Tensor;
    }, args?: ModelFitArgs): Promise<History_2>;
    /**
     * Trains the model using a dataset object.
     *
     * ```js
     * const xArray = [
     *   [1, 1, 1, 1, 1, 1, 1, 1, 1],
     *   [1, 1, 1, 1, 1, 1, 1, 1, 1],
     *   [1, 1, 1, 1, 1, 1, 1, 1, 1],
     *   [1, 1, 1, 1, 1, 1, 1, 1, 1],
     * ];
     * const yArray = [1, 1, 1, 1];
     * // Create a dataset from the JavaScript array.
     * const xDataset = tf.data.array(xArray);
     * const yDataset = tf.data.array(yArray);
     * // Zip combines the `x` and `y` Datasets into a single Dataset, the
     * // iterator of which will return an object containing of two tensors,
     * // corresponding to `x` and `y`.  The call to `batch(4)` will bundle
     * // four such samples into a single object, with the same keys now pointing
     * // to tensors that hold 4 examples, organized along the batch dimension.
     * // The call to `shuffle(4)` causes each iteration through the dataset to
     * // happen in a different order.  The size of the shuffle window is 4.
     * const xyDataset = tf.data.zip({xs: xDataset, ys: yDataset})
     *     .batch(4)
     *     .shuffle(4);
     * const model = tf.sequential({
     *   layers: [tf.layers.dense({units: 1, inputShape: [9]})]
     * });
     * model.compile({optimizer: 'sgd', loss: 'meanSquaredError'});
     * const history = await model.fitDataset(xyDataset, {
     *   epochs: 4,
     *   callbacks: {onEpochEnd: (epoch, logs) => console.log(logs.loss)}
     * });
     * ```
     *
     * @param dataset A dataset object. Its `iterator()` method is expected to
     *   generate a dataset iterator object, the `next()` method of which is
     *   expected to produce data batches for evaluation. The return value of the
     *   `next()` call ought to contain a boolean `done` field and a `value`
     *   field.
     *
     *   The `value` field is expected to be an object of with fields
     *   `xs` and `ys`, which point to the feature tensor and the target tensor,
     *   respectively. This case is for models with exactly one input and one
     *   output (e.g. a sequential model). For example:
     *   ```js
     *   {value: {xs: xsTensor, ys: ysTensor}, done: false}
     *   ```
     *
     *   If the model has multiple inputs, the `xs` field of `value` should
     *   be an object mapping input names to their respective feature tensors.
     *   For example:
     *   ```js
     *   {
     *     value: {
     *       xs: {
     *         input_1: xsTensor1,
     *         input_2: xsTensor2
     *       },
     *       ys: ysTensor
     *     },
     *     done: false
     *   }
     *   ```
     *   If the model has multiple outputs, the `ys` field of `value` should
     *   be an object mapping output names to their respective target tensors.
     *   For example:
     *   ```js
     *   {
     *     value: {
     *       xs: xsTensor,
     *       ys: {
     *         output_1: ysTensor1,
     *         output_2: ysTensor2
     *       },
     *     },
     *     done: false
     *   }
     *   ```
     * @param args A `ModelFitDatasetArgs`, containing optional fields.
     *
     * @return A `History` instance. Its `history` attribute contains all
     *   information collected during training.
     *
     * @doc {heading: 'Models', subheading: 'Classes', ignoreCI: true}
     */
    fitDataset<T>(dataset: Dataset<T>, args: ModelFitDatasetArgs<T>): Promise<History_2>;
    /**
     * Runs a single gradient update on a single batch of data.
     *
     * This method differs from `fit()` and `fitDataset()` in the following
     * regards:
     *   - It operates on exactly one batch of data.
     *   - It returns only the loss and metric values, instead of
     *     returning the batch-by-batch loss and metric values.
     *   - It doesn't support fine-grained options such as verbosity and
     *     callbacks.
     *
     * @param x Input data. It could be one of the following:
     *   - A `tf.Tensor`, or an Array of `tf.Tensor`s (in case the model has
     *     multiple inputs).
     *   - An Object mapping input names to corresponding `tf.Tensor` (if the
     *     model has named inputs).
     * @param y Target data. It could be either a `tf.Tensor` or multiple
     *   `tf.Tensor`s. It should be consistent with `x`.
     * @returns Training loss or losses (in case the model has
     *   multiple outputs), along with metrics (if any), as numbers.
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    trainOnBatch(x: Tensor | Tensor[] | {
        [inputName: string]: Tensor;
    }, y: Tensor | Tensor[] | {
        [inputName: string]: Tensor;
    }): Promise<number | number[]>;
    /** @nocollapse */
    static fromConfig<T extends serialization.Serializable>(cls: serialization.SerializableConstructor<T>, config: serialization.ConfigDict, customObjects?: serialization.ConfigDict, fastWeightInit?: boolean): T;
    /**
     * Setter used for force stopping of LayersModel.fit() (i.e., training).
     *
     * Example:
     *
     * ```js
     * const model = tf.sequential();
     * model.add(tf.layers.dense({units: 1, inputShape: [10]}));
     * model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});
     * const xs = tf.ones([8, 10]);
     * const ys = tf.zeros([8, 1]);
     *
     * const history = await model.fit(xs, ys, {
     *   epochs: 10,
     *   callbacks: {
     *     onEpochEnd: async (epoch, logs) => {
     *       if (epoch === 2) {
     *         model.stopTraining = true;
     *       }
     *     }
     *   }
     * });
     *
     * // There should be only 3 values in the loss array, instead of 10 values,
     * // due to the stopping after 3 epochs.
     * console.log(history.history.loss);
     * ```
     */
    set stopTraining(stop: boolean);
    get stopTraining(): boolean;
    getConfig(): any;
}

/**
 * Creates a `tf.Sequential` model.  A sequential model is any model where the
 * outputs of one layer are the inputs to the next layer, i.e. the model
 * topology is a simple 'stack' of layers, with no branching or skipping.
 *
 * This means that the first layer passed to a `tf.Sequential` model should have
 * a defined input shape. What that means is that it should have received an
 * `inputShape` or `batchInputShape` argument, or for some type of layers
 * (recurrent, Dense...) an `inputDim` argument.
 *
 * The key difference between `tf.model` and `tf.sequential` is that
 * `tf.sequential` is less generic, supporting only a linear stack of layers.
 * `tf.model` is more generic and supports an arbitrary graph (without
 * cycles) of layers.
 *
 * Examples:
 *
 * ```js
 * const model = tf.sequential();
 *
 * // First layer must have an input shape defined.
 * model.add(tf.layers.dense({units: 32, inputShape: [50]}));
 * // Afterwards, TF.js does automatic shape inference.
 * model.add(tf.layers.dense({units: 4}));
 *
 * // Inspect the inferred shape of the model's output, which equals
 * // `[null, 4]`. The 1st dimension is the undetermined batch dimension; the
 * // 2nd is the output size of the model's last layer.
 * console.log(JSON.stringify(model.outputs[0].shape));
 * ```
 *
 * It is also possible to specify a batch size (with potentially undetermined
 * batch dimension, denoted by "null") for the first layer using the
 * `batchInputShape` key. The following example is equivalent to the above:
 *
 * ```js
 * const model = tf.sequential();
 *
 * // First layer must have a defined input shape
 * model.add(tf.layers.dense({units: 32, batchInputShape: [null, 50]}));
 * // Afterwards, TF.js does automatic shape inference.
 * model.add(tf.layers.dense({units: 4}));
 *
 * // Inspect the inferred shape of the model's output.
 * console.log(JSON.stringify(model.outputs[0].shape));
 * ```
 *
 * You can also use an `Array` of already-constructed `Layer`s to create
 * a `tf.Sequential` model:
 *
 * ```js
 * const model = tf.sequential({
 *   layers: [tf.layers.dense({units: 32, inputShape: [50]}),
 *            tf.layers.dense({units: 4})]
 * });
 * console.log(JSON.stringify(model.outputs[0].shape));
 * ```
 *
 * @doc {heading: 'Models', subheading: 'Creation'}
 */
export declare function sequential(config?: SequentialArgs): Sequential;

/**
 * Configuration for a Sequential model.
 */
export declare interface SequentialArgs {
    /** Stack of layers for the model. */
    layers?: Layer[];
    /** The name of this model. */
    name?: string;
}

/**
 * Sets the number of threads that will be used by XNNPACK to create
 * threadpool (default to the number of logical CPU cores).
 *
 * This must be called before calling `tf.setBackend('wasm')`.
 */
export declare function setThreadsCount(numThreads: number): void;

/**
 * @deprecated Use `setWasmPaths` instead.
 * Sets the path to the `.wasm` file which will be fetched when the wasm
 * backend is initialized. See
 * https://github.com/tensorflow/tfjs/blob/master/tfjs-backend-wasm/README.md#using-bundlers
 * for more details.
 * @param path wasm file path or url
 * @param usePlatformFetch optional boolean to use platform fetch to download
 *     the wasm file, default to false.
 *
 * @doc {heading: 'Environment', namespace: 'wasm'}
 */
export declare function setWasmPath(path: string, usePlatformFetch?: boolean): void;

/**
 * Configures the locations of the WASM binaries.
 *
 * ```js
 * setWasmPaths({
 *  'tfjs-backend-wasm.wasm': 'renamed.wasm',
 *  'tfjs-backend-wasm-simd.wasm': 'renamed-simd.wasm',
 *  'tfjs-backend-wasm-threaded-simd.wasm': 'renamed-threaded-simd.wasm'
 * });
 * tf.setBackend('wasm');
 * ```
 *
 * @param prefixOrFileMap This can be either a string or object:
 *  - (string) The path to the directory where the WASM binaries are located.
 *     Note that this prefix will be used to load each binary (vanilla,
 *     SIMD-enabled, threading-enabled, etc.).
 *  - (object) Mapping from names of WASM binaries to custom
 *     full paths specifying the locations of those binaries. This is useful if
 *     your WASM binaries are not all located in the same directory, or if your
 *     WASM binaries have been renamed.
 * @param usePlatformFetch optional boolean to use platform fetch to download
 *     the wasm file, default to false.
 *
 * @doc {heading: 'Environment', namespace: 'wasm'}
 */
export declare function setWasmPaths(prefixOrFileMap: string | {
    [key in WasmBinaryName]?: string;
}, usePlatformFetch?: boolean): void;

export declare function setWebGLContext(webGLVersion: number, gl: WebGLRenderingContext): void;

declare type SGDOptimizerConfig = {
    learning_rate: number;
};

declare type SGDSerialization = BaseSerialization<'SGD', SGDOptimizerConfig>;

/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
/** @docalias (null | number)[] */
export declare type Shape = Array<null | number>;

declare namespace shared {
    export {
        simpleAbsImpl,
        addImpl,
        bincountImpl,
        bincountReduceImpl,
        bitwiseAndImpl,
        castImpl,
        ceilImpl,
        concatImpl,
        equalImpl,
        expImpl,
        expm1Impl,
        floorImpl,
        floorDivImpl,
        gatherNdImpl,
        gatherV2Impl,
        greaterImpl,
        greaterEqualImpl,
        lessImpl,
        lessEqualImpl,
        linSpaceImpl,
        logImpl,
        maxImpl,
        maximumImpl,
        minimumImpl,
        multiplyImpl,
        negImpl,
        notEqualImpl,
        prodImpl,
        raggedGatherImpl,
        raggedRangeImpl,
        raggedTensorToTensorImpl,
        rangeImpl,
        rsqrtImpl,
        scatterImpl,
        sigmoidImpl,
        sliceImpl,
        sparseFillEmptyRowsImpl,
        sparseReshapeImpl,
        sparseSegmentReductionImpl,
        sqrtImpl,
        squaredDifferenceImpl,
        staticRegexReplaceImpl,
        stridedSliceImpl,
        stringNGramsImpl,
        stringSplitImpl,
        stringToHashBucketFastImpl,
        subImpl,
        tileImpl,
        topKImpl,
        transposeImpl,
        uniqueImpl,
        ComplexBinaryKernelImpl,
        SimpleBinaryKernelImpl
    }
}
export { shared }

declare const sigmoidImpl: SimpleUnaryImpl<number, number>;

declare function simpleAbsImpl(vals: TypedArray): Float32Array;

declare type SimpleBinaryKernelImpl = (aShape: number[], bShape: number[], aVals: TypedArray | string[], bVals: TypedArray | string[], dtype: DataType) => [TypedArray, number[]];

declare class SimpleRNN extends RNN {
    /** @nocollapse */
    static className: string;
    constructor(args: SimpleRNNLayerArgs);
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    /** @nocollapse */
    static fromConfig<T extends serialization.Serializable>(cls: serialization.SerializableConstructor<T>, config: serialization.ConfigDict): T;
}

/**
 * Fully-connected RNN where the output is to be fed back to input.
 *
 * This is an `RNN` layer consisting of one `SimpleRNNCell`. However, unlike
 * the underlying `SimpleRNNCell`, the `apply` method of `SimpleRNN` operates
 * on a sequence of inputs. The shape of the input (not including the first,
 * batch dimension) needs to be at least 2-D, with the first dimension being
 * time steps. For example:
 *
 * ```js
 * const rnn = tf.layers.simpleRNN({units: 8, returnSequences: true});
 *
 * // Create an input with 10 time steps.
 * const input = tf.input({shape: [10, 20]});
 * const output = rnn.apply(input);
 *
 * console.log(JSON.stringify(output.shape));
 * // [null, 10, 8]: 1st dimension is unknown batch size; 2nd dimension is the
 * // same as the sequence length of `input`, due to `returnSequences`: `true`;
 * // 3rd dimension is the `SimpleRNNCell`'s number of units.
 * ```
 *
 * @doc {heading: 'Layers', subheading: 'Recurrent', namespace: 'layers'}
 */
declare function simpleRNN(args: SimpleRNNLayerArgs): SimpleRNN;

declare class SimpleRNNCell extends RNNCell {
    /** @nocollapse */
    static className: string;
    readonly units: number;
    readonly activation: Activation;
    readonly useBias: boolean;
    readonly kernelInitializer: Initializer;
    readonly recurrentInitializer: Initializer;
    readonly biasInitializer: Initializer;
    readonly kernelConstraint: Constraint;
    readonly recurrentConstraint: Constraint;
    readonly biasConstraint: Constraint;
    readonly kernelRegularizer: Regularizer;
    readonly recurrentRegularizer: Regularizer;
    readonly biasRegularizer: Regularizer;
    readonly dropout: number;
    readonly recurrentDropout: number;
    readonly dropoutFunc: Function;
    readonly stateSize: number;
    kernel: LayerVariable;
    recurrentKernel: LayerVariable;
    bias: LayerVariable;
    readonly DEFAULT_ACTIVATION = "tanh";
    readonly DEFAULT_KERNEL_INITIALIZER = "glorotNormal";
    readonly DEFAULT_RECURRENT_INITIALIZER = "orthogonal";
    readonly DEFAULT_BIAS_INITIALIZER: InitializerIdentifier;
    constructor(args: SimpleRNNCellLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}

/**
 * Cell class for `SimpleRNN`.
 *
 * `SimpleRNNCell` is distinct from the `RNN` subclass `SimpleRNN` in that its
 * `apply` method takes the input data of only a single time step and returns
 * the cell's output at the time step, while `SimpleRNN` takes the input data
 * over a number of time steps. For example:
 *
 * ```js
 * const cell = tf.layers.simpleRNNCell({units: 2});
 * const input = tf.input({shape: [10]});
 * const output = cell.apply(input);
 *
 * console.log(JSON.stringify(output.shape));
 * // [null, 10]: This is the cell's output at a single time step. The 1st
 * // dimension is the unknown batch size.
 * ```
 *
 * Instance(s) of `SimpleRNNCell` can be used to construct `RNN` layers. The
 * most typical use of this workflow is to combine a number of cells into a
 * stacked RNN cell (i.e., `StackedRNNCell` internally) and use it to create an
 * RNN. For example:
 *
 * ```js
 * const cells = [
 *   tf.layers.simpleRNNCell({units: 4}),
 *   tf.layers.simpleRNNCell({units: 8}),
 * ];
 * const rnn = tf.layers.rnn({cell: cells, returnSequences: true});
 *
 * // Create an input with 10 time steps and a length-20 vector at each step.
 * const input = tf.input({shape: [10, 20]});
 * const output = rnn.apply(input);
 *
 * console.log(JSON.stringify(output.shape));
 * // [null, 10, 8]: 1st dimension is unknown batch size; 2nd dimension is the
 * // same as the sequence length of `input`, due to `returnSequences`: `true`;
 * // 3rd dimension is the last `SimpleRNNCell`'s number of units.
 * ```
 *
 * To create an `RNN` consisting of only *one* `SimpleRNNCell`, use the
 * `tf.layers.simpleRNN`.
 *
 * @doc {heading: 'Layers', subheading: 'Recurrent', namespace: 'layers'}
 */
declare function simpleRNNCell(args: SimpleRNNCellLayerArgs): SimpleRNNCell;

export declare interface SimpleRNNCellLayerArgs extends LayerArgs {
    /**
     * units: Positive integer, dimensionality of the output space.
     */
    units: number;
    /**
     * Activation function to use.
     * Default: hyperbolic tangent ('tanh').
     * If you pass `null`,  'linear' activation will be applied.
     */
    activation?: ActivationIdentifier;
    /**
     * Whether the layer uses a bias vector.
     */
    useBias?: boolean;
    /**
     * Initializer for the `kernel` weights matrix, used for the linear
     * transformation of the inputs.
     */
    kernelInitializer?: InitializerIdentifier | Initializer;
    /**
     * Initializer for the `recurrentKernel` weights matrix, used for
     * linear transformation of the recurrent state.
     */
    recurrentInitializer?: InitializerIdentifier | Initializer;
    /**
     * Initializer for the bias vector.
     */
    biasInitializer?: InitializerIdentifier | Initializer;
    /**
     * Regularizer function applied to the `kernel` weights matrix.
     */
    kernelRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Regularizer function applied to the `recurrent_kernel` weights matrix.
     */
    recurrentRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Regularizer function applied to the bias vector.
     */
    biasRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Constraint function applied to the `kernel` weights matrix.
     */
    kernelConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Constraint function applied to the `recurrentKernel` weights matrix.
     */
    recurrentConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Constraint function applied to the bias vector.
     */
    biasConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Float number between 0 and 1. Fraction of the units to drop for the linear
     * transformation of the inputs.
     */
    dropout?: number;
    /**
     * Float number between 0 and 1. Fraction of the units to drop for the linear
     * transformation of the recurrent state.
     */
    recurrentDropout?: number;
    /**
     * This is added for test DI purpose.
     */
    dropoutFunc?: Function;
}

export declare interface SimpleRNNLayerArgs extends BaseRNNLayerArgs {
    /**
     * Positive integer, dimensionality of the output space.
     */
    units: number;
    /**
     * Activation function to use.
     *
     * Defaults to  hyperbolic tangent (`tanh`)
     *
     * If you pass `null`, no activation will be applied.
     */
    activation?: ActivationIdentifier;
    /**
     * Whether the layer uses a bias vector.
     */
    useBias?: boolean;
    /**
     * Initializer for the `kernel` weights matrix, used for the linear
     * transformation of the inputs.
     */
    kernelInitializer?: InitializerIdentifier | Initializer;
    /**
     * Initializer for the `recurrentKernel` weights matrix, used for
     * linear transformation of the recurrent state.
     */
    recurrentInitializer?: InitializerIdentifier | Initializer;
    /**
     * Initializer for the bias vector.
     */
    biasInitializer?: InitializerIdentifier | Initializer;
    /**
     * Regularizer function applied to the kernel weights matrix.
     */
    kernelRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Regularizer function applied to the recurrentKernel weights matrix.
     */
    recurrentRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Regularizer function applied to the bias vector.
     */
    biasRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Constraint function applied to the kernel weights matrix.
     */
    kernelConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Constraint function applied to the recurrentKernel weights matrix.
     */
    recurrentConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Constraint function applied to the bias vector.
     */
    biasConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Number between 0 and 1. Fraction of the units to drop for the linear
     * transformation of the inputs.
     */
    dropout?: number;
    /**
     * Number between 0 and 1. Fraction of the units to drop for the linear
     * transformation of the recurrent state.
     */
    recurrentDropout?: number;
    /**
     * This is added for test DI purpose.
     */
    dropoutFunc?: Function;
}

declare type SimpleUnaryImpl<I extends number | string = number | string, O extends number | string = number | string> = (values: ArrayLike<I>, dtype: DataTypeFor<O>, attrs?: NamedAttrMap) => DataTypeMap[DataTypeFor<O>];

declare function sliceImpl(vals: BackendValues, begin: number[], size: number[], shape: number[], dtype: DataType): BackendValues;

declare class Softmax extends Layer {
    /** @nocollapse */
    static className: string;
    readonly axis: number | number[];
    readonly softmax: (t: Tensor, a?: number) => Tensor;
    readonly DEFAULT_AXIS = 1;
    constructor(args?: SoftmaxLayerArgs);
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getConfig(): serialization.ConfigDict;
}

/**
 * Softmax activation layer.
 *
 * Input shape:
 *   Arbitrary. Use the configuration `inputShape` when using this layer as the
 *   first layer in a model.
 *
 * Output shape:
 *   Same shape as the input.
 *
 * @doc {
 *   heading: 'Layers',
 *   subheading: 'Advanced Activation',
 *   namespace: 'layers'
 * }
 */
declare function softmax(args?: SoftmaxLayerArgs): Softmax;

declare interface SoftmaxLayerArgs extends LayerArgs {
    /**
     * Integer, axis along which the softmax normalization is applied.
     * Defaults to `-1` (i.e., the last axis).
     */
    axis?: number | number[];
}

/**
 * Sparse categorical accuracy metric function.
 *
 * Example:
 * ```js
 *
 * const yTrue = tf.tensor1d([1, 1, 2, 2, 0]);
 * const yPred = tf.tensor2d(
 *      [[0, 1, 0], [1, 0, 0], [0, 0.4, 0.6], [0, 0.6, 0.4], [0.7, 0.3, 0]]);
 * const crossentropy = tf.metrics.sparseCategoricalAccuracy(yTrue, yPred);
 * crossentropy.print();
 * ```
 *
 * @param yTrue True labels: indices.
 * @param yPred Predicted probabilities or logits.
 * @returns Accuracy tensor.
 *
 * @doc {heading: 'Metrics', namespace: 'metrics'}
 */
declare function sparseCategoricalAccuracy(yTrue: Tensor, yPred: Tensor): Tensor;

declare function sparseFillEmptyRowsImpl(indices: TypedArray, indicesShape: number[], indicesDType: DataType, values: TypedArray, valuesDType: DataType, denseShape: TypedArray, defaultValue: number): [
TypedArray,
number[],
TypedArray,
boolean[],
number[]
];

declare function sparseReshapeImpl(inputIndices: TypedArray, inputIndicesShape: number[], inputDType: DataType, inputShape: number[], targetShape: number[]): [TypedArray, number[], number[]];

declare function sparseSegmentReductionImpl(input: TypedArray, inputShape: number[], inputDType: DataType, indices: TypedArray, segmentIds: TypedArray, isMean?: boolean, defaultValue?: number): [TypedArray, number[]];

declare class SpatialDropout1D extends Dropout {
    /** @nocollapse */
    static className: string;
    constructor(args: SpatialDropout1DLayerConfig);
    protected getNoiseShape(input: Tensor): Shape;
}

/**
 * Spatial 1D version of Dropout.
 *
 * This Layer type performs the same function as the Dropout layer, but it drops
 * entire 1D feature maps instead of individual elements. For example, if an
 * input example consists of 3 timesteps and the feature map for each timestep
 * has a size of 4, a `spatialDropout1d` layer may zero out the feature maps
 * of the 1st timesteps and 2nd timesteps completely while sparing all feature
 * elements of the 3rd timestep.
 *
 * If adjacent frames (timesteps) are strongly correlated (as is normally the
 * case in early convolution layers), regular dropout will not regularize the
 * activation and will otherwise just result in merely an effective learning
 * rate decrease. In this case, `spatialDropout1d` will help promote
 * independence among feature maps and should be used instead.
 *
 * **Arguments:**
 *   rate: A floating-point number >=0 and <=1. Fraction of the input elements
 *     to drop.
 *
 * **Input shape:**
 *   3D tensor with shape `(samples, timesteps, channels)`.
 *
 * **Output shape:**
 *   Same as the input shape.
 *
 * References:
 *   - [Efficient Object Localization Using Convolutional
 *      Networks](https://arxiv.org/abs/1411.4280)
 *
 * @doc {heading: 'Layers', subheading: 'Basic', namespace: 'layers'}
 */
declare function spatialDropout1d(args: SpatialDropout1DLayerConfig): SpatialDropout1D;

declare interface SpatialDropout1DLayerConfig extends LayerConfig {
    /** Float between 0 and 1. Fraction of the input units to drop. */
    rate: number;
    /** An integer to use as random seed. */
    seed?: number;
}

declare const sqrtImpl: SimpleUnaryImpl<number, number>;

declare const squaredDifferenceImpl: SimpleBinaryKernelImpl;

declare class StackedRNNCells extends RNNCell {
    /** @nocollapse */
    static className: string;
    protected cells: RNNCell[];
    constructor(args: StackedRNNCellsArgs);
    get stateSize(): number[];
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    build(inputShape: Shape | Shape[]): void;
    getConfig(): serialization.ConfigDict;
    /** @nocollapse */
    static fromConfig<T extends serialization.Serializable>(cls: serialization.SerializableConstructor<T>, config: serialization.ConfigDict, customObjects?: serialization.ConfigDict): T;
    get trainableWeights(): LayerVariable[];
    get nonTrainableWeights(): LayerVariable[];
    /**
     * Retrieve the weights of a the model.
     *
     * @returns A flat `Array` of `tf.Tensor`s.
     */
    getWeights(): Tensor[];
    /**
     * Set the weights of the model.
     *
     * @param weights An `Array` of `tf.Tensor`s with shapes and types matching
     *     the output of `getWeights()`.
     */
    setWeights(weights: Tensor[]): void;
}

/**
 * Wrapper allowing a stack of RNN cells to behave as a single cell.
 *
 * Used to implement efficient stacked RNNs.
 *
 * @doc {heading: 'Layers', subheading: 'Recurrent', namespace: 'layers'}
 */
declare function stackedRNNCells(args: StackedRNNCellsArgs): StackedRNNCells;

declare interface StackedRNNCellsArgs extends LayerArgs {
    /**
     * An `Array` of `RNNCell` instances.
     */
    cells: RNNCell[];
}

declare const staticRegexReplaceImpl: SimpleUnaryImpl<string, string>;

declare function stridedSliceImpl<R extends Rank>(outShape: number[], xBuf: TensorBuffer<R>, strides: number[], begin: number[]): TensorBuffer<R>;

/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
declare function stringNGramsImpl(data: Uint8Array[], dataSplits: Int32Array, separator: string, nGramWidths: number[], leftPad: string, rightPad: string, padWidth: number, preserveShortSequences: boolean): [Uint8Array[], Int32Array];

declare function stringSplitImpl(input: Uint8Array[], delimiter: Uint8Array, skipEmpty: boolean): [TypedArray, Uint8Array[], [number, number]];

declare function stringToHashBucketFastImpl(input: Uint8Array[], numBuckets: number): TypedArray;

declare const subImpl: SimpleBinaryKernelImpl;

/**
 * `tf.SymbolicTensor` is a placeholder for a Tensor without any concrete value.
 *
 * They are most often encountered when building a graph of `Layer`s for a
 * `tf.LayersModel` and the input data's shape, but not values are known.
 *
 * @doc {heading: 'Models', 'subheading': 'Classes'}
 */
export declare class SymbolicTensor {
    readonly dtype: DataType;
    readonly shape: Shape;
    sourceLayer: Layer;
    readonly inputs: SymbolicTensor[];
    readonly callArgs: Kwargs;
    readonly outputTensorIndex?: number;
    readonly id: number;
    readonly name: string;
    readonly originalName?: string;
    /**
     * Rank/dimensionality of the tensor.
     */
    readonly rank: number;
    /**
     * Replacement for _keras_history.
     */
    nodeIndex: number;
    /**
     * Replacement for _keras_history.
     */
    tensorIndex: number;
    /**
     *
     * @param dtype
     * @param shape
     * @param sourceLayer The Layer that produced this symbolic tensor.
     * @param inputs The inputs passed to sourceLayer's __call__() method.
     * @param nodeIndex
     * @param tensorIndex
     * @param callArgs The keyword arguments passed to the __call__() method.
     * @param name
     * @param outputTensorIndex The index of this tensor in the list of outputs
     *   returned by apply().
     */
    constructor(dtype: DataType, shape: Shape, sourceLayer: Layer, inputs: SymbolicTensor[], callArgs: Kwargs, name?: string, outputTensorIndex?: number);
}

declare interface TensorData<D extends DataType> {
    values?: backend_util.BackendValues;
    dtype: D;
    complexTensorInfos?: {
        real: TensorInfo_2;
        imag: TensorInfo_2;
    };
    refCount: number;
}

declare interface TensorData_2 {
    id: number;
    memoryOffset: number;
    shape: number[];
    dtype: DataType;
    refCount: number;
    /** Only used for string tensors, storing encoded bytes. */
    stringBytes?: Uint8Array[];
}

declare type TensorData_3 = {
    values: BackendValues;
    dtype: DataType;
    shape: number[];
    refCount: number;
    resource?: GPUBuffer | GPUTexture | GPUExternalTexture;
    external?: boolean;
    complexTensorInfos?: {
        real: TensorInfo_2;
        imag: TensorInfo_2;
    };
};

declare interface TensorInfo {
    name: string;
    shape?: number[];
    dtype: DataType;
}

/**
 * A single Tensor or a non-nested collection of Tensors.
 *
 * An object of this type can always be reduced to `Tensor[]`.  A single
 * 'Tensor' becomes `[Tensor]`.  A `Tensor[]` is unchanged.  A `NamedTensorMap`
 * can be converted with the help of a list of names, providing the order in
 * which the Tensors should appear in the resulting array.
 */
declare type TensorOrArrayOrMap = Tensor | Tensor[] | NamedTensorMap;

declare namespace TensorShape {
    /** Properties of a Dim. */
    interface IDim {
        /** Dim size */
        size?: (number | string | null);
        /** Dim name */
        name?: (string | null);
    }
}

declare interface Texture {
    texture: WebGLTexture;
    texShape: [number, number];
}

declare interface TextureConfig {
    internalFormatFloat: number;
    textureFormatFloat: number;
    internalFormatPackedHalfFloat: number;
    internalFormatHalfFloat: number;
    internalFormatPackedFloat: number;
    downloadTextureFormat: number;
    downloadUnpackNumChannels: number;
    defaultNumChannels: number;
    textureTypeHalfFloat: number;
    textureTypeFloat: number;
}

declare interface TextureData {
    shape: number[];
    dtype: DataType;
    values?: backend_util.BackendValues;
    texture?: Texture;
    complexTensorInfos?: {
        real: TensorInfo_2;
        imag: TensorInfo_2;
    };
    /** [rows, columns] shape of the texture. */
    texShape?: [number, number];
    usage?: TextureUsage;
    isPacked?: boolean;
    refCount: number;
    slice?: {
        flatOffset: number;
        origDataId: DataId_2;
    };
}

declare class TextureManager {
    private readonly gpgpu;
    private numUsedTextures;
    private numFreeTextures;
    private _numBytesAllocated;
    private _numBytesFree;
    private freeTextures;
    private usedTextures;
    private logEnabled;
    constructor(gpgpu: GPGPUContext);
    acquireTexture(shapeRC: [number, number], usage: TextureUsage, isPacked: boolean): Texture;
    releaseTexture(texture: Texture, shape: [number, number], logicalTexType: TextureUsage, isPacked: boolean): void;
    private log;
    get numBytesAllocated(): number;
    get numBytesFree(): number;
    getNumUsedTextures(): number;
    getNumFreeTextures(): number;
    dispose(): void;
}

/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
declare class TextureManager_2 {
    private device;
    private numUsedTextures;
    private numFreeTextures;
    private freeTextures;
    private usedTextures;
    numBytesUsed: number;
    numBytesAllocated: number;
    constructor(device: GPUDevice);
    acquireTexture(width: number, height: number, format: GPUTextureFormat, usage: GPUTextureUsageFlags): GPUTexture;
    releaseTexture(texture: GPUTexture): void;
    getNumUsedTextures(): number;
    getNumFreeTextures(): number;
    dispose(): void;
}

declare enum TextureUsage {
    RENDER = 0,
    UPLOAD = 1,
    PIXELS = 2,
    DOWNLOAD = 3
}

declare class ThresholdedReLU extends Layer {
    /** @nocollapse */
    static className: string;
    readonly theta: number;
    readonly DEFAULT_THETA = 1;
    constructor(args?: ThresholdedReLULayerArgs);
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getConfig(): serialization.ConfigDict;
}

/**
 * Thresholded Rectified Linear Unit.
 *
 * It follows:
 * `f(x) = x for x > theta`,
 * `f(x) = 0 otherwise`.
 *
 * Input shape:
 *   Arbitrary. Use the configuration `inputShape` when using this layer as the
 *   first layer in a model.
 *
 * Output shape:
 *   Same shape as the input.
 *
 * References:
 *   - [Zero-Bias Autoencoders and the Benefits of Co-Adapting
 * Features](http://arxiv.org/abs/1402.3337)
 *
 * @doc {
 *   heading: 'Layers',
 *   subheading: 'Advanced Activation',
 *   namespace: 'layers'
 * }
 */
declare function thresholdedReLU(args?: ThresholdedReLULayerArgs): ThresholdedReLU;

declare interface ThresholdedReLULayerArgs extends LayerArgs {
    /**
     * Float >= 0. Threshold location of activation.
     */
    theta?: number;
}

/**
 * An implementation of the tile kernel shared between webgl and cpu for string
 * tensors only.
 */
declare function tileImpl<R extends Rank>(xBuf: TensorBuffer<R, DataType>, reps: number[]): TensorBuffer<R, DataType>;

declare function tilesFitEvenlyIntoShape(tileSize: number[], shape: number[]): boolean;

declare class TimeDistributed extends Wrapper {
    /** @nocollapse */
    static className: string;
    constructor(args: WrapperLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
}

/**
 * This wrapper applies a layer to every temporal slice of an input.
 *
 * The input should be at least 3D,  and the dimension of the index `1` will be
 * considered to be the temporal dimension.
 *
 * Consider a batch of 32 samples, where each sample is a sequence of 10 vectors
 * of 16 dimensions. The batch input shape of the layer is then `[32,  10,
 * 16]`, and the `inputShape`, not including the sample dimension, is
 * `[10, 16]`.
 *
 * You can then use `TimeDistributed` to apply a `Dense` layer to each of the 10
 * timesteps, independently:
 *
 * ```js
 * const model = tf.sequential();
 * model.add(tf.layers.timeDistributed({
 *   layer: tf.layers.dense({units: 8}),
 *   inputShape: [10, 16],
 * }));
 *
 * // Now model.outputShape = [null, 10, 8].
 * // The output will then have shape `[32, 10, 8]`.
 *
 * // In subsequent layers, there is no need for `inputShape`:
 * model.add(tf.layers.timeDistributed({layer: tf.layers.dense({units: 32})}));
 * console.log(JSON.stringify(model.outputs[0].shape));
 * // Now model.outputShape = [null, 10, 32].
 * ```
 *
 * The output will then have shape `[32, 10, 32]`.
 *
 * `TimeDistributed` can be used with arbitrary layers, not just `Dense`, for
 * instance a `Conv2D` layer.
 *
 * ```js
 * const model = tf.sequential();
 * model.add(tf.layers.timeDistributed({
 *   layer: tf.layers.conv2d({filters: 64, kernelSize: [3, 3]}),
 *   inputShape: [10, 299, 299, 3],
 * }));
 * console.log(JSON.stringify(model.outputs[0].shape));
 * ```
 *
 * @doc {heading: 'Layers', subheading: 'Wrapper', namespace: 'layers'}
 */
declare function timeDistributed(args: WrapperLayerArgs): TimeDistributed;

declare function topKImpl<T extends Tensor, R extends Rank>(x: TypedArray, xShape: number[], xDtype: NumericDataType, k: number, sorted: boolean): [
TensorBuffer<R, NumericDataType>,
TensorBuffer<R, 'int32'>
];

/**
 * Configuration of the Keras trainer. This includes the configuration to the
 * optimizer, the loss, any metrics to be calculated, etc.
 */
declare interface TrainingConfig extends PyJsonDict {
    optimizer_config: OptimizerSerialization;
    loss: LossIdentifier | LossIdentifier[] | {
        [key: string]: LossIdentifier;
    };
    metrics?: MetricsIdentifier[] | {
        [key: string]: MetricsIdentifier;
    };
    weighted_metrics?: MetricsIdentifier[];
    sample_weight_mode?: SampleWeightMode;
    loss_weights?: LossWeights;
}

declare function transposeImpl(xVals: TypedArray, xShape: number[], dtype: DataType, perm: number[], newShape: number[]): TypedArray;

/**
 * Initializer that generates random values initialized to a truncated normal
 * distribution.
 *
 * These values are similar to values from a `RandomNormal` except that values
 * more than two standard deviations from the mean are discarded and re-drawn.
 * This is the recommended initializer for neural network weights and filters.
 *
 * @doc {heading: 'Initializers', namespace: 'initializers'}
 */
declare function truncatedNormal(args: TruncatedNormalArgs): Initializer;

declare interface TruncatedNormalArgs {
    /** Mean of the random values to generate. */
    mean?: number;
    /** Standard deviation of the random values to generate. */
    stddev?: number;
    /** Used to seed the random generator. */
    seed?: number;
}

declare const typeSnippet: (component: number, type?: string) => string;

declare function unbindColorTextureFromFramebuffer(gl: WebGLRenderingContext, framebuffer: WebGLFramebuffer): void;

declare function unbindTextureUnit(gl: WebGLRenderingContext, textureUnit: number): void;

declare type UniformType = 'float' | 'vec2' | 'vec3' | 'vec4' | 'int' | 'ivec2' | 'ivec3' | 'ivec4';

declare function uniqueImpl(values: BackendValues, axis: number, shape: number[], dtype: DataType): {
    outputValues: BackendValues;
    outputShape: number[];
    indices: BackendValues;
};

/**
 * Constrains the weights incident to each hidden unit to have unit norm.
 *
 * @doc {heading: 'Constraints', namespace: 'constraints'}
 */
declare function unitNorm(args: UnitNormArgs): Constraint;

declare interface UnitNormArgs {
    /**
     * Axis along which to calculate norms.
     *
     * For instance, in a `Dense` layer the weight matrix
     * has shape `[inputDim, outputDim]`,
     * set `axis` to `0` to constrain each weight vector
     * of length `[inputDim,]`.
     * In a `Conv2D` layer with `dataFormat="channels_last"`,
     * the weight tensor has shape
     * `[rows, cols, inputDepth, outputDepth]`,
     * set `axis` to `[0, 1, 2]`
     * to constrain the weights of each filter tensor of size
     * `[rows, cols, inputDepth]`.
     */
    axis?: number;
}

/**
 * Logs in which values can be either numbers or Tensors (Scalars).
 *
 * Used internally.
 */
declare type UnresolvedLogs = {
    [key: string]: number | Scalar;
};

declare function uploadDenseMatrixToTexture(gl: WebGLRenderingContext, texture: WebGLTexture, width: number, height: number, data: TypedArray, textureConfig: TextureConfig): void;

declare function uploadPixelDataToTexture(gl: WebGLRenderingContext, texture: WebGLTexture, pixels: PixelData | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap): void;

declare class UpSampling2D extends Layer {
    /** @nocollapse */
    static className: string;
    protected readonly DEFAULT_SIZE: number[];
    protected readonly size: number[];
    protected readonly dataFormat: DataFormat;
    protected readonly interpolation: InterpolationFormat;
    constructor(args: UpSampling2DLayerArgs);
    computeOutputShape(inputShape: Shape): Shape;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}

/**
 * Upsampling layer for 2D inputs.
 *
 * Repeats the rows and columns of the data
 * by size[0] and size[1] respectively.
 *
 *
 * Input shape:
 *    4D tensor with shape:
 *     - If `dataFormat` is `"channelsLast"`:
 *         `[batch, rows, cols, channels]`
 *     - If `dataFormat` is `"channelsFirst"`:
 *        `[batch, channels, rows, cols]`
 *
 * Output shape:
 *     4D tensor with shape:
 *     - If `dataFormat` is `"channelsLast"`:
 *        `[batch, upsampledRows, upsampledCols, channels]`
 *     - If `dataFormat` is `"channelsFirst"`:
 *         `[batch, channels, upsampledRows, upsampledCols]`
 *
 *
 * @doc {heading: 'Layers', subheading: 'Convolutional', namespace: 'layers'}
 */
declare function upSampling2d(args: UpSampling2DLayerArgs): UpSampling2D;

declare interface UpSampling2DLayerArgs extends LayerArgs {
    /**
     * The upsampling factors for rows and columns.
     *
     * Defaults to `[2, 2]`.
     */
    size?: number[];
    /**
     * Format of the data, which determines the ordering of the dimensions in
     * the inputs.
     *
     * `"channelsLast"` corresponds to inputs with shape
     *   `[batch, ..., channels]`
     *
     *  `"channelsFirst"` corresponds to inputs with shape `[batch, channels,
     * ...]`.
     *
     * Defaults to `"channelsLast"`.
     */
    dataFormat?: DataFormat;
    /**
     * The interpolation mechanism, one of `"nearest"` or `"bilinear"`, default
     * to `"nearest"`.
     */
    interpolation?: InterpolationFormat;
}

declare type Url = string | io.IOHandler | io.IOHandlerSync;

declare type UrlIOHandler<T extends Url> = T extends string ? io.IOHandler : T;

declare function validateFramebuffer(gl: WebGLRenderingContext): void;

declare function validateProgram(gl: WebGLRenderingContext, program: WebGLProgram): void;

declare function validateTextureSize(width: number, height: number): void;

declare type ValueType = string | string[] | number | number[] | number[][] | boolean | boolean[] | Tensor | Tensor[];

/**
 * Initializer capable of adapting its scale to the shape of weights.
 * With distribution=NORMAL, samples are drawn from a truncated normal
 * distribution centered on zero, with `stddev = sqrt(scale / n)` where n is:
 *   - number of input units in the weight tensor, if mode = FAN_IN.
 *   - number of output units, if mode = FAN_OUT.
 *   - average of the numbers of input and output units, if mode = FAN_AVG.
 * With distribution=UNIFORM,
 * samples are drawn from a uniform distribution
 * within [-limit, limit], with `limit = sqrt(3 * scale / n)`.
 *
 * @doc {heading: 'Initializers',namespace: 'initializers'}
 */
declare function varianceScaling(config: VarianceScalingArgs): Initializer;

declare interface VarianceScalingArgs {
    /** Scaling factor (positive float). */
    scale?: number;
    /** Fanning mode for inputs and outputs. */
    mode?: FanMode;
    /** Probabilistic distribution of the values. */
    distribution?: Distribution;
    /** Random number generator seed. */
    seed?: number;
}

export declare const version: {
    'tfjs-core': string;
    'tfjs-backend-cpu': string;
    'tfjs-backend-webgl': string;
    'tfjs-data': string;
    'tfjs-layers': string;
    'tfjs-converter': string;
    tfjs: string;
};

/** @license See the LICENSE file. */
export declare const version_converter = "0.0.0";

/** @license See the LICENSE file. */
export declare const version_cpu = "0.0.0";

/** @license See the LICENSE file. */
export declare const version_layers = "0.0.0";

/** @license See the LICENSE file. */
export declare const version_wasm = "0.0.0";

/** @license See the LICENSE file. */
export declare const version_webgl = "0.0.0";

declare type WasmBinaryName = typeof wasmBinaryNames[number];

declare const wasmBinaryNames: readonly ["tfjs-backend-wasm.wasm", "tfjs-backend-wasm-simd.wasm", "tfjs-backend-wasm-threaded-simd.wasm"];

export declare const webgl: {
    forceHalfFloat: typeof forceHalfFloat;
};

declare interface WebGL1DisjointQueryTimerExtension {
    TIME_ELAPSED_EXT: number;
    QUERY_RESULT_AVAILABLE_EXT: number;
    GPU_DISJOINT_EXT: number;
    QUERY_RESULT_EXT: number;
    createQueryEXT: () => {};
    beginQueryEXT: (ext: number, query: WebGLQuery) => void;
    endQueryEXT: (ext: number) => void;
    deleteQueryEXT: (query: WebGLQuery) => void;
    isQueryEXT: (query: WebGLQuery) => boolean;
    getQueryObjectEXT: (query: WebGLQuery, queryResultAvailableExt: number) => number;
}

/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
declare interface WebGL2DisjointQueryTimerExtension {
    TIME_ELAPSED_EXT: number;
    GPU_DISJOINT_EXT: number;
}

declare namespace webgl_util {
    export {
        callAndCheck,
        canBeRepresented,
        getWebGLErrorMessage,
        getExtensionOrThrow,
        createVertexShader_2 as createVertexShader,
        createFragmentShader,
        logShaderSourceAndInfoLog,
        createProgram,
        linkProgram,
        validateProgram,
        createStaticVertexBuffer,
        createStaticIndexBuffer,
        getNumChannels,
        createTexture,
        validateTextureSize,
        createFramebuffer,
        bindVertexBufferToProgramAttribute,
        bindTextureUnit,
        unbindTextureUnit,
        getProgramUniformLocationOrThrow,
        getProgramUniformLocation,
        bindTextureToProgramUniformSampler,
        bindCanvasToFramebuffer,
        bindColorTextureToFramebuffer,
        unbindColorTextureFromFramebuffer,
        validateFramebuffer,
        getFramebufferErrorMessage,
        getBatchDim,
        getRowsCols,
        getShapeAs3D,
        getTextureShapeFromLogicalShape,
        isReshapeFree,
        getWebGLMaxTextureSize,
        resetMaxTextureSize,
        resetMaxTexturesInShader,
        getMaxTexturesInShader,
        getWebGLDisjointQueryTimerVersion,
        hasExtension,
        isWebGLVersionEnabled,
        isCapableOfRenderingToFloatTexture,
        isDownloadFloatTextureEnabled,
        isWebGLFenceEnabled,
        assertNotComplex
    }
}
export { webgl_util }

export declare interface WebGLMemoryInfo extends MemoryInfo {
    numBytesInGPU: number;
    numBytesInGPUAllocated: number;
    numBytesInGPUFree: number;
    unreliable: boolean;
}

declare interface WebGLParallelCompilationExtension {
    COMPLETION_STATUS_KHR: number;
}

export declare interface WebGLTimingInfo extends TimingInfo {
    uploadWaitMs: number;
    downloadWaitMs: number;
}

declare type WebGLVao = WebGLVertexArrayObject | WebGLVertexArrayObjectOES;

declare namespace webgpu_program {
    export {
        getCoordsDataType,
        getCoordsXYZ,
        getMainHeaderString,
        getStartHeaderString,
        getWorkgroupSizeString,
        makeShaderKey,
        getCoordsFromIndexSnippet,
        dataTypeToGPUType,
        PixelsOpType,
        WebGPUProgram,
        compileProgram,
        typeSnippet
    }
}

declare namespace webgpu_util {
    export {
        tilesFitEvenlyIntoShape,
        computeDispatch,
        computeWorkgroupInfoForMatMul,
        computeWorkgroupSizeForConv2d,
        computeWorkPerThreadForConv2d,
        flatDispatchLayout,
        GPUBytesPerElement,
        isWebGPUSupported,
        assertNotComplex_2 as assertNotComplex,
        WorkgroupInfo,
        MatMulProgramType
    }
}
export { webgpu_util }

export declare class WebGPUBackend extends KernelBackend {
    bufferManager: BufferManager;
    adapterInfo: AdapterInfo;
    device: GPUDevice;
    queue: GPUQueue;
    tensorMap: DataStorage<TensorData_3>;
    textureManager: TextureManager_2;
    thresholdToIncreaseWorkgroups: number;
    private activeTimers;
    private commandEncoder;
    private computePassEncoder;
    private commandQueueOwnedIds;
    private dispatchCountInPass;
    private disposed;
    private downloadWaitMs;
    private dummyCanvas;
    private dummyContext;
    private tensorDataPendingDisposal;
    private static nextDataId;
    private pipelineCache;
    private programTimersStack;
    private queryResolveBuffer;
    private querySet;
    private querySetCount;
    private stagingPendingDisposal;
    private supportTimestampQuery;
    private uniformPendingDisposal;
    private uploadWaitMs;
    private hasReadSyncWarned;
    private hasTimestampQueryWarned;
    private nextDataId;
    constructor(device: GPUDevice, adapterInfo?: GPUAdapterInfo);
    floatPrecision(): 32;
    /**
     * Dispose the memory if the dataId has 0 refCount. Return true if the memory
     * is released or delayed in this backend, false if there are still
     * references.
     * @param dataId
     * @oaram force Optional, remove the data regardless of refCount
     */
    disposeData(dataId: DataId_4, force?: boolean): boolean;
    memory(): WebGPUMemoryInfo;
    private releaseResource;
    /** Return refCount of a `TensorData`. */
    refCount(dataId: DataId_4): number;
    /** Increase refCount of a `TensorData`. */
    incRef(dataId: DataId_4): void;
    /** Decrease refCount of a `TensorData`. */
    decRef(dataId: DataId_4): void;
    write(values: BackendValues, shape: number[], dtype: DataType): DataId_4;
    move(dataId: DataId_4, values: BackendValues, shape: number[], dtype: DataType, refCount: number): void;
    submitQueue(): void;
    ensureCommandEncoderReady(): void;
    endComputePassEncoder(): void;
    checkCompileCompletionAsync(): Promise<void>;
    getBufferData(buffer: GPUBuffer): Promise<ArrayBuffer>;
    private convertAndCacheOnCPU;
    readSync(dataId: object): BackendValues;
    read(dataId: object): Promise<BackendValues>;
    private copyBuffer;
    /**
     * Create a TF.js tensor out of an existing WebGPU buffer.
     */
    createTensorFromGPUData(webGPUData: WebGPUData, shape: number[], dtype: DataType): Tensor;
    /**
     * Read tensor to a new GPUBuffer.
     * @param dataId The source tensor.
     */
    readToGPU(dataId: DataId_4): GPUData;
    bufferSync<R extends Rank, D extends DataType>(t: TensorInfo_2): TensorBuffer<R, D>;
    time(f: () => void): Promise<WebGPUTimingInfo>;
    makeTensorInfo(shape: number[], dtype: DataType, values?: BackendValues | string[]): TensorInfo_2;
    private tensorToBinding;
    uploadToGPU(dataId: DataId_4): void;
    private makeUniforms;
    runWebGPUProgram(program: webgpu_program.WebGPUProgram, inputs: TensorInfo_2[], outputDtype: DataType, programDefinedUniform?: ProgramUniform, output?: TensorInfo_2): TensorInfo_2;
    private recordAndSubmit;
    getQueryTime(): Promise<number>;
    shouldExecuteOnCPU(inputs: TensorInfo_2[], sizeThreshold?: any): boolean;
    numDataIds(): number;
    dispose(): void;
}

declare interface WebGPUMemoryInfo extends backend_util.MemoryInfo {
    numBytesInGPU: number;
    numBytesAllocatedInGPU: number;
    unreliable: boolean;
}

export declare interface WebGPUProgram {
    atomic?: boolean;
    dispatch: [number, number, number];
    dispatchLayout: {
        x: number[];
        y?: number[];
        z?: number[];
    };
    outputComponent?: number;
    outputShape: number[];
    pixelsOpType?: PixelsOpType;
    shaderKey: string;
    size?: boolean;
    uniforms?: string;
    variableNames: string[];
    variableComponents?: number[];
    workgroupSize: [number, number, number];
    workPerThread?: number;
    pipeline?: GPUComputePipeline | Promise<GPUComputePipeline>;
    getUserCode: () => string;
}

declare interface WebGPUTimingInfo extends TimingInfo {
    uploadWaitMs: number;
    downloadWaitMs: number;
}

declare type WorkgroupInfo = {
    workgroupSize: [number, number, number];
    elementsPerThread: [number, number, number];
};

/**
 * Abstract wrapper base class.
 *
 * Wrappers take another layer and augment it in various ways.
 * Do not use this class as a layer, it is only an abstract base class.
 * Two usable wrappers are the `TimeDistributed` and `Bidirectional` wrappers.
 */
declare abstract class Wrapper extends Layer {
    readonly layer: Layer;
    constructor(args: WrapperLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    get trainable(): boolean;
    set trainable(value: boolean);
    get trainableWeights(): LayerVariable[];
    get nonTrainableWeights(): LayerVariable[];
    get updates(): Tensor[];
    get losses(): RegularizerFn[];
    getWeights(): Tensor[];
    setWeights(weights: Tensor[]): void;
    getConfig(): serialization.ConfigDict;
    setFastWeightInitDuringBuild(value: boolean): void;
    /** @nocollapse */
    static fromConfig<T extends serialization.Serializable>(cls: serialization.SerializableConstructor<T>, config: serialization.ConfigDict, customObjects?: serialization.ConfigDict): T;
}

declare interface WrapperLayerArgs extends LayerArgs {
    /**
     * The layer to be wrapped.
     */
    layer: Layer;
}

declare type YieldEveryOptions = 'auto' | 'batch' | 'epoch' | 'never' | number;

declare class ZeroPadding2D extends Layer {
    /** @nocollapse */
    static className: string;
    readonly dataFormat: DataFormat;
    readonly padding: [[number, number], [number, number]];
    constructor(args?: ZeroPadding2DLayerArgs);
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}

/**
 * Zero-padding layer for 2D input (e.g., image).
 *
 * This layer can add rows and columns of zeros
 * at the top, bottom, left and right side of an image tensor.
 *
 * Input shape:
 *   4D tensor with shape:
 *   - If `dataFormat` is `"channelsLast"`:
 *     `[batch, rows, cols, channels]`
 *   - If `data_format` is `"channels_first"`:
 *     `[batch, channels, rows, cols]`.
 *
 * Output shape:
 *   4D with shape:
 *   - If `dataFormat` is `"channelsLast"`:
 *     `[batch, paddedRows, paddedCols, channels]`
 *    - If `dataFormat` is `"channelsFirst"`:
 *     `[batch, channels, paddedRows, paddedCols]`.
 *
 * @doc {heading: 'Layers', subheading: 'Padding', namespace: 'layers'}
 */
declare function zeroPadding2d(args?: ZeroPadding2DLayerArgs): ZeroPadding2D;

declare interface ZeroPadding2DLayerArgs extends LayerArgs {
    /**
     * Integer, or `Array` of 2 integers, or `Array` of 2 `Array`s, each of
     * which is an `Array` of 2 integers.
     * - If integer, the same symmetric padding is applied to width and height.
     * - If `Array` of 2 integers, interpreted as two different symmetric values
     *   for height and width:
     *   `[symmetricHeightPad, symmetricWidthPad]`.
     * - If `Array` of 2 `Array`s, interpreted as:
     *   `[[topPad, bottomPad], [leftPad, rightPad]]`.
     */
    padding?: number | [number, number] | [[number, number], [number, number]];
    /**
     * One of `'channelsLast'` (default) and `'channelsFirst'`.
     *
     * The ordering of the dimensions in the inputs.
     * `channelsLast` corresponds to inputs with shape
     * `[batch, height, width, channels]` while `channelsFirst`
     * corresponds to inputs with shape
     * `[batch, channels, height, width]`.
     */
    dataFormat?: DataFormat;
}

declare class Zeros extends Initializer {
    /** @nocollapse */
    static className: string;
    apply(shape: Shape, dtype?: DataType): Tensor;
}

/**
 * Initializer that generates tensors initialized to 0.
 *
 * @doc {heading: 'Initializers', namespace: 'initializers'}
 */
declare function zeros(): Zeros;

export { }
