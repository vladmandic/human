/// <reference path="../src/types/webgpu.d.ts" />

export declare const Abs = "Abs";

export declare const abs: typeof abs_;

/**
 * Computes absolute value element-wise: `abs(x)`
 *
 * ```js
 * const x = tf.tensor1d([-1, 2, -3, 4]);
 *
 * x.abs().print();  // or tf.abs(x)
 * ```
 * @param x The input `tf.Tensor`.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function abs_<T extends Tensor>(x: T | TensorLike): T;

export declare type AbsInputs = UnaryInputs;

export declare const Acos = "Acos";

export declare const acos: typeof acos_;

/**
 * Computes acos of the input `tf.Tensor` element-wise: `acos(x)`
 *
 * ```js
 * const x = tf.tensor1d([0, 1, -1, .7]);
 *
 * x.acos().print();  // or tf.acos(x)
 * ```
 * @param x The input tensor.
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function acos_<T extends Tensor>(x: T | TensorLike): T;

export declare const Acosh = "Acosh";

export declare const acosh: typeof acosh_;

/**
 * Computes the inverse hyperbolic cos of the input `tf.Tensor` element-wise:
 * `acosh(x)`
 *
 * ```js
 * const x = tf.tensor1d([10, 1, 3, 5.7]);
 *
 * x.acosh().print();  // or tf.acosh(x)
 * ```
 * @param x The input tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function acosh_<T extends Tensor>(x: T | TensorLike): T;

export declare type AcoshInputs = UnaryInputs;

export declare type AcosInputs = UnaryInputs;

declare type Activation = 'linear' | 'relu' | 'prelu' | 'elu' | 'relu6' | 'leakyrelu' | 'sigmoid';

/** @doclink Optimizer */
export declare class AdadeltaOptimizer extends Optimizer {
    protected learningRate: number;
    protected rho: number;
    protected epsilon: number;
    /** @nocollapse */
    static get className(): string;
    private accumulatedGrads;
    private accumulatedUpdates;
    constructor(learningRate: number, rho: number, epsilon?: number);
    applyGradients(variableGradients: NamedVariableMap | NamedTensor[]): void;
    dispose(): void;
    getWeights(): Promise<NamedTensor[]>;
    setWeights(weightValues: NamedTensor[]): Promise<void>;
    getConfig(): ConfigDict;
    /** @nocollapse */
    static fromConfig<T extends Serializable>(cls: SerializableConstructor<T>, config: ConfigDict): T;
}

/** @doclink Optimizer */
export declare class AdagradOptimizer extends Optimizer {
    protected learningRate: number;
    private initialAccumulatorValue;
    /** @nocollapse */
    static get className(): string;
    private accumulatedGrads;
    constructor(learningRate: number, initialAccumulatorValue?: number);
    applyGradients(variableGradients: NamedVariableMap | NamedTensor[]): void;
    dispose(): void;
    getWeights(): Promise<NamedTensor[]>;
    setWeights(weightValues: NamedTensor[]): Promise<void>;
    getConfig(): ConfigDict;
    /** @nocollapse */
    static fromConfig<T extends Serializable>(cls: SerializableConstructor<T>, config: ConfigDict): T;
}

export declare class AdamaxOptimizer extends Optimizer {
    protected learningRate: number;
    protected beta1: number;
    protected beta2: number;
    protected epsilon: number;
    protected decay: number;
    /** @nocollapse */
    static get className(): string;
    private accBeta1;
    private iteration;
    private accumulatedFirstMoment;
    private accumulatedWeightedInfNorm;
    constructor(learningRate: number, beta1: number, beta2: number, epsilon?: number, decay?: number);
    applyGradients(variableGradients: NamedVariableMap | NamedTensor[]): void;
    dispose(): void;
    getWeights(): Promise<NamedTensor[]>;
    setWeights(weightValues: NamedTensor[]): Promise<void>;
    getConfig(): ConfigDict;
    /** @nocollapse */
    static fromConfig<T extends Serializable>(cls: SerializableConstructor<T>, config: ConfigDict): T;
}

export declare class AdamOptimizer extends Optimizer {
    protected learningRate: number;
    protected beta1: number;
    protected beta2: number;
    protected epsilon: number;
    /** @nocollapse */
    static get className(): string;
    private accBeta1;
    private accBeta2;
    private accumulatedFirstMoment;
    private accumulatedSecondMoment;
    constructor(learningRate: number, beta1: number, beta2: number, epsilon?: number);
    applyGradients(variableGradients: NamedVariableMap | NamedTensor[]): void;
    dispose(): void;
    getWeights(): Promise<NamedTensor[]>;
    setWeights(weightValues: NamedTensor[]): Promise<void>;
    getConfig(): ConfigDict;
    /** @nocollapse */
    static fromConfig<T extends Serializable>(cls: SerializableConstructor<T>, config: ConfigDict): T;
}

export declare const Add = "Add";

export declare const add: typeof add_;

/**
 * Adds two `tf.Tensor`s element-wise, A + B. Supports broadcasting.
 *
 *
 * ```js
 * const a = tf.tensor1d([1, 2, 3, 4]);
 * const b = tf.tensor1d([10, 20, 30, 40]);
 *
 * a.add(b).print();  // or tf.add(a, b)
 * ```
 *
 * ```js
 * // Broadcast add a with b.
 * const a = tf.scalar(5);
 * const b = tf.tensor1d([10, 20, 30, 40]);
 *
 * a.add(b).print();  // or tf.add(a, b)
 * ```
 * @param a The first `tf.Tensor` to add.
 * @param b The second `tf.Tensor` to add. Must have the same type as `a`.
 *
 * @doc {heading: 'Operations', subheading: 'Arithmetic'}
 */
declare function add_<T extends Tensor>(a: Tensor | TensorLike, b: Tensor | TensorLike): T;

export declare type AddInputs = BinaryInputs;

export declare const AddN = "AddN";

export declare const addN: typeof addN_;

/**
 * Adds a list of `tf.Tensor`s element-wise, each with the same shape and dtype.
 *
 * ```js
 * const a = tf.tensor1d([1, 2]);
 * const b = tf.tensor1d([3, 4]);
 * const c = tf.tensor1d([5, 6]);
 *
 * tf.addN([a, b, c]).print();
 * ```
 * @param tensors A list of tensors with the same shape and dtype.
 * @doc {heading: 'Operations', subheading: 'Arithmetic'}
 */
declare function addN_<T extends Tensor>(tensors: Array<T | TensorLike>): T;

export declare type AddNInputs = TensorInfo[];

export declare const All = "All";

export declare const all: typeof all_;

/**
 * Computes the logical and of elements across dimensions of a `tf.Tensor`.
 *
 * Reduces the input along the dimensions given in `axes`. Unless `keepDims`
 * is true, the rank of the `tf.Tensor` is reduced by 1 for each entry in
 * `axes`. If `keepDims` is true, the reduced dimensions are retained with
 * length 1. If `axes` has no entries, all dimensions are reduced, and a
 * `tf.Tensor` with a single element is returned.
 *
 * ```js
 * const x = tf.tensor1d([1, 1, 1], 'bool');
 *
 * x.all().print();  // or tf.all(x)
 * ```
 *
 * ```js
 * const x = tf.tensor2d([1, 1, 0, 0], [2, 2], 'bool');
 *
 * const axis = 1;
 * x.all(axis).print();  // or tf.all(x, axis)
 * ```
 *
 * @param x The input tensor. Must be of dtype bool.
 * @param axis The dimension(s) to reduce. By default it reduces
 *     all dimensions.
 * @param keepDims If true, retains reduced dimensions with size 1.
 *
 * @doc {heading: 'Operations', subheading: 'Reduction'}
 */
declare function all_<T extends Tensor>(x: Tensor | TensorLike, axis?: number | number[], keepDims?: boolean): T;

export declare interface AllAttrs {
    axis: number | number[];
    keepDims: boolean;
}

export declare type AllInputs = Pick<NamedTensorInfoMap, 'x'>;

export declare const Any = "Any";

export declare const any: typeof any_;

/**
 * Computes the logical or of elements across dimensions of a `tf.Tensor`.
 *
 * Reduces the input along the dimensions given in `axes`. Unless `keepDims`
 * is true, the rank of the `tf.Tensor` is reduced by 1 for each entry in
 * `axes`. If `keepDims` is true, the reduced dimensions are retained with
 * length 1. If `axes` has no entries, all dimensions are reduced, and a
 * `tf.Tensor` with a single element is returned.
 *
 * ```js
 * const x = tf.tensor1d([1, 1, 1], 'bool');
 *
 * x.any().print();  // or tf.any(x)
 * ```
 *
 * ```js
 * const x = tf.tensor2d([1, 1, 0, 0], [2, 2], 'bool');
 *
 * const axis = 1;
 * x.any(axis).print();  // or tf.any(x, axis)
 * ```
 *
 * @param x The input tensor. Must be of dtype bool.
 * @param axis The dimension(s) to reduce. By default it reduces
 *     all dimensions.
 * @param keepDims If true, retains reduced dimensions with size 1.
 *
 * @doc {heading: 'Operations', subheading: 'Reduction'}
 */
declare function any_<T extends Tensor>(x: Tensor | TensorLike, axis?: number | number[], keepDims?: boolean): T;

export declare interface AnyAttrs {
    axis: number | number[];
    keepDims: boolean;
}

export declare type AnyInputs = Pick<NamedTensorInfoMap, 'x'>;

declare function applyActivation(x: Tensor, activation: Activation, preluActivationWeights?: Tensor, leakyreluAlpha?: number): Tensor;

export declare const ArgMax = "ArgMax";

export declare const argMax: typeof argMax_;

/**
 * Returns the indices of the maximum values along an `axis`.
 *
 * The result has the same shape as `input` with the dimension along `axis`
 * removed.
 *
 * ```js
 * const x = tf.tensor1d([1, 2, 3]);
 *
 * x.argMax().print();  // or tf.argMax(x)
 * ```
 *
 * ```js
 * const x = tf.tensor2d([1, 2, 4, 3], [2, 2]);
 *
 * const axis = 1;
 * x.argMax(axis).print();  // or tf.argMax(x, axis)
 * ```
 *
 * @param x The input tensor.
 * @param axis The dimension to reduce. Defaults to 0 (outer-most dimension).
 *
 * @doc {heading: 'Operations', subheading: 'Reduction'}
 */
declare function argMax_<T extends Tensor>(x: Tensor | TensorLike, axis?: number): T;

export declare interface ArgMaxAttrs {
    axis: number;
}

export declare type ArgMaxInputs = Pick<NamedTensorInfoMap, 'x'>;

export declare const ArgMin = "ArgMin";

export declare const argMin: typeof argMin_;

/**
 * Returns the indices of the minimum values along an `axis`.
 *
 * The result has the same shape as `input` with the dimension along `axis`
 * removed.
 *
 * ```js
 * const x = tf.tensor1d([1, 2, 3]);
 *
 * x.argMin().print();  // or tf.argMin(x)
 * ```
 *
 * ```js
 * const x = tf.tensor2d([1, 2, 4, 3], [2, 2]);
 *
 * const axis = 1;
 * x.argMin(axis).print();  // or tf.argMin(x, axis)
 * ```
 *
 * @param x The input tensor.
 * @param axis The dimension to reduce. Defaults to 0 (outer-most dimension).
 *
 * @doc {heading: 'Operations', subheading: 'Reduction'}
 */
declare function argMin_<T extends Tensor>(x: Tensor | TensorLike, axis?: number): T;

export declare interface ArgMinAttrs {
    axis: number;
}

export declare type ArgMinInputs = Pick<NamedTensorInfoMap, 'x'>;

/** @docalias number[] */
declare interface ArrayMap {
    R0: number;
    R1: number[];
    R2: number[][];
    R3: number[][][];
    R4: number[][][][];
    R5: number[][][][][];
    R6: number[][][][][][];
}

declare function arraysEqual(n1: FlatVector, n2: FlatVector): boolean;

declare function arraysEqualWithNull(n1: number[], n2: number[]): boolean;

export declare const Asin = "Asin";

export declare const asin: typeof asin_;

/**
 * Computes asin of the input `tf.Tensor` element-wise: `asin(x)`
 *
 * ```js
 * const x = tf.tensor1d([0, 1, -1, .7]);
 *
 * x.asin().print();  // or tf.asin(x)
 * ```
 * @param x The input tensor.
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function asin_<T extends Tensor>(x: T | TensorLike): T;

export declare const Asinh = "Asinh";

export declare const asinh: typeof asinh_;

/**
 * Computes inverse hyperbolic sin of the input `tf.Tensor` element-wise:
 * `asinh(x)`
 *
 * ```js
 * const x = tf.tensor1d([0, 1, -1, .7]);
 *
 * x.asinh().print();  // or tf.asinh(x)
 * ```
 * @param x The input tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function asinh_<T extends Tensor>(x: T | TensorLike): T;

export declare type AsinhInputs = UnaryInputs;

export declare type AsinInputs = UnaryInputs;

/**
 * Asserts that the expression is true. Otherwise throws an error with the
 * provided message.
 *
 * ```js
 * const x = 2;
 * tf.util.assert(x === 2, 'x is not 2');
 * ```
 *
 * @param expr The expression to assert (as a boolean).
 * @param msg A function that returns the message to report when throwing an
 *     error. We use a function for performance reasons.
 *
 * @doc {heading: 'Util', namespace: 'util'}
 */
declare function assert(expr: boolean, msg: () => string): void;

declare function assertAndGetBroadcastShape(shapeA: number[], shapeB: number[]): number[];

declare function assertAxesAreInnerMostDims(msg: string, axes: number[], rank: number): void;

declare function assertNonNegativeIntegerDimensions(shape: number[]): void;

declare function assertNonNull(a: TensorLike): void;

/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
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
declare function assertParamsConsistent(shapes: number[][], axis: number): void;

declare function assertParamsValid(input: TensorInfo, begin: number[], size: number[]): void;

declare function assertShapesMatch(shapeA: number[], shapeB: number[], errorMessagePrefix?: string): void;

declare function assertTypesMatch(a: Tensor, b: Tensor): void;

/**
 * Insert a given complex value into the TypedArray.
 * @param data The array in which the complex value is inserted.
 * @param c The complex value to be inserted.
 * @param index An index of the target complex value.
 */
declare function assignToTypedArray(data: TypedArray, real: number, imag: number, index: number): void;

export declare const Atan = "Atan";

export declare const atan: typeof atan_;

export declare const Atan2 = "Atan2";

export declare const atan2: typeof atan2_;

/**
 * Computes arctangent of `tf.Tensor`s a / b element-wise: `atan2(a, b)`.
 * Supports broadcasting.
 *
 * ```js
 * const a = tf.tensor1d([1.0, 1.0, -1.0, .7]);
 * const b = tf.tensor1d([2.0, 13.0, 3.5, .21]);
 *
 * tf.atan2(a, b).print()
 * ```
 *
 * @param a The first tensor.
 * @param b The second tensor. Must have the same dtype as `a`.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function atan2_<T extends Tensor>(a: Tensor | TensorLike, b: Tensor | TensorLike): T;

export declare type Atan2Inputs = BinaryInputs;

/**
 * Computes atan of the input `tf.Tensor` element-wise: `atan(x)`
 *
 * ```js
 * const x = tf.tensor1d([0, 1, -1, .7]);
 *
 * x.atan().print();  // or tf.atan(x)
 * ```
 * @param x The input tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function atan_<T extends Tensor>(x: T | TensorLike): T;

export declare const Atanh = "Atanh";

export declare const atanh: typeof atanh_;

/**
 * Computes inverse hyperbolic tan of the input `tf.Tensor` element-wise:
 * `atanh(x)`
 *
 * ```js
 * const x = tf.tensor1d([0, .1, -.1, .7]);
 *
 * x.atanh().print();  // or tf.atanh(x)
 * ```
 * @param x The input tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function atanh_<T extends Tensor>(x: T | TensorLike): T;

export declare type AtanhInputs = UnaryInputs;

export declare type AtanInputs = UnaryInputs;

/** These are extra non-tensor/primitive params passed to kernel functions. */
export declare type Attribute = AttributeValue | RecursiveArray<AttributeValue>;

declare type AttributeValue = number | number[] | boolean | boolean[] | string | string[] | NamedAttrMap;

export declare const AvgPool = "AvgPool";

export declare const avgPool: typeof avgPool_;

export declare const AvgPool3D = "AvgPool3D";

export declare const avgPool3d: typeof avgPool3d_;

/**
 * Computes the 3D average pooling.
 *
 * ```js
 * const x = tf.tensor5d([1, 2, 3, 4, 5, 6, 7, 8], [1, 2, 2, 2, 1]);
 * const result = tf.avgPool3d(x, 2, 1, 'valid');
 * result.print();
 * ```
 *
 * @param x The input tensor, of rank 5 or rank 4 of shape
 *     `[batch, depth, height, width, inChannels]`.
 * @param filterSize The filter size:
 *     `[filterDepth, filterHeight, filterWidth]`.
 *     If `filterSize` is a single number,
 *     then `filterDepth == filterHeight == filterWidth`.
 * @param strides The strides of the pooling:
 *     `[strideDepth, strideHeight, strideWidth]`.
 *     If `strides` is a single number,
 *     then `strideDepth == strideHeight == strideWidth`.
 * @param pad The type of padding algorithm.
 *    - `same` and stride 1: output will be of same size as input,
 *       regardless of filter size.
 *    - `valid`: output will be smaller than input if filter is larger
 *       than 1*1x1.
 *    - For more info, see this guide:
 *     [https://www.tensorflow.org/api_docs/python/tf/nn/convolution](
 *          https://www.tensorflow.org/api_docs/python/tf/nn/convolution)
 * @param dimRoundingMode A string from: 'ceil', 'round', 'floor'. If none is
 *     provided, it will default to truncate.
 * @param dataFormat An optional string from: "NDHWC", "NCDHW". Defaults to
 *     "NDHWC". Specify the data format of the input and output data. With the
 *     default format "NDHWC", the data is stored in the order of: [batch,
 *     depth, height, width, channels]. Only "NDHWC" is currently supported.
 *
 * @doc {heading: 'Operations', subheading: 'Convolution'}
 */
declare function avgPool3d_<T extends Tensor4D | Tensor5D>(x: T | TensorLike, filterSize: [number, number, number] | number, strides: [number, number, number] | number, pad: 'valid' | 'same' | number, dimRoundingMode?: 'floor' | 'round' | 'ceil', dataFormat?: 'NDHWC' | 'NCDHW'): T;

export declare interface AvgPool3DAttrs {
    filterSize: [number, number, number] | number;
    strides: [number, number, number] | number;
    pad: 'valid' | 'same' | number;
    dimRoundingMode?: 'floor' | 'round' | 'ceil';
    dataFormat: 'NDHWC' | 'NCDHW';
}

export declare const AvgPool3DGrad = "AvgPool3DGrad";

export declare interface AvgPool3DGradAttrs {
    filterSize: [number, number, number] | number;
    strides: [number, number, number] | number;
    pad: 'valid' | 'same' | number;
    dimRoundingMode?: 'floor' | 'round' | 'ceil';
}

export declare type AvgPool3DGradInputs = Pick<NamedTensorInfoMap, 'dy' | 'input'>;

export declare type AvgPool3DInputs = Pick<NamedTensorInfoMap, 'x'>;

/**
 * Computes the 2D average pooling of an image.
 *
 * @param x The input tensor, of rank 4 or rank 3 of shape
 *     `[batch, height, width, inChannels]`. If rank 3, batch of 1 is assumed.
 * @param filterSize The filter size: `[filterHeight, filterWidth]`. If
 *     `filterSize` is a single number, then `filterHeight == filterWidth`.
 * @param strides The strides of the pooling: `[strideHeight, strideWidth]`. If
 *     `strides` is a single number, then `strideHeight == strideWidth`.
 * @param pad The type of padding algorithm:
 *    - `same` and stride 1: output will be of same size as input,
 *       regardless of filter size.
 *    - `valid`: output will be smaller than input if filter is larger
 *       than 1x1.
 *    - For more info, see this guide:
 *     [https://www.tensorflow.org/api_docs/python/tf/nn/convolution](
 *         https://www.tensorflow.org/api_docs/python/tf/nn/convolution)
 * @param dimRoundingMode A string from: 'ceil', 'round', 'floor'. If none is
 *     provided, it will default to truncate.
 *
 * @doc {heading: 'Operations', subheading: 'Convolution'}
 */
declare function avgPool_<T extends Tensor3D | Tensor4D>(x: T | TensorLike, filterSize: [number, number] | number, strides: [number, number] | number, pad: 'valid' | 'same' | number | conv_util.ExplicitPadding, dimRoundingMode?: 'floor' | 'round' | 'ceil'): T;

export declare interface AvgPoolAttrs {
    filterSize: [number, number] | number;
    strides: [number, number] | number;
    pad: 'valid' | 'same' | number | ExplicitPadding;
    dimRoundingMode?: 'floor' | 'round' | 'ceil';
}

export declare const AvgPoolGrad = "AvgPoolGrad";

export declare interface AvgPoolGradAttrs {
    filterSize: [number, number] | number;
    strides: [number, number] | number;
    pad: 'valid' | 'same' | number | ExplicitPadding;
}

export declare type AvgPoolGradInputs = Pick<NamedTensorInfoMap, 'dy' | 'input'>;

export declare type AvgPoolInputs = Pick<NamedTensorInfoMap, 'x'>;

/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
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
/**
 * Returns true if the axis specifies the inner most dimensions of the
 * array.
 */
declare function axesAreInnerMostDims(axes: number[], rank: number): boolean;

declare interface Backend {
}

/**
 * Gets the current backend. If no backends have been initialized, this will
 * attempt to initialize the best backend. Will throw an error if the highest
 * priority backend has async initialization, in which case you should call
 * 'await tf.ready()' before running other code.
 *
 * @doc {heading: 'Backends'}
 */
export declare function backend(): KernelBackend;

declare namespace backend_util {
    export {
        fromUint8ToStringArray,
        fromStringArrayToUint8,
        slice_util,
        BackendValues,
        TypedArray,
        upcastType,
        PixelData,
        MemoryInfo,
        TimingInfo,
        segment_util,
        axesAreInnerMostDims,
        combineLocations,
        computeOutAndReduceShapes,
        expandShapeToKeepDim,
        assertAxesAreInnerMostDims,
        getAxesPermutation,
        getUndoAxesPermutation,
        getInnerMostAxes,
        getBroadcastDims,
        getReductionAxes,
        assertAndGetBroadcastShape,
        assertParamsConsistent,
        computeOutShape_3 as computeOutShape,
        computeDilation2DInfo,
        computePool2DInfo,
        computePool3DInfo,
        computeConv2DInfo,
        computeConv3DInfo,
        computeDefaultPad,
        tupleValuesAreOne,
        eitherStridesOrDilationsAreOne,
        stridesOrDilationsArePositive,
        convertConv2DDataFormat,
        checkPadOnDimRoundingMode,
        ExplicitPadding,
        PadInfo,
        PadInfo3D,
        Conv2DInfo,
        Conv3DInfo,
        getFusedDyActivation,
        getFusedBiasGradient,
        applyActivation,
        shouldFuse,
        FusedConv2DConfig,
        FusedBatchMatMulConfig,
        Activation,
        combineRaggedTensorToTensorShapes,
        getRowPartitionTypesHelper,
        getRaggedRank,
        validateDefaultValueShape,
        RowPartitionType,
        computeOptimalWindowSize,
        PARALLELIZE_THRESHOLD,
        ReduceInfo,
        getImageCenter,
        getReshaped,
        getPermuted,
        getReshapedPermuted,
        getSliceBeginCoords,
        getSliceSize,
        prepareAndValidate,
        validateUpdateShape,
        validateInput,
        calculateShapes,
        ScatterShapeInfo,
        SELU_SCALEALPHA,
        SELU_SCALE,
        ERF_P,
        ERF_A1,
        ERF_A2,
        ERF_A3,
        ERF_A4,
        ERF_A5,
        warn,
        log_2 as log,
        mergeRealAndImagArrays,
        splitRealAndImagArrays,
        complexWithEvenIndex,
        complexWithOddIndex,
        getComplexWithIndex,
        assignToTypedArray,
        exponents,
        exponent,
        decodeEinsumEquation,
        getEinsumPermutation,
        checkEinsumDimSizes,
        getEinsumComputePath,
        isIdentityPermutation,
        prepareSplitSize,
        getSparseFillEmptyRowsIndicesDenseShapeMismatch,
        getSparseFillEmptyRowsNegativeIndexErrorMessage,
        getSparseFillEmptyRowsOutOfRangeIndexErrorMessage,
        getSparseReshapeMultipleNegativeOneOutputDimErrorMessage,
        getSparseReshapeNegativeOutputDimErrorMessage,
        getSparseReshapeEmptyTensorZeroOutputDimErrorMessage,
        getSparseReshapeInputOutputMultipleErrorMessage,
        getSparseReshapeInputOutputMismatchErrorMessage,
        getSparseSegmentReductionNegativeSegmentIdsErrorMessage,
        getSparseSegmentReductionNonIncreasingSegmentIdsErrorMessage,
        getSparseSegmentReductionSegmentIdOutOfRangeErrorMessage,
        getSparseSegmentReductionIndicesOutOfRangeErrorMessage
    }
}
export { backend_util }

declare interface BackendTimer {
    timerAvailable(): boolean;
    time(f: () => void): Promise<BackendTimingInfo>;
}

export declare interface BackendTimingInfo {
    kernelMs: number | {
        error: string;
    };
    getExtraProfileInfo?(): string;
}

/** The underlying tensor data that gets stored in a backend. */
export declare type BackendValues = Float32Array | Int32Array | Uint8Array | Uint8Array[];

export declare const basicLSTMCell: typeof basicLSTMCell_;

/**
 * Computes the next state and output of a BasicLSTMCell.
 *
 * Returns `[newC, newH]`.
 *
 * Derived from tf.contrib.rnn.BasicLSTMCell.
 *
 * @param forgetBias Forget bias for the cell.
 * @param lstmKernel The weights for the cell.
 * @param lstmBias The bias for the cell.
 * @param data The input to the cell.
 * @param c Previous cell state.
 * @param h Previous cell output.
 *
 * @doc {heading: 'Operations', subheading: 'RNN'}
 */
declare function basicLSTMCell_(forgetBias: Scalar | TensorLike, lstmKernel: Tensor2D | TensorLike, lstmBias: Tensor1D | TensorLike, data: Tensor2D | TensorLike, c: Tensor2D | TensorLike, h: Tensor2D | TensorLike): [Tensor2D, Tensor2D];

export declare const BatchMatMul = "BatchMatMul";

export declare interface BatchMatMulAttrs {
    transposeA: boolean;
    transposeB: boolean;
}

export declare type BatchMatMulInputs = Pick<NamedTensorInfoMap, 'a' | 'b'>;

export declare const batchNorm: typeof batchNorm_;

export declare const batchNorm2d: typeof batchNorm2d_;

/**
 * Batch normalization, strictly for 2D. For the more relaxed version, see
 * `tf.batchNorm`.
 *
 * @param x The input Tensor.
 * @param mean A mean Tensor.
 * @param variance A variance Tensor.
 * @param offset An offset Tensor.
 * @param scale A scale Tensor.
 * @param varianceEpsilon A small float number to avoid dividing by 0.
 */
declare function batchNorm2d_(x: Tensor2D | TensorLike, mean: Tensor2D | Tensor1D | TensorLike, variance: Tensor2D | Tensor1D | TensorLike, offset?: Tensor2D | Tensor1D | TensorLike, scale?: Tensor2D | Tensor1D | TensorLike, varianceEpsilon?: number): Tensor2D;

export declare const batchNorm3d: typeof batchNorm3d_;

/**
 * Batch normalization, strictly for 3D. For the more relaxed version, see
 * `tf.batchNorm`.
 *
 * @param x The input Tensor.
 * @param mean A mean Tensor.
 * @param variance A variance Tensor.
 * @param offset An offset Tensor.
 * @param scale A scale Tensor.
 * @param varianceEpsilon A small float number to avoid dividing by 0.
 */
declare function batchNorm3d_(x: Tensor3D | TensorLike, mean: Tensor3D | Tensor1D | TensorLike, variance: Tensor3D | Tensor1D | TensorLike, offset?: Tensor3D | Tensor1D | TensorLike, scale?: Tensor3D | Tensor1D | TensorLike, varianceEpsilon?: number): Tensor3D;

export declare const batchNorm4d: typeof batchNorm4d_;

/**
 * Batch normalization, strictly for 4D. For the more relaxed version, see
 * `tf.batchNorm`.
 *
 * @param x The input Tensor.
 * @param mean A mean Tensor.
 * @param variance A variance Tensor.
 * @param offset An offset Tensor.
 * @param scale A scale Tensor.
 * @param varianceEpsilon A small float number to avoid dividing by 0.
 */
declare function batchNorm4d_(x: Tensor4D | TensorLike, mean: Tensor4D | Tensor1D | TensorLike, variance: Tensor4D | Tensor1D | TensorLike, offset?: Tensor4D | Tensor1D | TensorLike, scale?: Tensor4D | Tensor1D | TensorLike, varianceEpsilon?: number): Tensor4D;

/**
 * Batch normalization.
 *
 * As described in
 * [http://arxiv.org/abs/1502.03167](http://arxiv.org/abs/1502.03167).
 *
 * Mean, variance, scale, and offset can be of two shapes:
 *   - The same shape as the input.
 *   - In the common case, the depth dimension is the last dimension of x, so
 *     the values would be a `tf.Tensor1D` of shape [depth].
 *
 * Also available are stricter rank-specific methods with the same signature
 * as this method that assert that parameters passed are of given rank
 *   - `tf.batchNorm2d`
 *   - `tf.batchNorm3d`
 *   - `tf.batchNorm4d`
 *
 * @param x The input Tensor.
 * @param mean A mean Tensor.
 * @param variance A variance Tensor.
 * @param offset An offset Tensor.
 * @param scale A scale Tensor.
 * @param varianceEpsilon A small float number to avoid dividing by 0.
 *
 * @doc {heading: 'Operations', subheading: 'Normalization'}
 */
declare function batchNorm_<R extends Rank>(x: Tensor<R> | TensorLike, mean: Tensor<R> | Tensor1D | TensorLike, variance: Tensor<R> | Tensor1D | TensorLike, offset?: Tensor<R> | Tensor1D | TensorLike, scale?: Tensor<R> | Tensor1D | TensorLike, varianceEpsilon?: number): Tensor<R>;

export declare const BatchToSpaceND = "BatchToSpaceND";

export declare const batchToSpaceND: typeof batchToSpaceND_;

/**
 * This operation reshapes the "batch" dimension 0 into `M + 1` dimensions of
 * shape `blockShape + [batch]`, interleaves these blocks back into the grid
 * defined by the spatial dimensions `[1, ..., M]`, to obtain a result with
 * the same rank as the input. The spatial dimensions of this intermediate
 * result are then optionally cropped according to `crops` to produce the
 * output. This is the reverse of `tf.spaceToBatchND`. See below for a precise
 * description.
 *
 * ```js
 * const x = tf.tensor4d([1, 2, 3, 4], [4, 1, 1, 1]);
 * const blockShape = [2, 2];
 * const crops = [[0, 0], [0, 0]];
 *
 * x.batchToSpaceND(blockShape, crops).print();
 * ```
 *
 * @param x A `tf.Tensor`. N-D with `x.shape` = `[batch] + spatialShape +
 * remainingShape`, where spatialShape has `M` dimensions.
 * @param blockShape A 1-D array. Must have shape `[M]`, all values must
 * be >= 1.
 * @param crops A 2-D array.  Must have shape `[M, 2]`, all values must be >= 0.
 * `crops[i] = [cropStart, cropEnd]` specifies the amount to crop from input
 * dimension `i + 1`, which corresponds to spatial dimension `i`. It is required
 * that `cropStart[i] + cropEnd[i] <= blockShape[i] * inputShape[i + 1]`
 *
 * This operation is equivalent to the following steps:
 *
 * 1. Reshape `x` to `reshaped` of shape: `[blockShape[0], ...,
 * blockShape[M-1], batch / prod(blockShape), x.shape[1], ...,
 * x.shape[N-1]]`
 *
 * 2. Permute dimensions of `reshaped` to produce `permuted` of shape `[batch /
 * prod(blockShape),x.shape[1], blockShape[0], ..., x.shape[M],
 * blockShape[M-1],x.shape[M+1], ..., x.shape[N-1]]`
 *
 * 3. Reshape `permuted` to produce `reshapedPermuted` of shape `[batch /
 * prod(blockShape),x.shape[1] * blockShape[0], ..., x.shape[M] *
 * blockShape[M-1],x.shape[M+1], ..., x.shape[N-1]]`
 *
 * 4. Crop the start and end of dimensions `[1, ..., M]` of `reshapedPermuted`
 * according to `crops` to produce the output of shape: `[batch /
 * prod(blockShape),x.shape[1] * blockShape[0] - crops[0,0] - crops[0,1],
 * ..., x.shape[M] * blockShape[M-1] - crops[M-1,0] -
 * crops[M-1,1],x.shape[M+1], ..., x.shape[N-1]]`
 *
 * @doc {heading: 'Tensors', subheading: 'Transformations'}
 */
declare function batchToSpaceND_<T extends Tensor>(x: T | TensorLike, blockShape: number[], crops: number[][]): T;

export declare interface BatchToSpaceNDAttrs {
    blockShape: number[];
    crops: number[][];
}

export declare type BatchToSpaceNDInputs = Pick<NamedTensorInfoMap, 'x'>;

export declare type BinaryInputs = Pick<NamedTensorInfoMap, 'a' | 'b'>;

export declare const Bincount = "Bincount";

export declare const bincount: typeof bincount_;

/**
 * Outputs a vector with length `size` and the same dtype as `weights`.
 *
 * If `weights` are empty, then index `i` stores the number of times the value
 * `i` is counted in `x`. If `weights` are non-empty, then index `i` stores the
 * sum of the value in `weights` at each index where the corresponding value in
 * `x` is `i`.
 *
 * Values in `x` outside of the range [0, size) are ignored.
 *
 * @param x The input int tensor, rank 1.
 * @param weights The weights tensor, must have the same shape as x, or a
 *     length-0 Tensor, in which case it acts as all weights equal to 1.
 * @param size Non-negative integer.
 *
 * @doc {heading: 'Operations', subheading: 'Reduction'}
 */
declare function bincount_<T extends Tensor1D>(x: T | TensorLike, weights: T | TensorLike, size: number): T;

export declare interface BincountAttrs {
    size: number;
}

export declare type BincountInputs = Pick<NamedTensorInfoMap, 'x' | 'weights'>;

export declare const BitwiseAnd = "BitwiseAnd";

export declare const bitwiseAnd: typeof bitwiseAnd_;

/**
 * Bitwise `AND` operation for input tensors.
 *
 * Given two input tensors, returns a new tensor
 * with the `AND` calculated values.
 *
 * The method supports int32 values
 *
 *
 * ```js
 * const x = tf.tensor1d([0, 5, 3, 14], 'int32');
 * const y = tf.tensor1d([5, 0, 7, 11], 'int32');
 * tf.bitwiseAnd(x, y).print();
 * ```
 *
 * @param x The input tensor to be calculated.
 * @param y The input tensor to be calculated.
 *
 * @doc {heading: 'Operations', subheading: 'Logical'}
 */
declare function bitwiseAnd_<R extends Rank>(x: Tensor, y: Tensor): Tensor<R>;

export declare type BitwiseAndInputs = BinaryInputs;

export declare const booleanMaskAsync: typeof booleanMaskAsync_;

/**
 * Apply boolean mask to tensor.
 *
 * ```js
 * const tensor = tf.tensor2d([1, 2, 3, 4, 5, 6], [3, 2]);
 * const mask = tf.tensor1d([1, 0, 1], 'bool');
 * const result = await tf.booleanMaskAsync(tensor, mask);
 * result.print();
 * ```
 *
 * @param tensor N-D tensor.
 * @param mask K-D boolean tensor, K <= N and K must be known statically.
 * @param axis A 0-D int Tensor representing the axis in tensor to mask from.
 *     By default, axis is 0 which will mask from the first dimension.
 *     Otherwise K + axis <= N.
 *
 * @doc {heading: 'Tensors', subheading: 'Slicing and Joining'}
 */
declare function booleanMaskAsync_(tensor: Tensor | TensorLike, mask: Tensor | TensorLike, axis?: number): Promise<Tensor>;

declare namespace broadcast_util {
    export {
        getBroadcastDims,
        getReductionAxes,
        assertAndGetBroadcastShape
    }
}
export { broadcast_util }

export declare const BroadcastArgs = "BroadcastArgs";

export declare const broadcastArgs: typeof broadcastArgs_;

/**
 * Return the shape of s0 op s1 with broadcast.
 *
 * compute r0, the broadcasted shape as a tensor.
 * s0, s1 and r0 are all integer vectors.
 *
 * This function returns the shape of the result of an operation between
 * two tensors of size s0 and s1 performed with broadcast.
 *
 * @param s0 A tensor representing a shape
 * @param s1 A tensor representing a shape
 *
 * @doc {heading: 'Tensors', subheading: 'Transformations'}
 */
declare function broadcastArgs_<R extends Rank>(s0: Tensor | TensorLike, s1: Tensor | TensorLike): Tensor<R>;

export declare type BroadcastArgsInputs = Pick<NamedTensorInfoMap, 's0' | 's1'>;

export declare const BroadcastTo = "BroadcastTo";

export declare const broadcastTo: typeof broadcastTo_;

/**
 * Broadcast an array to a compatible shape NumPy-style.
 *
 * The tensor's shape is compared to the broadcast shape from end to beginning.
 * Ones are prepended to the tensor's shape until it has the same length as
 * the broadcast shape. If input.shape[i]==shape[i], the (i+1)-th axis is
 * already broadcast-compatible. If input.shape[i]==1 and shape[i]==N, then
 * the input tensor is tiled N times along that axis (using tf.tile).
 *
 * @param input The tensor that is to be broadcasted.
 * @param shape The input is to be broadcast to this shape.
 *
 * @doc {heading: 'Tensors', subheading: 'Transformations'}
 */
declare function broadcastTo_<R extends Rank>(x: Tensor | TensorLike, shape: ShapeMap[R]): Tensor<R>;

export declare interface BroadCastToAttrs {
    shape: number[];
    inputShape: number[];
}

export declare type BroadcastToInputs = Pick<NamedTensorInfoMap, 'x'>;

declare namespace browser {
    export {
        fromPixelsAsync,
        toPixels,
        draw,
        fromPixels
    }
}
export { browser }

/**
 * Creates an IOHandler that loads model artifacts from user-selected files.
 *
 * This method can be used for loading from files such as user-selected files
 * in the browser.
 * When used in conjunction with `tf.loadLayersModel`, an instance of
 * `tf.LayersModel` (Keras-style) can be constructed from the loaded artifacts.
 *
 * ```js
 * // Note: This code snippet won't run properly without the actual file input
 * //   elements in the HTML DOM.
 *
 * // Suppose there are two HTML file input (`<input type="file" ...>`)
 * // elements.
 * const uploadJSONInput = document.getElementById('upload-json');
 * const uploadWeightsInput = document.getElementById('upload-weights');
 * const model = await tf.loadLayersModel(tf.io.browserFiles(
 *     [uploadJSONInput.files[0], uploadWeightsInput.files[0]]));
 * ```
 *
 * @param files `File`s to load from. Currently, this function supports only
 *   loading from files that contain Keras-style models (i.e., `tf.Model`s), for
 *   which an `Array` of `File`s is expected (in that order):
 *   - A JSON file containing the model topology and weight manifest.
 *   - Optionally, one or more binary files containing the binary weights.
 *     These files must have names that match the paths in the `weightsManifest`
 *     contained by the aforementioned JSON file, or errors will be thrown
 *     during loading. These weights files have the same format as the ones
 *     generated by `tensorflowjs_converter` that comes with the `tensorflowjs`
 *     Python PIP package. If no weights files are provided, only the model
 *     topology will be loaded from the JSON file above.
 * @returns An instance of `Files` `IOHandler`.
 *
 * @doc {
 *   heading: 'Models',
 *   subheading: 'Loading',
 *   namespace: 'io',
 *   ignoreCI: true
 * }
 */
declare function browserFiles(files: File[]): IOHandler;

/**
 * Deprecated. Use `tf.io.http`.
 * @param path
 * @param loadOptions
 */
declare function browserHTTPRequest(path: string, loadOptions?: LoadOptions): IOHandler;

/**
 * Creates an empty `tf.TensorBuffer` with the specified `shape` and `dtype`.
 *
 * The values are stored in CPU as `TypedArray`. Fill the buffer using
 * `buffer.set()`, or by modifying directly `buffer.values`.
 *
 * When done, call `buffer.toTensor()` to get an immutable `tf.Tensor` with
 * those values.
 *
 * ```js
 * // Create a buffer and set values at particular indices.
 * const buffer = tf.buffer([2, 2]);
 * buffer.set(3, 0, 0);
 * buffer.set(5, 1, 0);
 *
 * // Convert the buffer back to a tensor.
 * buffer.toTensor().print();
 * ```
 *
 * @param shape An array of integers defining the output tensor shape.
 * @param dtype The dtype of the buffer. Defaults to 'float32'.
 * @param values The values of the buffer as `TypedArray`. Defaults to
 * zeros.
 *
 * @doc {heading: 'Tensors', subheading: 'Creation'}
 */
export declare function buffer<R extends Rank, D extends DataType = 'float32'>(shape: ShapeMap[R], dtype?: D, values?: DataTypeMap[D]): TensorBuffer<R, D>;

/**
 * Returns the approximate number of bytes allocated in the string array - 2
 * bytes per character. Computing the exact bytes for a native string in JS
 * is not possible since it depends on the encoding of the html page that
 * serves the website.
 */
declare function bytesFromStringArray(arr: Uint8Array[]): number;

declare function bytesPerElement(dtype: DataType): number;

/**
 * Calculate the shape information for the output.
 *
 * @param update The tensor contains the update values.
 * @param indices The tensor contains the indices for the update values.
 * @param shape The shape of the output tensor.
 *
 * @returns ScatterShapeInfo
 */
declare function calculateShapes(updates: TensorInfo, indices: TensorInfo, shape: number[]): ScatterShapeInfo;

export declare const Cast = "Cast";

export declare const cast: typeof cast_;

/**
 * Casts a `tf.Tensor` to a new dtype.
 *
 * ```js
 * const x = tf.tensor1d([1.5, 2.5, 3]);
 * tf.cast(x, 'int32').print();
 * ```
 * @param x The input tensor to be casted.
 * @param dtype The dtype to cast the input tensor to.
 *
 * @doc {heading: 'Tensors', subheading: 'Transformations'}
 */
declare function cast_<T extends Tensor>(x: T | TensorLike, dtype: DataType): T;

export declare interface CastAttrs {
    dtype: DataType;
}

export declare type CastInputs = UnaryInputs;

export declare const Ceil = "Ceil";

export declare const ceil: typeof ceil_;

/**
 * Computes ceiling of input `tf.Tensor` element-wise: `ceil(x)`
 *
 * ```js
 * const x = tf.tensor1d([.6, 1.1, -3.3]);
 *
 * x.ceil().print();  // or tf.ceil(x)
 * ```
 * @param x The input Tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function ceil_<T extends Tensor>(x: T | TensorLike): T;

export declare type CeilInputs = UnaryInputs;

declare function checkConversionForErrors<D extends DataType>(vals: DataTypeMap[D] | number[], dtype: D): void;

/**
 * Checks that the dimension sizes from different input tensors match the
 * equation.
 */
declare function checkEinsumDimSizes(nDims: number, idDims: number[][], tensors: Tensor[]): void;

/**
 * Check validity of pad when using dimRoundingMode.
 * @param opDesc A string of op description
 * @param pad The type of padding algorithm.
 *   - `same` and stride 1: output will be of same size as input,
 *       regardless of filter size.
 *   - `valid` output will be smaller than input if filter is larger
 *       than 1x1.
 *   - For more info, see this guide:
 *     [https://www.tensorflow.org/api_docs/python/tf/nn/convolution](
 *          https://www.tensorflow.org/api_docs/python/tf/nn/convolution)
 * @param dimRoundingMode A string from: 'ceil', 'round', 'floor'. If none is
 *     provided, it will default to truncate.
 * @throws unknown padding parameter
 */
declare function checkPadOnDimRoundingMode(opDesc: string, pad: 'valid' | 'same' | number | ExplicitPadding, dimRoundingMode?: 'floor' | 'round' | 'ceil'): void;

/** Clamps a value to a specified range. */
declare function clamp(min: number, x: number, max: number): number;

export declare const ClipByValue = "ClipByValue";

export declare const clipByValue: typeof clipByValue_;

/**
 * Clips values element-wise. `max(min(x, clipValueMax), clipValueMin)`
 *
 * ```js
 * const x = tf.tensor1d([-1, 2, -3, 4]);
 *
 * x.clipByValue(-2, 3).print();  // or tf.clipByValue(x, -2, 3)
 * ```
 * @param x The input tensor.
 * @param clipValueMin Lower bound of range to be clipped to.
 * @param clipValueMax Upper bound of range to be clipped to.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function clipByValue_<T extends Tensor>(x: T | TensorLike, clipValueMin: number, clipValueMax: number): T;

export declare interface ClipByValueAttrs {
    clipValueMin: number;
    clipValueMax: number;
}

export declare type ClipByValueInputs = UnaryInputs;

export declare const clone: typeof clone_;

/**
 * Creates a new tensor with the same values and shape as the specified
 * tensor.
 *
 * ```js
 * const x = tf.tensor([1, 2]);
 *
 * x.clone().print();
 * ```
 *
 * @param x The tensor to clone.
 *
 * @doc {heading: 'Tensors', subheading: 'Creation'}
 */
declare function clone_<T extends Tensor>(x: T | TensorLike): T;

declare function collectGatherOpShapeInfo(x: TensorInfo, indices: TensorInfo, axis: number, batchDims: number): GatherOpShapeInfo;

declare function combineLocations(outputLoc: number[], reduceLoc: number[], axes: number[]): number[];

declare function combineRaggedTensorToTensorShapes(raggedRank: number, shape: number[], valueShape: number[]): number[];

export declare const Complex = "Complex";

export declare const complex: typeof complex_;

/**
 * Converts two real numbers to a complex number.
 *
 * Given a tensor `real` representing the real part of a complex number, and a
 * tensor `imag` representing the imaginary part of a complex number, this
 * operation returns complex numbers elementwise of the form [r0, i0, r1, i1],
 * where r represents the real part and i represents the imag part.
 *
 * The input tensors real and imag must have the same shape.
 *
 * ```js
 * const real = tf.tensor1d([2.25, 3.25]);
 * const imag = tf.tensor1d([4.75, 5.75]);
 * const complex = tf.complex(real, imag);
 *
 * complex.print();
 * ```
 *
 * @doc {heading: 'Tensors', subheading: 'Creation'}
 */
declare function complex_<T extends Tensor>(real: T | TensorLike, imag: T | TensorLike): T;

export declare const ComplexAbs = "ComplexAbs";

export declare type ComplexAbsInputs = UnaryInputs;

export declare type ComplexInputs = Pick<NamedTensorInfoMap, 'real' | 'imag'>;

/**
 * Extracts even indexed complex values in the given array.
 * @param complex The complex tensor values
 */
declare function complexWithEvenIndex(complex: Float32Array): {
    real: Float32Array;
    imag: Float32Array;
};

/**
 * Extracts odd indexed comple values in the given array.
 * @param complex The complex tensor values
 */
declare function complexWithOddIndex(complex: Float32Array): {
    real: Float32Array;
    imag: Float32Array;
};

/**
 * Wraps a list of ArrayBuffers into a `slice()`-able object without allocating
 * a large ArrayBuffer.
 *
 * Allocating large ArrayBuffers (~2GB) can be unstable on Chrome. TFJS loads
 * its weights as a list of (usually) 4MB ArrayBuffers and then slices the
 * weight tensors out of them. For small models, it's safe to concatenate all
 * the weight buffers into a single ArrayBuffer and then slice the weight
 * tensors out of it, but for large models, a different approach is needed.
 */
declare class CompositeArrayBuffer {
    private shards;
    private previousShardIndex;
    private bufferUniformSize?;
    readonly byteLength: number;
    /**
     * Concatenate a number of ArrayBuffers into one.
     *
     * @param buffers An array of ArrayBuffers to concatenate, or a single
     *     ArrayBuffer.
     * @returns Result of concatenating `buffers` in order.
     */
    static join(buffers?: ArrayBuffer[] | ArrayBuffer): ArrayBuffer;
    constructor(buffers?: ArrayBuffer | ArrayBuffer[] | TypedArray | TypedArray[]);
    slice(start?: number, end?: number): ArrayBuffer;
    /**
     * Get the index of the shard that contains the byte at `byteIndex`.
     */
    private findShardForByte;
}

/**
 * Computes the information for a forward pass of a convolution/pooling
 * operation.
 */
declare function computeConv2DInfo(inShape: [number, number, number, number], filterShape: [number, number, number, number], strides: number | [number, number], dilations: number | [number, number], pad: 'same' | 'valid' | number | ExplicitPadding, roundingMode?: 'floor' | 'round' | 'ceil', depthwise?: boolean, dataFormat?: 'channelsFirst' | 'channelsLast'): Conv2DInfo;

/**
 * Computes the information for a forward pass of a 3D convolution/pooling
 * operation.
 */
declare function computeConv3DInfo(inShape: [number, number, number, number, number], filterShape: [number, number, number, number, number], strides: number | [number, number, number], dilations: number | [number, number, number], pad: 'same' | 'valid' | number, depthwise?: boolean, dataFormat?: 'channelsFirst' | 'channelsLast', roundingMode?: 'floor' | 'round' | 'ceil'): Conv3DInfo;

declare function computeDefaultPad(inputShape: [number, number] | [number, number, number, number], fieldSize: number, stride: number, dilation?: number): number;

/**
 *
 * @param inputShape Input tensor shape is of the following dimensions:
 *     `[batch, height, width, inChannels]`.
 * @param filterShape The filter shape is of the following dimensions:
 *     `[filterHeight, filterWidth, depth]`.
 * @param strides The strides of the sliding window for each dimension of the
 *     input tensor: `[strideHeight, strideWidth]`.
 *     If `strides` is a single number,
 *     then `strideHeight == strideWidth`.
 * @param pad The type of padding algorithm.
 *    - `same` and stride 1: output will be of same size as input,
 *       regardless of filter size.
 *    - `valid`: output will be smaller than input if filter is larger
 *       than 1*1x1.
 *    - For more info, see this guide:
 *     [https://www.tensorflow.org/api_docs/python/tf/nn/convolution](
 *          https://www.tensorflow.org/api_docs/python/tf/nn/convolution)
 * @param dataFormat The data format of the input and output data.
 *     Defaults to 'NHWC'.
 * @param dilations The dilation rates: `[dilationHeight, dilationWidth]`.
 *     Defaults to `[1, 1]`. If `dilations` is a single number, then
 *     `dilationHeight == dilationWidth`.
 */
declare function computeDilation2DInfo(inputShape: [number, number, number, number], filterShape: [number, number, number], strides: number | [number, number], pad: 'same' | 'valid' | number, dataFormat: 'NHWC', dilations: number | [number, number]): Conv2DInfo;

declare function computeFlatOffset(begin: number[], strides: number[]): number;

declare function computeOptimalWindowSize(inSize: number): number;

declare function computeOutAndReduceShapes(aShape: number[], axes: number[]): [number[], number[]];

/** Computes the output shape given the strided slice params. */
declare function computeOutShape(begin: number[], end: number[], strides: number[]): number[];

declare function computeOutShape_2(aShape: number[], axis: number, numSegments: number): number[];

declare function computeOutShape_3(shapes: number[][], axis: number): number[];

declare function computePool2DInfo(inShape: [number, number, number, number], filterSize: [number, number] | number, strides: number | [number, number], dilations: number | [number, number], pad: 'same' | 'valid' | number | ExplicitPadding, roundingMode?: 'floor' | 'round' | 'ceil', dataFormat?: 'channelsFirst' | 'channelsLast'): Conv2DInfo;

/**
 * Computes the information for a forward pass of a pooling3D operation.
 */
declare function computePool3DInfo(inShape: [number, number, number, number, number], filterSize: number | [number, number, number], strides: number | [number, number, number], dilations: number | [number, number, number], pad: 'same' | 'valid' | number, roundingMode?: 'floor' | 'round' | 'ceil', dataFormat?: 'NDHWC' | 'NCDHW'): Conv3DInfo;

declare function computeStrides(shape: number[]): number[];

export declare const Concat = "Concat";

export declare const concat: typeof concat_;

export declare const concat1d: typeof concat1d_;

/**
 * Concatenates a list of`tf.Tensor1D`s along an axis. See `concat` for details.
 *
 * For example, if:
 * A: shape(3) = |r1, g1, b1|
 * B: shape(2) = |r2, g2|
 * C = tf.concat1d([A, B]) == |r1, g1, b1, r2, g2|
 *
 * @param tensors A list of`tf.Tensor`s to concatenate.
 * @return The concatenated array.
 */
declare function concat1d_(tensors: Array<Tensor1D | TensorLike>): Tensor1D;

export declare const concat2d: typeof concat2d_;

/**
 * Concatenates a list of`tf.Tensor2D`s along an axis. See `concat` for details.
 *
 * For example, if:
 * A: shape(2, 3) = | r1, g1, b1 |
 *                  | r2, g2, b2 |
 *
 * B: shape(2, 3) = | r3, g3, b3 |
 *                  | r4, g4, b4 |
 *
 * C = tf.concat2d([A, B], axis)
 *
 * if axis = 0:
 * C: shape(4, 3) = | r1, g1, b1 |
 *                  | r2, g2, b2 |
 *                  | r3, g3, b3 |
 *                  | r4, g4, b4 |
 *
 * if axis = 1:
 * C = shape(2, 6) = | r1, g1, b1, r3, g3, b3 |
 *                   | r2, g2, b2, r4, g4, b4 |
 *
 *
 * @param tensors A list of `tf.Tensor`s to concatenate.
 * @param axis The axis to concatenate along.
 * @return The concatenated array.
 */
declare function concat2d_(tensors: Array<Tensor2D | TensorLike>, axis: number): Tensor2D;

export declare const concat3d: typeof concat3d_;

/**
 * Concatenates a list of `tf.Tensor3D`s along an axis.
 * See `concat` for details.
 *
 * For example, if:
 * A: shape(2, 1, 3) = | r1, g1, b1 |
 *                     | r2, g2, b2 |
 *
 * B: shape(2, 1, 3) = | r3, g3, b3 |
 *                     | r4, g4, b4 |
 *
 * C = tf.concat3d([A, B], axis)
 *
 * if axis = 0:
 * C: shape(4, 1, 3) = | r1, g1, b1 |
 *                     | r2, g2, b2 |
 *                     | r3, g3, b3 |
 *                     | r4, g4, b4 |
 *
 * if axis = 1:
 * C: shape(2, 2, 3) = | r1, g1, b1, r3, g3, b3 |
 *                     | r2, g2, b2, r4, g4, b4 |
 *
 * if axis = 2:
 * C = shape(2, 1, 6) = | r1, g1, b1, r3, g3, b3 |
 *                      | r2, g2, b2, r4, g4, b4 |
 *
 * @param tensors A list of`tf.Tensor`s to concatenate.
 * @param axis The axis to concate along.
 * @return The concatenated array.
 */
declare function concat3d_(tensors: Array<Tensor3D | TensorLike>, axis: number): Tensor3D;

export declare const concat4d: typeof concat4d_;

/**
 * Concatenates a list of `tf.Tensor4D`s along an axis.
 * See `concat` for details.
 *
 * @param tensors A list of `tf.Tensor`s to concatenate.
 * @param axis The axis to concate along.
 * @return The concatenated array.
 */
declare function concat4d_(tensors: Array<Tensor4D | TensorLike>, axis: number): Tensor4D;

/**
 * Concatenates a list of `tf.Tensor`s along a given axis.
 *
 * The tensors ranks and types must match, and their sizes must match in all
 * dimensions except `axis`.
 *
 * Also available are stricter rank-specific methods that assert that
 * `tensors` are of the given rank:
 *   - `tf.concat1d`
 *   - `tf.concat2d`
 *   - `tf.concat3d`
 *   - `tf.concat4d`
 *
 * Except `tf.concat1d` (which does not have axis param), all methods have
 * same signature as this method.
 *
 * ```js
 * const a = tf.tensor1d([1, 2]);
 * const b = tf.tensor1d([3, 4]);
 * a.concat(b).print();  // or a.concat(b)
 * ```
 *
 * ```js
 * const a = tf.tensor1d([1, 2]);
 * const b = tf.tensor1d([3, 4]);
 * const c = tf.tensor1d([5, 6]);
 * tf.concat([a, b, c]).print();
 * ```
 *
 * ```js
 * const a = tf.tensor2d([[1, 2], [10, 20]]);
 * const b = tf.tensor2d([[3, 4], [30, 40]]);
 * const axis = 1;
 * tf.concat([a, b], axis).print();
 * ```
 * @param tensors A list of tensors to concatenate.
 * @param axis The axis to concatenate along. Defaults to 0 (the first dim).
 *
 * @doc {heading: 'Tensors', subheading: 'Slicing and Joining'}
 */
declare function concat_<T extends Tensor>(tensors: Array<T | TensorLike>, axis?: number): T;

export declare interface ConcatAttrs {
    axis: number;
}

/**
 * Concatenate a number of ArrayBuffers into one.
 *
 * @param buffers An array of ArrayBuffers to concatenate, or a single
 *     ArrayBuffer.
 * @returns Result of concatenating `buffers` in order.
 *
 * @deprecated Use tf.io.CompositeArrayBuffer.join() instead.
 */
declare function concatenateArrayBuffers(buffers: ArrayBuffer[] | ArrayBuffer): ArrayBuffer;

export declare type ConcatInputs = TensorInfo[];

declare interface ConfigDict {
    [key: string]: ConfigDictValue;
}

declare interface ConfigDictArray extends Array<ConfigDictValue> {
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
/**
 * Types to support JSON-esque data structures internally.
 *
 * Internally ConfigDict's use camelCase keys and values where the
 * values are class names to be instantiated.  On the python side, these
 * will be snake_case.  Internally we allow Enums into the values for better
 * type safety, but these need to be converted to raw primitives (usually
 * strings) for round-tripping with python.
 *
 * toConfig returns the TS-friendly representation. model.toJSON() returns
 * the pythonic version as that's the portable format.  If you need to
 * python-ify a non-model level toConfig output, you'll need to use a
 * convertTsToPythonic from serialization_utils in -Layers.
 *
 */
declare type ConfigDictValue = boolean | number | string | null | ConfigDictArray | ConfigDict;

declare const confusionMatrix: typeof confusionMatrix_;

/**
 * Computes the confusion matrix from true labels and predicted labels.
 *
 * ```js
 * const labels = tf.tensor1d([0, 1, 2, 1, 0], 'int32');
 * const predictions = tf.tensor1d([0, 2, 2, 1, 0], 'int32');
 * const numClasses = 3;
 * const out = tf.math.confusionMatrix(labels, predictions, numClasses);
 * out.print();
 * // Expected output matrix:
 * // [[2, 0, 0],
 * //  [0, 1, 1],
 * //  [0, 0, 1]]
 * ```
 *
 * @param labels The target labels, assumed to be 0-based integers
 *   for the classes. The shape is `[numExamples]`, where
 *   `numExamples` is the number of examples included.
 * @param predictions The predicted classes, assumed to be
 *   0-based integers for the classes. Must have the same shape as `labels`.
 * @param numClasses Number of all classes, as an integer.
 *   Its value must be larger than the largest element in `labels` and
 *   `predictions`.
 * @returns The confusion matrix as a int32-type 2D tensor. The value at
 *   row `r` and column `c` is the number of times examples of actual class
 *   `r` were predicted as class `c`.
 *
 * @doc {heading: 'Operations', subheading: 'Evaluation'}
 */
declare function confusionMatrix_(labels: Tensor1D | TensorLike, predictions: Tensor1D | TensorLike, numClasses: number): Tensor2D;

declare interface ContextOptions {
    /**
     * Optional.  If the canvas has created a context, it would not make effects.
     * If it is not set, it would be variable based on the current backend.
     */
    contextType?: string;
    /**
     * Optional. A WebGLContextAttributes configuration. If the canvas has created
     * a context, it would not make effects.
     */
    contextAttributes?: WebGLContextAttributes;
}

export declare const conv1d: typeof conv1d_;

/**
 * Computes a 1D convolution over the input x.
 *
 * @param x The input tensor, of rank 3 or rank 2, of shape
 *     `[batch, width, inChannels]`. If rank 2, batch of 1 is assumed.
 * @param filter The filter, rank 3, of shape
 *     `[filterWidth, inDepth, outDepth]`.
 * @param stride The number of entries by which the filter is moved right at
 *     each step.
 * @param pad The type of padding algorithm.
 *    - `same` and stride 1: output will be of same size as input,
 *       regardless of filter size.
 *    - `valid`: output will be smaller than input if filter is larger
 *       than 1x1.
 *   - For more info, see this guide:
 *     [https://www.tensorflow.org/api_docs/python/tf/nn/convolution](
 *          https://www.tensorflow.org/api_docs/python/tf/nn/convolution)
 * @param dataFormat An optional string from "NWC", "NCW". Defaults to "NWC",
 *     the data is stored in the order of [batch, in_width, in_channels]. Only
 *     "NWC" is currently supported.
 * @param dilation The dilation rate in which we sample input values in
 *     atrous convolution. Defaults to `1`. If it is greater than 1, then
 *     stride must be `1`.
 * @param dimRoundingMode A string from: 'ceil', 'round', 'floor'. If none is
 *     provided, it will default to truncate.
 *
 * @doc {heading: 'Operations', subheading: 'Convolution'}
 */
declare function conv1d_<T extends Tensor2D | Tensor3D>(x: T | TensorLike, filter: Tensor3D | TensorLike, stride: number, pad: 'valid' | 'same' | number | conv_util.ExplicitPadding, dataFormat?: 'NWC' | 'NCW', dilation?: number, dimRoundingMode?: 'floor' | 'round' | 'ceil'): T;

export declare const Conv2D = "Conv2D";

export declare const conv2d: typeof conv2d_;

/**
 * Computes a 2D convolution over the input x.
 *
 * @param x The input tensor, of rank 4 or rank 3, of shape
 *     `[batch, height, width, inChannels]`. If rank 3, batch of 1 is
 * assumed.
 * @param filter The filter, rank 4, of shape
 *     `[filterHeight, filterWidth, inDepth, outDepth]`.
 * @param strides The strides of the convolution: `[strideHeight,
 * strideWidth]`.
 * @param pad The type of padding algorithm.
 *    - `same` and stride 1: output will be of same size as input,
 *       regardless of filter size.
 *    - `valid`: output will be smaller than input if filter is larger
 *       than 1x1.
 *   - For more info, see this guide:
 *     [https://www.tensorflow.org/api_docs/python/tf/nn/convolution](
 *          https://www.tensorflow.org/api_docs/python/tf/nn/convolution)
 * @param dataFormat: An optional string from: "NHWC", "NCHW". Defaults to
 *     "NHWC". Specify the data format of the input and output data. With the
 *     default format "NHWC", the data is stored in the order of: [batch,
 *     height, width, channels].
 * @param dilations The dilation rates: `[dilationHeight, dilationWidth]`
 *     in which we sample input values across the height and width dimensions
 *     in atrous convolution. Defaults to `[1, 1]`. If `dilations` is a single
 *     number, then `dilationHeight == dilationWidth`. If it is greater than
 *     1, then all values of `strides` must be 1.
 * @param dimRoundingMode A string from: 'ceil', 'round', 'floor'. If none is
 *     provided, it will default to truncate.
 *
 * @doc {heading: 'Operations', subheading: 'Convolution'}
 */
declare function conv2d_<T extends Tensor3D | Tensor4D>(x: T | TensorLike, filter: Tensor4D | TensorLike, strides: [number, number] | number, pad: 'valid' | 'same' | number | conv_util.ExplicitPadding, dataFormat?: 'NHWC' | 'NCHW', dilations?: [number, number] | number, dimRoundingMode?: 'floor' | 'round' | 'ceil'): T;

declare const conv2d_2: typeof fusedConv2d_;

export declare interface Conv2DAttrs {
    strides: [number, number] | number;
    pad: 'valid' | 'same' | number | ExplicitPadding;
    dataFormat: 'NHWC' | 'NCHW';
    dilations: [number, number] | number;
    dimRoundingMode?: 'floor' | 'round' | 'ceil';
}

export declare const Conv2DBackpropFilter = "Conv2DBackpropFilter";

export declare interface Conv2DBackpropFilterAttrs {
    strides: [number, number] | number;
    pad: 'valid' | 'same' | number | ExplicitPadding;
    dataFormat: 'NHWC' | 'NCHW';
    dimRoundingMode?: 'floor' | 'round' | 'ceil';
    filterShape: [number, number, number, number];
}

export declare type Conv2DBackpropFilterInputs = Pick<NamedTensorInfoMap, 'x' | 'dy'>;

export declare const Conv2DBackpropInput = "Conv2DBackpropInput";

export declare interface Conv2DBackpropInputAttrs {
    strides: [number, number] | number;
    pad: 'valid' | 'same' | number | ExplicitPadding;
    dataFormat: 'NHWC' | 'NCHW';
    dimRoundingMode?: 'floor' | 'round' | 'ceil';
    inputShape: [number, number, number, number];
}

export declare type Conv2DBackpropInputInputs = Pick<NamedTensorInfoMap, 'dy' | 'filter'>;

/**
 * Information about the forward pass of a convolution/pooling operation.
 * It includes input and output shape, strides, filter size and padding
 * information.
 */
declare type Conv2DInfo = {
    batchSize: number;
    inHeight: number;
    inWidth: number;
    inChannels: number;
    outHeight: number;
    outWidth: number;
    outChannels: number;
    dataFormat: 'channelsFirst' | 'channelsLast';
    strideHeight: number;
    strideWidth: number;
    dilationHeight: number;
    dilationWidth: number;
    filterHeight: number;
    filterWidth: number;
    effectiveFilterHeight: number;
    effectiveFilterWidth: number;
    padInfo: PadInfo;
    inShape: [number, number, number, number];
    outShape: [number, number, number, number];
    filterShape: [number, number, number, number];
};

export declare type Conv2DInputs = Pick<NamedTensorInfoMap, 'x' | 'filter'>;

export declare const conv2dTranspose: typeof conv2dTranspose_;

/**
 * Computes the transposed 2D convolution of an image, also known as a
 * deconvolution.
 *
 * @param x The input image, of rank 4 or rank 3, of shape
 *   `[batch, height, width, inDepth]`. If rank 3, batch of 1 is assumed.
 * @param filter The filter, rank 4, of shape
 *     `[filterHeight, filterWidth, outDepth, inDepth]`.
 *     `inDepth` must match `inDepth` in `x`.
 * @param outputShape Output shape, of rank 4 or rank 3:
 *     `[batch, height, width, outDepth]`. If rank 3, batch of 1 is assumed.
 * @param strides The strides of the original convolution:
 *     `[strideHeight, strideWidth]`.
 * @param pad  The type of padding algorithm used in the non-transpose version
 *    of the op.
 * @param dimRoundingMode A string from: 'ceil', 'round', 'floor'. If none is
 *     provided, it will default to truncate.
 *
 * @doc {heading: 'Operations', subheading: 'Convolution'}
 */
declare function conv2dTranspose_<T extends Tensor3D | Tensor4D>(x: T | TensorLike, filter: Tensor4D | TensorLike, outputShape: [number, number, number, number] | [number, number, number], strides: [number, number] | number, pad: 'valid' | 'same' | number | ExplicitPadding, dimRoundingMode?: 'floor' | 'round' | 'ceil'): T;

export declare const Conv3D = "Conv3D";

export declare const conv3d: typeof conv3d_;

/**
 * Computes a 3D convolution over the input x.
 *
 * @param x The input tensor, of rank 5 or rank 4, of shape
 *     `[batch, depth, height, width, channels]`. If rank 4,
 * batch of 1 is assumed.
 * @param filter The filter, rank 5, of shape
 *     `[filterDepth, filterHeight, filterWidth, inChannels, outChannels]`.
 *      inChannels must match between input and filter.
 * @param strides The strides of the convolution: `[strideDepth, strideHeight,
 * strideWidth]`.
 * @param pad The type of padding algorithm.
 *    - `same` and stride 1: output will be of same size as input,
 *       regardless of filter size.
 *    - `valid`: output will be smaller than input if filter is larger
 *       than 1x1.
 *   - For more info, see this guide:
 *     [https://www.tensorflow.org/api_docs/python/tf/nn/convolution](
 *          https://www.tensorflow.org/api_docs/python/tf/nn/convolution)
 * @param dataFormat: An optional string from: "NDHWC", "NCDHW". Defaults to
 *     "NDHWC". Specify the data format of the input and output data. With the
 *     default format "NDHWC", the data is stored in the order of: [batch,
 *     depth, height, width, channels]. Only "NDHWC" is currently supported.
 * @param dilations The dilation rates: `[dilationDepth, dilationHeight,
 *     dilationWidth]` in which we sample input values across the height
 *     and width dimensions in atrous convolution. Defaults to `[1, 1, 1]`.
 *     If `dilations` is a single number, then
 *     `dilationDepth == dilationHeight == dilationWidth`. If it is greater
 *     than 1, then all values of `strides` must be 1.
 *
 * @doc {heading: 'Operations', subheading: 'Convolution'}
 */
declare function conv3d_<T extends Tensor4D | Tensor5D>(x: T | TensorLike, filter: Tensor5D | TensorLike, strides: [number, number, number] | number, pad: 'valid' | 'same', dataFormat?: 'NDHWC' | 'NCDHW', dilations?: [number, number, number] | number): T;

export declare interface Conv3DAttrs {
    strides: [number, number, number] | number;
    pad: 'valid' | 'same';
    dataFormat: 'NDHWC' | 'NCDHW';
    dilations: [number, number, number] | number;
}

export declare const Conv3DBackpropFilterV2 = "Conv3DBackpropFilterV2";

export declare interface Conv3DBackpropFilterV2Attrs {
    strides: [number, number, number] | number;
    pad: 'valid' | 'same';
    filterShape: [number, number, number, number, number];
}

export declare type Conv3DBackpropFilterV2Inputs = Pick<NamedTensorInfoMap, 'x' | 'dy'>;

export declare const Conv3DBackpropInputV2 = "Conv3DBackpropInputV2";

export declare interface Conv3DBackpropInputV2Attrs {
    strides: [number, number, number] | number;
    pad: 'valid' | 'same';
    inputShape: [number, number, number, number, number];
}

export declare type Conv3DBackpropInputV2Inputs = Pick<NamedTensorInfoMap, 'dy' | 'filter'>;

/**
 * Information about the forward pass of a 3D convolution/pooling operation.
 * It includes input and output shape, strides, filter size and padding
 * information.
 */
declare type Conv3DInfo = {
    batchSize: number;
    inDepth: number;
    inHeight: number;
    inWidth: number;
    inChannels: number;
    outDepth: number;
    outHeight: number;
    outWidth: number;
    outChannels: number;
    dataFormat: 'channelsFirst' | 'channelsLast';
    strideDepth: number;
    strideHeight: number;
    strideWidth: number;
    dilationDepth: number;
    dilationHeight: number;
    dilationWidth: number;
    filterDepth: number;
    filterHeight: number;
    filterWidth: number;
    effectiveFilterDepth: number;
    effectiveFilterHeight: number;
    effectiveFilterWidth: number;
    padInfo: PadInfo3D;
    inShape: [number, number, number, number, number];
    outShape: [number, number, number, number, number];
    filterShape: [number, number, number, number, number];
};

export declare type Conv3DInputs = Pick<NamedTensorInfoMap, 'x' | 'filter'>;

export declare const conv3dTranspose: typeof conv3dTranspose_;

/**
 * Computes the transposed 3D convolution of a volume, also known as a
 * deconvolution.
 *
 * @param x The input image, of rank 5 or rank 4, of shape
 *   `[batch, depth, height, width, inDepth]`. If rank 4, batch of 1 is assumed.
 * @param filter The filter, rank 4, of shape
 *     `[depth, filterHeight, filterWidth, outDepth, inDepth]`.
 *     `inDepth` must match `inDepth` in `x`.
 * @param outputShape Output shape, of rank 5 or rank 4:
 *     `[batch, depth, height, width, outDepth]`. If rank 3, batch of 1 is
 *    assumed.
 * @param strides The strides of the original convolution:
 *     `[strideDepth, strideHeight, strideWidth]`.
 * @param pad  The type of padding algorithm used in the non-transpose version
 *    of the op.
 *
 * @doc {heading: 'Operations', subheading: 'Convolution'}
 */
declare function conv3dTranspose_<T extends Tensor4D | Tensor5D>(x: T | TensorLike, filter: Tensor5D | TensorLike, outputShape: [
number,
number,
number,
number,
number
] | [number, number, number, number], strides: [number, number, number] | number, pad: 'valid' | 'same'): T;

declare namespace conv_util {
    export {
        computeDilation2DInfo,
        computePool2DInfo,
        computePool3DInfo,
        computeConv2DInfo,
        computeConv3DInfo,
        computeDefaultPad,
        tupleValuesAreOne,
        eitherStridesOrDilationsAreOne,
        stridesOrDilationsArePositive,
        convertConv2DDataFormat,
        checkPadOnDimRoundingMode,
        ExplicitPadding,
        PadInfo,
        PadInfo3D,
        Conv2DInfo,
        Conv3DInfo
    }
}

declare function convertBackendValuesAndArrayBuffer(data: BackendValues | ArrayBuffer, dtype: DataType): Uint8Array | Int32Array | Float32Array | Uint8Array[];

/**
 * Convert Conv2D dataFormat from 'NHWC'|'NCHW' to
 *    'channelsLast'|'channelsFirst'
 * @param dataFormat in 'NHWC'|'NCHW' mode
 * @return dataFormat in 'channelsLast'|'channelsFirst' mode
 * @throws unknown dataFormat
 */
declare function convertConv2DDataFormat(dataFormat: 'NHWC' | 'NCHW'): 'channelsLast' | 'channelsFirst';

/**
 * Copy a model from one URL to another.
 *
 * This function supports:
 *
 * 1. Copying within a storage medium, e.g.,
 *    `tf.io.copyModel('localstorage://model-1', 'localstorage://model-2')`
 * 2. Copying between two storage mediums, e.g.,
 *    `tf.io.copyModel('localstorage://model-1', 'indexeddb://model-1')`
 *
 * ```js
 * // First create and save a model.
 * const model = tf.sequential();
 * model.add(tf.layers.dense(
 *     {units: 1, inputShape: [10], activation: 'sigmoid'}));
 * await model.save('localstorage://demo/management/model1');
 *
 * // Then list existing models.
 * console.log(JSON.stringify(await tf.io.listModels()));
 *
 * // Copy the model, from Local Storage to IndexedDB.
 * await tf.io.copyModel(
 *     'localstorage://demo/management/model1',
 *     'indexeddb://demo/management/model1');
 *
 * // List models again.
 * console.log(JSON.stringify(await tf.io.listModels()));
 *
 * // Remove both models.
 * await tf.io.removeModel('localstorage://demo/management/model1');
 * await tf.io.removeModel('indexeddb://demo/management/model1');
 * ```
 *
 * @param sourceURL Source URL of copying.
 * @param destURL Destination URL of copying.
 * @returns ModelArtifactsInfo of the copied model (if and only if copying
 *   is successful).
 * @throws Error if copying fails, e.g., if no model exists at `sourceURL`, or
 *   if `oldPath` and `newPath` are identical.
 *
 * @doc {
 *   heading: 'Models',
 *   subheading: 'Management',
 *   namespace: 'io',
 *   ignoreCI: true
 * }
 */
declare function copyModel(sourceURL: string, destURL: string): Promise<ModelArtifactsInfo>;

/**
 * Finds kernels that have already been registered to a backend and re-registers
 * them for a new backend. Useful for registering custom backends.
 * @param registeredBackendName Already registered backend.
 * @param newBackendName New backend.
 */
export declare function copyRegisteredKernels(registeredBackendName: string, newBackendName: string): void;

export declare const Cos = "Cos";

export declare const cos: typeof cos_;

/**
 * Computes cos of the input `tf.Tensor` element-wise: `cos(x)`
 *
 * ```js
 * const x = tf.tensor1d([0, Math.PI / 2, Math.PI * 3 / 4]);
 *
 * x.cos().print();  // or tf.cos(x)
 * ```
 * @param x The input tensor. Must be float32 type.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function cos_<T extends Tensor>(x: T | TensorLike): T;

export declare const Cosh = "Cosh";

export declare const cosh: typeof cosh_;

/**
 * Computes hyperbolic cos of the input `tf.Tensor` element-wise: `cosh(x)`
 *
 * ```js
 * const x = tf.tensor1d([0, 1, -1, .7]);
 *
 * x.cosh().print();  // or tf.cosh(x)
 * ```
 * @param x The input tensor. Must be float32 type.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function cosh_<T extends Tensor>(x: T | TensorLike): T;

export declare type CoshInputs = UnaryInputs;

export declare function cosineWindow(windowLength: number, a: number, b: number): Tensor1D;

export declare type CosInputs = UnaryInputs;

/**
 * Create typed array for scalar value. Used for storing in `DataStorage`.
 */
declare function createScalarValue(value: DataType, dtype: DataType): BackendValues;

/**
 * Creates a new array with randomized indices to a given quantity.
 *
 * ```js
 * const randomTen = tf.util.createShuffledIndices(10);
 * console.log(randomTen);
 * ```
 *
 * @param number Quantity of how many shuffled indices to create.
 *
 * @doc {heading: 'Util', namespace: 'util'}
 */
declare function createShuffledIndices(n: number): Uint32Array;

/** Creates an HTMLVideoElement with autoplay-friendly default settings. */
declare function createVideoElement(source: HTMLSourceElement): Promise<HTMLVideoElement>;

export declare const CropAndResize = "CropAndResize";

export declare interface CropAndResizeAttrs {
    cropSize: [number, number];
    method: 'bilinear' | 'nearest';
    extrapolationValue: number;
}

export declare type CropAndResizeInputs = Pick<NamedTensorInfoMap, 'image' | 'boxes' | 'boxInd'>;

export declare const Cumprod = "Cumprod";

export declare const cumprod: typeof cumprod_;

/**
 * Computes the cumulative product of a `tf.Tensor` along `axis`.
 *
 * ```js
 * const x = tf.tensor([1, 2, 3, 4]);
 * x.cumprod().print();
 * ```
 * ```js
 * const x = tf.tensor([[1, 2], [3, 4]]);
 * x.cumprod().print();
 * ```
 *
 * @param x The input tensor to cumulatively multiply.
 * @param axis The axis along which to multiply. Optional. Defaults to 0.
 * @param exclusive Whether to perform exclusive cumulative product. Optional.
 *     Defaults to false. If set to true then the product of each tensor entry
 *     does not include its own value, but only the values previous to it
 *     along the specified axis.
 * @param reverse Whether to multiply in the opposite direction. Optional.
 *     Defaults to false.
 *
 * @doc {heading: 'Operations', subheading: 'Scan'}
 */
declare function cumprod_<T extends Tensor>(x: Tensor | TensorLike, axis?: number, exclusive?: boolean, reverse?: boolean): T;

export declare interface CumprodAttrs {
    axis: number;
    exclusive: boolean;
    reverse: boolean;
}

export declare type CumprodInputs = Pick<NamedTensorInfoMap, 'x'>;

export declare const Cumsum = "Cumsum";

export declare const cumsum: typeof cumsum_;

/**
 * Computes the cumulative sum of a `tf.Tensor` along `axis`.
 *
 * ```js
 * const x = tf.tensor([1, 2, 3, 4]);
 * x.cumsum().print();
 * ```
 * ```js
 * const x = tf.tensor([[1, 2], [3, 4]]);
 * x.cumsum().print();
 * ```
 *
 * @param x The input tensor to be summed.
 * @param axis The axis along which to sum. Optional. Defaults to 0.
 * @param exclusive Whether to perform exclusive cumulative sum. Optional.
 *     Defaults to false. If set to true then the sum of each tensor entry
 *     does not include its own value, but only the values previous to it
 *     along the specified axis.
 * @param reverse Whether to sum in the opposite direction. Optional.
 *     Defaults to false.
 *
 * @doc {heading: 'Operations', subheading: 'Scan'}
 */
declare function cumsum_<T extends Tensor>(x: Tensor | TensorLike, axis?: number, exclusive?: boolean, reverse?: boolean): T;

export declare interface CumsumAttrs {
    axis: number;
    exclusive: boolean;
    reverse: boolean;
}

export declare type CumsumInputs = Pick<NamedTensorInfoMap, 'x'>;

/**
 * Overrides the gradient computation of a function `f`.
 *
 * Takes a function
 * `f(...inputs, save) => {value: Tensor, gradFunc: (dy, saved) => Tensor[]}`
 * and returns another function `g(...inputs)` which takes the same inputs as
 * `f`. When called, `g` returns `f().value`. In backward mode, custom gradients
 * with respect to each input of `f` are computed using `f().gradFunc`.
 *
 * The `save` function passed to `f` should be used for saving tensors needed
 * in the gradient. And the `saved` passed to the `gradFunc` is a
 * `NamedTensorMap`, which contains those saved tensors.
 *
 * ```js
 * const customOp = tf.customGrad((x, save) => {
 *   // Save x to make sure it's available later for the gradient.
 *   save([x]);
 *   // Override gradient of our custom x ^ 2 op to be dy * abs(x);
 *   return {
 *     value: x.square(),
 *     // Note `saved.x` which points to the `x` we saved earlier.
 *     gradFunc: (dy, saved) => [dy.mul(saved[0].abs())]
 *   };
 * });
 *
 * const x = tf.tensor1d([-1, -2, 3]);
 * const dx = tf.grad(x => customOp(x));
 *
 * console.log(`f(x):`);
 * customOp(x).print();
 * console.log(`f'(x):`);
 * dx(x).print();
 * ```
 *
 * @param f The function to evaluate in forward mode, which should return
 *     `{value: Tensor, gradFunc: (dy, saved) => Tensor[]}`, where `gradFunc`
 *     returns the custom gradients of `f` with respect to its inputs.
 *
 * @doc {heading: 'Training', subheading: 'Gradients'}
 */
export declare function customGrad<T extends Tensor>(f: CustomGradientFunc<T>): (...args: Tensor[]) => T;

/**
 * @docalias (a: Tensor, b: Tensor,..., save?: Function) => {
 *   value: Tensor,
 *   gradFunc: (dy: Tensor, saved?: NamedTensorMap) => Tensor | Tensor[]
 * }
 */
declare type CustomGradientFunc<T extends Tensor> = (...inputs: Array<Tensor | GradSaveFunc>) => {
    value: T;
    gradFunc: (dy: T, saved: Tensor[]) => Tensor | Tensor[];
};

/**
 * We wrap data id since we use weak map to avoid memory leaks.
 * Since we have our own memory management, we have a reference counter
 * mapping a tensor to its data, so there is always a pointer (even if that
 * data is otherwise garbage collectable).
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/
 * Global_Objects/WeakMap
 */
export declare type DataId = object;

export declare interface DataMover {
    /**
     * To be called by backends whenever they see a dataId that they don't own.
     * Upon calling this method, the mover will fetch the tensor from another
     * backend and register it with the current active backend.
     */
    moveData(backend: KernelBackend, dataId: DataId): void;
}

/** Convenient class for storing tensor-related data. */
export declare class DataStorage<T> {
    private backend;
    private dataMover;
    private data;
    private dataIdsCount;
    constructor(backend: KernelBackend, dataMover: DataMover);
    get(dataId: DataId): T;
    set(dataId: DataId, value: T): void;
    has(dataId: DataId): boolean;
    delete(dataId: DataId): boolean;
    numDataIds(): number;
}

export declare type DataToGPUOptions = DataToGPUWebGLOption;

export declare interface DataToGPUWebGLOption {
    customTexShape?: [number, number];
}

/** @docalias 'float32'|'int32'|'bool'|'complex64'|'string' */
export declare type DataType = keyof DataTypeMap;

export declare type DataTypeFor<T extends number | string | boolean> = T extends number | boolean ? NumericDataType : T extends string ? 'string' : never;

export declare interface DataTypeMap {
    float32: Float32Array;
    int32: Int32Array;
    bool: Uint8Array;
    complex64: Float32Array;
    string: string[];
}

/** Tensor data used in tensor creation and user-facing API. */
export declare type DataValues = DataTypeMap[DataType];

/**
 * Parse an equation for einsum.
 *
 * @param equation The einsum equation (e.g., "ij,jk->ik").
 * @param numTensors Number of tensors provided along with `equation`. Used to
 *   check matching number of input tensors.
 * @returns An object consisting of the following fields:
 *   - allDims: all dimension names as strings.
 *   - summedDims: a list of all dimensions being summed over, as indices to
 *     the elements of `allDims`.
 *   - idDims: indices of the dimensions in each input tensor, as indices to
 *     the elements of `allDims.
 */
declare function decodeEinsumEquation(equation: string, numTensors: number): {
    allDims: string[];
    summedDims: number[];
    idDims: number[][];
};

/**
 * Decodes the provided bytes into a string using the provided encoding scheme.
 * @param bytes The bytes to decode.
 *
 * @param encoding The encoding scheme. Defaults to utf-8.
 *
 * @doc {heading: 'Util'}
 */
declare function decodeString(bytes: Uint8Array, encoding?: string): string;

/**
 * Decode flat ArrayBuffer as weights.
 *
 * This function does not handle sharding.
 *
 * This function is the reverse of `encodeWeights`.
 *
 * @param weightData A flat ArrayBuffer or an array of ArrayBuffers carrying the
 *   binary values of the tensors concatenated in the order specified in
 *   `specs`.
 * @param specs Specifications of the names, dtypes and shapes of the tensors
 *   whose value are encoded by `buffer`.
 * @return A map from tensor name to tensor value, with the names corresponding
 *   to names in `specs`.
 * @throws Error, if any of the tensors has unsupported dtype.
 */
declare function decodeWeights(weightData: WeightData, specs: WeightsManifestEntry[]): NamedTensorMap;

export declare const DenseBincount = "DenseBincount";

export declare const denseBincount: typeof denseBincount_;

/**
 * Outputs a vector with length `size` and the same dtype as `weights`.
 *
 * If `weights` are empty, then index `i` stores the number of times the value
 * `i` is counted in `x`. If `weights` are non-empty, then index `i` stores the
 * sum of the value in `weights` at each index where the corresponding value in
 * `x` is `i`.
 *
 * Values in `x` outside of the range [0, size) are ignored.
 *
 * @param x The input int tensor, rank 1 or rank 2.
 * @param weights The weights tensor, must have the same shape as x, or a
 *     length-0 Tensor, in which case it acts as all weights equal to 1.
 * @param size Non-negative integer.
 * @param binaryOutput Optional. Whether the kernel should count the appearance
 *     or number of occurrences. Defaults to False.
 *
 * @doc {heading: 'Operations', subheading: 'Reduction'}
 */
declare function denseBincount_<T extends Tensor1D | Tensor2D>(x: T | TensorLike, weights: T | TensorLike, size: number, binaryOutput?: boolean): T;

export declare interface DenseBincountAttrs {
    size: number;
    binaryOutput?: boolean;
}

export declare type DenseBincountInputs = Pick<NamedTensorInfoMap, 'x' | 'weights'>;

/** Warn users about deprecated functionality. */
export declare function deprecationWarn(msg: string): void;

export declare const DepthToSpace = "DepthToSpace";

export declare const depthToSpace: typeof depthToSpace_;

/**
 * Rearranges data from depth into blocks of spatial data. More specifically,
 * this op outputs a copy of the input tensor where values from the `depth`
 * dimension are moved in spatial blocks to the `height` and `width` dimensions.
 * The attr `blockSize` indicates the input block size and how the data is
 * moved.
 *
 *  - Chunks of data of size `blockSize * blockSize` from depth are rearranged
 * into non-overlapping blocks of size `blockSize x blockSize`
 *
 *  - The width the output tensor is `inputWidth * blockSize`, whereas the
 * height is `inputHeight * blockSize`
 *
 *  - The Y, X coordinates within each block of the output image are determined
 * by the high order component of the input channel index
 *
 *  - The depth of the input tensor must be divisible by `blockSize *
 * blockSize`
 *
 * The `dataFormat` attr specifies the layout of the input and output tensors
 * with the following options: "NHWC": [ `batch, height, width, channels` ]
 * "NCHW": [ `batch, channels, height, width` ]
 *
 * ```js
 * const x = tf.tensor4d([1, 2, 3, 4], [1, 1, 1, 4]);
 * const blockSize = 2;
 * const dataFormat = "NHWC";
 *
 * tf.depthToSpace(x, blockSize, dataFormat).print();
 * ```
 *
 * @param x The input tensor of rank 4
 * @param blockSIze  An `int` that is `>= 2`. The size of the spatial block
 * @param dataFormat An optional string from: "NHWC", "NCHW". Defaults to "NHWC"
 *
 * @doc {heading: 'Tensors', subheading: 'Transformations'}
 */
declare function depthToSpace_(x: Tensor4D | TensorLike4D, blockSize: number, dataFormat?: 'NHWC' | 'NCHW'): Tensor4D;

export declare interface DepthToSpaceAttrs {
    blockSize: number;
    dataFormat: 'NHWC' | 'NCHW';
}

export declare type DepthToSpaceInputs = Pick<NamedTensorInfoMap, 'x'>;

export declare const depthwiseConv2d: typeof depthwiseConv2d_;

/**
 * Depthwise 2D convolution.
 *
 * Given a 4D `input` array and a `filter` array of shape
 * `[filterHeight, filterWidth, inChannels, channelMultiplier]` containing
 * `inChannels` convolutional filters of depth 1, this op applies a
 * different filter to each input channel (expanding from 1 channel to
 * `channelMultiplier` channels for each), then concatenates the results
 * together. The output has `inChannels * channelMultiplier` channels.
 *
 * See
 * [https://www.tensorflow.org/api_docs/python/tf/nn/depthwise_conv2d](
 *     https://www.tensorflow.org/api_docs/python/tf/nn/depthwise_conv2d)
 * for more details.
 *
 * @param x The input tensor, of rank 4 or rank 3, of shape
 *     `[batch, height, width, inChannels]`. If rank 3, batch of 1 is
 * assumed.
 * @param filter The filter tensor, rank 4, of shape
 *     `[filterHeight, filterWidth, inChannels, channelMultiplier]`.
 * @param strides The strides of the convolution: `[strideHeight,
 * strideWidth]`. If strides is a single number, then `strideHeight ==
 * strideWidth`.
 * @param pad The type of padding algorithm.
 *   - `same` and stride 1: output will be of same size as input,
 *       regardless of filter size.
 *   - `valid`: output will be smaller than input if filter is larger
 *       than 1x1.
 *   - For more info, see this guide:
 *     [https://www.tensorflow.org/api_docs/python/tf/nn/convolution](
 *          https://www.tensorflow.org/api_docs/python/tf/nn/convolution)
 * @param dilations The dilation rates: `[dilationHeight, dilationWidth]`
 *     in which we sample input values across the height and width dimensions
 *     in atrous convolution. Defaults to `[1, 1]`. If `rate` is a single
 *     number, then `dilationHeight == dilationWidth`. If it is greater than
 *     1, then all values of `strides` must be 1.
 * @param dataFormat: An optional string from: "NHWC", "NCHW". Defaults to
 *     "NHWC". Specify the data format of the input and output data. With the
 *     default format "NHWC", the data is stored in the order of: [batch,
 *     height, width, channels]. Only "NHWC" is currently supported.
 * @param dimRoundingMode A string from: 'ceil', 'round', 'floor'. If none is
 *     provided, it will default to truncate.
 *
 * @doc {heading: 'Operations', subheading: 'Convolution'}
 */
declare function depthwiseConv2d_<T extends Tensor3D | Tensor4D>(x: T | TensorLike, filter: Tensor4D | TensorLike, strides: [number, number] | number, pad: 'valid' | 'same' | number | conv_util.ExplicitPadding, dataFormat?: 'NHWC' | 'NCHW', dilations?: [number, number] | number, dimRoundingMode?: 'floor' | 'round' | 'ceil'): T;

declare const depthwiseConv2d_2: typeof fusedDepthwiseConv2d_;

export declare const DepthwiseConv2dNative = "DepthwiseConv2dNative";

export declare interface DepthwiseConv2dNativeAttrs {
    strides: [number, number] | number;
    pad: 'valid' | 'same' | number | ExplicitPadding;
    dataFormat: 'NHWC' | 'NCHW';
    dilations: [number, number] | number;
    dimRoundingMode?: 'floor' | 'round' | 'ceil';
}

export declare const DepthwiseConv2dNativeBackpropFilter = "DepthwiseConv2dNativeBackpropFilter";

export declare interface DepthwiseConv2dNativeBackpropFilterAttrs {
    strides: [number, number] | number;
    dilations: [number, number] | number;
    pad: 'valid' | 'same' | number | ExplicitPadding;
    dimRoundingMode?: 'floor' | 'round' | 'ceil';
    filterShape: [number, number, number, number];
}

export declare type DepthwiseConv2dNativeBackpropFilterInputs = Pick<NamedTensorInfoMap, 'x' | 'dy'>;

export declare const DepthwiseConv2dNativeBackpropInput = "DepthwiseConv2dNativeBackpropInput";

export declare interface DepthwiseConv2dNativeBackpropInputAttrs {
    strides: [number, number] | number;
    dilations: [number, number] | number;
    pad: 'valid' | 'same' | number | ExplicitPadding;
    dimRoundingMode?: 'floor' | 'round' | 'ceil';
    inputShape: [number, number, number, number];
}

export declare type DepthwiseConv2dNativeBackpropInputInputs = Pick<NamedTensorInfoMap, 'dy' | 'filter'>;

export declare type DepthwiseConv2dNativeInputs = Pick<NamedTensorInfoMap, 'x' | 'filter'>;

declare namespace device_util {
    export {
        mockIsMobile,
        isMobile,
        isBrowser
    }
}
export { device_util }

export declare const Diag = "Diag";

export declare const diag: typeof diag_;

/**
 * Returns a diagonal tensor with given diagonal values.
 *
 * Given a diagonal, this operation returns a tensor with the diagonal and
 * everything else padded with zeros.
 *
 * Assume the input has dimensions `[D1,..., Dk]`, then the output is a tensor
 * of rank 2k with dimensions `[D1,..., Dk, D1,..., Dk]`
 *
 * ```js
 * const x = tf.tensor1d([1, 2, 3, 4]);
 *
 * tf.diag(x).print()
 * ```
 * ```js
 * const x = tf.tensor2d([1, 2, 3, 4, 5, 6, 7, 8], [4, 2])
 *
 * tf.diag(x).print()
 * ```
 * @param x The input tensor.
 *
 * @doc {heading: 'Tensors', subheading: 'Creation'}
 */
declare function diag_(x: Tensor): Tensor;

export declare type DiagInputs = Pick<NamedTensorInfoMap, 'x'>;

export declare const Dilation2D = "Dilation2D";

export declare const dilation2d: typeof dilation2d_;

/**
 * Computes the grayscale dilation over the input `x`.
 *
 * @param x The input tensor, rank 3 or rank 4 of shape
 *     `[batch, height, width, depth]`. If rank 3, batch of 1 is assumed.
 * @param filter The filter tensor, rank 3, of shape
 *     `[filterHeight, filterWidth, depth]`.
 * @param strides The strides of the sliding window for each dimension of the
 *     input tensor: `[strideHeight, strideWidth]`.
 *     If `strides` is a single number,
 *     then `strideHeight == strideWidth`.
 * @param pad The type of padding algorithm.
 *    - `same` and stride 1: output will be of same size as input,
 *       regardless of filter size.
 *    - `valid`: output will be smaller than input if filter is larger
 *       than 1*1x1.
 *    - For more info, see this guide:
 *     [https://www.tensorflow.org/api_docs/python/tf/nn/convolution](
 *          https://www.tensorflow.org/api_docs/python/tf/nn/convolution)
 * @param dataFormat Specify the data format of the input and output data.
 *      Defaults to 'NHWC'. Only 'NHWC' is currently supported. With the
 *      default format "NHWC", the data is stored in the order of: [batch,
 *      height, width, channels].
 * @param dilations The dilation rates: `[dilationHeight, dilationWidth]`
 *     in which we sample input values across the height and width dimensions
 *     for atrous morphological dilation. Defaults to `[1, 1]`. If `dilations`
 *     is a single number, then `dilationHeight == dilationWidth`. If it is
 *     greater than 1, then all values of `strides` must be 1.
 *
 * @doc {heading: 'Operations', subheading: 'Convolution'}
 */
declare function dilation2d_<T extends Tensor3D | Tensor4D>(x: T | TensorLike, filter: Tensor3D | TensorLike, strides: [number, number] | number, pad: 'valid' | 'same', dilations?: [number, number] | number, dataFormat?: 'NHWC'): T;

export declare interface Dilation2DAttrs {
    strides: [number, number] | number;
    pad: 'valid' | 'same' | number;
    dilations: [number, number] | number;
}

export declare const Dilation2DBackpropFilter = "Dilation2DBackpropFilter";

export declare type Dilation2DBackpropFilterInputs = Pick<NamedTensorInfoMap, 'x' | 'filter' | 'dy'>;

export declare const Dilation2DBackpropInput = "Dilation2DBackpropInput";

export declare type Dilation2DBackpropInputInputs = Pick<NamedTensorInfoMap, 'x' | 'filter' | 'dy'>;

export declare type Dilation2DInputs = Pick<NamedTensorInfoMap, 'x' | 'filter'>;

/** Globally disables deprecation warnings */
export declare function disableDeprecationWarnings(): void;

/**
 * Disposes any `tf.Tensor`s found within the provided object.
 *
 * @param container an object that may be a `tf.Tensor` or may directly
 *     contain `tf.Tensor`s, such as a `Tensor[]` or `{key: Tensor, ...}`. If
 *     the object is not a `tf.Tensor` or does not contain `Tensors`, nothing
 *     happens. In general it is safe to pass any object here, except that
 *     `Promise`s are not supported.
 *
 * @doc {heading: 'Performance', subheading: 'Memory'}
 */
export declare function dispose(container: TensorContainer): void;

/**
 * Dispose all variables kept in backend engine.
 *
 * @doc {heading: 'Environment'}
 */
export declare function disposeVariables(): void;

/** Returns the squared Euclidean distance between two vectors. */
declare function distSquared(a: FlatVector, b: FlatVector): number;

export declare const div: typeof div_;

/**
 * Divides two `tf.Tensor`s element-wise, A / B. Supports broadcasting.
 *
 * ```js
 * const a = tf.tensor1d([1, 4, 9, 16]);
 * const b = tf.tensor1d([1, 2, 3, 4]);
 *
 * a.div(b).print();  // or tf.div(a, b)
 * ```
 *
 * ```js
 * // Broadcast div a with b.
 * const a = tf.tensor1d([2, 4, 6, 8]);
 * const b = tf.scalar(2);
 *
 * a.div(b).print();  // or tf.div(a, b)
 * ```
 *
 * @param a The first tensor as the numerator.
 * @param b The second tensor as the denominator. Must have the same dtype as
 * `a`.
 *
 * @doc {heading: 'Operations', subheading: 'Arithmetic'}
 */
declare function div_<T extends Tensor>(a: Tensor | TensorLike, b: Tensor | TensorLike): T;

export declare const divNoNan: typeof divNoNan_;

/**
 * Divides two `tf.Tensor`s element-wise, A / B. Supports broadcasting. Return 0
 * if denominator is 0.
 *
 *
 * ```js
 * const a = tf.tensor1d([1, 4, 9, 16]);
 * const b = tf.tensor1d([1, 2, 3, 4]);
 * const c = tf.tensor1d([0, 0, 0, 0]);
 *
 * a.divNoNan(b).print();  // or tf.divNoNan(a, b)
 * a.divNoNan(c).print();  // or tf.divNoNan(a, c)
 * ```
 *
 * ```js
 * // Broadcast div a with b.
 * const a = tf.tensor1d([2, 4, 6, 8]);
 * const b = tf.scalar(2);
 * const c = tf.scalar(0);
 *
 * a.divNoNan(b).print();  // or tf.divNoNan(a, b)
 * a.divNoNan(c).print();  // or tf.divNoNan(a, c)
 * ```
 *
 * @param a The first tensor as the numerator.
 * @param b The second tensor as the denominator. Must have the same dtype as
 * `a`.
 *
 * @doc {heading: 'Operations', subheading: 'Arithmetic'}
 */
declare function divNoNan_<T extends Tensor>(a: Tensor | TensorLike, b: Tensor | TensorLike): T;

declare interface DoneFn_2 {
    (): void;
    fail: (message?: Error | string) => void;
}

export declare const dot: typeof dot_;

/**
 * Computes the dot product of two matrices and/or vectors, `t1` and `t2`.
 *
 * ```js
 * const a = tf.tensor1d([1, 2]);
 * const b = tf.tensor2d([[1, 2], [3, 4]]);
 * const c = tf.tensor2d([[1, 2, 3], [4, 5, 6]]);
 *
 * a.dot(b).print();  // or tf.dot(a, b)
 * b.dot(a).print();
 * b.dot(c).print();
 * ```
 * @param t1 The first tensor in the dot operation.
 * @param t2 The second tensor in the dot operation.
 *
 * @doc {heading: 'Operations', subheading: 'Matrices'}
 */
declare function dot_(t1: Tensor | TensorLike, t2: Tensor | TensorLike): Tensor;

export declare const Draw = "Draw";

/**
 * Draws a `tf.Tensor` to a canvas.
 *
 * When the dtype of the input is 'float32', we assume values in the range
 * [0-1]. Otherwise, when input is 'int32', we assume values in the range
 * [0-255].
 *
 * @param image The tensor to draw on the canvas. Must match one of
 * these shapes:
 *   - Rank-2 with shape `[height, width`]: Drawn as grayscale.
 *   - Rank-3 with shape `[height, width, 1]`: Drawn as grayscale.
 *   - Rank-3 with shape `[height, width, 3]`: Drawn as RGB with alpha set in
 *     `imageOptions` (defaults to 1, which is opaque).
 *   - Rank-3 with shape `[height, width, 4]`: Drawn as RGBA.
 * @param canvas The canvas to draw to.
 * @param options The configuration arguments for image to be drawn and the
 *     canvas to draw to.
 *
 * @doc {heading: 'Browser', namespace: 'browser'}
 */
declare function draw(image: Tensor2D | Tensor3D | TensorLike, canvas: HTMLCanvasElement, options?: DrawOptions): void;

export declare interface DrawAttrs {
    canvas: HTMLCanvasElement;
    options?: DrawOptions;
}

export declare type DrawInputs = Pick<NamedTensorInfoMap, 'image'>;

declare interface DrawOptions {
    /**
     * Optional. An object of options to customize the values of image tensor.
     */
    imageOptions?: ImageOptions;
    /**
     * Optional. An object to configure the context of the canvas to draw to.
     */
    contextOptions?: ContextOptions;
}

export declare const dropout: typeof dropout_;

/**
 * Computes dropout.
 *
 * ```js
 * const x = tf.tensor1d([1, 2, 2, 1]);
 * const rate = 0.75;
 * const output = tf.dropout(x, rate);
 * output.print();
 * ```
 *
 * @param x A floating point Tensor or TensorLike.
 * @param rate A float in the range [0, 1). The probability that each element
 *   of x is discarded.
 * @param noiseShape An array of numbers of type int32, representing the
 * shape for randomly generated keep/drop flags. If the noiseShape has null
 * value, it will be automatically replaced with the x's relative dimension
 * size. Optional.
 * @param seed Used to create random seeds. Optional.
 * @returns A Tensor of the same shape of x.
 *
 * @doc {heading: 'Operations', subheading: 'Dropout'}
 */
declare function dropout_(x: Tensor | TensorLike, rate: number, noiseShape?: number[], seed?: number | string): Tensor;

export declare const Einsum = "Einsum";

export declare const einsum: typeof einsum_;

/**
 * Tensor contraction over specified indices and outer product.
 *
 * `einsum` allows defining Tensors by defining their element-wise computation.
 * This computation is based on
 * [Einstein summation](https://en.wikipedia.org/wiki/Einstein_notation).
 *
 * Some special cases include:
 *
 * Matrix multiplication:
 * ```js
 * const x = tf.tensor2d([[1, 2, 3], [4, 5, 6]]);
 * const y = tf.tensor2d([[0, 1], [2, 3], [4, 5]]);
 * x.print();
 * y.print();
 * tf.einsum('ij,jk->ik', x, y).print();
 * ```
 *
 * Dot product:
 * ```js
 * const x = tf.tensor1d([1, 2, 3]);
 * const y = tf.tensor1d([0, 1, 2]);
 * x.print();
 * y.print();
 * tf.einsum('i,i->', x, y).print();
 * ```
 *
 * Batch dot product:
 * ```js
 * const x = tf.tensor2d([[1, 2, 3], [4, 5, 6]]);
 * const y = tf.tensor2d([[0, 1, 2], [3, 4, 5]]);
 * x.print();
 * y.print();
 * tf.einsum('bi,bi->b', x, y).print();
 * ```
 *
 * Outer prouduct:
 * ```js
 * const x = tf.tensor1d([1, 3, 5]);
 * const y = tf.tensor1d([2, 4, 6]);
 * x.print();
 * y.print();
 * tf.einsum('i,j->ij', x, y).print();
 * ```
 *
 * Matrix transpose:
 * ```js
 * const x = tf.tensor2d([[1, 2], [3, 4]]);
 * x.print();
 * tf.einsum('ij->ji', x).print();
 * ```
 *
 * Batch matrix transpose:
 * ```js
 * const x = tf.tensor3d([[[1, 2], [3, 4]], [[-1, -2], [-3, -4]]]);
 * x.print();
 * tf.einsum('bij->bji', x).print();
 * ```
 *
 * Limitations:
 *
 * This implementation of einsum has the following limitations:
 *
 * - Does not support >2 input tensors.
 * - Does not support duplicate axes for any given input tensor. E.g., equation
 *   'ii->' is not supported.
 * - The `...` notation is not supported.
 *
 * @param equation a string describing the contraction, in the same format as
 * [numpy.einsum](https://numpy.org/doc/stable/reference/generated/numpy.einsum.html).
 * @param tensors the input(s) to contract (each one a Tensor), whose shapes
 *     should be consistent with equation.
 * @returns The output tensor.
 *
 * @doc {heading: 'Tensors', subheading: 'Matrices'}
 */
declare function einsum_(equation: string, ...tensors: Tensor[]): Tensor;

export declare interface EinsumAttrs {
    equation: string;
}

export declare type EinsumInputs = TensorInfo[];

declare function eitherStridesOrDilationsAreOne(strides: number | number[], dilations: number | number[]): boolean;

export declare const Elu = "Elu";

export declare const elu: typeof elu_;

/**
 * Computes exponential linear element-wise: `x > 0 ? x : (e ^ x) - 1`.
 *
 * ```js
 * const x = tf.tensor1d([-1, 1, -3, 2]);
 *
 * x.elu().print();  // or tf.elu(x)
 * ```
 * @param x The input tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function elu_<T extends Tensor>(x: T | TensorLike): T;

export declare const EluGrad = "EluGrad";

export declare type EluGradInputs = Pick<NamedTensorInfoMap, 'dy' | 'y'>;

export declare type EluInputs = Pick<NamedTensorInfoMap, 'x'>;

/**
 * Enables debug mode which will log information about all executed kernels:
 * the elapsed time of the kernel execution, as well as the rank, shape, and
 * size of the output tensor.
 *
 * Debug mode will significantly slow down your application as it will
 * download the result of every operation to the CPU. This should not be used in
 * production. Debug mode does not affect the timing information of the kernel
 * execution as we do not measure download time in the kernel execution time.
 *
 * See also: `tf.profile`, `tf.memory`.
 *
 * @doc {heading: 'Environment'}
 */
export declare function enableDebugMode(): void;

/**
 * Enables production mode which disables correctness checks in favor of
 * performance.
 *
 * @doc {heading: 'Environment'}
 */
export declare function enableProdMode(): void;

export declare function enclosingPowerOfTwo(value: number): number;

/**
 * Encodes the provided string into bytes using the provided encoding scheme.
 *
 * @param s The string to encode.
 * @param encoding The encoding scheme. Defaults to utf-8.
 *
 * @doc {heading: 'Util'}
 */
declare function encodeString(s: string, encoding?: string): Uint8Array;

/** Encodes strings into utf-8 bytes. */
declare function encodeStrings(a: RecursiveArray<{}>): RecursiveArray<Uint8Array>;

/**
 * Encode a map from names to weight values as an ArrayBuffer, along with an
 * `Array` of `WeightsManifestEntry` as specification of the encoded weights.
 *
 * This function does not perform sharding.
 *
 * This function is the reverse of `decodeWeights`.
 *
 * @param tensors A map ("dict") from names to tensors.
 * @param group Group to which the weights belong (optional).
 * @returns A `Promise` of
 *   - A flat `ArrayBuffer` with all the binary values of the `Tensor`s
 *     concatenated.
 *   - An `Array` of `WeightManifestEntry`s, carrying information including
 *     tensor names, `dtype`s and shapes.
 * @throws Error: on unsupported tensor `dtype`.
 */
declare function encodeWeights(tensors: NamedTensorMap | NamedTensor[], group?: WeightGroup): Promise<{
    data: ArrayBuffer;
    specs: WeightsManifestEntry[];
}>;

declare class Engine implements TensorTracker, DataMover {
    ENV: Environment;
    state: EngineState;
    backendName: string;
    registry: {
        [id: string]: KernelBackend;
    };
    registryFactory: {
        [id: string]: {
            factory: () => KernelBackend | Promise<KernelBackend>;
            priority: number;
        };
    };
    private profiler;
    private backendInstance;
    private pendingBackendInit;
    private pendingBackendInitId;
    constructor(ENV: Environment);
    ready(): Promise<void>;
    get backend(): KernelBackend;
    backendNames(): string[];
    findBackend(backendName: string): KernelBackend;
    findBackendFactory(backendName: string): () => KernelBackend | Promise<KernelBackend>;
    registerBackend(backendName: string, factory: () => KernelBackend | Promise<KernelBackend>, priority?: number): boolean;
    setBackend(backendName: string): Promise<boolean>;
    private setupRegisteredKernels;
    private disposeRegisteredKernels;
    /**
     * Initializes a backend by looking up the backend name in the factory
     * registry and calling the factory method. Returns a boolean representing
     * whether the initialization of the backend suceeded. Throws an error if
     * there is no backend in the factory registry.
     */
    private initializeBackend;
    removeBackend(backendName: string): void;
    private getSortedBackends;
    private initializeBackendsAndReturnBest;
    moveData(backend: KernelBackend, dataId: DataId): void;
    tidy<T extends TensorContainer>(nameOrFn: string | ScopeFn<T>, fn?: ScopeFn<T>): T;
    private scopedRun;
    private static nextTensorId;
    private nextTensorId;
    private static nextVariableId;
    private nextVariableId;
    /**
     * This method is called instead of the public-facing tensor.clone() when
     * saving a tensor for backwards pass. It makes sure to add the clone
     * operation to the tape regardless of being called inside a kernel
     * execution.
     */
    private clone;
    /**
     * Execute a kernel with the given name and return the output tensor.
     *
     * @param kernelName The name of the kernel to execute.
     * @param inputs A map of input names to tensors.
     * @param attrs A map of attribute names to their values. An attribute is a
     *     primitive (non-tensor) input to the kernel.
     * @param inputsToSave A list of tensors, inputs to save for the backprop
     *     computation.
     * @param outputsToSave A list of booleans, specifying which output to save
     *     for the backprop computation. These are booleans since the output
     * tensors are not visible to the user.
     */
    runKernel<T extends Tensor | Tensor[]>(kernelName: string, inputs: NamedTensorMap, attrs?: NamedAttrMap): T;
    private shouldCheckForMemLeaks;
    private checkKernelForMemLeak;
    /**
     * Internal helper method to execute a kernel Func
     *
     * Use `runKernel` to execute kernels from outside of engine.
     */
    private runKernelFunc;
    /**
     * Saves tensors used in forward mode for use in backward mode.
     *
     * @param tensors the list of tensors to save.
     */
    private saveTensorsForBackwardMode;
    /**
     * Returns a list of tensors to save for a given gradient calculation.
     *
     * @param kernelName name of kernel to look up gradient for.
     * @param inputs a map of input tensors.
     * @param outputs an array of output tensors from forward mode of kernel.
     */
    private getTensorsForGradient;
    /**
     * Internal method used by public APIs for tensor creation. Makes a new
     * tensor with the provided shape, dtype and values. It always
     * creates a new data id and writes the values to the underlying backend.
     */
    makeTensor(values: DataValues, shape: number[], dtype: DataType, backend?: KernelBackend): Tensor;
    /**
     * Internal method used by backends. Makes a new tensor
     * that is a wrapper around an existing data id. It doesn't create
     * a new data id, only increments the ref count used in memory tracking.
     * @deprecated
     */
    makeTensorFromDataId(dataId: DataId, shape: number[], dtype: DataType, backend?: KernelBackend): Tensor;
    /**
     * Internal method used by backends. Makes a new tensor that is a wrapper
     * around an existing data id in TensorInfo. It doesn't create a new data id,
     * only increments the ref count used in memory tracking.
     */
    makeTensorFromTensorInfo(tensorInfo: TensorInfo, backend?: KernelBackend): Tensor;
    makeVariable(initialValue: Tensor, trainable?: boolean, name?: string, dtype?: DataType): Variable;
    trackTensor(a: Tensor, backend: KernelBackend): void;
    incRef(a: Tensor, backend: KernelBackend): void;
    removeDataId(dataId: DataId, backend: KernelBackend): void;
    disposeTensor(a: Tensor): void;
    disposeVariables(): void;
    disposeVariable(v: Variable): void;
    memory(): MemoryInfo;
    profile(query: () => (TensorContainer | Promise<TensorContainer>)): Promise<ProfileInfo>;
    isTapeOn(): boolean;
    private addTapeNode;
    keep<T extends Tensor>(result: T): T;
    private startTape;
    private endTape;
    /**
     * Start a scope. Use this with endScope() to achieve the same functionality
     * as scope() without the need for a function closure.
     */
    startScope(name?: string): void;
    /**
     * End a scope. Use this with startScope() to achieve the same functionality
     * as scope() without the need for a function closure.
     */
    endScope(result?: TensorContainer): void;
    /**
     * Returns gradients of `f` with respect to each of the `xs`. The gradients
     * returned are of the same length as `xs`, but some might be null if `f`
     * was not a function of that `x`. It also takes optional dy to multiply the
     * gradient, which defaults to `1`.
     */
    gradients<T extends Tensor>(f: () => T, xs: Tensor[], dy?: T, allowNoGradients?: boolean): {
        value: T;
        grads: Tensor[];
    };
    customGrad<T extends Tensor>(f: CustomGradientFunc<T>): (...args: Array<Tensor | GradSaveFunc>) => T;
    readSync(dataId: DataId): BackendValues;
    read(dataId: DataId): Promise<BackendValues>;
    readToGPU(dataId: DataId, options?: DataToGPUOptions): GPUData;
    time(query: () => void): Promise<TimingInfo>;
    /**
     * Tracks a Tensor in the current scope to be automatically cleaned up
     * when the current scope ends, and returns the value.
     *
     * @param result The Tensor to track in the current scope.
     */
    private track;
    get registeredVariables(): NamedVariableMap;
    /**
     * Resets the engine state. Removes all backends but does not remove
     * registered backend factories.
     */
    reset(): void;
}

/**
 * It returns the global engine that keeps track of all tensors and backends.
 *
 * @doc {heading: 'Environment'}
 */
export declare function engine(): Engine;

declare class EngineState {
    registeredVariables: NamedVariableMap;
    nextTapeNodeId: number;
    numBytes: number;
    numTensors: number;
    numStringTensors: number;
    numDataBuffers: number;
    activeTape: TapeNode[];
    gradientDepth: number;
    kernelDepth: number;
    activeScope: ScopeState;
    scopeStack: ScopeState[];
    /**
     * Keeps track of the number of data moves during a kernel execution. We
     * maintain a stack since kernels can call other kernels, recursively.
     */
    numDataMovesStack: number[];
    nextScopeId: number;
    tensorInfo: WeakMap<object, {
        backend: KernelBackend;
        bytes: number;
        dtype: DataType;
        shape: number[];
    }>;
    profiling: boolean;
    activeProfile: ProfileInfo;
    dispose(): void;
}

export declare const ensureShape: typeof ensureShape_;

/**
 * Checks the input tensor mathes the given shape.
 *
 * Given an input tensor, returns a new tensor with the same values as the
 * input tensor with shape `shape`.
 *
 * The method supports the null value in tensor. It will still check the shapes,
 * and null is a placeholder.
 *
 *
 * ```js
 * const x = tf.tensor1d([1, 2, 3, 4]);
 * const y = tf.tensor1d([1, null, 3, 4]);
 * const z = tf.tensor2d([1, 2, 3, 4], [2,2]);
 * tf.ensureShape(x, [4]).print();
 * tf.ensureShape(y, [4]).print();
 * tf.ensureShape(z, [null, 2]).print();
 * ```
 *
 * @param x The input tensor to be ensured.
 * @param shape A TensorShape representing the shape of this tensor, an array
 *     or null.
 *
 * @doc {heading: 'Tensors', subheading: 'Transformations'}
 */
declare function ensureShape_<R extends Rank>(x: Tensor, shape: ShapeMap[R]): Tensor;

export declare let ENV: Environment;

/**
 * Returns the current environment (a global singleton).
 *
 * The environment object contains the evaluated feature values as well as the
 * active platform.
 *
 * @doc {heading: 'Environment'}
 */
export declare function env(): Environment;

/**
 * The environment contains evaluated flags as well as the registered platform.
 * This is always used as a global singleton and can be retrieved with
 * `tf.env()`.
 *
 * @doc {heading: 'Environment'}
 */
export declare class Environment {
    global: any;
    private flags;
    private flagRegistry;
    private urlFlags;
    platformName: string;
    platform: Platform;
    getQueryParams: typeof getQueryParams;
    constructor(global: any);
    setPlatform(platformName: string, platform: Platform): void;
    registerFlag(flagName: string, evaluationFn: FlagEvaluationFn, setHook?: (value: FlagValue) => void): void;
    getAsync(flagName: string): Promise<FlagValue>;
    get(flagName: string): FlagValue;
    getNumber(flagName: string): number;
    getBool(flagName: string): boolean;
    getString(flagName: string): string;
    getFlags(): Flags;
    get features(): Flags;
    set(flagName: string, value: FlagValue): void;
    private evaluateFlag;
    setFlags(flags: Flags): void;
    reset(): void;
    private populateURLFlags;
}

export declare const Equal = "Equal";

export declare const equal: typeof equal_;

/**
 * Returns the truth value of (a == b) element-wise. Supports broadcasting.
 *
 * ```js
 * const a = tf.tensor1d([1, 2, 3]);
 * const b = tf.tensor1d([2, 2, 2]);
 *
 * a.equal(b).print();
 * ```
 *
 * @param a The first input tensor.
 * @param b The second input tensor. Must have the same dtype as `a`.
 *
 * @doc {heading: 'Operations', subheading: 'Logical'}
 */
declare function equal_<T extends Tensor>(a: Tensor | TensorLike, b: Tensor | TensorLike): T;

export declare type EqualInputs = BinaryInputs;

export declare const Erf = "Erf";

export declare const erf: typeof erf_;

/**
 * Computes Gauss error function of the input `tf.Tensor` element-wise:
 * `erf(x)`
 *
 * ```js
 * const x = tf.tensor1d([0, .1, -.1, .7]);
 *
 * x.erf().print(); // or tf.erf(x);
 * ```
 * @param x The input tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function erf_<T extends Tensor>(x: T | TensorLike): T;

declare const ERF_A1 = 0.254829592;

declare const ERF_A2 = -0.284496736;

declare const ERF_A3 = 1.421413741;

declare const ERF_A4 = -1.453152027;

declare const ERF_A5 = 1.061405429;

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
declare const ERF_P = 0.3275911;

export declare type ErfInputs = UnaryInputs;

export declare const euclideanNorm: typeof euclideanNorm_;

/**
 * Computes the Euclidean norm of scalar, vectors, and matrices.
 *
 * ```js
 * const x = tf.tensor1d([1, 2, 3, 4]);
 *
 * x.euclideanNorm().print();  // or tf.euclideanNorm(x)
 * ```
 *
 * @param x The input array.
 * @param axis Optional. If axis is null (the default), the input is
 * considered a vector and a single vector norm is computed over the entire
 * set of values in the Tensor, i.e. euclideanNorm(x) is equivalent
 * to euclideanNorm(x.reshape([-1])). If axis is an integer, the input
 * is considered a batch of vectors, and axis determines the axis in x
 * over which to compute vector norms. If axis is a 2-tuple of integer it is
 * considered a batch of matrices and axis determines the axes in NDArray
 * over which to compute a matrix norm.
 * @param keepDims Optional. If true, the norm has the same dimensionality
 * as the input.
 *
 * @doc {heading: 'Operations', subheading: 'Matrices'}
 */
declare function euclideanNorm_(x: Tensor | TensorLike, axis?: number | number[], keepDims?: boolean): Tensor;

export declare const Exp = "Exp";

export declare const exp: typeof exp_;

/**
 * Computes exponential of the input `tf.Tensor` element-wise. `e ^ x`
 *
 * ```js
 * const x = tf.tensor1d([1, 2, -3]);
 *
 * x.exp().print();  // or tf.exp(x)
 * ```
 * @param x The input tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function exp_<T extends Tensor>(x: T | TensorLike): T;

export declare const ExpandDims = "ExpandDims";

export declare const expandDims: typeof expandDims_;

/**
 * Returns a `tf.Tensor` that has expanded rank, by inserting a dimension
 * into the tensor's shape.
 *
 * ```js
 * const x = tf.tensor1d([1, 2, 3, 4]);
 * const axis = 1;
 * x.expandDims(axis).print();
 * ```
 *
 * @param x The input tensor whose dimensions are to be expanded.
 * @param axis The dimension index at which to insert shape of `1`. Defaults
 *     to 0 (the first dimension).
 *
 * @doc {heading: 'Tensors', subheading: 'Transformations'}
 */
declare function expandDims_<T extends Tensor>(x: Tensor | TensorLike, axis?: number): T;

export declare interface ExpandDimsAttrs {
    dim: number;
}

export declare type ExpandDimsInputs = Pick<NamedTensorInfoMap, 'input'>;

declare function expandShapeToKeepDim(shape: number[], axes: number[]): number[];

declare function expectArrayBuffersEqual(actual: ArrayBuffer, expected: ArrayBuffer): void;

declare function expectArraysClose(actual: TypedArray | number | RecursiveArray<number>, expected: TypedArray | number | RecursiveArray<number>, epsilon?: number): void;

declare function expectArraysEqual(actual: TensorLike, expected: TensorLike): void;

declare function expectNumbersClose(a: number, e: number, epsilon?: number): void;

declare function expectPromiseToFail(fn: () => Promise<{}>, done: DoneFn_2): void;

declare function expectValuesInRange(actual: TypedArray | number[], low: number, high: number): void;

export declare type ExpInputs = UnaryInputs;

declare type ExplicitPadding = [
[number, number],
[number, number],
[number, number],
[number, number]
];

export declare const Expm1 = "Expm1";

export declare const expm1: typeof expm1_;

/**
 * Computes exponential of the input `tf.Tensor` minus one element-wise.
 * `e ^ x - 1`
 *
 * ```js
 * const x = tf.tensor1d([1, 2, -3]);
 *
 * x.expm1().print();  // or tf.expm1(x)
 * ```
 * @param x The input tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function expm1_<T extends Tensor>(x: T | TensorLike): T;

export declare type Expm1Inputs = UnaryInputs;

/**
 * Make the exponent term used by FFT.
 */
declare function exponent(k: number, n: number, inverse: boolean): {
    real: number;
    imag: number;
};

/**
 * Make the list of exponent terms used by FFT.
 */
declare function exponents(n: number, inverse: boolean): {
    real: Float32Array;
    imag: Float32Array;
};

export declare const eye: typeof eye_;

/**
 * Create an identity matrix.
 *
 * @param numRows Number of rows.
 * @param numColumns Number of columns. Defaults to `numRows`.
 * @param batchShape If provided, will add the batch shape to the beginning
 *   of the shape of the returned `tf.Tensor` by repeating the identity
 *   matrix.
 * @param dtype Data type.
 * @returns Identity matrix of the specified size and data type, possibly
 *   with batch repetition if `batchShape` is specified.
 *
 * @doc {heading: 'Tensors', subheading: 'Creation'}
 */
declare function eye_(numRows: number, numColumns?: number, batchShape?: [
number
] | [
number,
number
] | [number, number, number] | [number, number, number, number], dtype?: DataType): Tensor2D;

/**
 * Returns a platform-specific implementation of
 * [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).
 *
 * If `fetch` is defined on the global object (`window`, `process`, etc.),
 * `tf.util.fetch` returns that function.
 *
 * If not, `tf.util.fetch` returns a platform-specific solution.
 *
 * ```js
 * const resource = await tf.util.fetch('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs');
 * // handle response
 * ```
 *
 * @doc {heading: 'Util'}
 */
declare function fetch_2(path: string, requestInits?: RequestInit): Promise<Response>;

export declare const FFT = "FFT";

export declare const fft: typeof fft_;

/**
 * Fast Fourier transform.
 *
 * Computes the 1-dimensional discrete Fourier transform over the inner-most
 * dimension of input.
 *
 * ```js
 * const real = tf.tensor1d([1, 2, 3]);
 * const imag = tf.tensor1d([1, 2, 3]);
 * const x = tf.complex(real, imag);
 *
 * x.fft().print();  // tf.spectral.fft(x).print();
 * ```
 * @param input The complex input to compute an fft over.
 *
 * @doc {heading: 'Operations', subheading: 'Spectral', namespace: 'spectral'}
 */
declare function fft_(input: Tensor): Tensor;

export declare type FFTInputs = Pick<NamedTensorInfoMap, 'input'>;

export declare const Fill = "Fill";

/**
 * Creates a `tf.Tensor` filled with a scalar value.
 *
 * ```js
 * tf.fill([2, 2], 4).print();
 * ```
 *
 * @param shape An array of integers defining the output tensor shape.
 * @param value The scalar value to fill the tensor with.
 * @param dtype The type of an element in the resulting tensor. Defaults to
 *     'float32' if the given param value is a number, otherwise 'string'.
 *
 * @doc {heading: 'Tensors', subheading: 'Creation'}
 */
export declare function fill<R extends Rank>(shape: ShapeMap[R], value: number | string, dtype?: DataType): Tensor<R>;

export declare interface FillAttrs {
    shape: number[];
    value: number | string;
    dtype: DataType;
}

/**
 * Finds the backend registered under the provided name. Returns null if the
 * name is not in the registry, or the registration hasn't finished yet.
 */
export declare function findBackend(name: string): KernelBackend;

/**
 * Finds the backend factory registered under the provided name. Returns a
 * function that produces a new backend when called. Returns null if the name
 * is not in the registry.
 */
export declare function findBackendFactory(name: string): () => KernelBackend | Promise<KernelBackend>;

declare function fingerPrint64(s: Uint8Array, len?: number): Long;

declare type FlagEvaluationFn = (() => FlagValue) | (() => Promise<FlagValue>);

declare type Flags = {
    [featureName: string]: FlagValue;
};

declare type FlagValue = number | boolean | string;

/**
 *  Flattens an arbitrarily nested array.
 *
 * ```js
 * const a = [[1, 2], [3, 4], [5, [6, [7]]]];
 * const flat = tf.util.flatten(a);
 * console.log(flat);
 * ```
 *
 *  @param arr The nested array to flatten.
 *  @param result The destination array which holds the elements.
 *  @param skipTypedArray If true, avoids flattening the typed arrays. Defaults
 *      to false.
 *
 * @doc {heading: 'Util', namespace: 'util'}
 */
declare function flatten<T extends number | boolean | string | Promise<number> | TypedArray>(arr: T | RecursiveArray<T>, result?: T[], skipTypedArray?: boolean): T[];

declare type FlatVector = boolean[] | number[] | TypedArray;

export declare const FlipLeftRight = "FlipLeftRight";

export declare type FlipLeftRightInputs = Pick<NamedTensorInfoMap, 'image'>;

export declare const Floor = "Floor";

export declare const floor: typeof floor_;

/**
 * Computes floor of input `tf.Tensor` element-wise: `floor(x)`.
 *
 * ```js
 * const x = tf.tensor1d([.6, 1.1, -3.3]);
 *
 * x.floor().print();  // or tf.floor(x)
 * ```
 * @param x The input tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function floor_<T extends Tensor>(x: T | TensorLike): T;

export declare const FloorDiv = "FloorDiv";

export declare const floorDiv: typeof floorDiv_;

/**
 * Divides two `tf.Tensor`s element-wise, A / B. Supports broadcasting.
 * The result is rounded with floor function.
 *
 *
 * ```js
 * const a = tf.tensor1d([1, 4, 9, 16]);
 * const b = tf.tensor1d([1, 2, 3, 4]);
 *
 * a.floorDiv(b).print();  // or tf.div(a, b)
 * ```
 *
 * ```js
 * // Broadcast div a with b.
 * const a = tf.tensor1d([2, 4, 6, 8]);
 * const b = tf.scalar(2);
 *
 * a.floorDiv(b).print();  // or tf.floorDiv(a, b)
 * ```
 *
 * @param a The first tensor as the numerator.
 * @param b The second tensor as the denominator. Must have the same dtype as
 * `a`.
 *
 * @doc {heading: 'Operations', subheading: 'Arithmetic'}
 */
declare function floorDiv_<T extends Tensor>(a: Tensor | TensorLike, b: Tensor | TensorLike): T;

export declare type FloorDivInputs = BinaryInputs;

export declare type FloorInputs = UnaryInputs;

/**
 * A function that computes an output. The save function is for saving tensors
 * computed in the forward pass, that we need in the backward pass.
 */
export declare type ForwardFunc<T> = (backend: KernelBackend, save?: GradSaveFunc) => T;

declare type FromConfigMethod<T extends Serializable> = (cls: SerializableConstructor<T>, config: ConfigDict) => T;

/**
 * Creates an IOHandler that loads model artifacts from memory.
 *
 * When used in conjunction with `tf.loadLayersModel`, an instance of
 * `tf.LayersModel` (Keras-style) can be constructed from the loaded artifacts.
 *
 * ```js
 * const model = await tf.loadLayersModel(tf.io.fromMemory(
 *     modelTopology, weightSpecs, weightData));
 * ```
 *
 * @param modelArtifacts a object containing model topology (i.e., parsed from
 *   the JSON format).
 * @param weightSpecs An array of `WeightsManifestEntry` objects describing the
 *   names, shapes, types, and quantization of the weight data. Optional.
 * @param weightData A single `ArrayBuffer` containing the weight data,
 *   concatenated in the order described by the weightSpecs. Optional.
 * @param trainingConfig Model training configuration. Optional.
 *
 * @returns A passthrough `IOHandler` that simply loads the provided data.
 */
declare function fromMemory(modelArtifacts: {} | ModelArtifacts, weightSpecs?: WeightsManifestEntry[], weightData?: WeightData, trainingConfig?: TrainingConfig): IOHandler;

/**
 * Creates an IOHandler that loads model artifacts from memory.
 *
 * When used in conjunction with `tf.loadLayersModel`, an instance of
 * `tf.LayersModel` (Keras-style) can be constructed from the loaded artifacts.
 *
 * ```js
 * const model = await tf.loadLayersModel(tf.io.fromMemory(
 *     modelTopology, weightSpecs, weightData));
 * ```
 *
 * @param modelArtifacts a object containing model topology (i.e., parsed from
 *   the JSON format).
 * @param weightSpecs An array of `WeightsManifestEntry` objects describing the
 *   names, shapes, types, and quantization of the weight data. Optional.
 * @param weightData A single `ArrayBuffer` containing the weight data,
 *   concatenated in the order described by the weightSpecs. Optional.
 * @param trainingConfig Model training configuration. Optional.
 *
 * @returns A passthrough `IOHandlerSync` that simply loads the provided data.
 */
declare function fromMemorySync(modelArtifacts: {} | ModelArtifacts, weightSpecs?: WeightsManifestEntry[], weightData?: WeightData, trainingConfig?: TrainingConfig): IOHandlerSync;

export declare const FromPixels = "FromPixels";

declare const fromPixels: typeof fromPixels_;

/**
 * Creates a `tf.Tensor` from an image.
 *
 * ```js
 * const image = new ImageData(1, 1);
 * image.data[0] = 100;
 * image.data[1] = 150;
 * image.data[2] = 200;
 * image.data[3] = 255;
 *
 * tf.browser.fromPixels(image).print();
 * ```
 *
 * @param pixels The input image to construct the tensor from. The
 * supported image types are all 4-channel. You can also pass in an image
 * object with following attributes:
 * `{data: Uint8Array; width: number; height: number}`
 * @param numChannels The number of channels of the output tensor. A
 * numChannels value less than 4 allows you to ignore channels. Defaults to
 * 3 (ignores alpha channel of input image).
 *
 * @returns A Tensor3D with the shape `[height, width, numChannels]`.
 *
 * Note: fromPixels can be lossy in some cases, same image may result in
 * slightly different tensor values, if rendered by different rendering
 * engines. This means that results from different browsers, or even same
 * browser with CPU and GPU rendering engines can be different. See discussion
 * in details:
 * https://github.com/tensorflow/tfjs/issues/5482
 *
 * @doc {heading: 'Browser', namespace: 'browser', ignoreCI: true}
 */
declare function fromPixels_(pixels: PixelData | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap, numChannels?: number): Tensor3D;

/**
 * Creates a `tf.Tensor` from an image in async way.
 *
 * ```js
 * const image = new ImageData(1, 1);
 * image.data[0] = 100;
 * image.data[1] = 150;
 * image.data[2] = 200;
 * image.data[3] = 255;
 *
 * (await tf.browser.fromPixelsAsync(image)).print();
 * ```
 * This API is the async version of fromPixels. The API will first
 * check |WRAP_TO_IMAGEBITMAP| flag, and try to wrap the input to
 * imageBitmap if the flag is set to true.
 *
 * @param pixels The input image to construct the tensor from. The
 * supported image types are all 4-channel. You can also pass in an image
 * object with following attributes:
 * `{data: Uint8Array; width: number; height: number}`
 * @param numChannels The number of channels of the output tensor. A
 * numChannels value less than 4 allows you to ignore channels. Defaults to
 * 3 (ignores alpha channel of input image).
 *
 * @doc {heading: 'Browser', namespace: 'browser', ignoreCI: true}
 */
declare function fromPixelsAsync(pixels: PixelData | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap, numChannels?: number): Promise<Tensor3D>;

export declare interface FromPixelsAttrs {
    numChannels: number;
}

export declare interface FromPixelsInputs {
    pixels: PixelData | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap;
}

declare function fromStringArrayToUint8(strings: string[]): Uint8Array[];

declare function fromUint8ToStringArray(vals: Uint8Array[]): string[];

declare namespace fused {
    export {
        Activation,
        conv2d_2 as conv2d,
        depthwiseConv2d_2 as depthwiseConv2d,
        matMul_2 as matMul
    }
}
export { fused }

declare type FusedBatchMatMulConfig = {
    a: Tensor3D;
    b: Tensor3D;
    transposeA: boolean;
    transposeB: boolean;
    bias?: Tensor;
    activation?: Activation;
    preluActivationWeights?: Tensor;
    leakyreluAlpha?: number;
};

export declare const FusedBatchNorm = "FusedBatchNorm";

export declare interface FusedBatchNormAttrs {
    varianceEpsilon: number;
}

export declare type FusedBatchNormInputs = Pick<NamedTensorInfoMap, 'x' | 'scale' | 'offset' | 'mean' | 'variance'>;

export declare const FusedConv2D = "FusedConv2D";

/**
 * Computes a 2D convolution over the input x, optionally fused with adding a
 * bias and applying an activation.
 *
 * ```js
 * const inputDepth = 2;
 * const inShape = [2, 2, 2, inputDepth];
 * const outputDepth = 2;
 * const fSize = 1;
 * const pad = 0;
 * const strides = 1;
 *
 * const x = tf.tensor4d( [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
 * 16], inShape);
 * const w = tf.tensor4d([-1, 1, -2, 0.5], [fSize, fSize, inputDepth,
 * outputDepth]);
 *
 * tf.fused.conv2d({ x, filter: w, strides, pad, dataFormat: 'NHWC',
 * dilations: [1, 1], bias: tf.scalar(5), activation: 'relu' }).print();
 * ```
 *
 * @param obj An object with the following properties:
 * @param x The input tensor, of rank 4 or rank 3, of shape
 *     `[batch, height, width, inChannels]`. If rank 3, batch of 1 is
 * assumed.
 * @param filter The filter, rank 4, of shape
 *     `[filterHeight, filterWidth, inDepth, outDepth]`.
 * @param strides The strides of the convolution: `[strideHeight,
 * strideWidth]`.
 * @param pad The type of padding algorithm.
 *   - `same` and stride 1: output will be of same size as input,
 *       regardless of filter size.
 *   - `valid` output will be smaller than input if filter is larger
 *       than 1x1.
 *   - For more info, see this guide:
 *     [https://www.tensorflow.org/api_docs/python/tf/nn/convolution](
 *          https://www.tensorflow.org/api_docs/python/tf/nn/convolution)
 * @param dataFormat An optional string from: "NHWC", "NCHW". Defaults to
 *     "NHWC". Specify the data format of the input and output data. With the
 *     default format "NHWC", the data is stored in the order of: [batch,
 *     height, width, channels]. Only "NHWC" is currently supported.
 * @param dilations The dilation rates: `[dilationHeight, dilationWidth]`
 *     in which we sample input values across the height and width dimensions
 *     in atrous convolution. Defaults to `[1, 1]`. If `dilations` is a single
 *     number, then `dilationHeight == dilationWidth`. If it is greater than
 *     1, then all values of `strides` must be 1.
 * @param dimRoundingMode A string from: 'ceil', 'round', 'floor'. If none is
 *     provided, it will default to truncate.
 * @param bias Tensor to be added to the result.
 * @param activation Name of activation kernel (defaults to `linear`) to be
 *     applied
 *      after biasAdd.
 * @param preluActivationWeights Tensor of prelu weights to be applied as part
 *     of a `prelu` activation, typically the same shape as `x`.
 * @param leakyreluAlpha Optional. Alpha to be applied as part of a `leakyrelu`
 *     activation.
 */
declare function fusedConv2d_<T extends Tensor3D | Tensor4D>({ x, filter, strides, pad, dataFormat, dilations, dimRoundingMode, bias, activation, preluActivationWeights, leakyreluAlpha }: {
    x: T | TensorLike;
    filter: Tensor4D | TensorLike;
    strides: [number, number] | number;
    pad: 'valid' | 'same' | number | conv_util.ExplicitPadding;
    dataFormat?: 'NHWC' | 'NCHW';
    dilations?: [number, number] | number;
    dimRoundingMode?: 'floor' | 'round' | 'ceil';
    bias?: Tensor | TensorLike;
    activation?: Activation;
    preluActivationWeights?: Tensor;
    leakyreluAlpha?: number;
}): T;

export declare interface FusedConv2DAttrs {
    strides: [number, number] | number;
    pad: 'valid' | 'same' | number | ExplicitPadding;
    dataFormat: 'NHWC' | 'NCHW';
    dilations: [number, number] | number;
    dimRoundingMode: 'floor' | 'round' | 'ceil';
    activation: Activation;
    leakyreluAlpha?: number;
}

declare type FusedConv2DConfig = {
    input: Tensor4D;
    filter: Tensor4D;
    convInfo: Conv2DInfo;
    bias?: Tensor;
    activation?: Activation;
    preluActivationWeights?: Tensor;
    leakyreluAlpha?: number;
};

export declare interface FusedConv2DInputs extends NamedTensorInfoMap {
    x: TensorInfo;
    filter: TensorInfo;
    bias?: TensorInfo;
    preluActivationWeights?: TensorInfo;
}

export declare const FusedDepthwiseConv2D = "FusedDepthwiseConv2D";

/**
 * Computes depthwise 2D convolution, optionally fused with adding a
 * bias and applying an activation.
 *
 * Given a 4D `input` array and a `filter` array of shape
 * `[filterHeight, filterWidth, inChannels, channelMultiplier]` containing
 * `inChannels` convolutional filters of depth 1, this op applies a
 * different filter to each input channel (expanding from 1 channel to
 * `channelMultiplier` channels for each), then concatenates the results
 * together. The output has `inChannels * channelMultiplier` channels.
 *
 * See
 * [https://www.tensorflow.org/api_docs/python/tf/nn/depthwise_conv2d](
 *     https://www.tensorflow.org/api_docs/python/tf/nn/depthwise_conv2d)
 * for more details.
 *
 * @param obj An object with the following properties:
 * @param x The input tensor, of rank 4 or rank 3, of shape
 *     `[batch, height, width, inChannels]`. If rank 3, batch of 1 is
 * assumed.
 * @param filter The filter tensor, rank 4, of shape
 *     `[filterHeight, filterWidth, inChannels, channelMultiplier]`.
 * @param strides The strides of the convolution: `[strideHeight,
 * strideWidth]`. If strides is a single number, then `strideHeight ==
 * strideWidth`.
 * @param pad The type of padding algorithm.
 *   - `same` and stride 1: output will be of same size as input,
 *       regardless of filter size.
 *   - `valid`: output will be smaller than input if filter is larger
 *       than 1x1.
 *   - For more info, see this guide:
 *     [https://www.tensorflow.org/api_docs/python/tf/nn/convolution](
 *          https://www.tensorflow.org/api_docs/python/tf/nn/convolution)
 * @param dilations The dilation rates: `[dilationHeight, dilationWidth]`
 *     in which we sample input values across the height and width dimensions
 *     in atrous convolution. Defaults to `[1, 1]`. If `rate` is a single
 *     number, then `dilationHeight == dilationWidth`. If it is greater than
 *     1, then all values of `strides` must be 1.
 * @param dataFormat: An optional string from: "NHWC", "NCHW". Defaults to
 *     "NHWC". Specify the data format of the input and output data. With the
 *     default format "NHWC", the data is stored in the order of: [batch,
 *     height, width, channels]. Only "NHWC" is currently supported.
 * @param dimRoundingMode A string from: 'ceil', 'round', 'floor'. If none is
 *     provided, it will default to truncate.
 * @param bias Tensor to be added to the result.
 * @param activation Name of activation kernel (defaults to `linear`).
 * @param preluActivationWeights Tensor of prelu weights to be applied as part
 *     of a `prelu` activation, typically the same shape as `x`.
 * @param leakyreluAlpha Optional. Alpha to be applied as part of a `leakyrelu`
 *     activation.
 */
declare function fusedDepthwiseConv2d_<T extends Tensor3D | Tensor4D>({ x, filter, strides, pad, dataFormat, dilations, dimRoundingMode, bias, activation, preluActivationWeights, leakyreluAlpha }: {
    x: T | TensorLike;
    filter: Tensor4D | TensorLike;
    strides: [number, number] | number;
    pad: 'valid' | 'same' | number;
    dataFormat?: 'NHWC' | 'NCHW';
    dilations?: [number, number] | number;
    dimRoundingMode?: 'floor' | 'round' | 'ceil';
    bias?: Tensor | TensorLike;
    activation?: Activation;
    preluActivationWeights?: Tensor;
    leakyreluAlpha?: number;
}): T;

export declare interface FusedDepthwiseConv2DAttrs {
    strides: [number, number] | number;
    pad: 'valid' | 'same' | number | ExplicitPadding;
    dataFormat: 'NHWC' | 'NCHW';
    dilations: [number, number] | number;
    dimRoundingMode: 'floor' | 'round' | 'ceil';
    activation: Activation;
    leakyreluAlpha?: number;
}

export declare interface FusedDepthwiseConv2DInputs extends NamedTensorInfoMap {
    x: TensorInfo;
    filter: TensorInfo;
    bias?: TensorInfo;
    preluActivationWeights?: TensorInfo;
}

export declare const _FusedMatMul = "_FusedMatMul";

/**
 * Computes the dot product of two matrices with optional activation and bias.
 *
 * ```js
 * const a = tf.tensor2d([-1, -2], [1, 2]);
 * const b = tf.tensor2d([1, 2, 3, 4], [2, 2]);
 * const bias = tf.tensor2d([1, 2], [1, 2]);
 *
 * tf.fused.matMul({a, b, bias, activation: 'relu'}).print();
 * ```
 *
 * @param obj An object with the following properties:
 * - `a` First matrix in dot product operation.
 * - `b` Second matrix in dot product operation.
 * - `transposeA` If true, `a` is transposed before multiplication.
 * - `transposeB` If true, `b` is transposed before multiplication.
 * - `bias` Matrix to be added to the result.
 * - `activation` Name of activation kernel (defaults to `linear`).
 * - `preluActivationWeights` Tensor of prelu weights.
 * - `leakyreluAlpha` Alpha of leakyrelu.
 */
declare function fusedMatMul_({ a, b, transposeA, transposeB, bias, activation, preluActivationWeights, leakyreluAlpha, }: {
    a: Tensor | TensorLike;
    b: Tensor | TensorLike;
    transposeA?: boolean;
    transposeB?: boolean;
    bias?: Tensor | TensorLike;
    activation?: Activation;
    preluActivationWeights?: Tensor;
    leakyreluAlpha?: number;
}): Tensor;

export declare interface _FusedMatMulAttrs {
    transposeA: boolean;
    transposeB: boolean;
    activation: Activation;
    leakyreluAlpha?: number;
}

export declare interface _FusedMatMulInputs extends NamedTensorInfoMap {
    a: TensorInfo;
    b: TensorInfo;
    bias?: TensorInfo;
    preluActivationWeights?: TensorInfo;
}

export declare const gather: typeof gather_;

/**
 * Gather slices from tensor `x`'s axis `axis` according to `indices`.
 *
 * ```js
 * const x = tf.tensor1d([1, 2, 3, 4]);
 * const indices = tf.tensor1d([1, 3, 3], 'int32');
 *
 * x.gather(indices).print();
 * ```
 *
 * ```js
 * const x = tf.tensor2d([1, 2, 3, 4], [2, 2]);
 * const indices = tf.tensor1d([1, 1, 0], 'int32');
 *
 * x.gather(indices).print();
 * ```
 * @param x The input tensor whose slices are to be gathered.
 * @param indices The indices of the values to extract.
 * @param axis The axis over which to select values. Defaults to 0.
 * @param batchDims Optional. The number of batch dimensions. It must be less
 *     than or equal to rank(indices). Defaults to 0.
 *     The output tensor will have shape of
 *     `x.shape[:axis] + indices.shape[batchDims:] + x.shape[axis + 1:]`
 *
 * @doc {heading: 'Tensors', subheading: 'Slicing and Joining'}
 */
declare function gather_<T extends Tensor>(x: T | TensorLike, indices: Tensor | TensorLike, axis?: number, batchDims?: number): T;

declare namespace gather_util {
    export {
        prepareAndValidate
    }
}
export { gather_util }

export declare const GatherNd = "GatherNd";

export declare const gatherND: typeof gatherND_;

/**
 * Gather slices from input tensor into a Tensor with shape specified by
 * `indices`.
 *
 * `indices` is a K-dimensional integer tensor, best thought of as a
 * (K-1)-dimensional tensor of indices into input, where each element defines a
 * slice of input:
 * output[\\(i_0, ..., i_{K-2}\\)] = input[indices[\\(i_0, ..., i_{K-2}\\)]]
 *
 * Whereas in `tf.gather`, `indices` defines slices into the first dimension of
 * input, in `tf.gatherND`, `indices` defines slices into the first N dimensions
 * of input, where N = indices.shape[-1].
 *
 * The last dimension of indices can be at most the rank of input:
 * indices.shape[-1] <= input.rank
 *
 * The last dimension of `indices` corresponds to elements
 * (if indices.shape[-1] == input.rank) or slices
 * (if indices.shape[-1] < input.rank) along dimension indices.shape[-1] of
 * input.
 * The output tensor has shape
 * indices.shape[:-1] + input.shape[indices.shape[-1]:]
 *
 * Note that on CPU, if an out of bound index is found, an error is returned. On
 * GPU, if an out of bound index is found, a 0 is stored in the corresponding
 * output value.
 *
 * ```js
 * const indices = tf.tensor2d([0, 1, 1, 0], [2,2], 'int32');
 * const input = tf.tensor2d([9, 10, 11, 12], [2, 2]);
 * tf.gatherND(input, indices).print() // [10, 11]
 * ```
 *
 * @param x The tensor from which to gather values.
 * @param indices Index tensor, must be of type int32.
 *
 * @doc {heading: 'Operations', subheading: 'Slicing and Joining'}
 */
declare function gatherND_(x: Tensor | TensorLike, indices: Tensor | TensorLike): Tensor;

export declare type GatherNdInputs = Pick<NamedTensorInfoMap, 'params' | 'indices'>;

declare interface GatherOpShapeInfo {
    batchSize: number;
    sliceSize: number;
    outerSize: number;
    dimSize: number;
    outputShape: number[];
}

export declare const GatherV2 = "GatherV2";

export declare interface GatherV2Attrs {
    axis: number;
    batchDims: number;
}

export declare type GatherV2Inputs = Pick<NamedTensorInfoMap, 'x' | 'indices'>;

declare function getArrayFromDType<D extends DataType>(dtype: D, size: number): DataTypeMap[D];

/**
 * Returns the axes permutation to be used with `tf.transpose`, if such
 * permutation is necessary. Otherwise it returns null. This method is used by
 * operations that operate only on inner-most axes.
 */
declare function getAxesPermutation(axes: number[], rank: number): number[] | null;

/**
 * Returns the current backend name (cpu, webgl, etc). The backend is
 * responsible for creating tensors and executing operations on those tensors.
 *
 * @doc {heading: 'Backends'}
 */
export declare function getBackend(): string;

/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
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
/**
 * Returns the dimensions in the input shape that are broadcasted to
 * produce the provided output shape.
 *
 * The returned dimensions are 0-indexed and sorted. An example:
 * inShape = [4, 1, 3]
 * outShape = [5, 4, 3, 3]
 * result = [1]. Dimension 1 (2nd dimension of input) gets broadcasted 1 => 3.
 */
declare function getBroadcastDims(inShape: number[], outShape: number[]): number[];

/**
 * Get the map representing a complex value in the given array.
 * @param complex The complex tensor values.
 * @param index An index of the target complex value.
 */
declare function getComplexWithIndex(complex: Float32Array, index: number): {
    real: number;
    imag: number;
};

/**
 * Gets path of computation for einsum.
 *
 * @param summedDims indices to the dimensions being summed over.
 * @param idDims A look up table for the dimensions present in each input
 *     tensor. Each consituent array contains indices for the dimensions in the
 *     corresponding input tensor.
 *
 * @return A map with two fields:
 *   - path: The path of computation, with each element indicating the dimension
 *     being summed over after the element-wise multiplication in that step.
 *   - steps: With the same length as `path`. Each element contains the indices
 *     to the input tensors being used for element-wise multiplication in the
 *     corresponding step.
 */
declare function getEinsumComputePath(summedDims: number[], idDims: number[][]): {
    path: number[];
    steps: number[][];
};

/**
 * Get the permutation for a given input tensor.
 *
 * @param nDims Total number of dimension of all tensors involved in the einsum
 *   operation.
 * @param idDims Dimension indices involve in the tensor in question.
 * @returns An object consisting of the following fields:
 *   - permutationIndices: Indices to permute the axes of the tensor with.
 *   - expandDims: Indices to the dimension that need to be expanded from the
 *     tensor after permutation.
 */
declare function getEinsumPermutation(nDims: number, idDims: number[]): {
    permutationIndices: number[];
    expandDims: number[];
};

declare function getFusedBiasGradient(bias: Tensor, dyActivation: Tensor): Tensor;

declare function getFusedDyActivation(dy: Tensor, y: Tensor, activation: Activation): Tensor;

/**
 * Returns the registered gradient info associated with the provided kernel.
 * @param kernelName The official TF kernel name.
 */
export declare function getGradient(kernelName: string): GradConfig;

/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
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
declare function getImageCenter(center: number | [number, number], imageHeight: number, imageWidth: number): [number, number];

declare function getInnerMostAxes(numAxes: number, rank: number): number[];

/**
 * Returns the kernel function (code) associated with the provided names.
 *
 * @param kernelName The official name of the kernel.
 * @param backendName The official name of the backend.
 */
export declare function getKernel(kernelName: string, backendName: string): KernelConfig;

export declare function getKernelsForBackend(backendName: string): KernelConfig[];

declare const getLoadHandlers: (url: string | string[], loadOptions?: LoadOptions) => IOHandler[];

/**
 * Create `ModelArtifacts` from a JSON file.
 *
 * @param modelJSON Object containing the parsed JSON of `model.json`
 * @param loadWeights Function that takes the JSON file's weights manifest,
 *     reads weights from the listed path(s), and returns a Promise of the
 *     weight manifest entries along with the weights data.
 * @returns A Promise of the `ModelArtifacts`, as described by the JSON file.
 */
declare function getModelArtifactsForJSON(modelJSON: ModelJSON, loadWeights: (weightsManifest: WeightsManifestConfig) => Promise<[
WeightsManifestEntry[],
WeightData
]>): Promise<ModelArtifacts>;

/**
 * Create `ModelArtifacts` from a JSON file and weights.
 *
 * @param modelJSON Object containing the parsed JSON of `model.json`
 * @param weightSpecs The list of WeightsManifestEntry for the model. Must be
 *     passed if the modelJSON has a weightsManifest.
 * @param weightData An ArrayBuffer or array of ArrayBuffers of weight data for
 *     the model corresponding to the weights in weightSpecs. Must be passed if
 *     the modelJSON has a weightsManifest.
 * @returns A Promise of the `ModelArtifacts`, as described by the JSON file.
 */
declare function getModelArtifactsForJSONSync(modelJSON: ModelJSON, weightSpecs?: WeightsManifestEntry[], weightData?: WeightData): ModelArtifacts;

/**
 * Populate ModelArtifactsInfo fields for a model with JSON topology.
 * @param modelArtifacts
 * @returns A ModelArtifactsInfo object.
 */
declare function getModelArtifactsInfoForJSON(modelArtifacts: ModelArtifacts): ModelArtifactsInfo;

declare function getNormalizedAxes(inputShape: number[], ellipsisAxes: number[], numInterpolatedAxes: number, begin: number[], end: number[], strides: number[], beginMask: number, endMask: number, ellipsisMask: number): {
    begin: number[];
    end: number[];
    strides: number[];
};

/**
 * Gets the permutation that will transpose the dimensions of the
 * reshaped tensor to shape:
 *
 * [batch / prod(block_shape),inputShape[1], blockShape[0], ...,
 * inputShape[M], blockShape[M-1],inputShape[M+1], ..., inputShape[N-1]]
 *
 * see step 2: https://www.tensorflow.org/api_docs/python/tf/batch_to_space_nd
 */
declare function getPermuted(reshapedRank: number, blockShapeRank: number, batchToSpace?: boolean): number[];

declare function getQueryParams(queryString: string): {
    [key: string]: string;
};

declare function getRaggedRank(rowPartitionTypes: RowPartitionType[]): number;

/**
 * Returns the axes in the output space that should be reduced to produce
 * the input space.
 */
declare function getReductionAxes(inShape: number[], outShape: number[]): number[];

/**
 * Get the registered name of a class. If the class has not been registered,
 * return the class name.
 *
 * @param cls The class we want to get register name for. It must have a public
 *     static member called `className` defined.
 * @returns registered name or class name.
 */
declare function getRegisteredName<T extends Serializable>(cls: SerializableConstructor<T>): string;

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
/**
 * Gets the new shape of the input Tensor after it's been reshaped
 * to:
 * [blockShape[0], ..., blockShape[M-1], batch / prod(blockShape),
 * inputShape[1], ..., inputShape[N-1]]
 *
 * See step 1: https://www.tensorflow.org/api_docs/python/tf/batch_to_space_nd
 */
declare function getReshaped(inputShape: number[], blockShape: number[], prod: number, batchToSpace?: boolean): number[];

/**
 * Gets the shape of the reshaped and permuted input Tensor before any cropping
 * is applied.  The new shape will be:
 *
 * [batch / prod(blockShape),inputShape[1] * blockShape[0], ...,
 * inputShape[M] * blockShape[M-1],inputShape[M+1], ..., inputShape[N-1]]
 *
 * See step 3: https://www.tensorflow.org/api_docs/python/tf/batch_to_space_nd
 */
declare function getReshapedPermuted(inputShape: number[], blockShape: number[], prod: number, batchToSpace?: boolean): number[];

declare function getRowPartitionTypesHelper(rowPartitionTypeStrings: string[]): RowPartitionType[];

declare const getSaveHandlers: (url: string | string[]) => IOHandler[];

/**
 * Converts the crops argument into the beginning coordinates of a slice
 * operation.
 */
declare function getSliceBeginCoords(crops: number[][], blockShape: number): number[];

/**
 * Converts the crops argument into the size of a slice operation.  When
 * combined with getSliceBeginCoords this function allows the reshaped and
 * permuted Tensor to be cropped to its final output shape of:
 *
 * inputShape[1] * blockShape[0] - crops[0,0] - crops[0,1], ...,
 * inputShape[M] * blockShape[M-1] -crops[M-1,0] -
 * crops[M-1,1],inputShape[M+1], ..., inputShape[N-1]]
 *
 * See step 4: https://www.tensorflow.org/api_docs/python/tf/batch_to_space_nd
 */
declare function getSliceSize(uncroppedShape: number[], crops: number[][], blockShape: number): number[];

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
/**
 * Generates sparse fill empty rows indices, dense shape mismatch error message.
 *
 * @param indicesLength The first dimension of indices.
 */
declare function getSparseFillEmptyRowsIndicesDenseShapeMismatch(indicesLength: number): string;

/**
 * Generates sparse fill empty rows negative index error message.
 *
 * @param index The index with a negative value.
 * @param value The negative value.
 */
declare function getSparseFillEmptyRowsNegativeIndexErrorMessage(index: number, value: number): string;

/**
 * Generates sparse fill empty rows out of range index error message.
 *
 * @param index The index with an out of range value.
 * @param value The out of range value.
 * @param limit The upper limit for indices.
 */
declare function getSparseFillEmptyRowsOutOfRangeIndexErrorMessage(index: number, value: number, limit: number): string;

/**
 * Generates sparse reshape empty tensor zero output dimension error message.
 *
 */
declare function getSparseReshapeEmptyTensorZeroOutputDimErrorMessage(): string;

/**
 * Generates sparse reshape input output inequality error message.
 *
 * @param inputShape the input shape.
 * @param outputShape the requested output shape.
 */
declare function getSparseReshapeInputOutputMismatchErrorMessage(inputShape: number[], outputShape: number[]): string;

/**
 * Generates sparse reshape input output multiple mismatch error message.
 *
 * @param inputShape the input shape.
 * @param outputShape the requested output shape.
 */
declare function getSparseReshapeInputOutputMultipleErrorMessage(inputShape: number[], outputShape: number[]): string;

/**
 * Generates sparse reshape multiple negative 1 output dimension error message.
 *
 * @param dim1 The first dimension with a negative 1 value.
 * @param dim2 The second dimension with a negative 1 value.
 */
declare function getSparseReshapeMultipleNegativeOneOutputDimErrorMessage(dim1: number, dim2: number): string;

/**
 * Generates sparse reshape negative output dimension error message.
 *
 * @param dim The dimension with a negative value.
 * @param value The negative value.
 */
declare function getSparseReshapeNegativeOutputDimErrorMessage(dim: number, value: number): string;

/**
 * Generates sparse segment reduction input indice out of range error message.
 *
 * @param index The index that holds the out of range value.
 * @param indexValue The value that is out of range.
 * @param inputRows Upper bound of valid index values.
 */
declare function getSparseSegmentReductionIndicesOutOfRangeErrorMessage(index: number, indexValue: number, inputRows: number): string;

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
/**
 * Generates sparse segment reduction negative segment ids error message.
 *
 */
declare function getSparseSegmentReductionNegativeSegmentIdsErrorMessage(): string;

/**
 * Generates sparse segment reduction non increasing segment ids error message.
 *
 */
declare function getSparseSegmentReductionNonIncreasingSegmentIdsErrorMessage(): string;

/**
 * Generates sparse segment reduction segment id out of range error message.
 *
 * @param segmentId The segment id index that is out of range.
 * @param outputRows Upper bound of valid segment id values.
 */
declare function getSparseSegmentReductionSegmentIdOutOfRangeErrorMessage(segmentId: number, outputRows: number): string;

/**
 * Extracts any `Tensor`s found within the provided object.
 *
 * @param container an object that may be a `Tensor` or may directly contain
 *   `Tensor`s, such as a `Tensor[]` or `{key: Tensor, ...}`. In general it
 *   is safe to pass any object here, except that `Promise`s are not
 *   supported.
 * @returns An array of `Tensors` found within the passed object. If the
 *   argument is simply a `Tensor', a list containing that `Tensor` is
 *   returned. If the object is not a `Tensor` or does not
 *   contain `Tensors`, an empty list is returned.
 */
declare function getTensorsInContainer(result: TensorContainer): Tensor[];

declare function getTypedArrayFromDType<D extends NumericDataType>(dtype: D, size: number): DataTypeMap[D];

/** Returns the axes permutation that undoes the original permutation. */
declare function getUndoAxesPermutation(axes: number[]): number[];

/**
 * Concatenate the weights stored in a WeightsManifestConfig into a list of
 * WeightsManifestEntry
 *
 * @param weightsManifest The WeightsManifestConfig to extract weights from.
 * @returns A list of WeightsManifestEntry of the weights in the weightsManifest
 */
declare function getWeightSpecs(weightsManifest: WeightsManifestConfig): WeightsManifestEntry[];

export declare interface GPUData {
    tensorRef: Tensor;
    texture?: WebGLTexture;
    buffer?: GPUBuffer;
    texShape?: [number, number];
}

/**
 * Provided `f(x)`, returns another function `g(x, dy?)`, which gives the
 * gradient of `f(x)` with respect to `x`.
 *
 * If `dy` is provided, the gradient of `f(x).mul(dy).sum()` with respect to
 * `x` is computed instead. `f(x)` must take a single tensor `x` and return a
 * single tensor `y`. If `f()` takes multiple inputs, use `tf.grads` instead.
 *
 * ```js
 * // f(x) = x ^ 2
 * const f = x => x.square();
 * // f'(x) = 2x
 * const g = tf.grad(f);
 *
 * const x = tf.tensor1d([2, 3]);
 * g(x).print();
 * ```
 *
 * ```js
 * // f(x) = x ^ 3
 * const f = x => x.pow(tf.scalar(3, 'int32'));
 * // f'(x) = 3x ^ 2
 * const g = tf.grad(f);
 * // f''(x) = 6x
 * const gg = tf.grad(g);
 *
 * const x = tf.tensor1d([2, 3]);
 * gg(x).print();
 * ```
 *
 * @param f The function f(x), to compute gradient for.
 *
 * @doc {heading: 'Training', subheading: 'Gradients'}
 */
export declare function grad(f: (x: Tensor) => Tensor): (x: TensorLike | Tensor, dy?: TensorLike | Tensor) => Tensor;

/** Config object for registering a gradient in the global registry. */
export declare interface GradConfig {
    kernelName: string;
    inputsToSave?: string[];
    saveAllInputs?: boolean;
    outputsToSave?: boolean[];
    gradFunc: GradFunc;
}

/** The function to run when computing a gradient during backprop. */
export declare type GradFunc = (dy: Tensor | Tensor[], saved: Tensor[], attrs: NamedAttrMap) => NamedGradientMap;

/**
 * Provided `f(x1, x2,...)`, returns another function `g([x1, x2,...], dy?)`,
 * which gives an array of gradients of `f()` with respect to each input
 * [`x1`,`x2`,...].
 *
 * If `dy` is passed when calling `g()`, the gradient of
 * `f(x1,...).mul(dy).sum()` with respect to each input is computed instead.
 * The provided `f` must take one or more tensors and return a single tensor
 * `y`. If `f()` takes a single input, we recommend using `tf.grad` instead.
 *
 * ```js
 * // f(a, b) = a * b
 * const f = (a, b) => a.mul(b);
 * // df / da = b, df / db = a
 * const g = tf.grads(f);
 *
 * const a = tf.tensor1d([2, 3]);
 * const b = tf.tensor1d([-2, -3]);
 * const [da, db] = g([a, b]);
 * console.log('da');
 * da.print();
 * console.log('db');
 * db.print();
 * ```
 *
 * @param f The function `f(x1, x2,...)` to compute gradients for.
 *
 * @doc {heading: 'Training', subheading: 'Gradients'}
 */
export declare function grads(f: (...args: Tensor[]) => Tensor): (args: Array<Tensor | TensorLike>, dy?: Tensor | TensorLike) => Tensor[];

export declare type GradSaveFunc = (save: Tensor[]) => void;

export declare const Greater = "Greater";

export declare const greater: typeof greater_;

/**
 * Returns the truth value of (a > b) element-wise. Supports broadcasting.
 *
 * ```js
 * const a = tf.tensor1d([1, 2, 3]);
 * const b = tf.tensor1d([2, 2, 2]);
 *
 * a.greater(b).print();
 * ```
 *
 * @param a The first input tensor.
 * @param b The second input tensor. Must have the same dtype as `a`.
 *
 * @doc {heading: 'Operations', subheading: 'Logical'}
 */
declare function greater_<T extends Tensor>(a: Tensor | TensorLike, b: Tensor | TensorLike): T;

export declare const GreaterEqual = "GreaterEqual";

export declare const greaterEqual: typeof greaterEqual_;

/**
 * Returns the truth value of (a >= b) element-wise. Supports broadcasting.
 *
 * ```js
 * const a = tf.tensor1d([1, 2, 3]);
 * const b = tf.tensor1d([2, 2, 2]);
 *
 * a.greaterEqual(b).print();
 * ```
 *
 * @param a The first input tensor.
 * @param b The second input tensor. Must have the same dtype as `a`.
 *
 * @doc {heading: 'Operations', subheading: 'Logical'}
 */
declare function greaterEqual_<T extends Tensor>(a: Tensor | TensorLike, b: Tensor | TensorLike): T;

export declare type GreaterEqualInputs = BinaryInputs;

export declare type GreaterInputs = BinaryInputs;

/**
 * Returns true if the new type can't encode the old type without loss of
 * precision.
 */
declare function hasEncodingLoss(oldType: DataType, newType: DataType): boolean;

declare function hexToLong(hex: string): Long;

/**
 * Creates an IOHandler subtype that sends model artifacts to HTTP server.
 *
 * An HTTP request of the `multipart/form-data` mime type will be sent to the
 * `path` URL. The form data includes artifacts that represent the topology
 * and/or weights of the model. In the case of Keras-style `tf.Model`, two
 * blobs (files) exist in form-data:
 *   - A JSON file consisting of `modelTopology` and `weightsManifest`.
 *   - A binary weights file consisting of the concatenated weight values.
 * These files are in the same format as the one generated by
 * [tfjs_converter](https://js.tensorflow.org/tutorials/import-keras.html).
 *
 * The following code snippet exemplifies the client-side code that uses this
 * function:
 *
 * ```js
 * const model = tf.sequential();
 * model.add(
 *     tf.layers.dense({units: 1, inputShape: [100], activation: 'sigmoid'}));
 *
 * const saveResult = await model.save(tf.io.http(
 *     'http://model-server:5000/upload', {requestInit: {method: 'PUT'}}));
 * console.log(saveResult);
 * ```
 *
 * If the default `POST` method is to be used, without any custom parameters
 * such as headers, you can simply pass an HTTP or HTTPS URL to `model.save`:
 *
 * ```js
 * const saveResult = await model.save('http://model-server:5000/upload');
 * ```
 *
 * The following GitHub Gist
 * https://gist.github.com/dsmilkov/1b6046fd6132d7408d5257b0976f7864
 * implements a server based on [flask](https://github.com/pallets/flask) that
 * can receive the request. Upon receiving the model artifacts via the requst,
 * this particular server reconstitutes instances of [Keras
 * Models](https://keras.io/models/model/) in memory.
 *
 *
 * @param path A URL path to the model.
 *   Can be an absolute HTTP path (e.g.,
 *   'http://localhost:8000/model-upload)') or a relative path (e.g.,
 *   './model-upload').
 * @param requestInit Request configurations to be used when sending
 *    HTTP request to server using `fetch`. It can contain fields such as
 *    `method`, `credentials`, `headers`, `mode`, etc. See
 *    https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
 *    for more information. `requestInit` must not have a body, because the
 * body will be set by TensorFlow.js. File blobs representing the model
 * topology (filename: 'model.json') and the weights of the model (filename:
 * 'model.weights.bin') will be appended to the body. If `requestInit` has a
 * `body`, an Error will be thrown.
 * @param loadOptions Optional configuration for the loading. It includes the
 *   following fields:
 *   - weightPathPrefix Optional, this specifies the path prefix for weight
 *     files, by default this is calculated from the path param.
 *   - fetchFunc Optional, custom `fetch` function. E.g., in Node.js,
 *     the `fetch` from node-fetch can be used here.
 *   - onProgress Optional, progress callback function, fired periodically
 *     before the load is completed.
 * @returns An instance of `IOHandler`.
 *
 * @doc {
 *   heading: 'Models',
 *   subheading: 'Loading',
 *   namespace: 'io',
 *   ignoreCI: true
 * }
 */
declare function http(path: string, loadOptions?: LoadOptions): IOHandler;

export declare const Identity = "Identity";

export declare type IdentityInputs = Pick<NamedTensorInfoMap, 'x'>;

export declare const IFFT = "IFFT";

export declare const ifft: typeof ifft_;

/**
 * Inverse fast Fourier transform.
 *
 * Computes the inverse 1-dimensional discrete Fourier transform over the
 * inner-most dimension of input.
 *
 * ```js
 * const real = tf.tensor1d([1, 2, 3]);
 * const imag = tf.tensor1d([1, 2, 3]);
 * const x = tf.complex(real, imag);
 *
 * x.ifft().print();  // tf.spectral.ifft(x).print();
 * ```
 * @param input The complex input to compute an ifft over.
 *
 * @doc {heading: 'Operations', subheading: 'Spectral', namespace: 'spectral'}
 */
declare function ifft_(input: Tensor): Tensor;

export declare type IFFTInputs = Pick<NamedTensorInfoMap, 'input'>;

export declare const Imag = "Imag";

export declare const imag: typeof imag_;

/**
 * Returns the imaginary part of a complex (or real) tensor.
 *
 * Given a tensor input, this operation returns a tensor of type float that is
 * the imaginary part of each element in input considered as a complex number.
 * If input is real, a tensor of all zeros is returned.
 *
 * ```js
 * const x = tf.complex([-2.25, 3.25], [4.75, 5.75]);
 * tf.imag(x).print();
 * ```
 *
 * @doc {heading: 'Tensors', subheading: 'Creation'}
 */
declare function imag_<T extends Tensor>(input: T | TensorLike): T;

export declare const image: {
    flipLeftRight: (image: TensorLike | Tensor4D) => Tensor4D;
    grayscaleToRGB: <T extends Tensor2D | Tensor3D | Tensor4D | Tensor5D | Tensor6D>(image: TensorLike | T) => T;
    resizeNearestNeighbor: <T_1 extends Tensor3D | Tensor4D>(images: TensorLike | T_1, size: [number, number], alignCorners?: boolean, halfPixelCenters?: boolean) => T_1;
    resizeBilinear: <T_2 extends Tensor3D | Tensor4D>(images: TensorLike | T_2, size: [number, number], alignCorners?: boolean, halfPixelCenters?: boolean) => T_2;
    rgbToGrayscale: <T_3 extends Tensor2D | Tensor3D | Tensor4D | Tensor5D | Tensor6D>(image: TensorLike | T_3) => T_3;
    rotateWithOffset: (image: TensorLike | Tensor4D, radians: number, fillValue?: number | [number, number, number], center?: number | [number, number]) => Tensor4D;
    cropAndResize: (image: TensorLike | Tensor4D, boxes: TensorLike | Tensor2D, boxInd: TensorLike | Tensor1D, cropSize: [number, number], method?: "nearest" | "bilinear", extrapolationValue?: number) => Tensor4D;
    nonMaxSuppression: (boxes: TensorLike | Tensor2D, scores: TensorLike | Tensor1D, maxOutputSize: number, iouThreshold?: number, scoreThreshold?: number) => Tensor1D;
    nonMaxSuppressionAsync: (boxes: TensorLike | Tensor2D, scores: TensorLike | Tensor1D, maxOutputSize: number, iouThreshold?: number, scoreThreshold?: number) => Promise<Tensor1D>;
    nonMaxSuppressionWithScore: (boxes: TensorLike | Tensor2D, scores: TensorLike | Tensor1D, maxOutputSize: number, iouThreshold?: number, scoreThreshold?: number, softNmsSigma?: number) => NamedTensorMap;
    nonMaxSuppressionWithScoreAsync: (boxes: TensorLike | Tensor2D, scores: TensorLike | Tensor1D, maxOutputSize: number, iouThreshold?: number, scoreThreshold?: number, softNmsSigma?: number) => Promise<NamedTensorMap>;
    nonMaxSuppressionPadded: (boxes: TensorLike | Tensor2D, scores: TensorLike | Tensor1D, maxOutputSize: number, iouThreshold?: number, scoreThreshold?: number, padToMaxOutputSize?: boolean) => NamedTensorMap;
    nonMaxSuppressionPaddedAsync: (boxes: TensorLike | Tensor2D, scores: TensorLike | Tensor1D, maxOutputSize: number, iouThreshold?: number, scoreThreshold?: number, padToMaxOutputSize?: boolean) => Promise<NamedTensorMap>;
    threshold: (image: TensorLike | Tensor3D, method?: string, inverted?: boolean, threshValue?: number) => Tensor3D;
    transform: (image: TensorLike | Tensor4D, transforms: TensorLike | Tensor2D, interpolation?: "nearest" | "bilinear", fillMode?: "nearest" | "constant" | "reflect" | "wrap", fillValue?: number, outputShape?: [number, number]) => Tensor4D;
};

declare interface ImageOptions {
    /**
     * Optional. A number in range [0-1]. If the image is a 2D tensor or a 3D
     * tensor with 1 or 3 channels, the alpha channels would set as its value;
     * otherwise, it would not make effects.
     */
    alpha?: number;
}

export declare type ImagInputs = Pick<NamedTensorInfoMap, 'input'>;

/**
 * Computes the location (multidimensional index) in a
 * tensor/multidimentional array for a given flat index.
 *
 * @param index Index in flat array.
 * @param rank Rank of tensor.
 * @param strides Strides of tensor.
 */
declare function indexToLoc(index: number, rank: number, strides: number[]): number[];

declare function inferDtype(values: TensorLike | WebGLData | WebGPUData): DataType;

/**
 * Common interface for a machine learning model that can do inference.
 */
export declare interface InferenceModel {
    /**
     * Return the array of input tensor info.
     */
    readonly inputs: ModelTensorInfo[];
    /**
     * Return the array of output tensor info.
     */
    readonly outputs: ModelTensorInfo[];
    /**
     * Execute the inference for the input tensors.
     *
     * @param input The input tensors, when there is single input for the model,
     * inputs param should be a Tensor. For models with multiple inputs, inputs
     * params should be in either Tensor[] if the input order is fixed, or
     * otherwise NamedTensorMap format.
     * For batch inference execution, the tensors for each input need to be
     * concatenated together. For example with mobilenet, the required input shape
     * is [1, 244, 244, 3], which represents the [batch, height, width, channel].
     * If we are provide a batched data of 100 images, the input tensor should be
     * in the shape of [100, 244, 244, 3].
     *
     * @param config Prediction configuration for specifying the batch size.
     *
     * @returns Inference result tensors. The output would be single Tensor if
     * model has single output node, otherwise Tensor[] or NamedTensorMap[] will
     * be returned for model with multiple outputs.
     */
    predict(inputs: Tensor | Tensor[] | NamedTensorMap, config: ModelPredictConfig): Tensor | Tensor[] | NamedTensorMap;
    /**
     * Single Execute the inference for the input tensors and return activation
     * values for specified output node names without batching.
     *
     * @param input The input tensors, when there is single input for the model,
     * inputs param should be a Tensor. For models with multiple inputs, inputs
     * params should be in either Tensor[] if the input order is fixed, or
     * otherwise NamedTensorMap format.
     *
     * @param outputs string|string[]. List of output node names to retrieve
     * activation from.
     *
     * @returns Activation values for the output nodes result tensors. The return
     * type matches specified parameter outputs type. The output would be single
     * Tensor if single output is specified, otherwise Tensor[] for multiple
     * outputs.
     */
    execute(inputs: Tensor | Tensor[] | NamedTensorMap, outputs: string | string[]): Tensor | Tensor[];
}

/**
 * Given the full size of the array and a shape that may contain -1 as the
 * implicit dimension, returns the inferred shape where -1 is replaced.
 * E.g. For shape=[2, -1, 3] and size=24, it will return [2, 4, 3].
 *
 * @param shape The shape, which may contain -1 in some dimension.
 * @param size The full size (number of elements) of the array.
 * @return The inferred shape where -1 is replaced with the inferred size.
 */
declare function inferFromImplicitShape(shape: number[], size: number): number[];

export declare const inTopKAsync: typeof inTopKAsync_;

/**
 * Returns whether the targets are in the top K predictions.
 *
 * ```js
 * const predictions = tf.tensor2d([[20, 10, 40, 30], [30, 50, -20, 10]]);
 * const targets = tf.tensor1d([2, 0]);
 * const precision = await tf.inTopKAsync(predictions, targets);
 * precision.print();
 * ```
 * @param predictions 2-D or higher `tf.Tensor` with last dimension being
 *     at least `k`.
 * @param targets 1-D or higher `tf.Tensor`.
 * @param k Optional Number of top elements to look at for computing precision,
 *     default to 1.
 *
 * @doc {heading: 'Operations', subheading: 'Evaluation'}
 */
declare function inTopKAsync_<T extends Tensor, U extends Tensor>(predictions: T | TensorLike, targets: U | TensorLike, k?: number): Promise<U>;

declare namespace io {
    export {
        copyModel,
        listModels,
        moveModel,
        removeModel,
        browserFiles,
        browserHTTPRequest,
        CompositeArrayBuffer,
        concatenateArrayBuffers,
        decodeWeights,
        encodeWeights,
        fromMemory,
        fromMemorySync,
        getLoadHandlers,
        getModelArtifactsForJSON,
        getModelArtifactsForJSONSync,
        getModelArtifactsInfoForJSON,
        getSaveHandlers,
        getWeightSpecs,
        http,
        IOHandler,
        IOHandlerSync,
        isHTTPScheme,
        LoadHandler,
        LoadOptions,
        loadWeights,
        ModelArtifacts,
        ModelArtifactsInfo,
        ModelJSON,
        ModelStoreManager,
        OnProgressCallback,
        registerLoadRouter,
        registerSaveRouter,
        RequestDetails,
        SaveConfig,
        SaveHandler,
        SaveResult,
        TrainingConfig,
        WeightData,
        WeightGroup,
        weightsLoaderFactory,
        WeightsManifestConfig,
        WeightsManifestEntry,
        withSaveHandler,
        withSaveHandlerSync
    }
}
export { io }

/**
 * Interface for a model import/export handler.
 *
 * The `save` and `load` handlers are both optional, in order to allow handlers
 * that support only saving or loading.
 */
declare interface IOHandler {
    save?: SaveHandler;
    load?: LoadHandler;
}

/**
 * Interface for a synchronous model import/export handler.
 *
 * The `save` and `load` handlers are both optional, in order to allow handlers
 * that support only saving or loading.
 */
declare type IOHandlerSync = {
    save?: SaveHandlerSync;
    load?: LoadHandlerSync;
};

declare type IORouter = (url: string | string[], loadOptions?: LoadOptions) => IOHandler;

export declare const irfft: typeof irfft_;

/**
 * Inversed real value input fast Fourier transform.
 *
 * Computes the 1-dimensional inversed discrete Fourier transform over the
 * inner-most dimension of the real input.
 *
 * ```js
 * const real = tf.tensor1d([1, 2, 3]);
 * const imag = tf.tensor1d([0, 0, 0]);
 * const x = tf.complex(real, imag);
 *
 * x.irfft().print();
 * ```
 * @param input The real value input to compute an irfft over.
 *
 * @doc {heading: 'Operations', subheading: 'Spectral', namespace: 'spectral'}
 */
declare function irfft_(input: Tensor): Tensor;

declare function isBoolean(value: {}): boolean;

declare function isBrowser(): boolean;

export declare const IsFinite = "IsFinite";

/**
 * Returns which elements of x are finite.
 *
 * ```js
 * const x = tf.tensor1d([NaN, Infinity, -Infinity, 0, 1]);
 *
 * x.isFinite().print();  // or tf.isNaN(x)
 * ```
 * @param x The input Tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function isFinite_<T extends Tensor>(x: T | TensorLike): T;

declare const isFinite_2: typeof isFinite_;
export { isFinite_2 as isFinite }

export declare type IsFiniteInputs = UnaryInputs;

declare function isFunction(f: Function): boolean;

declare function isHTTPScheme(url: string): boolean;

/** Determines if an axes permutation is the identity permutation. */
declare function isIdentityPermutation(perm: number[]): boolean;

export declare const IsInf = "IsInf";

export declare const isInf: typeof isInf_;

/**
 * Returns which elements of x are Infinity or -Infinity.
 *
 * ```js
 * const x = tf.tensor1d([NaN, Infinity, -Infinity, 0, 1]);
 *
 * x.isInf().print();  // or tf.isNaN(x)
 * ```
 * @param x The input Tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function isInf_<T extends Tensor>(x: T | TensorLike): T;

export declare type IsInfInputs = UnaryInputs;

declare function isInt(a: number): boolean;

declare function isMobile(nav?: Navigator): boolean;

export declare const IsNan = "IsNan";

/**
 * Returns which elements of x are NaN.
 *
 * ```js
 * const x = tf.tensor1d([NaN, Infinity, -Infinity, 0, 1]);
 *
 * x.isNaN().print();  // or tf.isNaN(x)
 * ```
 * @param x The input Tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function isNaN_<T extends Tensor>(x: T | TensorLike): T;

declare const isNaN_2: typeof isNaN_;
export { isNaN_2 as isNaN }

export declare type IsNanInputs = UnaryInputs;

declare function isNumber(value: {}): boolean;

/**
 * This method asserts whether an object is a Promise instance.
 * @param object
 */
declare function isPromise(object: any): object is Promise<unknown>;

declare function isScalarShape(shape: number[]): boolean;

/**
 * Returns true if the slice occupies a continous set of elements in the
 * 'flat' space.
 */
declare function isSliceContinous(shape: number[], begin: number[], size: number[]): boolean;

/** Returns true if the value is a string. */
declare function isString(value: {}): value is string;

declare function isTensorInList(tensor: Tensor, tensorList: Tensor[]): boolean;

declare function isTypedArray(a: {}): a is Float32Array | Int32Array | Uint8Array | Uint8ClampedArray;

/** Returns true if the dtype is valid. */
declare function isValidDtype(dtype: DataType): boolean;

/**
 * Keeps a `tf.Tensor` generated inside a `tf.tidy` from being disposed
 * automatically.
 *
 * ```js
 * let b;
 * const y = tf.tidy(() => {
 *   const one = tf.scalar(1);
 *   const a = tf.scalar(2);
 *
 *   // b will not be cleaned up by the tidy. a and one will be cleaned up
 *   // when the tidy ends.
 *   b = tf.keep(a.square());
 *
 *   console.log('numTensors (in tidy): ' + tf.memory().numTensors);
 *
 *   // The value returned inside the tidy function will return
 *   // through the tidy, in this case to the variable y.
 *   return b.add(one);
 * });
 *
 * console.log('numTensors (outside tidy): ' + tf.memory().numTensors);
 * console.log('y:');
 * y.print();
 * console.log('b:');
 * b.print();
 * ```
 *
 * @param result The tensor to keep from being disposed.
 *
 * @doc {heading: 'Performance', subheading: 'Memory'}
 */
export declare function keep<T extends Tensor>(result: T): T;

declare namespace kernel_impls {
    export {
        nonMaxSuppressionV3Impl,
        nonMaxSuppressionV4Impl,
        nonMaxSuppressionV5Impl,
        whereImpl
    }
}
export { kernel_impls }

/**
 * The interface that defines the kernels that should be implemented when
 * adding a new backend. New backends don't need to implement every one of the
 * methods, this can be done gradually (throw an error for unimplemented
 * methods).
 */
export declare class KernelBackend implements TensorStorage, Backend, BackendTimer {
    refCount(dataId: DataId): number;
    incRef(dataId: DataId): void;
    timerAvailable(): boolean;
    time(f: () => void): Promise<BackendTimingInfo>;
    read(dataId: object): Promise<BackendValues>;
    readSync(dataId: object): BackendValues;
    readToGPU(dataId: object, options?: DataToGPUOptions): GPUData;
    numDataIds(): number;
    disposeData(dataId: object, force?: boolean): boolean;
    write(values: BackendValues, shape: number[], dtype: DataType): DataId;
    move(dataId: DataId, values: BackendValues, shape: number[], dtype: DataType, refCount: number): void;
    createTensorFromGPUData(values: WebGLData | WebGPUData, shape: number[], dtype: DataType): Tensor;
    memory(): {
        unreliable: boolean;
        reasons?: string[];
    };
    /** Returns the highest precision for floats in bits (e.g. 16 or 32) */
    floatPrecision(): 16 | 32;
    /** Returns the smallest representable number.  */
    epsilon(): number;
    dispose(): void;
}

/** Config object for registering a kernel in the global registry. */
export declare interface KernelConfig {
    kernelName: string;
    backendName: string;
    kernelFunc: KernelFunc;
    setupFunc?: KernelSetupFunc;
    disposeFunc?: KernelDisposeFunc;
}

/** Function that gets called right before the backend is disposed. */
export declare type KernelDisposeFunc = KernelSetupFunc;

/** Specifies the code to run when executing a kernel. */
export declare type KernelFunc = (params: {
    inputs: NamedTensorInfoMap;
    backend: {};
    attrs?: NamedAttrMap;
}) => TensorInfo | TensorInfo[];

declare type KernelInfo = {
    name: string;
    bytesAdded: number;
    totalBytesSnapshot: number;
    tensorsAdded: number;
    totalTensorsSnapshot: number;
    inputShapes: number[][];
    outputShapes: number[][];
    kernelTimeMs: number | {
        error: string;
    } | Promise<number | {
        error: string;
    }>;
    extraInfo: string | Promise<string>;
};

/** Function that gets called after the backend initializes. */
export declare type KernelSetupFunc = (backend: {}) => void;

export declare const LeakyRelu = "LeakyRelu";

export declare const leakyRelu: typeof leakyRelu_;

/**
 * Computes leaky rectified linear element-wise.
 *
 * See
 * [http://web.stanford.edu/~awni/papers/relu_hybrid_icml2013_final.pdf](
 *     http://web.stanford.edu/~awni/papers/relu_hybrid_icml2013_final.pdf)
 *
 * ```js
 * const x = tf.tensor1d([-1, 2, -3, 4]);
 *
 * x.leakyRelu(0.1).print();  // or tf.leakyRelu(x, 0.1)
 * ```
 * @param x The input tensor.
 * @param alpha The scaling factor for negative values, defaults to 0.2.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function leakyRelu_<T extends Tensor>(x: T | TensorLike, alpha?: number): T;

export declare interface LeakyReluAttrs {
    alpha: number;
}

export declare type LeakyReluInputs = Pick<NamedTensorInfoMap, 'x'>;

export declare const Less = "Less";

export declare const less: typeof less_;

/**
 * Returns the truth value of (a < b) element-wise. Supports broadcasting.
 *
 * ```js
 * const a = tf.tensor1d([1, 2, 3]);
 * const b = tf.tensor1d([2, 2, 2]);
 *
 * a.less(b).print();
 * ```
 * @param a The first input tensor.
 * @param b The second input tensor. Must have the same dtype as `a`.
 *
 * @doc {heading: 'Operations', subheading: 'Logical'}
 */
declare function less_<T extends Tensor>(a: Tensor | TensorLike, b: Tensor | TensorLike): T;

export declare const LessEqual = "LessEqual";

export declare const lessEqual: typeof lessEqual_;

/**
 * Returns the truth value of (a <= b) element-wise. Supports broadcasting.
 *
 * ```js
 * const a = tf.tensor1d([1, 2, 3]);
 * const b = tf.tensor1d([2, 2, 2]);
 *
 * a.lessEqual(b).print();
 * ```
 *
 * @param a The first input tensor.
 * @param b The second input tensor. Must have the same dtype as `a`.
 *
 * @doc {heading: 'Operations', subheading: 'Logical'}
 */
declare function lessEqual_<T extends Tensor>(a: Tensor | TensorLike, b: Tensor | TensorLike): T;

export declare type LessEqualInputs = BinaryInputs;

export declare type LessInputs = BinaryInputs;

export declare const linalg: {
    bandPart: <T extends Tensor<Rank>>(a: TensorLike | T, numLower: number | Scalar, numUpper: number | Scalar) => T;
    gramSchmidt: (xs: Tensor2D | Tensor1D[]) => Tensor2D | Tensor1D[];
    qr: (x: Tensor<Rank>, fullMatrices?: boolean) => [Tensor<Rank>, Tensor<Rank>];
};

export declare const LinSpace = "LinSpace";

/**
 * Return an evenly spaced sequence of numbers over the given interval.
 *
 * ```js
 * tf.linspace(0, 9, 10).print();
 * ```
 * @param start The start value of the sequence.
 * @param stop The end value of the sequence.
 * @param num The number of values to generate.
 *
 * @doc {heading: 'Tensors', subheading: 'Creation'}
 */
export declare function linspace(start: number, stop: number, num: number): Tensor1D;

export declare interface LinSpaceAttrs {
    start: number;
    stop: number;
    num: number;
}

/**
 * List all models stored in registered storage mediums.
 *
 * For a web browser environment, the registered mediums are Local Storage and
 * IndexedDB.
 *
 * ```js
 * // First create and save a model.
 * const model = tf.sequential();
 * model.add(tf.layers.dense(
 *     {units: 1, inputShape: [10], activation: 'sigmoid'}));
 * await model.save('localstorage://demo/management/model1');
 *
 * // Then list existing models.
 * console.log(JSON.stringify(await tf.io.listModels()));
 *
 * // Delete the model.
 * await tf.io.removeModel('localstorage://demo/management/model1');
 *
 * // List models again.
 * console.log(JSON.stringify(await tf.io.listModels()));
 * ```
 *
 * @returns A `Promise` of a dictionary mapping URLs of existing models to
 * their model artifacts info. URLs include medium-specific schemes, e.g.,
 *   'indexeddb://my/model/1'. Model artifacts info include type of the
 * model's topology, byte sizes of the topology, weights, etc.
 *
 * @doc {
 *   heading: 'Models',
 *   subheading: 'Management',
 *   namespace: 'io',
 *   ignoreCI: true
 * }
 */
declare function listModels(): Promise<{
    [url: string]: ModelArtifactsInfo;
}>;

/**
 * Type definition for handlers of loading operations.
 */
declare type LoadHandler = () => Promise<ModelArtifacts>;

/**
 * Type definition for handlers of synchronous loading operations.
 */
declare type LoadHandlerSync = () => ModelArtifacts;

/** @innamespace io */
declare interface LoadOptions {
    /**
     * RequestInit (options) for HTTP requests.
     *
     * For detailed information on the supported fields, see
     * [https://developer.mozilla.org/en-US/docs/Web/API/Request/Request](
     *     https://developer.mozilla.org/en-US/docs/Web/API/Request/Request)
     */
    requestInit?: RequestInit;
    /**
     * Progress callback.
     */
    onProgress?: OnProgressCallback;
    /**
     * A function used to override the `window.fetch` function.
     */
    fetchFunc?: Function;
    /**
     * Strict loading model: whether extraneous weights or missing
     * weights should trigger an `Error`.
     *
     * If `true`, require that the provided weights exactly match those
     * required by the layers. `false` means that both extra weights
     * and missing weights will be silently ignored.
     *
     * Default: `true`.
     */
    strict?: boolean;
    /**
     * Path prefix for weight files, by default this is calculated from the
     * path of the model JSON file.
     *
     * For instance, if the path to the model JSON file is
     * `http://localhost/foo/model.json`, then the default path prefix will be
     * `http://localhost/foo/`. If a weight file has the path value
     * `group1-shard1of2` in the weight manifest, then the weight file will be
     * loaded from `http://localhost/foo/group1-shard1of2` by default. However,
     * if you provide a `weightPathPrefix` value of
     * `http://localhost/foo/alt-weights`, then the weight file will be loaded
     * from the path `http://localhost/foo/alt-weights/group1-shard1of2` instead.
     */
    weightPathPrefix?: string;
    /**
     * Whether the module or model is to be loaded from TF Hub.
     *
     * Setting this to `true` allows passing a TF-Hub module URL, omitting the
     * standard model file name and the query parameters.
     *
     * Default: `false`.
     */
    fromTFHub?: boolean;
    /**
     * An async function to convert weight file name to URL. The weight file
     * names are stored in model.json's weightsManifest.paths field. By default we
     * consider weight files are colocated with the model.json file. For example:
     *     model.json URL: https://www.google.com/models/1/model.json
     *     group1-shard1of1.bin url:
     *        https://www.google.com/models/1/group1-shard1of1.bin
     *
     * With this func you can convert the weight file name to any URL.
     */
    weightUrlConverter?: (weightFileName: string) => Promise<string>;
}

/**
 * Reads a weights manifest JSON configuration, fetches the weights and
 * returns them as `Tensor`s.
 *
 * @param manifest The weights manifest JSON.
 * @param filePathPrefix The path prefix for filenames given in the manifest.
 *     Defaults to the empty string.
 * @param weightNames The names of the weights to be fetched.
 */
declare function loadWeights(manifest: WeightsManifestConfig, filePathPrefix?: string, weightNames?: string[], requestInit?: RequestInit): Promise<NamedTensorMap>;

export declare const localResponseNormalization: typeof localResponseNormalization_;

/**
 * Normalizes the activation of a local neighborhood across or within
 * channels.
 *
 * @param x The input tensor. The 4-D input tensor is treated as a 3-D array
 *     of 1D vectors (along the last dimension), and each vector is
 *     normalized independently.
 * @param depthRadius The number of adjacent channels in the 1D normalization
 *     window.
 * @param bias A constant bias term for the basis.
 * @param alpha A scale factor, usually positive.
 * @param beta An exponent.
 *
 * @doc {heading: 'Operations', subheading: 'Normalization'}
 */
declare function localResponseNormalization_<T extends Tensor3D | Tensor4D>(x: T | TensorLike, depthRadius?: number, bias?: number, alpha?: number, beta?: number): T;

/**
 * Computes flat index for a given location (multidimentionsal index) in a
 * Tensor/multidimensional array.
 *
 * @param locs Location in the tensor.
 * @param rank Rank of the tensor.
 * @param strides Tensor strides.
 */
declare function locToIndex(locs: number[], rank: number, strides: number[]): number;

export declare const Log = "Log";

export declare const log: typeof log_;

export declare const Log1p = "Log1p";

export declare const log1p: typeof log1p_;

/**
 * Computes natural logarithm of the input `tf.Tensor` plus one
 * element-wise: `ln(1 + x)`
 *
 * ```js
 * const x = tf.tensor1d([1, 2, Math.E - 1]);
 *
 * x.log1p().print();  // or tf.log1p(x)
 * ```
 * @param x The input tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function log1p_<T extends Tensor>(x: T | TensorLike): T;

export declare type Log1pInputs = UnaryInputs;

/**
 * Computes natural logarithm of the input `tf.Tensor` element-wise: `ln(x)`
 *
 * ```js
 * const x = tf.tensor1d([1, 2, Math.E]);
 *
 * x.log().print();  // or tf.log(x)
 * ```
 * @param x The input tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function log_<T extends Tensor>(x: T | TensorLike): T;

declare function log_2(...msg: Array<{}>): void;

export declare const LogicalAnd = "LogicalAnd";

export declare const logicalAnd: typeof logicalAnd_;

/**
 * Returns the truth value of `a AND b` element-wise. Supports broadcasting.
 *
 * ```js
 * const a = tf.tensor1d([false, false, true, true], 'bool');
 * const b = tf.tensor1d([false, true, false, true], 'bool');
 *
 * a.logicalAnd(b).print();
 * ```
 *
 * @param a The first input tensor. Must be of dtype bool.
 * @param b The second input tensor. Must be of dtype bool.
 *
 * @doc {heading: 'Operations', subheading: 'Logical'}
 */
declare function logicalAnd_<T extends Tensor>(a: Tensor | TensorLike, b: Tensor | TensorLike): T;

export declare type LogicalAndInputs = BinaryInputs;

export declare const LogicalNot = "LogicalNot";

export declare const logicalNot: typeof logicalNot_;

/**
 * Returns the truth value of `NOT x` element-wise.
 *
 * ```js
 * const a = tf.tensor1d([false, true], 'bool');
 *
 * a.logicalNot().print();
 * ```
 *
 * @param x The input tensor. Must be of dtype 'bool'.
 *
 * @doc {heading: 'Operations', subheading: 'Logical'}
 */
declare function logicalNot_<T extends Tensor>(x: T | TensorLike): T;

export declare type LogicalNotInputs = Pick<NamedTensorInfoMap, 'x'>;

export declare const LogicalOr = "LogicalOr";

export declare const logicalOr: typeof logicalOr_;

/**
 * Returns the truth value of `a OR b` element-wise. Supports broadcasting.
 *
 * ```js
 * const a = tf.tensor1d([false, false, true, true], 'bool');
 * const b = tf.tensor1d([false, true, false, true], 'bool');
 *
 * a.logicalOr(b).print();
 * ```
 * @param a The first input tensor. Must be of dtype bool.
 * @param b The second input tensor. Must be of dtype bool.
 *
 * @doc {heading: 'Operations', subheading: 'Logical'}
 */
declare function logicalOr_<T extends Tensor>(a: Tensor | TensorLike, b: Tensor | TensorLike): T;

export declare type LogicalOrInputs = BinaryInputs;

export declare const LogicalXor = "LogicalXor";

export declare const logicalXor: typeof logicalXor_;

/**
 * Returns the truth value of `a XOR b` element-wise. Supports broadcasting.
 *
 * ```js
 * const a = tf.tensor1d([false, false, true, true], 'bool');
 * const b = tf.tensor1d([false, true, false, true], 'bool');
 *
 * a.logicalXor(b).print();
 * ```
 *
 * @param a The first input tensor. Must be of dtype bool.
 * @param b The second input tensor. Must be of dtype bool.
 *
 * @doc {heading: 'Operations', subheading: 'Logical'}
 */
declare function logicalXor_<T extends Tensor>(a: Tensor | TensorLike, b: Tensor | TensorLike): T;

export declare type LogicalXorInputs = BinaryInputs;

export declare type LogInputs = UnaryInputs;

export declare const logSigmoid: typeof logSigmoid_;

/**
 * Computes log sigmoid of the input `tf.Tensor` element-wise:
 * `logSigmoid(x)`. For numerical stability, we use `-tf.softplus(-x)`.
 *
 * ```js
 * const x = tf.tensor1d([0, 1, -1, .7]);
 *
 * x.logSigmoid().print();  // or tf.logSigmoid(x)
 * ```
 * @param x The input tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function logSigmoid_<T extends Tensor>(x: T | TensorLike): T;

export declare const LogSoftmax = "LogSoftmax";

export declare const logSoftmax: typeof logSoftmax_;

/**
 * Computes the log softmax.
 *
 * ```js
 * const a = tf.tensor1d([1, 2, 3]);
 *
 * a.logSoftmax().print();  // or tf.logSoftmax(a)
 * ```
 *
 * ```js
 * const a = tf.tensor2d([2, 4, 6, 1, 2, 3], [2, 3]);
 *
 * a.logSoftmax().print();  // or tf.logSoftmax(a)
 * ```
 *
 * @param logits The logits array.
 * @param axis The dimension softmax would be performed on. Defaults to `-1`
 *     which indicates the last dimension.
 *
 * @doc {heading: 'Operations', subheading: 'Normalization'}
 */
declare function logSoftmax_<T extends Tensor>(logits: T | TensorLike, axis?: number): T;

export declare interface LogSoftmaxAttrs {
    axis: number;
}

export declare type LogSoftmaxInputs = Pick<NamedTensorInfoMap, 'logits'>;

export declare const logSumExp: typeof logSumExp_;

/**
 * Computes the log(sum(exp(elements across the reduction dimensions))).
 *
 * Reduces the input along the dimensions given in `axis`. Unless `keepDims`
 * is true, the rank of the array is reduced by 1 for each entry in `axis`.
 * If `keepDims` is true, the reduced dimensions are retained with length 1.
 * If `axis` has no entries, all dimensions are reduced, and an array with a
 * single element is returned.
 *
 * ```js
 * const x = tf.tensor1d([1, 2, 3]);
 *
 * x.logSumExp().print();  // or tf.logSumExp(x)
 * ```
 *
 * ```js
 * const x = tf.tensor2d([1, 2, 3, 4], [2, 2]);
 *
 * const axis = 1;
 * x.logSumExp(axis).print();  // or tf.logSumExp(a, axis)
 * ```
 * @param x The input tensor.
 * @param axis The dimension(s) to reduce. If null (the default),
 *     reduces all dimensions.
 * @param keepDims If true, retains reduced dimensions with length
 *     of 1. Defaults to false.
 *
 * @doc {heading: 'Operations', subheading: 'Reduction'}
 */
declare function logSumExp_<T extends Tensor>(x: Tensor | TensorLike, axis?: number | number[], keepDims?: boolean): T;

export declare const losses: {
    absoluteDifference: <T extends Tensor<Rank>, O extends Tensor<Rank>>(labels: TensorLike | T, predictions: TensorLike | T, weights?: TensorLike | Tensor<Rank>, reduction?: Reduction) => O;
    computeWeightedLoss: <T_1 extends Tensor<Rank>, O_1 extends Tensor<Rank>>(losses: TensorLike | T_1, weights?: TensorLike | Tensor<Rank>, reduction?: Reduction) => O_1;
    cosineDistance: <T_2 extends Tensor<Rank>, O_2 extends Tensor<Rank>>(labels: TensorLike | T_2, predictions: TensorLike | T_2, axis: number, weights?: TensorLike | Tensor<Rank>, reduction?: Reduction) => O_2;
    hingeLoss: <T_3 extends Tensor<Rank>, O_3 extends Tensor<Rank>>(labels: TensorLike | T_3, predictions: TensorLike | T_3, weights?: TensorLike | Tensor<Rank>, reduction?: Reduction) => O_3;
    huberLoss: <T_4 extends Tensor<Rank>, O_4 extends Tensor<Rank>>(labels: TensorLike | T_4, predictions: TensorLike | T_4, weights?: TensorLike | Tensor<Rank>, delta?: number, reduction?: Reduction) => O_4;
    logLoss: <T_5 extends Tensor<Rank>, O_5 extends Tensor<Rank>>(labels: TensorLike | T_5, predictions: TensorLike | T_5, weights?: TensorLike | Tensor<Rank>, epsilon?: number, reduction?: Reduction) => O_5;
    meanSquaredError: <T_6 extends Tensor<Rank>, O_6 extends Tensor<Rank>>(labels: TensorLike | T_6, predictions: TensorLike | T_6, weights?: TensorLike | Tensor<Rank>, reduction?: Reduction) => O_6;
    sigmoidCrossEntropy: <T_7 extends Tensor<Rank>, O_7 extends Tensor<Rank>>(multiClassLabels: TensorLike | T_7, logits: TensorLike | T_7, weights?: TensorLike | Tensor<Rank>, labelSmoothing?: number, reduction?: Reduction) => O_7;
    softmaxCrossEntropy: <T_8 extends Tensor<Rank>, O_8 extends Tensor<Rank>>(onehotLabels: TensorLike | T_8, logits: TensorLike | T_8, weights?: TensorLike | Tensor<Rank>, labelSmoothing?: number, reduction?: Reduction) => O_8;
};

export declare const LowerBound = "LowerBound";

/**
 * Searches for where a value would go in a sorted sequence.
 *
 * This is not a method for checking containment (like javascript in).
 *
 * The typical use case for this operation is "binning", "bucketing", or
 * "discretizing". The values are assigned to bucket-indices based on the edges
 * listed in 'sortedSequence'. This operation returns the bucket-index for each
 * value.
 *
 * The index returned corresponds to the first edge greater than or equal to the
 * value.
 *
 * The axis is not settable for this operation. It always operates on the
 * innermost dimension (axis=-1). The operation will accept any number of outer
 * dimensions.
 *
 * Note: This operation assumes that 'lowerBound' is sorted along the
 * innermost axis, maybe using 'sort(..., axis=-1)'. If the sequence is not
 * sorted no error is raised and the content of the returned tensor is not well
 * defined.
 *
 * ```js
 * const edges = tf.tensor1d([-1, 3.3, 9.1, 10.0]);
 * let values = tf.tensor1d([0.0, 4.1, 12.0]);
 * const result1 = tf.lowerBound(edges, values);
 * result1.print(); // [1, 2, 4]
 *
 * const seq = tf.tensor1d([0, 3, 9, 10, 10]);
 * values = tf.tensor1d([0, 4, 10]);
 * const result2 = tf.lowerBound(seq, values);
 * result2.print(); // [0, 2, 3]
 *
 * const sortedSequence = tf.tensor2d([[0., 3., 8., 9., 10.],
 *                                     [1., 2., 3., 4., 5.]]);
 * values = tf.tensor2d([[9.8, 2.1, 4.3],
 *                       [0.1, 6.6, 4.5, ]]);
 * const result3 = tf.lowerBound(sortedSequence, values);
 * result3.print(); // [[4, 1, 2], [0, 5, 4]]
 * ```
 * @param sortedSequence: N-D. Sorted sequence.
 * @param values: N-D. Search values.
 * @return An N-D int32 tensor the size of values containing the result of
 *     applying lower bound to each value. The result is not a global index to
 *     the entire Tensor, but the index in the last dimension.
 * @doc {heading: 'Operations', subheading: 'Evaluation'}
 */
export declare function lowerBound(sortedSequence: Tensor | TensorLike, values: Tensor | TensorLike): Tensor;

export declare type LowerBoundInputs = Pick<NamedTensorInfoMap, 'sortedSequence' | 'values'>;

export declare const LRN = "LRN";

export declare interface LRNAttrs {
    depthRadius: number;
    bias: number;
    alpha: number;
    beta: number;
}

export declare const LRNGrad = "LRNGrad";

export declare interface LRNGradAttrs {
    depthRadius: number;
    bias: number;
    alpha: number;
    beta: number;
}

export declare type LRNGradInputs = Pick<NamedTensorInfoMap, 'x' | 'y' | 'dy'>;

export declare type LRNInputs = Pick<NamedTensorInfoMap, 'x'>;

/**
 * @docalias (data: Tensor2D, c: Tensor2D, h: Tensor2D): [Tensor2D, Tensor2D]
 */
export declare type LSTMCellFunc = {
    (data: Tensor2D, c: Tensor2D, h: Tensor2D): [Tensor2D, Tensor2D];
};

declare function makeOnesTypedArray<D extends DataType>(size: number, dtype: D): DataTypeMap[D];

declare function makeTypesMatch<T extends Tensor>(a: T, b: T): [T, T];

/**
 * Make nested `TypedArray` filled with zeros.
 * @param shape The shape information for the nested array.
 * @param dtype dtype of the array element.
 */
declare function makeZerosNestedTypedArray<D extends DataType>(shape: number[], dtype: D): number | any[];

declare function makeZerosTypedArray<D extends DataType>(size: number, dtype: D): DataTypeMap[D];

/** Converts a binary mask to an array of axes. Used in stridedSlice(). */
declare function maskToAxes(mask: number): number[];

declare namespace math {
    export {
        confusionMatrix
    }
}
export { math }

export declare const matMul: typeof matMul_;

/**
 * Computes the dot product of two matrices, A * B. These must be matrices.
 *
 * ```js
 * const a = tf.tensor2d([1, 2], [1, 2]);
 * const b = tf.tensor2d([1, 2, 3, 4], [2, 2]);
 *
 * a.matMul(b).print();  // or tf.matMul(a, b)
 * ```
 * @param a First matrix in dot product operation.
 * @param b Second matrix in dot product operation.
 * @param transposeA If true, `a` is transposed before multiplication.
 * @param transposeB If true, `b` is transposed before multiplication.
 *
 * @doc {heading: 'Operations', subheading: 'Matrices'}
 */
declare function matMul_<T extends Tensor>(a: Tensor | TensorLike, b: Tensor | TensorLike, transposeA?: boolean, transposeB?: boolean): T;

declare const matMul_2: typeof fusedMatMul_;

export declare const MatrixBandPart = "MatrixBandPart";

export declare interface MatrixBandPartAttrs {
}

export declare type MatrixBandPartInputs = Pick<NamedTensorInfoMap, 'input' | 'numLower' | 'numUpper'>;

export declare const Max = "Max";

export declare const max: typeof max_;

/**
 * Computes the maximum of elements across dimensions of a `tf.Tensor`.
 *
 * Reduces the input along the dimensions given in `axes`. Unless `keepDims`
 * is true, the rank of the `tf.Tensor` is reduced by 1 for each entry in
 * `axes`. If `keepDims` is true, the reduced dimensions are retained with
 * length 1. If `axes` has no entries, all dimensions are reduced, and a
 * `tf.Tensor` with a single element is returned.
 *
 * ```js
 * const x = tf.tensor1d([1, 2, 3]);
 *
 * x.max().print();  // or tf.max(x)
 * ```
 *
 * ```js
 * const x = tf.tensor2d([1, 2, 3, 4], [2, 2]);
 *
 * const axis = 1;
 * x.max(axis).print();  // or tf.max(x, axis)
 * ```
 *
 * @param x The input tensor.
 * @param axis The dimension(s) to reduce. By default it reduces
 *     all dimensions.
 * @param keepDims If true, retains reduced dimensions with size 1.
 *
 * @doc {heading: 'Operations', subheading: 'Reduction'}
 */
declare function max_<T extends Tensor>(x: Tensor | TensorLike, axis?: number | number[], keepDims?: boolean): T;

export declare interface MaxAttrs {
    reductionIndices: number | number[];
    keepDims: boolean;
}

export declare const Maximum = "Maximum";

export declare const maximum: typeof maximum_;

/**
 * Returns the max of a and b (`a > b ? a : b`) element-wise.
 * Supports broadcasting.
 *
 * We also expose `tf.maximumStrict` which has the same signature as this op and
 * asserts that `a` and `b` are the same shape (does not broadcast).
 *
 * ```js
 * const a = tf.tensor1d([1, 4, 3, 16]);
 * const b = tf.tensor1d([1, 2, 9, 4]);
 *
 * a.maximum(b).print();  // or tf.maximum(a, b)
 * ```
 *
 * ```js
 * // Broadcast maximum a with b.
 * const a = tf.tensor1d([2, 4, 6, 8]);
 * const b = tf.scalar(5);
 *
 * a.maximum(b).print();  // or tf.maximum(a, b)
 * ```
 *
 * @param a The first tensor.
 * @param b The second tensor. Must have the same type as `a`.
 *
 * @doc {heading: 'Operations', subheading: 'Arithmetic'}
 */
declare function maximum_<T extends Tensor>(a: Tensor | TensorLike, b: Tensor | TensorLike): T;

export declare type MaximumInputs = BinaryInputs;

export declare type MaxInputs = Pick<NamedTensorInfoMap, 'x'>;

export declare const MaxPool = "MaxPool";

export declare const maxPool: typeof maxPool_;

export declare const MaxPool3D = "MaxPool3D";

export declare const maxPool3d: typeof maxPool3d_;

/**
 * Computes the 3D max pooling.
 *
 * ```js
 * const x = tf.tensor5d([1, 2, 3, 4, 5, 6, 7, 8], [1, 2, 2, 2, 1]);
 * const result = tf.maxPool3d(x, 2, 1, 'valid');
 * result.print();
 * ```
 *
 * @param x The input tensor, of rank 5 or rank 4 of shape
 *     `[batch, depth, height, width, inChannels]`.
 * @param filterSize The filter size:
 *     `[filterDepth, filterHeight, filterWidth]`.
 *     If `filterSize` is a single number,
 *     then `filterDepth == filterHeight == filterWidth`.
 * @param strides The strides of the pooling:
 *     `[strideDepth, strideHeight, strideWidth]`.
 *     If `strides` is a single number,
 *     then `strideDepth == strideHeight == strideWidth`.
 * @param pad The type of padding algorithm.
 *    - `same` and stride 1: output will be of same size as input,
 *       regardless of filter size.
 *    - `valid`: output will be smaller than input if filter is larger
 *       than 1*1x1.
 *    - For more info, see this guide:
 *     [https://www.tensorflow.org/api_docs/python/tf/nn/convolution](
 *          https://www.tensorflow.org/api_docs/python/tf/nn/convolution)
 * @param dimRoundingMode A string from: 'ceil', 'round', 'floor'. If none is
 *     provided, it will default to truncate.
 * @param dataFormat An optional string from: "NDHWC", "NCDHW". Defaults to
 *     "NDHWC". Specify the data format of the input and output data. With the
 *     default format "NDHWC", the data is stored in the order of: [batch,
 *     depth, height, width, channels]. Only "NDHWC" is currently supported.
 * @doc {heading: 'Operations', subheading: 'Convolution'}
 */
declare function maxPool3d_<T extends Tensor4D | Tensor5D>(x: T | TensorLike, filterSize: [number, number, number] | number, strides: [number, number, number] | number, pad: 'valid' | 'same' | number, dimRoundingMode?: 'floor' | 'round' | 'ceil', dataFormat?: 'NDHWC' | 'NCDHW'): T;

export declare interface MaxPool3DAttrs {
    filterSize: [number, number, number] | number;
    strides: [number, number, number] | number;
    pad: 'valid' | 'same' | number;
    dataFormat: 'NDHWC' | 'NCDHW';
    dimRoundingMode?: 'floor' | 'round' | 'ceil';
}

export declare const MaxPool3DGrad = "MaxPool3DGrad";

export declare interface MaxPool3DGradAttrs {
    filterSize: [number, number, number] | number;
    strides: [number, number, number] | number;
    pad: 'valid' | 'same' | number;
    dimRoundingMode?: 'floor' | 'round' | 'ceil';
}

export declare type MaxPool3DGradInputs = Pick<NamedTensorInfoMap, 'dy' | 'input' | 'output'>;

export declare type MaxPool3DInputs = Pick<NamedTensorInfoMap, 'x'>;

/**
 * Computes the 2D max pooling of an image.
 *
 * @param x The input tensor, of rank 4 or rank 3 of shape
 *     `[batch, height, width, inChannels]`. If rank 3, batch of 1 is assumed.
 * @param filterSize The filter size: `[filterHeight, filterWidth]`. If
 *     `filterSize` is a single number, then `filterHeight == filterWidth`.
 * @param strides The strides of the pooling: `[strideHeight, strideWidth]`. If
 *     `strides` is a single number, then `strideHeight == strideWidth`.
 * @param dilations The dilation rates: `[dilationHeight, dilationWidth]`
 *     in which we sample input values across the height and width dimensions
 *     in dilated pooling. Defaults to `[1, 1]`. If `dilations` is a single
 *     number, then `dilationHeight == dilationWidth`. If it is greater than
 *     1, then all values of `strides` must be 1.
 * @param pad The type of padding algorithm.
 *    - `same` and stride 1: output will be of same size as input,
 *       regardless of filter size.
 *    - `valid`: output will be smaller than input if filter is larger
 *       than 1x1.
 *    - For more info, see this guide:
 *     [https://www.tensorflow.org/api_docs/python/tf/nn/convolution](
 *          https://www.tensorflow.org/api_docs/python/tf/nn/convolution)
 * @param dimRoundingMode A string from: 'ceil', 'round', 'floor'. If none is
 *     provided, it will default to truncate.
 */
declare function maxPool_<T extends Tensor3D | Tensor4D>(x: T | TensorLike, filterSize: [number, number] | number, strides: [number, number] | number, pad: 'valid' | 'same' | number | conv_util.ExplicitPadding, dimRoundingMode?: 'floor' | 'round' | 'ceil'): T;

export declare interface MaxPoolAttrs {
    filterSize: [number, number] | number;
    strides: [number, number] | number;
    pad: 'valid' | 'same' | number | ExplicitPadding;
    dimRoundingMode?: 'floor' | 'round' | 'ceil';
}

export declare const MaxPoolGrad = "MaxPoolGrad";

export declare interface MaxPoolGradAttrs {
    filterSize: [number, number] | number;
    strides: [number, number] | number;
    pad: 'valid' | 'same' | number | ExplicitPadding;
    dimRoundingMode?: 'floor' | 'round' | 'ceil';
}

export declare type MaxPoolGradInputs = Pick<NamedTensorInfoMap, 'dy' | 'input' | 'output'>;

export declare type MaxPoolInputs = Pick<NamedTensorInfoMap, 'x'>;

export declare const MaxPoolWithArgmax = "MaxPoolWithArgmax";

export declare const maxPoolWithArgmax: typeof maxPoolWithArgmax_;

/**
 * Computes the 2D max pooling of an image with Argmax index.
 * The indices in argmax are flattened, so that a maximum value at position `[b,
 * y, x, c]` becomes flattened index: `(y * width + x) * channels + c` if
 * include_batch_in_index is False; `((b * height + y) * width + x) * channels
 * +c` if include_batch_in_index is True.
 *
 * The indices returned are always in `[0, height) x [0, width)` before
 * flattening.
 *
 * @param x The input tensor, of rank 4 or rank 3 of shape
 *     `[batch, height, width, inChannels]`. If rank 3, batch of 1 is assumed.
 * @param filterSize The filter size: `[filterHeight, filterWidth]`. If
 *     `filterSize` is a single number, then `filterHeight == filterWidth`.
 * @param strides The strides of the pooling: `[strideHeight, strideWidth]`. If
 *     `strides` is a single number, then `strideHeight == strideWidth`.
 * @param dataFormat An optional string from: "NDHWC", "NCDHW". Defaults to
 *     "NDHWC". Specify the data format of the input and output data. With the
 *     default format "NDHWC", the data is stored in the order of: [batch,
 *     depth, height, width, channels]. Only "NDHWC" is currently supported.
 * @param pad The type of padding algorithm.
 *    - `same` and stride 1: output will be of same size as input,
 *       regardless of filter size.
 *    - `valid`: output will be smaller than input if filter is larger
 *       than 1x1.
 *    - For more info, see this guide:
 *     [https://www.tensorflow.org/api_docs/python/tf/nn/convolution](
 *          https://www.tensorflow.org/api_docs/python/tf/nn/convolution)
 * @param includeBatchIndex Defaults to False. Whether to include batch
 *    dimension in flattened index of argmax.
 *
 * @doc {heading: 'Operations', subheading: 'Convolution'}
 */
declare function maxPoolWithArgmax_<T extends Tensor4D>(x: T | TensorLike, filterSize: [number, number] | number, strides: [number, number] | number, pad: 'valid' | 'same' | number, includeBatchInIndex?: boolean): NamedTensorMap;

export declare interface MaxPoolWithArgmaxAttrs {
    filterSize: [number, number] | number;
    strides: [number, number] | number;
    pad: 'valid' | 'same' | number;
    includeBatchInIndex: boolean;
}

export declare type MaxPoolWithArgmaxInputs = Pick<NamedTensorInfoMap, 'x'>;

export declare const Mean = "Mean";

export declare const mean: typeof mean_;

/**
 * Computes the mean of elements across dimensions of a `tf.Tensor`.
 *
 * Reduces `x` along the dimensions given in `axis`. Unless `keepDims` is
 * true, the rank of the `tf.Tensor` is reduced by 1 for each entry in `axis`.
 * If `keepDims` is true, the reduced dimensions are retained with length 1.
 * If `axis` has no entries, all dimensions are reduced, and a `tf.Tensor` with
 * a single element is returned.
 *
 * ```js
 * const x = tf.tensor1d([1, 2, 3]);
 *
 * x.mean().print();  // or tf.mean(a)
 * ```
 *
 * ```js
 * const x = tf.tensor2d([1, 2, 3, 4], [2, 2]);
 *
 * const axis = 1;
 * x.mean(axis).print();  // or tf.mean(x, axis)
 * ```
 *
 * @param x The input tensor.
 * @param axis The dimension(s) to reduce. By default it reduces
 *     all dimensions.
 * @param keepDims If true, retains reduced dimensions with size 1.
 *
 * @doc {heading: 'Operations', subheading: 'Reduction'}
 */
declare function mean_<T extends Tensor>(x: Tensor | TensorLike, axis?: number | number[], keepDims?: boolean): T;

export declare interface MeanAttrs {
    axis: number | number[];
    keepDims: boolean;
}

export declare type MeanInputs = Pick<NamedTensorInfoMap, 'x'>;

/**
 * Returns memory info at the current time in the program. The result is an
 * object with the following properties:
 *
 * - `numBytes`: Number of bytes allocated (undisposed) at this time.
 * - `numTensors`: Number of unique tensors allocated.
 * - `numDataBuffers`: Number of unique data buffers allocated
 *   (undisposed) at this time, which is ≤ the number of tensors
 *   (e.g. `a.reshape(newShape)` makes a new Tensor that shares the same
 *   data buffer with `a`).
 * - `unreliable`: True if the memory usage is unreliable. See `reasons` when
 *    `unreliable` is true.
 * - `reasons`: `string[]`, reasons why the memory is unreliable, present if
 *    `unreliable` is true.
 *
 * WebGL Properties:
 * - `numBytesInGPU`: Number of bytes allocated (undisposed) in the GPU only at
 *     this time.
 *
 * @doc {heading: 'Performance', subheading: 'Memory'}
 */
export declare function memory(): MemoryInfo;

export declare type MemoryInfo = {
    numTensors: number;
    numDataBuffers: number;
    numBytes: number;
    unreliable?: boolean;
    reasons: string[];
};

/**
 * Merges real and imaginary Float32Arrays into a single complex Float32Array.
 *
 * The memory layout is interleaved as follows:
 * real: [r0, r1, r2]
 * imag: [i0, i1, i2]
 * complex: [r0, i0, r1, i1, r2, i2]
 *
 * This is the inverse of splitRealAndImagArrays.
 *
 * @param real The real values of the complex tensor values.
 * @param imag The imag values of the complex tensor values.
 * @returns A complex tensor as a Float32Array with merged values.
 */
declare function mergeRealAndImagArrays(real: Float32Array, imag: Float32Array): Float32Array;

/**
 * Broadcasts parameters for evaluation on an N-D grid.
 *
 * Given N one-dimensional coordinate arrays `*args`, returns a list `outputs`
 * of N-D coordinate arrays for evaluating expressions on an N-D grid.
 *
 * Notes:
 * `meshgrid` supports cartesian ('xy') and matrix ('ij') indexing conventions.
 * When the `indexing` argument is set to 'xy' (the default), the broadcasting
 * instructions for the first two dimensions are swapped.
 * Examples:
 * Calling `const [X, Y] = meshgrid(x, y)` with the tensors
 *
 * ```javascript
 * const x = [1, 2, 3];
 * const y = [4, 5, 6];
 * const [X, Y] = tf.meshgrid(x, y);
 * // X = [[1, 2, 3],
 * //      [1, 2, 3],
 * //      [1, 2, 3]]
 * // Y = [[4, 4, 4],
 * //      [5, 5, 5],
 * //      [6, 6, 6]]
 * ```
 *
 * @param x Tensor with rank geq 1.
 * @param y Tensor with rank geq 1.
 * @param indexing
 *
 * @doc {heading: 'Operations', subheading: 'Slicing and Joining'}
 */
export declare function meshgrid<T extends Tensor>(x?: T | TensorLike, y?: T | TensorLike, { indexing }?: {
    indexing?: string;
}): T[];

/**
 * Interface for SavedModel/GraphModel MetaGraph info.
 */
export declare interface MetaGraph {
    tags: string[];
    signatureDefs: SignatureDef;
}

/**
 * @deprecated Deprecated interface for SavedModel/GraphModel MetaGraph info.
 *     User MetaGraph instead.
 */
export declare interface MetaGraphInfo {
    tags: string[];
    signatureDefs: SignatureDefInfo;
}

export declare const Min = "Min";

export declare const min: typeof min_;

/**
 * Computes the minimum value from the input.
 *
 * Reduces the input along the dimensions given in `axes`. Unless `keepDims`
 * is true, the rank of the array is reduced by 1 for each entry in `axes`.
 * If `keepDims` is true, the reduced dimensions are retained with length 1.
 * If `axes` has no entries, all dimensions are reduced, and an array with a
 * single element is returned.
 *
 * ```js
 * const x = tf.tensor1d([1, 2, 3]);
 *
 * x.min().print();  // or tf.min(x)
 * ```
 *
 * ```js
 * const x = tf.tensor2d([1, 2, 3, 4], [2, 2]);
 *
 * const axis = 1;
 * x.min(axis).print();  // or tf.min(x, axis)
 * ```
 *
 * @param x The input Tensor.
 * @param axis The dimension(s) to reduce. By default it reduces
 *     all dimensions.
 * @param keepDims If true, retains reduced dimensions with size 1.
 *
 * @doc {heading: 'Operations', subheading: 'Reduction'}
 */
declare function min_<T extends Tensor>(x: Tensor | TensorLike, axis?: number | number[], keepDims?: boolean): T;

export declare interface MinAttrs {
    axis: number | number[];
    keepDims: boolean;
}

export declare const Minimum = "Minimum";

export declare const minimum: typeof minimum_;

/**
 * Returns the min of a and b (`a < b ? a : b`) element-wise.
 * Supports broadcasting.
 *
 * We also expose `minimumStrict` which has the same signature as this op and
 * asserts that `a` and `b` are the same shape (does not broadcast).
 *
 * ```js
 * const a = tf.tensor1d([1, 4, 3, 16]);
 * const b = tf.tensor1d([1, 2, 9, 4]);
 *
 * a.minimum(b).print();  // or tf.minimum(a, b)
 * ```
 *
 * ```js
 * // Broadcast minimum a with b.
 * const a = tf.tensor1d([2, 4, 6, 8]);
 * const b = tf.scalar(5);
 *
 * a.minimum(b).print();  // or tf.minimum(a, b)
 * ```
 *
 * @param a The first tensor.
 * @param b The second tensor. Must have the same type as `a`.
 *
 * @doc {heading: 'Operations', subheading: 'Arithmetic'}
 */
declare function minimum_<T extends Tensor>(a: Tensor | TensorLike, b: Tensor | TensorLike): T;

export declare type MinimumInputs = BinaryInputs;

export declare type MinInputs = Pick<NamedTensorInfoMap, 'x'>;

export declare const MirrorPad = "MirrorPad";

export declare const mirrorPad: typeof mirrorPad_;

/**
 * Pads a `tf.Tensor` using mirror padding.
 *
 * This operation implements the `REFLECT` and `SYMMETRIC` modes of pad.
 *
 * ```js
 * const x = tf.range(0, 9).reshape([1, 1, 3, 3]);
 * x.mirrorPad([[0, 0], [0, 0], [2, 2], [2, 2]], 'reflect').print();
 * ```
 * @param x The tensor to pad.
 * @param paddings An array of length `R` (the rank of the tensor), where
 * each element is a length-2 tuple of ints `[padBefore, padAfter]`,
 * specifying how much to pad along each dimension of the tensor.
 * In "reflect" mode, the padded regions do not include the borders,
 * while in "symmetric" mode the padded regions do include the borders.
 * For example, if the input is `[1, 2, 3]` and paddings is `[0, 2]`,
 * then the output is `[1, 2, 3, 2, 1]` in "reflect" mode, and
 * `[1, 2, 3, 3, 2]` in "symmetric" mode.
 * If `mode` is "reflect" then both `paddings[D, 0]` and `paddings[D, 1]`
 * must be no greater than `x.shape[D] - 1`. If mode is "symmetric"
 * then both `paddings[D, 0]` and `paddings[D, 1]` must be no greater than
 * `x.shape[D]`
 * @param mode String to specify padding mode. Can be `'reflect' | 'symmetric'`
 */
/** @doc {heading: 'Tensors', subheading: 'Transformations'} */
declare function mirrorPad_<T extends Tensor>(x: T | TensorLike, paddings: Array<[number, number]>, mode: 'reflect' | 'symmetric'): T;

export declare interface MirrorPadAttrs {
    paddings: Array<[number, number]>;
    mode: 'reflect' | 'symmetric';
}

export declare type MirrorPadInputs = Pick<NamedTensorInfoMap, 'x'>;

/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
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
declare function mockIsMobile(value: boolean | undefined): void;

export declare const Mod = "Mod";

export declare const mod: typeof mod_;

/**
 * Returns the mod of a and b element-wise.
 * `floor(x / y) * y + mod(x, y) = x`
 * Supports broadcasting.
 *
 * We also expose `tf.modStrict` which has the same signature as this op and
 * asserts that `a` and `b` are the same shape (does not broadcast).
 *
 * ```js
 * const a = tf.tensor1d([1, 4, 3, 16]);
 * const b = tf.tensor1d([1, 2, 9, 4]);
 *
 * a.mod(b).print();  // or tf.mod(a, b)
 * ```
 *
 * ```js
 * // Broadcast a mod b.
 * const a = tf.tensor1d([2, 4, 6, 8]);
 * const b = tf.scalar(5);
 *
 * a.mod(b).print();  // or tf.mod(a, b)
 * ```
 *
 * @param a The first tensor.
 * @param b The second tensor. Must have the same type as `a`.
 *
 * @doc {heading: 'Operations', subheading: 'Arithmetic'}
 */
declare function mod_<T extends Tensor>(a: Tensor | TensorLike, b: Tensor | TensorLike): T;

/**
 * The serialized artifacts of a model, including topology and weights.
 *
 * The `modelTopology`, `trainingConfig`, `weightSpecs` and `weightData` fields
 * of this interface are optional, in order to support topology- or weights-only
 * saving and loading.
 *
 * Note this interface is used internally in IOHandlers.  For the file format
 * written to disk as `model.json`, see `ModelJSON`.
 */
declare interface ModelArtifacts {
    /**
     * Model topology.
     *
     * For Keras-style `tf.Model`s, this is a JSON object.
     * For TensorFlow-style models (e.g., `SavedModel`), this is the JSON
     * encoding of the `GraphDef` protocol buffer.
     */
    modelTopology?: {} | ArrayBuffer;
    /**
     * Serialized configuration for the model's training.
     */
    trainingConfig?: TrainingConfig;
    /**
     * Weight specifications.
     *
     * This corresponds to the weightsData below.
     */
    weightSpecs?: WeightsManifestEntry[];
    /**
     * Binary buffer(s) for all weight values in the order specified by
     * `weightSpecs`. This may be a single ArrayBuffer of all the weights
     * concatenated together or an Array of ArrayBuffers containing the weights
     * (weights may be sharded across multiple ArrayBuffers).
     */
    weightData?: WeightData;
    /**
     * Hard-coded format name for models saved from TensorFlow.js or converted
     * by TensorFlow.js Converter.
     */
    format?: string;
    /**
     * What library is responsible for originally generating this artifact.
     *
     * Used for debugging purposes. E.g., 'TensorFlow.js v1.0.0'.
     */
    generatedBy?: string;
    /**
     * What library or tool is responsible for converting the original model
     * to this format, applicable only if the model is output by a converter.
     *
     * Used for debugging purposes.  E.g., 'TensorFlow.js Converter v1.0.0'.
     *
     * A value of `null` means the model artifacts are generated without any
     * conversion process (e.g., saved directly from a TensorFlow.js
     * `tf.LayersModel` instance.)
     */
    convertedBy?: string | null;
    /**
     * Inputs and outputs signature for saved model.
     */
    signature?: {};
    /**
     * User-defined metadata about the model.
     */
    userDefinedMetadata?: {
        [key: string]: {};
    };
    /**
     * Initializer for the model.
     */
    modelInitializer?: {};
    /**
     * Inputs and outputs signature for model initializer.
     */
    initializerSignature?: {};
}

declare interface ModelArtifactsInfo {
    /**
     * Timestamp for when the model is saved.
     */
    dateSaved: Date;
    /**
     * TODO (cais,yassogba) consider removing GraphDef as GraphDefs now
     * come in a JSON format and none of our IOHandlers support a non json
     * format. We could conder replacing this with 'Binary' if we want to
     * allow future handlers to save to non json formats (though they will
     * probably want more information than 'Binary').
     * Type of the model topology
     *
     * Type of the model topology
     *
     * Possible values:
     *   - JSON: JSON config (human-readable, e.g., Keras JSON).
     *   - GraphDef: TensorFlow
     *     [GraphDef](https://www.tensorflow.org/extend/tool_developers/#graphdef)
     *     protocol buffer (binary).
     */
    modelTopologyType: 'JSON' | 'GraphDef';
    /**
     * Size of model topology (Keras JSON or GraphDef), in bytes.
     */
    modelTopologyBytes?: number;
    /**
     * Size of weight specification or manifest, in bytes.
     */
    weightSpecsBytes?: number;
    /**
     * Size of weight value data, in bytes.
     */
    weightDataBytes?: number;
}

/**
 * The on-disk format of the `model.json` file.
 *
 * TF.js 1.0 always populates the optional fields when writing model.json.
 * Prior versions did not provide those fields.
 */
declare interface ModelJSON {
    /**
     * Model topology.
     *
     * For Keras-style `tf.Model`s, this is a JSON object.
     * For TensorFlow-style models (e.g., `SavedModel`), this is the JSON
     * encoding of the `GraphDef` protocol buffer.
     */
    modelTopology: {};
    /** Model training configuration. */
    trainingConfig?: TrainingConfig;
    /**
     * Weights manifest.
     *
     * The weights manifest consists of an ordered list of weight-manifest
     * groups. Each weight-manifest group consists of a number of weight values
     * stored in a number of paths. See the documentation of
     * `WeightsManifestConfig` for more details.
     */
    weightsManifest: WeightsManifestConfig;
    /**
     * Hard-coded format name for models saved from TensorFlow.js or converted
     * by TensorFlow.js Converter.
     */
    format?: string;
    /**
     * What library is responsible for originally generating this artifact.
     *
     * Used for debugging purposes. E.g., 'TensorFlow.js v1.0.0'.
     */
    generatedBy?: string;
    /**
     * What library or tool is responsible for converting the original model
     * to this format, applicable only if the model is output by a converter.
     *
     * Used for debugging purposes.  E.g., 'TensorFlow.js Converter v1.0.0'.
     *
     * A value of `null` means the model artifacts are generated without any
     * conversion process (e.g., saved directly from a TensorFlow.js
     * `tf.LayersModel` instance.)
     */
    convertedBy?: string | null;
    /**
     * Inputs and outputs signature for saved model.
     */
    signature?: {};
    /**
     * User-defined metadata about the model.
     */
    userDefinedMetadata?: {
        [key: string]: {};
    };
    /**
     * Initializer for the model.
     */
    modelInitializer?: {};
    /**
     * Inputs and outputs signature for model initializer.
     */
    initializerSignature?: {};
}

export declare interface ModelPredictConfig {
    /**
     * Optional. Batch size (Integer). If unspecified, it will default to 32.
     */
    batchSize?: number;
    /**
     * Optional. Verbosity mode. Defaults to false.
     */
    verbose?: boolean;
}

/**
 * An interface for the manager of a model store.
 *
 * A model store is defined as a storage medium on which multiple models can
 * be stored. Each stored model has a unique `path` as its identifier.
 * A `ModelStoreManager` for the store allows actions including
 *
 * - Listing the models stored in the store.
 * - Deleting a model from the store.
 */
declare interface ModelStoreManager {
    /**
     * List all models in the model store.
     *
     * @returns A dictionary mapping paths of existing models to their
     *   model artifacts info. Model artifacts info include type of the model's
     *   topology, byte sizes of the topology, weights, etc.
     */
    listModels(): Promise<{
        [path: string]: ModelArtifactsInfo;
    }>;
    /**
     * Remove a model specified by `path`.
     *
     * @param path
     * @returns ModelArtifactsInfo of the deleted model (if and only if deletion
     *   is successful).
     * @throws Error if deletion fails, e.g., if no model exists at `path`.
     */
    removeModel(path: string): Promise<ModelArtifactsInfo>;
}

/**
 * Interface for model input/output tensor info.
 */
export declare interface ModelTensorInfo {
    name: string;
    shape?: number[];
    dtype: DataType;
    tfDtype?: string;
}

export declare type ModInputs = BinaryInputs;

export declare const moments: typeof moments_;

/**
 * Calculates the mean and variance of `x`. The mean and variance are
 * calculated by aggregating the contents of `x` across `axes`. If `x` is
 * 1-D and `axes = [0]` this is just the mean and variance of a vector.
 *
 * @param x The input tensor.
 * @param axis The dimension(s) along with to compute mean and
 *     variance. By default it reduces all dimensions.
 * @param keepDims If true, the moments have the same dimensionality as the
 *     input.
 * @return An object with two keys: `mean` and `variance`.
 *
 * @doc {heading: 'Operations', subheading: 'Normalization'}
 */
declare function moments_(x: Tensor | TensorLike, axis?: number | number[], keepDims?: boolean): {
    mean: Tensor;
    variance: Tensor;
};

/** @doclink Optimizer */
export declare class MomentumOptimizer extends SGDOptimizer {
    protected learningRate: number;
    private momentum;
    private useNesterov;
    /** @nocollapse */
    static get className(): string;
    private m;
    private accumulations;
    constructor(learningRate: number, momentum: number, useNesterov?: boolean);
    applyGradients(variableGradients: NamedVariableMap | NamedTensor[]): void;
    dispose(): void;
    /**
     * Sets the momentum of the optimizer.
     *
     * @param momentum
     */
    setMomentum(momentum: number): void;
    getWeights(): Promise<NamedTensor[]>;
    setWeights(weightValues: NamedTensor[]): Promise<void>;
    getConfig(): ConfigDict;
    /** @nocollapse */
    static fromConfig<T extends Serializable>(cls: SerializableConstructor<T>, config: ConfigDict): T;
}

/**
 * Move a model from one URL to another.
 *
 * This function supports:
 *
 * 1. Moving within a storage medium, e.g.,
 *    `tf.io.moveModel('localstorage://model-1', 'localstorage://model-2')`
 * 2. Moving between two storage mediums, e.g.,
 *    `tf.io.moveModel('localstorage://model-1', 'indexeddb://model-1')`
 *
 * ```js
 * // First create and save a model.
 * const model = tf.sequential();
 * model.add(tf.layers.dense(
 *     {units: 1, inputShape: [10], activation: 'sigmoid'}));
 * await model.save('localstorage://demo/management/model1');
 *
 * // Then list existing models.
 * console.log(JSON.stringify(await tf.io.listModels()));
 *
 * // Move the model, from Local Storage to IndexedDB.
 * await tf.io.moveModel(
 *     'localstorage://demo/management/model1',
 *     'indexeddb://demo/management/model1');
 *
 * // List models again.
 * console.log(JSON.stringify(await tf.io.listModels()));
 *
 * // Remove the moved model.
 * await tf.io.removeModel('indexeddb://demo/management/model1');
 * ```
 *
 * @param sourceURL Source URL of moving.
 * @param destURL Destination URL of moving.
 * @returns ModelArtifactsInfo of the copied model (if and only if copying
 *   is successful).
 * @throws Error if moving fails, e.g., if no model exists at `sourceURL`, or
 *   if `oldPath` and `newPath` are identical.
 *
 * @doc {
 *   heading: 'Models',
 *   subheading: 'Management',
 *   namespace: 'io',
 *   ignoreCI: true
 * }
 */
declare function moveModel(sourceURL: string, destURL: string): Promise<ModelArtifactsInfo>;

export declare const movingAverage: typeof movingAverage_;

/**
 * Compute the moving average of a variable.
 *
 * Without zeroDebias, the moving average operation is defined by:
 *   `v += delta`
 * where
 *   `delta = (1 - decay) * (x - v)`
 *
 * With zeroDebias (default), the `delta` term is scaled to debias the
 * effect of the (assumed) zero-initialization of `v`.
 *   `delta /= (1 - decay ^ step)`
 *
 * For more details on the zero-debiasing algorithm, see:
 *   https://arxiv.org/abs/1412.6980
 *
 * Note that this function is completely stateless and does not keep track of
 * step count. The step count needs to be maintained by the caller and passed
 * in as `step`.
 *
 * @param v The current moving average value.
 * @param x New input value, must have the same shape and dtype as `v`.
 * @param decay The decay factor. Typical values are 0.95 and 0.99.
 * @param step Step count.
 * @param zeroDebias: Whether zeroDebias is to be performed (default: `true`).
 * @returns The new moving average value.
 *
 * @doc {heading: 'Operations', subheading: 'Moving Average'}
 */
declare function movingAverage_<T extends Tensor>(v: T | TensorLike, x: T | TensorLike, decay: number | Scalar, step?: number | Scalar, zeroDebias?: boolean): T;

export declare const mul: typeof mul_;

/**
 * Multiplies two `tf.Tensor`s element-wise, A * B. Supports broadcasting.
 *
 * We also expose `tf.mulStrict` which has the same signature as this op and
 * asserts that `a` and `b` are the same shape (does not broadcast).
 *
 * ```js
 * const a = tf.tensor1d([1, 2, 3, 4]);
 * const b = tf.tensor1d([2, 3, 4, 5]);
 *
 * a.mul(b).print();  // or tf.mul(a, b)
 * ```
 *
 * ```js
 * // Broadcast mul a with b.
 * const a = tf.tensor1d([1, 2, 3, 4]);
 * const b = tf.scalar(5);
 *
 * a.mul(b).print();  // or tf.mul(a, b)
 * ```
 * @param a The first tensor to multiply.
 * @param b The second tensor to multiply. Must have the same dtype as `a`.
 *
 * @doc {heading: 'Operations', subheading: 'Arithmetic'}
 */
declare function mul_<T extends Tensor>(a: Tensor | TensorLike, b: Tensor | TensorLike): T;

export declare const Multinomial = "Multinomial";

export declare const multinomial: typeof multinomial_;

/**
 * Creates a `tf.Tensor` with values drawn from a multinomial distribution.
 *
 * ```js
 * const probs = tf.tensor([.75, .25]);
 * tf.multinomial(probs, 3).print();
 * ```
 *
 * @param logits 1D array with unnormalized log-probabilities, or
 *     2D array of shape `[batchSize, numOutcomes]`. See the `normalized`
 *     parameter.
 * @param numSamples Number of samples to draw for each row slice.
 * @param seed The seed number.
 * @param normalized Whether the provided `logits` are normalized true
 *     probabilities (sum to 1). Defaults to false.
 * @return 1D array of shape `[numSamples]`, or 2D array of shape
 *     `[batchSize, numSamples]`, depending on the rank of the input.
 *
 * @doc {heading: 'Tensors', subheading: 'Random'}
 */
declare function multinomial_(logits: Tensor1D | Tensor2D | TensorLike, numSamples: number, seed?: number, normalized?: boolean): Tensor1D | Tensor2D;

export declare interface MultinomialAttrs {
    numSamples: number;
    seed: number;
    normalized: boolean;
}

export declare type MultinomialInputs = Pick<NamedTensorInfoMap, 'logits'>;

export declare const Multiply = "Multiply";

export declare type MultiplyInputs = BinaryInputs;

export declare const multiRNNCell: typeof multiRNNCell_;

/**
 * Computes the next states and outputs of a stack of LSTMCells.
 *
 * Each cell output is used as input to the next cell.
 *
 * Returns `[cellState, cellOutput]`.
 *
 * Derived from tf.contrib.rn.MultiRNNCell.
 *
 * @param lstmCells Array of LSTMCell functions.
 * @param data The input to the cell.
 * @param c Array of previous cell states.
 * @param h Array of previous cell outputs.
 *
 * @doc {heading: 'Operations', subheading: 'RNN'}
 */
declare function multiRNNCell_(lstmCells: LSTMCellFunc[], data: Tensor2D | TensorLike, c: Array<Tensor2D | TensorLike>, h: Array<Tensor2D | TensorLike>): [Tensor2D[], Tensor2D[]];

export declare interface NamedAttrMap {
    [name: string]: Attribute;
}

declare type NamedGradientMap = {
    [inputName: string]: () => Tensor;
};

declare interface NamedTensor {
    name: string;
    tensor: Tensor;
}

export declare interface NamedTensorInfoMap {
    [name: string]: TensorInfo | undefined;
}

/** @docalias {[name: string]: Tensor} */
export declare type NamedTensorMap = {
    [name: string]: Tensor;
};

declare type NamedVariableMap = {
    [name: string]: Variable;
};

declare function nearestDivisor(size: number, start: number): number;

declare function nearestLargerEven(val: number): number;

export declare const Neg = "Neg";

export declare const neg: typeof neg_;

/**
 * Computes `-1 * x` element-wise.
 *
 * ```js
 * const x = tf.tensor2d([1, 2, -2, 0], [2, 2]);
 *
 * x.neg().print();  // or tf.neg(x)
 * ```
 *
 * @param x The input tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function neg_<T extends Tensor>(x: T | TensorLike): T;

export declare type NegInputs = UnaryInputs;

/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
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
/**
 * Returns a promise that resolves when a requestAnimationFrame has completed.
 *
 * On Node.js this uses setImmediate instead of requestAnimationFrame.
 *
 * This is simply a sugar method so that users can do the following:
 * `await tf.nextFrame();`
 *
 * @doc {heading: 'Performance', subheading: 'Timing'}
 */
export declare function nextFrame(): Promise<void>;

declare interface NonMaxSuppressionResult {
    selectedIndices: number[];
    selectedScores?: number[];
    validOutputs?: number;
}

export declare const NonMaxSuppressionV3 = "NonMaxSuppressionV3";

export declare interface NonMaxSuppressionV3Attrs {
    maxOutputSize: number;
    iouThreshold: number;
    scoreThreshold: number;
}

declare function nonMaxSuppressionV3Impl(boxes: TypedArray, scores: TypedArray, maxOutputSize: number, iouThreshold: number, scoreThreshold: number): NonMaxSuppressionResult;

export declare type NonMaxSuppressionV3Inputs = Pick<NamedTensorInfoMap, 'boxes' | 'scores'>;

export declare const NonMaxSuppressionV4 = "NonMaxSuppressionV4";

export declare interface NonMaxSuppressionV4Attrs {
    maxOutputSize: number;
    iouThreshold: number;
    scoreThreshold: number;
    padToMaxOutputSize: boolean;
}

declare function nonMaxSuppressionV4Impl(boxes: TypedArray, scores: TypedArray, maxOutputSize: number, iouThreshold: number, scoreThreshold: number, padToMaxOutputSize: boolean): NonMaxSuppressionResult;

export declare type NonMaxSuppressionV4Inputs = Pick<NamedTensorInfoMap, 'boxes' | 'scores'>;

export declare const NonMaxSuppressionV5 = "NonMaxSuppressionV5";

export declare interface NonMaxSuppressionV5Attrs {
    maxOutputSize: number;
    iouThreshold: number;
    scoreThreshold: number;
    softNmsSigma: number;
}

declare function nonMaxSuppressionV5Impl(boxes: TypedArray, scores: TypedArray, maxOutputSize: number, iouThreshold: number, scoreThreshold: number, softNmsSigma: number): NonMaxSuppressionResult;

export declare type NonMaxSuppressionV5Inputs = Pick<NamedTensorInfoMap, 'boxes' | 'scores'>;

export declare const norm: typeof norm_;

/**
 * Computes the norm of scalar, vectors, and matrices.
 * This function can compute several different vector norms (the 1-norm, the
 * Euclidean or 2-norm, the inf-norm, and in general the p-norm for p > 0)
 * and matrix norms (Frobenius, 1-norm, and inf-norm).
 *
 * ```js
 * const x = tf.tensor1d([1, 2, 3, 4]);
 *
 * x.norm().print();  // or tf.norm(x)
 * ```
 *
 * @param x The input array.
 * @param ord Optional. Order of the norm. Supported norm types are
 * following:
 *
 *  | ord        | norm for matrices         | norm for vectors
 *  |------------|---------------------------|---------------------
 *  |'euclidean' |Frobenius norm             |2-norm
 *  |'fro'       |Frobenius norm	           |
 *  |Infinity    |max(sum(abs(x), axis=1))   |max(abs(x))
 *  |-Infinity   |min(sum(abs(x), axis=1))   |min(abs(x))
 *  |1           |max(sum(abs(x), axis=0))   |sum(abs(x))
 *  |2           |                           |sum(abs(x)^2)^(1/2)
 *
 * @param axis Optional. If axis is null (the default), the input is
 * considered a vector and a single vector norm is computed over the entire
 * set of values in the Tensor, i.e. norm(x, ord) is equivalent
 * to norm(x.reshape([-1]), ord). If axis is an integer, the input
 * is considered a batch of vectors, and axis determines the axis in x
 * over which to compute vector norms. If axis is a 2-tuple of integer it is
 * considered a batch of matrices and axis determines the axes in NDArray
 * over which to compute a matrix norm.
 * @param keepDims Optional. If true, the norm has the same dimensionality
 * as the input.
 *
 * @doc {heading: 'Operations', subheading: 'Matrices'}
 */
declare function norm_(x: Tensor | TensorLike, ord?: number | 'euclidean' | 'fro', axis?: number | number[], keepDims?: boolean): Tensor;

export declare const NotEqual = "NotEqual";

export declare const notEqual: typeof notEqual_;

/**
 * Returns the truth value of (a != b) element-wise. Supports broadcasting.
 *
 * ```js
 * const a = tf.tensor1d([1, 2, 3]);
 * const b = tf.tensor1d([0, 2, 3]);
 *
 * a.notEqual(b).print();
 * ```
 * @param a The first input tensor.
 * @param b The second input tensor. Must have the same dtype as `a`.
 *
 * @doc {heading: 'Operations', subheading: 'Logical'}
 */
declare function notEqual_<T extends Tensor>(a: Tensor | TensorLike, b: Tensor | TensorLike): T;

export declare type NotEqualInputs = BinaryInputs;

/**
 * Returns the current high-resolution time in milliseconds relative to an
 * arbitrary time in the past. It works across different platforms (node.js,
 * browsers).
 *
 * ```js
 * console.log(tf.util.now());
 * ```
 *
 * @doc {heading: 'Util', namespace: 'util'}
 */
declare function now(): number;

export declare type NumericDataType = 'float32' | 'int32' | 'bool' | 'complex64';

export declare const OneHot = "OneHot";

export declare const oneHot: typeof oneHot_;

/**
 * Creates a one-hot `tf.Tensor`. The locations represented by `indices` take
 * value `onValue` (defaults to 1), while all other locations take value
 * `offValue` (defaults to 0). If `indices` is rank `R`, the output has rank
 * `R+1` with the last axis of size `depth`.
 * `indices` used to encode prediction class must start from 0. For example,
 *  if you have 3 classes of data, class 1 should be encoded as 0, class 2
 *  should be 1, and class 3 should be 2.
 *
 * ```js
 * tf.oneHot(tf.tensor1d([0, 1], 'int32'), 3).print();
 * ```
 *
 * @param indices `tf.Tensor` of indices with dtype `int32`. Indices must
 * start from 0.
 * @param depth The depth of the one hot dimension.
 * @param onValue A number used to fill in the output when the index matches
 * the location.
 * @param offValue A number used to fill in the output when the index does
 *     not match the location.
 * @param dtype The dtype of the output tensor, default to 'int32'.
 *
 * @doc {heading: 'Tensors', subheading: 'Creation'}
 */
declare function oneHot_(indices: Tensor | TensorLike, depth: number, onValue?: number, offValue?: number, dtype?: DataType): Tensor;

export declare interface OneHotAttrs {
    depth: number;
    onValue: number;
    offValue: number;
    dtype: DataType;
}

export declare type OneHotInputs = Pick<NamedTensorInfoMap, 'indices'>;

/**
 * Creates a `tf.Tensor` with all elements set to 1.
 *
 * ```js
 * tf.ones([2, 2]).print();
 * ```
 *
 * @param shape An array of integers defining the output tensor shape.
 * @param dtype The type of an element in the resulting tensor. Defaults to
 *     'float'.
 *
 * @doc {heading: 'Tensors', subheading: 'Creation'}
 */
export declare function ones<R extends Rank>(shape: ShapeMap[R], dtype?: DataType): Tensor<R>;

export declare const OnesLike = "OnesLike";

export declare const onesLike: typeof onesLike_;

/**
 * Creates a `tf.Tensor` with all elements set to 1 with the same shape as the
 * given tensor.
 *
 * ```js
 * const x = tf.tensor([1, 2]);
 * tf.onesLike(x).print();
 * ```
 * @param x A tensor.
 *
 * @doc {heading: 'Tensors', subheading: 'Creation'}
 */
declare function onesLike_<T extends Tensor>(x: T | TensorLike): T;

export declare type OnesLikeInputs = UnaryInputs;

/**
 * Callback for the progress of a long-running action such as an HTTP
 * request for a large binary object.
 *
 * `fraction` should be a number in the [0, 1] interval, indicating how
 * much of the action has completed.
 */
declare type OnProgressCallback = (fraction: number) => void;

/**
 * Used for wrapping functions that perform math operations on
 * Tensors. The function will be wrapped in a named scope that cleans all
 * memory usage after the function is done.
 */
export declare function op<T extends Function>(f: {
    [name: string]: T;
}): T;

export declare const OP_SCOPE_SUFFIX = "__op";

/** @doc {heading: 'Training', subheading: 'Classes', namespace: 'train'} */
export declare abstract class Optimizer extends Serializable {
    protected iterations_: number;
    /**
     * Executes `f()` and minimizes the scalar output of `f()` by computing
     * gradients of y with respect to the list of trainable variables provided by
     * `varList`. If no list is provided, it defaults to all trainable variables.
     *
     * @param f The function to execute and whose output to minimize.
     * @param returnCost Whether to return the scalar cost value produced by
     * executing `f()`.
     * @param varList An optional list of variables to update. If specified, only
     * the trainable variables in varList will be updated by minimize. Defaults to
     * all trainable variables.
     *
     * @doc {heading: 'Training', subheading: 'Optimizers'}
     */
    minimize(f: () => Scalar, returnCost?: boolean, varList?: Variable[]): Scalar | null;
    /**
     * The number of iterations that this optimizer instance has been invoked for.
     */
    get iterations(): number;
    protected incrementIterations(): void;
    /**
     * Executes f() and computes the gradient of the scalar output of f() with
     * respect to the list of trainable variables provided by `varList`. If no
     * list is provided, it defaults to all trainable variables.
     *
     * @param f The function to execute and whose output to use for computing
     * gradients with respect to variables.
     * @param varList An optional list of variables to compute gradients with
     * respect to. If specified, only the trainable variables in varList will have
     * gradients computed with respect to. Defaults to all trainable variables.
     *
     * @doc {heading: 'Training', subheading: 'Optimizers'}
     */
    computeGradients(f: () => Scalar, varList?: Variable[]): {
        value: Scalar;
        grads: NamedTensorMap;
    };
    /**
     * Updates variables by using the computed gradients.
     *
     * @param variableGradients A mapping of variable name to its gradient value.
     *
     * @doc {heading: 'Training', subheading: 'Optimizers'}
     */
    abstract applyGradients(variableGradients: NamedTensorMap | NamedTensor[]): void;
    /**
     * Dispose the variables (if any) owned by this optimizer instance.
     */
    dispose(): void;
    saveIterations(): Promise<NamedTensor>;
    getWeights(): Promise<NamedTensor[]>;
    setWeights(weightValues: NamedTensor[]): Promise<void>;
    /**
     * Extract the first element of the weight values and set it
     * as the iterations counter variable of this instance of optimizer.
     *
     * @param weightValues
     * @returns Weight values with the first element consumed and excluded.
     */
    protected extractIterations(weightValues: NamedTensor[]): Promise<NamedTensor[]>;
}

export declare class OptimizerConstructors {
    /**
     * Constructs a `tf.SGDOptimizer` that uses stochastic gradient descent.
     *
     * ```js
     * // Fit a quadratic function by learning the coefficients a, b, c.
     * const xs = tf.tensor1d([0, 1, 2, 3]);
     * const ys = tf.tensor1d([1.1, 5.9, 16.8, 33.9]);
     *
     * const a = tf.scalar(Math.random()).variable();
     * const b = tf.scalar(Math.random()).variable();
     * const c = tf.scalar(Math.random()).variable();
     *
     * // y = a * x^2 + b * x + c.
     * const f = x => a.mul(x.square()).add(b.mul(x)).add(c);
     * const loss = (pred, label) => pred.sub(label).square().mean();
     *
     * const learningRate = 0.01;
     * const optimizer = tf.train.sgd(learningRate);
     *
     * // Train the model.
     * for (let i = 0; i < 10; i++) {
     *   optimizer.minimize(() => loss(f(xs), ys));
     * }
     *
     * // Make predictions.
     * console.log(
     *     `a: ${a.dataSync()}, b: ${b.dataSync()}, c: ${c.dataSync()}`);
     * const preds = f(xs).dataSync();
     * preds.forEach((pred, i) => {
     *   console.log(`x: ${i}, pred: ${pred}`);
     * });
     * ```
     *
     * @param learningRate The learning rate to use for the SGD algorithm.
     *
     * @doc {heading: 'Training', subheading: 'Optimizers', namespace: 'train'}
     */
    static sgd(learningRate: number): SGDOptimizer;
    /**
     * Constructs a `tf.MomentumOptimizer` that uses momentum gradient
     * descent.
     *
     * See
     * [http://proceedings.mlr.press/v28/sutskever13.pdf](
     * http://proceedings.mlr.press/v28/sutskever13.pdf)
     *
     * @param learningRate The learning rate to use for the Momentum gradient
     * descent algorithm.
     * @param momentum The momentum to use for the momentum gradient descent
     * algorithm.
     *
     * @doc {heading: 'Training', subheading: 'Optimizers', namespace: 'train'}
     */
    static momentum(learningRate: number, momentum: number, useNesterov?: boolean): MomentumOptimizer;
    /**
     * Constructs a `tf.RMSPropOptimizer` that uses RMSProp gradient
     * descent. This implementation uses plain momentum and is not centered
     * version of RMSProp.
     *
     * See
     * [http://www.cs.toronto.edu/~tijmen/csc321/slides/lecture_slides_lec6.pdf](
     * http://www.cs.toronto.edu/~tijmen/csc321/slides/lecture_slides_lec6.pdf)
     *
     * @param learningRate The learning rate to use for the RMSProp gradient
     * descent algorithm.
     * @param decay The discounting factor for the history/coming gradient.
     * @param momentum The momentum to use for the RMSProp gradient descent
     * algorithm.
     * @param epsilon Small value to avoid zero denominator.
     * @param centered If true, gradients are normalized by the estimated
     * variance of the gradient.
     *
     * @doc {heading: 'Training', subheading: 'Optimizers', namespace: 'train'}
     */
    static rmsprop(learningRate: number, decay?: number, momentum?: number, epsilon?: number, centered?: boolean): RMSPropOptimizer;
    /**
     * Constructs a `tf.AdamOptimizer` that uses the Adam algorithm.
     * See [https://arxiv.org/abs/1412.6980](https://arxiv.org/abs/1412.6980)
     *
     * @param learningRate The learning rate to use for the Adam gradient
     * descent algorithm.
     * @param beta1 The exponential decay rate for the 1st moment estimates.
     * @param beta2 The exponential decay rate for the 2nd moment estimates.
     * @param epsilon A small constant for numerical stability.
     *
     * @doc {heading: 'Training', subheading: 'Optimizers', namespace: 'train'}
     */
    static adam(learningRate?: number, beta1?: number, beta2?: number, epsilon?: number): AdamOptimizer;
    /**
     * Constructs a `tf.AdadeltaOptimizer` that uses the Adadelta algorithm.
     * See [https://arxiv.org/abs/1212.5701](https://arxiv.org/abs/1212.5701)
     *
     * @param learningRate The learning rate to use for the Adadelta gradient
     * descent algorithm.
     * @param rho The learning rate decay over each update.
     * @param epsilon A constant epsilon used to better condition the grad
     * update.
     *
     * @doc {heading: 'Training', subheading: 'Optimizers', namespace: 'train'}
     */
    static adadelta(learningRate?: number, rho?: number, epsilon?: number): AdadeltaOptimizer;
    /**
     * Constructs a `tf.AdamaxOptimizer` that uses the Adamax algorithm.
     * See [https://arxiv.org/abs/1412.6980](https://arxiv.org/abs/1412.6980)
     *
     * @param learningRate The learning rate to use for the Adamax gradient
     * descent algorithm.
     * @param beta1 The exponential decay rate for the 1st moment estimates.
     * @param beta2 The exponential decay rate for the 2nd moment estimates.
     * @param epsilon A small constant for numerical stability.
     * @param decay The learning rate decay over each update.
     *
     * @doc {heading: 'Training', subheading: 'Optimizers', namespace: 'train'}
     */
    static adamax(learningRate?: number, beta1?: number, beta2?: number, epsilon?: number, decay?: number): AdamaxOptimizer;
    /**
     * Constructs a `tf.AdagradOptimizer` that uses the Adagrad algorithm.
     * See
     * [http://www.jmlr.org/papers/volume12/duchi11a/duchi11a.pdf](
     * http://www.jmlr.org/papers/volume12/duchi11a/duchi11a.pdf)
     * or
     * [http://ruder.io/optimizing-gradient-descent/index.html#adagrad](
     * http://ruder.io/optimizing-gradient-descent/index.html#adagrad)
     *
     * @param learningRate The learning rate to use for the Adagrad gradient
     * descent algorithm.
     * @param initialAccumulatorValue Starting value for the accumulators, must be
     * positive.
     *
     * @doc {heading: 'Training', subheading: 'Optimizers', namespace: 'train'}
     */
    static adagrad(learningRate: number, initialAccumulatorValue?: number): AdagradOptimizer;
}

export declare const outerProduct: typeof outerProduct_;

/**
 * Computes the outer product of two vectors, `v1` and `v2`.
 *
 * ```js
 * const a = tf.tensor1d([1, 2, 3]);
 * const b = tf.tensor1d([3, 4, 5]);
 *
 * tf.outerProduct(a, b).print();
 * ```
 * @param v1 The first vector in the outer product operation.
 * @param v2 The second vector in the outer product operation.
 *
 * @doc {heading: 'Operations', subheading: 'Matrices'}
 */
declare function outerProduct_(v1: Tensor1D | TensorLike, v2: Tensor1D | TensorLike): Tensor2D;

export declare const Pack = "Pack";

export declare interface PackAttrs {
    axis: number;
}

export declare type PackInputs = TensorInfo[];

export declare const pad: typeof pad_;

export declare const pad1d: typeof pad1d_;

/**
 * Pads a `tf.Tensor1D` with a given value and paddings. See `pad` for details.
 */
declare function pad1d_(x: Tensor1D | TensorLike, paddings: [number, number], constantValue?: number): Tensor1D;

export declare const pad2d: typeof pad2d_;

/**
 * Pads a `tf.Tensor2D` with a given value and paddings. See `pad` for details.
 */
declare function pad2d_(x: Tensor2D | TensorLike, paddings: [[number, number], [number, number]], constantValue?: number): Tensor2D;

export declare const pad3d: typeof pad3d_;

/**
 * Pads a `tf.Tensor3D` with a given value and paddings. See `pad` for details.
 */
declare function pad3d_(x: Tensor3D | TensorLike, paddings: [[number, number], [number, number], [number, number]], constantValue?: number): Tensor3D;

export declare const pad4d: typeof pad4d_;

/**
 * Pads a `tf.Tensor4D` with a given value and paddings. See `pad` for details.
 */
declare function pad4d_(x: Tensor4D | TensorLike, paddings: [
[
number,
number
],
[number, number],
[number, number],
[number, number]
], constantValue?: number): Tensor4D;

/**
 * Pads a `tf.Tensor` with a given value and paddings.
 *
 * This operation implements `CONSTANT` mode. For `REFLECT` and `SYMMETRIC`,
 * refer to `tf.mirrorPad`.
 *
 * Also available are stricter rank-specific methods with the same signature
 * as this method that assert that `paddings` is of given length.
 *   - `tf.pad1d`
 *   - `tf.pad2d`
 *   - `tf.pad3d`
 *   - `tf.pad4d`
 *
 * ```js
 * const x = tf.tensor1d([1, 2, 3, 4]);
 * x.pad([[1, 2]]).print();
 * ```
 * @param x The tensor to pad.
 * @param paddings An array of length `R` (the rank of the tensor), where
 * each element is a length-2 tuple of ints `[padBefore, padAfter]`,
 * specifying how much to pad along each dimension of the tensor.
 * @param constantValue The pad value to use. Defaults to 0.
 *
 * @doc {heading: 'Tensors', subheading: 'Transformations'}
 */
declare function pad_<T extends Tensor>(x: T | TensorLike, paddings: Array<[number, number]>, constantValue?: number): T;

declare type PadInfo = {
    top: number;
    left: number;
    right: number;
    bottom: number;
    type: PadType;
};

declare type PadInfo3D = {
    top: number;
    left: number;
    right: number;
    bottom: number;
    front: number;
    back: number;
    type: PadType;
};

/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
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
declare type PadType = 'SAME' | 'VALID' | 'NUMBER' | 'EXPLICIT';

export declare const PadV2 = "PadV2";

export declare interface PadV2Attrs {
    paddings: Array<[number, number]>;
    constantValue: number;
}

export declare type PadV2Inputs = Pick<NamedTensorInfoMap, 'x'>;

/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
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
declare const PARALLELIZE_THRESHOLD = 30;

declare function parseAxisParam(axis: number | number[], shape: number[]): number[];

declare function parseSliceParams(x: TensorInfo, begin: number | number[], size?: number | number[]): number[][];

/** Type for representing image data in Uint8Array type. */
export declare interface PixelData {
    width: number;
    height: number;
    data: Uint8Array;
}

/**
 * At any given time a single platform is active and represents and
 * implementation of this interface. In practice, a platform is an environment
 * where TensorFlow.js can be executed, e.g. the browser or Node.js.
 */
export declare interface Platform {
    /**
     * Makes an HTTP request.
     * @param path The URL path to make a request to
     * @param init The request init. See init here:
     *     https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
     */
    fetch(path: string, requestInits?: RequestInit, options?: RequestDetails): Promise<Response>;
    /**
     * Returns the current high-resolution time in milliseconds relative to an
     * arbitrary time in the past. It works across different platforms (node.js,
     * browsers).
     */
    now(): number;
    /**
     * Encode the provided string into an array of bytes using the provided
     * encoding.
     */
    encode(text: string, encoding: string): Uint8Array;
    /** Decode the provided bytes into a string using the provided encoding. */
    decode(bytes: Uint8Array, encoding: string): string;
    setTimeoutCustom?(functionRef: Function, delay: number): void;
    isTypedArray(a: unknown): a is Float32Array | Int32Array | Uint8Array | Uint8ClampedArray;
}

declare function play(video: HTMLVideoElement): Promise<void>;

export declare const Pool = "Pool";

export declare const pool: typeof pool_;

/**
 * Performs an N-D pooling operation
 *
 * @param input The input tensor, of rank 4 or rank 3 of shape
 *     `[batch, height, width, inChannels]`. If rank 3, batch of 1 is assumed.
 * @param windowShape The filter size: `[filterHeight, filterWidth]`. If
 *     `filterSize` is a single number, then `filterHeight == filterWidth`.
 * @param poolingType The type of pooling, either 'max' or 'avg'.
 * @param pad The type of padding algorithm:
 *    - `same` and stride 1: output will be of same size as input,
 *       regardless of filter size.
 *    - `valid`: output will be smaller than input if filter is larger
 *       than 1x1.
 *    - For more info, see this guide:
 *     [https://www.tensorflow.org/api_guides/python/nn#Convolution](
 *         https://www.tensorflow.org/api_guides/python/nn#Convolution)
 * @param dilations The dilation rates: `[dilationHeight, dilationWidth]`
 *     in which we sample input values across the height and width dimensions
 *     in dilated pooling. Defaults to `[1, 1]`. If `dilationRate` is a single
 *     number, then `dilationHeight == dilationWidth`. If it is greater than
 *     1, then all values of `strides` must be 1.
 * @param strides The strides of the pooling: `[strideHeight, strideWidth]`. If
 *     `strides` is a single number, then `strideHeight == strideWidth`.
 * @param dimRoundingMode A string from: 'ceil', 'round', 'floor'. If none is
 *     provided, it will default to truncate.
 *
 * @doc {heading: 'Operations', subheading: 'Convolution'}
 */
declare function pool_<T extends Tensor3D | Tensor4D>(input: T | TensorLike, windowShape: [number, number] | number, poolingType: 'avg' | 'max', pad: 'valid' | 'same' | number | conv_util.ExplicitPadding, dilations?: [number, number] | number, strides?: [number, number] | number, dimRoundingMode?: 'floor' | 'round' | 'ceil'): T;

export declare type PoolInputs = Pick<NamedTensorInfoMap, 'input'>;

export declare const Pow = "Pow";

export declare const pow: typeof pow_;

/**
 * Computes the power of one `tf.Tensor` to another. Supports broadcasting.
 *
 * Given a `tf.Tensor` x and a `tf.Tensor` y, this operation computes x^y for
 * corresponding elements in x and y. The result's dtype will be the upcasted
 * type of the `base` and `exp` dtypes.
 *
 * ```js
 * const a = tf.tensor([[2, 3], [4, 5]])
 * const b = tf.tensor([[1, 2], [3, 0]]).toInt();
 *
 * a.pow(b).print();  // or tf.pow(a, b)
 * ```
 *
 * ```js
 * const a = tf.tensor([[1, 2], [3, 4]])
 * const b = tf.tensor(2).toInt();
 *
 * a.pow(b).print();  // or tf.pow(a, b)
 * ```
 * We also expose `powStrict` which has the same signature as this op and
 * asserts that `base` and `exp` are the same shape (does not broadcast).
 *
 * @param base The base `tf.Tensor` to pow element-wise.
 * @param exp The exponent `tf.Tensor` to pow element-wise.
 *
 * @doc {heading: 'Operations', subheading: 'Arithmetic'}
 */
declare function pow_<T extends Tensor>(base: Tensor | TensorLike, exp: Tensor | TensorLike): T;

export declare type PowInputs = BinaryInputs;

export declare const Prelu = "Prelu";

export declare const prelu: typeof prelu_;

/**
 * Computes leaky rectified linear element-wise with parametric alphas.
 *
 * `x < 0 ? alpha * x : f(x) = x`
 *
 * ```js
 * const x = tf.tensor1d([-1, 2, -3, 4]);
 * const alpha = tf.scalar(0.1);
 *
 * x.prelu(alpha).print();  // or tf.prelu(x, alpha)
 * ```
 * @param x The input tensor.
 * @param alpha Scaling factor for negative values.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function prelu_<T extends Tensor>(x: T | TensorLike, alpha: T | TensorLike): T;

export declare type PreluInputs = Pick<NamedTensorInfoMap, 'x' | 'alpha'>;

/**
 * Validate gather nd inputs.
 *
 * @param tensor The tensor contains the source values.
 * @param indices The tensor contains the indices to slice the source.
 *
 * @returns [resultShape, numUpdates, sliceSize, strides]
 */
declare function prepareAndValidate(tensor: TensorInfo, indices: TensorInfo): [
number[],
number,
number,
number[]
];

/**
 * Prepare the split size array. When the input is a number, the axis is evenly
 * divided among the split size. When the input contains the negative value, the
 * rest of the axis is allocated toward that.
 */
declare function prepareSplitSize(x: Tensor | TensorInfo, numOrSizeSplits: number[] | number, axis?: number): number[];

/**
 * Prints information about the `tf.Tensor` including its data.
 *
 * ```js
 * const verbose = true;
 * tf.tensor2d([1, 2, 3, 4], [2, 2]).print(verbose);
 * ```
 * @param x The tensor to be printed.
 * @param verbose Whether to print verbose information about the ` Tensor`,
 * including dtype and size.
 *
 * @doc {heading: 'Tensors', subheading: 'Creation'}
 */
declare function print_2<T extends Tensor>(x: T, verbose?: boolean): void;
export { print_2 as print }

export declare const Prod = "Prod";

export declare const prod: typeof prod_;

/**
 * Computes the product of elements across dimensions of a `tf.Tensor`.
 *
 * Reduces the input along the dimensions given in `axes`. Unless `keepDims`
 * is true, the rank of the `tf.Tensor` is reduced by 1 for each entry in
 * `axes`. If `keepDims` is true, the reduced dimensions are retained with
 * length 1. If `axes` has no entries, all dimensions are reduced, and a
 * `tf.Tensor` with a single element is returned.
 *
 * ```js
 * const x = tf.tensor1d([1, 2, 3]);
 *
 * x.prod().print();  // or tf.prod(x)
 * ```
 *
 * ```js
 * const x = tf.tensor2d([1, 2, 3, 4], [2, 2]);
 *
 * const axis = 1;
 * x.prod(axis).print();  // or tf.prod(x, axis)
 * ```
 *
 * @param x The input tensor to compute the product over. If the dtype is `bool`
 *   it will be converted to `int32` and the output dtype will be `int32`.
 * @param axis The dimension(s) to reduce. By default it reduces
 *     all dimensions.
 * @param keepDims If true, retains reduced dimensions with size 1.
 *
 * @doc {heading: 'Operations', subheading: 'Reduction'}
 */
declare function prod_<T extends Tensor>(x: Tensor | TensorLike, axis?: number | number[], keepDims?: boolean): T;

export declare interface ProdAttrs {
    axis: number | number[];
    keepDims: boolean;
}

export declare type ProdInputs = Pick<NamedTensorInfoMap, 'x'>;

/**
 * Executes the provided function `f()` and returns a promise that resolves
 * with information about the function's memory use:
 * - `newBytes`: the number of new bytes allocated
 * - `newTensors`: the number of new tensors created
 * - `peakBytes`: the peak number of bytes allocated
 * - `kernels`: an array of objects for each kernel involved that reports
 * their input and output shapes, number of bytes used, and number of new
 * tensors created.
 * - `kernelNames`: an array of unique strings with just the names of the
 * kernels in the `kernels` array.
 *
 * ```js
 * const profile = await tf.profile(() => {
 *   const x = tf.tensor1d([1, 2, 3]);
 *   let x2 = x.square();
 *   x2.dispose();
 *   x2 = x.square();
 *   x2.dispose();
 *   return x;
 * });
 *
 * console.log(`newBytes: ${profile.newBytes}`);
 * console.log(`newTensors: ${profile.newTensors}`);
 * console.log(`byte usage over all kernels: ${profile.kernels.map(k =>
 * k.totalBytesSnapshot)}`);
 * ```
 *
 *
 * @doc {heading: 'Performance', subheading: 'Profile'}
 */
export declare function profile(f: () => (TensorContainer | Promise<TensorContainer>)): Promise<ProfileInfo>;

declare type ProfileInfo = {
    newBytes: number;
    newTensors: number;
    peakBytes: number;
    kernels: KernelInfo[];
    result: TensorContainer;
    kernelNames: string[];
};

export declare const RaggedGather = "RaggedGather";

export declare const raggedGather: typeof raggedGather_;

declare function raggedGather_(paramsNestedSplits: Tensor[], paramsDenseValues: Tensor | TensorLike, indices: Tensor | TensorLike, outputRaggedRank: number): RaggedGatherMap;

export declare interface RaggedGatherAttrs {
    outputRaggedRank: number;
}

export declare type RaggedGatherInputs = {
    paramsNestedSplits: TensorInfo[];
} & Pick<NamedTensorInfoMap, 'paramsDenseValues' | 'indices'>;

/**
 * Gather ragged slices from params axis 0 according to indices.
 *
 * @param paramsNestedSplits: A list of at least 1 Tensor with type 'int32' The
 *     nestedRowSplits tensors that define the row-partitioning for the params
 *     RaggedTensor input.
 * @param paramsDenseValues: A Tensor. The flatValues for the params
 *     RaggedTensor.
 * @param indices: A Tensor. Must be one of type: int32. Indices in the
 *     outermost dimension of params of the values that should be gathered.
 * @param outputRaggedRank: An int that is >= 0. The ragged rank of the output
 *     RaggedTensor. outputNestedSplits will contain this number of rowSplits
 *     tensors. This value should equal indices.shape.ndims + params.raggedRank
 *     - 1.
 * @return A map with the following properties:
 *     - outputNestedSplits: A list of outputRaggedRank Tensor objects with the
 * same type as paramsNestedSplits.
 *     - outputDenseValues: A Tensor. Has the same type as paramsDenseValues.
 * @doc {heading: 'Operations', subheading: 'Ragged'}
 */
declare interface RaggedGatherMap {
    outputNestedSplits: Tensor[];
    outputDenseValues: Tensor;
}

export declare const RaggedRange = "RaggedRange";

export declare const raggedRange: typeof raggedRange_;

/**
 * Returns a RaggedTensor result composed from rtDenseValues and rtNestedSplits,
 * such that result[i] = [starts[i], starts[i] + deltas[i], ..., limits[i]]).
 *
 * @param starts: A Tensor. Must be one of the following types:
 *     'float32', 'int32'. The starts of each range.
 * @param limits: A Tensor. Must have the same type as starts. The limits of
 *     each range.
 * @param deltas: A Tensor. Must have the same type as starts. The deltas of
 *     each range.
 * @return A map with the following properties:
 *     - rtNestedSplits: A Tensor of type 'int32'.
 *     - rtDenseValues: A Tensor. Has the same type as starts.
 */
declare function raggedRange_(starts: Tensor | TensorLike, limits: Tensor | TensorLike, deltas: Tensor | TensorLike): NamedTensorMap;

export declare type RaggedRangeInputs = Pick<NamedTensorInfoMap, 'starts' | 'limits' | 'deltas'>;

export declare const RaggedTensorToTensor = "RaggedTensorToTensor";

export declare const raggedTensorToTensor: typeof raggedTensorToTensor_;

/**
 * Create a dense tensor from a ragged tensor, possibly altering its shape.
 *
 * The raggedTensorToTensor op creates a dense tensor from am array of row
 * partition tensors, a value vector, and default values. If the shape is
 * unspecified, the minimal shape required to contain all the elements in the
 * ragged tensor (the natural shape) will be used. If some dimensions are left
 * unspecified, then the size of the natural shape is used in that dimension.
 *
 * The defaultValue will be broadcast to the output shape. After that, the
 * values from the ragged tensor overwrite the default values. Note that the
 * defaultValue must have less dimensions than the value.
 *
 * The row partition tensors are in the order of the dimensions. At present, the
 * types can be: "ROW_SPLITS": the row_splits tensor from the ragged tensor.
 *   "VALUE_ROWIDS": the value_rowids tensor from the ragged tensor.
 *   "FIRST_DIM_SIZE": if value_rowids is used for the first dimension, then it
 * is preceded by "FIRST_DIM_SIZE".
 * ```
 * @param shape: A Tensor. Must be one of the following types: 'int32'. The
 *     desired shape of the output tensor. If left unspecified (empty), the
 *     minimal shape required to contain all the elements in the ragged tensor
 *     (the natural shape) will be used. If some dimensions are left
 *     unspecified, then the size of the natural shape is used in that
 *     dimension.
 *
 *     Note that dense dimensions cannot be modified by the shape argument.
 *     Trying to change the size of a dense dimension will cause the op to fail.
 *     Examples: natural shape: [4, 5, 6] shape: -1 output shape: [4, 5, 6]
 *
 *     natural shape: [4, 5, 6] shape: [3, -1, 2] output shape: [3, 5, 2]
 *
 *     natural shape: [4, 5, 6] shape: [3, 7, 2] output shape: [3, 7, 2]
 * @param values: A Tensor. A 1D tensor representing the values of the ragged
 *     tensor.
 * @param defaultValue: A Tensor. Must have the same type as values. The
 *     defaultValue when the shape is larger than the ragged tensor. The
 *     defaultValue is broadcast until it is the shape of the output tensor,
 *     and then overwritten by values in the ragged tensor. The default value
 *     must be compatible with this broadcast operation, and must have fewer
 *     dimensions than the value tensor.
 * @param rowPartitionTensors: A list of at least 1 Tensor objects with the same
 *     type in: 'int32'.
 * @param rowPartitionTypes: A list of strings. The types of the row partition
 *     tensors. At present, these can be:
 *     "ROW_SPLITS": the row_splits tensor from the ragged tensor.
 *     "VALUE_ROWIDS": the value_rowids tensor from the ragged tensor.
 *     "FIRST_DIM_SIZE": if value_rowids is used for the first dimension, then
 *         it is preceeded by "FIRST_DIM_SIZE". The tensors are in the order of
 *         the dimensions.
 * @return A Tensor. Has the same type as values.
 * @doc {heading: 'Operations', subheading: 'Ragged'}
 */
declare function raggedTensorToTensor_(shape: Tensor | TensorLike, values: Tensor | TensorLike, defaultValue: Tensor | TensorLike, rowPartitionTensors: Tensor[], rowPartitionTypes: string[]): Tensor;

export declare interface RaggedTensorToTensorAttrs {
    rowPartitionTypes: string[];
}

export declare type RaggedTensorToTensorInputs = Pick<NamedTensorInfoMap, 'shape' | 'values' | 'defaultValue'> & {
    rowPartitionTensors: TensorInfo[];
};

export declare const rand: typeof rand_;

/**
 * Creates a `tf.Tensor` with values sampled from a random number generator
 * function defined by the user.
 *
 * @param shape An array of integers defining the output tensor shape.
 * @param randFunction A random number generator function which is called
 * for each element in the output tensor.
 * @param dtype The data type of the output tensor. Defaults to 'float32'.
 *
 * @doc {heading: 'Tensors', subheading: 'Random'}
 */
declare function rand_<R extends Rank>(shape: ShapeMap[R], randFunction: () => number, dtype?: DataType): Tensor<R>;

export declare const randomGamma: typeof randomGamma_;

/**
 * Creates a `tf.Tensor` with values sampled from a gamma distribution.
 *
 * ```js
 * tf.randomGamma([2, 2], 1).print();
 * ```
 *
 * @param shape An array of integers defining the output tensor shape.
 * @param alpha The shape parameter of the gamma distribution.
 * @param beta The inverse scale parameter of the gamma distribution. Defaults
 *     to 1.
 * @param dtype The data type of the output. Defaults to float32.
 * @param seed The seed for the random number generator.
 *
 * @doc {heading: 'Tensors', subheading: 'Random'}
 */
declare function randomGamma_<R extends Rank>(shape: ShapeMap[R], alpha: number, beta?: number, dtype?: 'float32' | 'int32', seed?: number): Tensor<R>;

export declare const randomNormal: typeof randomNormal_;

/**
 * Creates a `tf.Tensor` with values sampled from a normal distribution.
 *
 * ```js
 * tf.randomNormal([2, 2]).print();
 * ```
 *
 * @param shape An array of integers defining the output tensor shape.
 * @param mean The mean of the normal distribution.
 * @param stdDev The standard deviation of the normal distribution.
 * @param dtype The data type of the output.
 * @param seed The seed for the random number generator.
 *
 * @doc {heading: 'Tensors', subheading: 'Random'}
 */
declare function randomNormal_<R extends Rank>(shape: ShapeMap[R], mean?: number, stdDev?: number, dtype?: 'float32' | 'int32', seed?: number): Tensor<R>;

export declare const randomStandardNormal: typeof randomStandardNormal_;

/**
 * Creates a `tf.Tensor` with values sampled from a normal distribution.
 *
 * The generated values will have mean 0 and standard deviation 1.
 *
 * ```js
 * tf.randomStandardNormal([2, 2]).print();
 * ```
 *
 * @param shape An array of integers defining the output tensor shape.
 * @param dtype The data type of the output.
 * @param seed The seed for the random number generator.
 *
 * @doc {heading: 'Tensors', subheading: 'Random'}
 */
declare function randomStandardNormal_<R extends Rank>(shape: ShapeMap[R], dtype?: 'float32' | 'int32', seed?: number): Tensor<R>;

export declare const randomUniform: typeof randomUniform_;

/**
 * Creates a `tf.Tensor` with values sampled from a uniform distribution.
 *
 * The generated values follow a uniform distribution in the range [minval,
 * maxval). The lower bound minval is included in the range, while the upper
 * bound maxval is excluded.
 *
 * ```js
 * tf.randomUniform([2, 2]).print();
 * ```
 *
 * @param shape An array of integers defining the output tensor shape.
 * @param minval The lower bound on the range of random values to generate.
 *   Defaults to 0.
 * @param maxval The upper bound on the range of random values to generate.
 *   Defaults to 1.
 * @param dtype The data type of the output tensor. Defaults to 'float32'.
 * @param seed An optional int. Defaults to 0. If seed is set to be non-zero,
 *   the random number generator is seeded by the given seed. Otherwise, it is
 *   seeded by a random seed.
 *
 * @doc {heading: 'Tensors', subheading: 'Random'}
 */
declare function randomUniform_<R extends Rank>(shape: ShapeMap[R], minval?: number, maxval?: number, dtype?: DataType, seed?: number | string): Tensor<R>;

export declare const randomUniformInt: typeof randomUniformInt_;

/**
 * Creates a `tf.Tensor` with integers sampled from a uniform distribution.
 *
 * The generated values are uniform integers in the range [minval, maxval). The
 * lower bound minval is included in the range, while the upper bound maxval is
 * excluded.
 *
 * ```js
 * tf.randomUniformInt([2, 2], 0, 10).print();
 * ```
 *
 * @param shape An array of integers defining the output tensor shape.
 * @param minval Inclusive lower bound on the generated integers.
 * @param maxval Exclusive upper bound on the generated integers.
 * @param seed An optional int. Defaults to 0. If seed is set to be non-zero,
 *   the random number generator is seeded by the given seed. Otherwise, it is
 *   seeded by a random seed.
 *
 * @doc {heading: 'Tensors', subheading: 'Random'}
 */
declare function randomUniformInt_<R extends Rank>(shape: ShapeMap[R], minval: number, maxval: number, seed?: number | string): Tensor<R>;

/**
 * Returns a sample from a uniform [a, b) distribution.
 *
 * @param a The minimum support (inclusive).
 * @param b The maximum support (exclusive).
 * @return A pseudorandom number on the half-open interval [a,b).
 */
declare function randUniform(a: number, b: number): number;

/**
 * Creates a new `tf.Tensor1D` filled with the numbers in the range provided.
 *
 * The tensor is a half-open interval meaning it includes start, but
 * excludes stop. Decrementing ranges and negative step values are also
 * supported.
 *
 *
 * ```js
 * tf.range(0, 9, 2).print();
 * ```
 *
 * @param start An integer start value
 * @param stop An integer stop value
 * @param step An integer increment (will default to 1 or -1)
 * @param dtype The data type of the output tensor. Defaults to 'float32'.
 *
 * @doc {heading: 'Tensors', subheading: 'Creation'}
 */
export declare function range(start: number, stop: number, step?: number, dtype?: 'float32' | 'int32'): Tensor1D;

declare const Range_2 = "Range";
export { Range_2 as Range }

export declare interface RangeAttrs {
    start: number;
    stop: number;
    step: number;
    dtype: 'float32' | 'int32';
}

export declare enum Rank {
    R0 = "R0",
    R1 = "R1",
    R2 = "R2",
    R3 = "R3",
    R4 = "R4",
    R5 = "R5",
    R6 = "R6"
}

/**
 * Returns a promise that resolves when the currently selected backend (or the
 * highest priority one) has initialized. Await this promise when you are using
 * a backend that has async initialization.
 *
 * @doc {heading: 'Backends'}
 */
export declare function ready(): Promise<void>;

export declare const Real = "Real";

export declare const real: typeof real_;

/**
 * Returns the real part of a complex (or real) tensor.
 *
 * Given a tensor input, this operation returns a tensor of type float that is
 * the real part of each element in input considered as a complex number.
 *
 * If the input is real, it simply makes a clone.
 *
 * ```js
 * const x = tf.complex([-2.25, 3.25], [4.75, 5.75]);
 * tf.real(x).print();
 * ```
 *
 * @doc {heading: 'Tensors', subheading: 'Creation'}
 */
declare function real_<T extends Tensor>(input: T | TensorLike): T;

export declare const RealDiv = "RealDiv";

export declare type RealDivInputs = BinaryInputs;

export declare type RealInputs = Pick<NamedTensorInfoMap, 'input'>;

export declare const Reciprocal = "Reciprocal";

export declare const reciprocal: typeof reciprocal_;

/**
 * Computes reciprocal of x element-wise: `1 / x`
 *
 * ```js
 * const x = tf.tensor1d([0, 1, 2]);
 *
 * x.reciprocal().print();  // or tf.reciprocal(x)
 * ```
 * @param x The input tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function reciprocal_<T extends Tensor>(x: T | TensorLike): T;

export declare type ReciprocalInputs = UnaryInputs;

export declare interface RecursiveArray<T extends any> {
    [index: number]: T | RecursiveArray<T>;
}

declare interface ReduceInfo {
    windowSize: number;
    batchSize: number;
    inSize: number;
    outSize: number;
}

/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
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
export declare enum Reduction {
    NONE = 0,
    MEAN = 1,
    SUM = 2,
    SUM_BY_NONZERO_WEIGHTS = 3
}

/**
 * Registers a global backend. The registration should happen when importing
 * a module file (e.g. when importing `backend_webgl.ts`), and is used for
 * modular builds (e.g. custom tfjs bundle with only webgl support).
 *
 * @param factory The backend factory function. When called, it should
 * return a backend instance, or a promise of an instance.
 * @param priority The priority of the backend (higher = more important).
 *     In case multiple backends are registered, the priority is used to find
 *     the best backend. Defaults to 1.
 * @return False if there is already a registered backend under this name, true
 *     if not.
 *
 * @doc {heading: 'Backends'}
 */
export declare function registerBackend(name: string, factory: () => KernelBackend | Promise<KernelBackend>, priority?: number): boolean;

/**
 * Register a class with the serialization map of TensorFlow.js.
 *
 * This is often used for registering custom Layers, so they can be
 * serialized and deserialized.
 *
 * Example 1. Register the class without package name and specified name.
 *
 * ```js
 * class MyCustomLayer extends tf.layers.Layer {
 *   static className = 'MyCustomLayer';
 *
 *   constructor(config) {
 *     super(config);
 *   }
 * }
 * tf.serialization.registerClass(MyCustomLayer);
 * console.log(tf.serialization.GLOBALCUSTOMOBJECT.get("Custom>MyCustomLayer"));
 * console.log(tf.serialization.GLOBALCUSTOMNAMES.get(MyCustomLayer));
 * ```
 *
 * Example 2. Register the class with package name: "Package" and specified
 * name: "MyLayer".
 * ```js
 * class MyCustomLayer extends tf.layers.Layer {
 *   static className = 'MyCustomLayer';
 *
 *   constructor(config) {
 *     super(config);
 *   }
 * }
 * tf.serialization.registerClass(MyCustomLayer, "Package", "MyLayer");
 * console.log(tf.serialization.GLOBALCUSTOMOBJECT.get("Package>MyLayer"));
 * console.log(tf.serialization.GLOBALCUSTOMNAMES.get(MyCustomLayer));
 * ```
 *
 * Example 3. Register the class with specified name: "MyLayer".
 * ```js
 * class MyCustomLayer extends tf.layers.Layer {
 *   static className = 'MyCustomLayer';
 *
 *   constructor(config) {
 *     super(config);
 *   }
 * }
 * tf.serialization.registerClass(MyCustomLayer, undefined, "MyLayer");
 * console.log(tf.serialization.GLOBALCUSTOMOBJECT.get("Custom>MyLayer"));
 * console.log(tf.serialization.GLOBALCUSTOMNAMES.get(MyCustomLayer));
 * ```
 *
 * Example 4. Register the class with specified package name: "Package".
 * ```js
 * class MyCustomLayer extends tf.layers.Layer {
 *   static className = 'MyCustomLayer';
 *
 *   constructor(config) {
 *     super(config);
 *   }
 * }
 * tf.serialization.registerClass(MyCustomLayer, "Package");
 * console.log(tf.serialization.GLOBALCUSTOMOBJECT
 * .get("Package>MyCustomLayer"));
 * console.log(tf.serialization.GLOBALCUSTOMNAMES
 * .get(MyCustomLayer));
 * ```
 *
 * @param cls The class to be registered. It must have a public static member
 *   called `className` defined and the value must be a non-empty string.
 * @param pkg The pakcage name that this class belongs to. This used to define
 *     the key in GlobalCustomObject. If not defined, it defaults to `Custom`.
 * @param name The name that user specified. It defaults to the actual name of
 *     the class as specified by its static `className` property.
 * @doc {heading: 'Models', subheading: 'Serialization', ignoreCI: true}
 */
declare function registerClass<T extends Serializable>(cls: SerializableConstructor<T>, pkg?: string, name?: string): SerializableConstructor<T>;

/**
 * Registers a gradient function for a given kernel in the global registry,
 * to be used during the back-propagation of that kernel.
 *
 * @param config An object with the following properties:
 * - `kernelName` The name of the kernel that the gradient function is for.
 * - `gradFunc` The function to run during back-propagation.
 */
export declare function registerGradient(config: GradConfig): void;

/**
 * Registers the function (forward pass) for the kernel in a global registry.
 *
 * @param config A config object with the following properties:
 * - `kernelName` The official name of the kernel.
 * - `backendName` The official name of the backend.
 * - `kernelFunc` The function to run during the forward pass of the kernel.
 * - `setupFunc` Optional. Gets called once, after the backend initializes.
 * - `disposeFunc` Optional. Gets called once, right before the backend is
 * disposed.
 */
export declare function registerKernel(config: KernelConfig): void;

declare const registerLoadRouter: (loudRouter: IORouter) => void;

declare const registerSaveRouter: (loudRouter: IORouter) => void;

export declare const Relu = "Relu";

export declare const relu: typeof relu_;

export declare const Relu6 = "Relu6";

export declare const relu6: typeof relu6_;

/**
 * Computes rectified linear 6 element-wise: `min(max(x, 0), 6)`.
 *
 * ```js
 * const x = tf.tensor1d([-1, 2, -3, 8]);
 *
 * x.relu6().print();  // or tf.relu6(x)
 * ```
 * @param x The input tensor. If the dtype is `bool`, the output dtype will be
 *     `int32`.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function relu6_<T extends Tensor>(x: T | TensorLike): T;

export declare type Relu6Inputs = Pick<NamedTensorInfoMap, 'x'>;

/**
 * Computes rectified linear element-wise: `max(x, 0)`.
 *
 * ```js
 * const x = tf.tensor1d([-1, 2, -3, 4]);
 *
 * x.relu().print();  // or tf.relu(x)
 * ```
 * @param x The input tensor. If the dtype is `bool`, the output dtype will be
 *     `int32`.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function relu_<T extends Tensor>(x: T | TensorLike): T;

export declare type ReluInputs = Pick<NamedTensorInfoMap, 'x'>;

/**
 * Removes a backend and the registered factory.
 *
 * @doc {heading: 'Backends'}
 */
export declare function removeBackend(name: string): void;

/**
 * Remove a model specified by URL from a registered storage medium.
 *
 * ```js
 * // First create and save a model.
 * const model = tf.sequential();
 * model.add(tf.layers.dense(
 *     {units: 1, inputShape: [10], activation: 'sigmoid'}));
 * await model.save('localstorage://demo/management/model1');
 *
 * // Then list existing models.
 * console.log(JSON.stringify(await tf.io.listModels()));
 *
 * // Delete the model.
 * await tf.io.removeModel('localstorage://demo/management/model1');
 *
 * // List models again.
 * console.log(JSON.stringify(await tf.io.listModels()));
 * ```
 *
 * @param url A URL to a stored model, with a scheme prefix, e.g.,
 *   'localstorage://my-model-1', 'indexeddb://my/model/2'.
 * @returns ModelArtifactsInfo of the deleted model (if and only if deletion
 *   is successful).
 * @throws Error if deletion fails, e.g., if no model exists at `path`.
 *
 * @doc {
 *   heading: 'Models',
 *   subheading: 'Management',
 *   namespace: 'io',
 *   ignoreCI: true
 * }
 */
declare function removeModel(url: string): Promise<ModelArtifactsInfo>;

declare function repeatedTry(checkFn: () => boolean, delayFn?: (counter: number) => number, maxCounter?: number, scheduleFn?: (functionRef: Function, delay: number) => void): Promise<void>;

/**
 * Additional options for Platform.fetch
 */
declare interface RequestDetails {
    /**
     * Is this request for a binary file (as opposed to a json file)
     */
    isBinary?: boolean;
}

export declare const Reshape = "Reshape";

export declare const reshape: typeof reshape_;

/**
 * Reshapes a `tf.Tensor` to a given shape.
 *
 * Given an input tensor, returns a new tensor with the same values as the
 * input tensor with shape `shape`.
 *
 * If one component of shape is the special value -1, the size of that
 * dimension is computed so that the total size remains constant. In
 * particular, a shape of [-1] flattens into 1-D. At most one component of
 * shape can be -1.
 *
 * If shape is 1-D or higher, then the operation returns a tensor with shape
 * shape filled with the values of tensor. In this case, the number of
 * elements implied by shape must be the same as the number of elements in
 * tensor.
 *
 * ```js
 * const x = tf.tensor1d([1, 2, 3, 4]);
 * x.reshape([2, 2]).print();
 * ```
 *
 * @param x The input tensor to be reshaped.
 * @param shape An array of integers defining the output tensor shape.
 *
 * @doc {heading: 'Tensors', subheading: 'Transformations'}
 */
declare function reshape_<R extends Rank>(x: Tensor | TensorLike, shape: ShapeMap[R]): Tensor<R>;

export declare interface ReshapeAttrs {
    shape: number[];
}

export declare type ReshapeInputs = Pick<NamedTensorInfoMap, 'x'>;

export declare const ResizeBilinear = "ResizeBilinear";

export declare interface ResizeBilinearAttrs {
    alignCorners: boolean;
    halfPixelCenters: boolean;
    size: [number, number];
}

export declare const ResizeBilinearGrad = "ResizeBilinearGrad";

export declare type ResizeBilinearGradAttrs = ResizeBilinearAttrs;

export declare type ResizeBilinearGradInputs = Pick<NamedTensorInfoMap, 'images' | 'dy'>;

export declare type ResizeBilinearInputs = Pick<NamedTensorInfoMap, 'images'>;

export declare const ResizeNearestNeighbor = "ResizeNearestNeighbor";

export declare interface ResizeNearestNeighborAttrs {
    alignCorners: boolean;
    halfPixelCenters: boolean;
    size: [number, number];
}

export declare const ResizeNearestNeighborGrad = "ResizeNearestNeighborGrad";

export declare type ResizeNearestNeighborGradAttrs = ResizeNearestNeighborAttrs;

export declare type ResizeNearestNeighborGradInputs = Pick<NamedTensorInfoMap, 'images' | 'dy'>;

export declare type ResizeNearestNeighborInputs = Pick<NamedTensorInfoMap, 'images'>;

export declare const Reverse = "Reverse";

export declare const reverse: typeof reverse_;

export declare const reverse1d: typeof reverse1d_;

/**
 * Reverses a `tf.Tensor1D`.
 *
 * @param x The input tensor.
 */
declare function reverse1d_(x: Tensor1D | TensorLike): Tensor1D;

export declare const reverse2d: typeof reverse2d_;

/**
 * Reverses a `tf.Tensor2D` along a specified axis.
 *
 * @param x The input tensor.
 * @param axis The set of dimensions to reverse. Must be in the
 *     range [-rank(x), rank(x)). Defaults to all axes.
 */
declare function reverse2d_(x: Tensor2D | TensorLike, axis?: number | number[]): Tensor2D;

export declare const reverse3d: typeof reverse3d_;

/**
 * Reverses a `tf.Tensor3D` along a specified axis.
 *
 * @param x The input tensor.
 * @param axis The set of dimensions to reverse. Must be in the
 *     range [-rank(x), rank(x)). Defaults to all axes.
 */
declare function reverse3d_(x: Tensor3D | TensorLike, axis?: number | number[]): Tensor3D;

export declare const reverse4d: typeof reverse4d_;

/**
 * Reverses a `tf.Tensor4D` along a specified axis.
 *
 * @param x The input tensor.
 * @param axis The set of dimensions to reverse. Must be in the
 *     range [-rank(x), rank(x)). Defaults to all axes.
 */
declare function reverse4d_(x: Tensor4D | TensorLike, axis?: number | number[]): Tensor4D;

/**
 * Reverses a `tf.Tensor` along a specified axis.
 *
 * Also available are stricter rank-specific methods that assert that `x` is
 * of the given rank:
 *   - `tf.reverse1d`
 *   - `tf.reverse2d`
 *   - `tf.reverse3d`
 *   - `tf.reverse4d`
 *
 * Except `tf.reverse1d` (which does not have axis param), all methods have
 * same signature as this method.
 *
 * ```js
 * const x = tf.tensor1d([1, 2, 3, 4]);
 *
 * x.reverse().print();
 * ```
 *
 * ```js
 * const x = tf.tensor2d([1, 2, 3, 4], [2, 2]);
 *
 * const axis = 1;
 * x.reverse(axis).print();
 * ```
 * @param x The input tensor to be reversed.
 * @param axis The set of dimensions to reverse. Must be in the
 *     range [-rank(x), rank(x)). Defaults to all axes.
 *
 * @doc {heading: 'Tensors', subheading: 'Slicing and Joining'}
 */
declare function reverse_<T extends Tensor>(x: T | TensorLike, axis?: number | number[]): T;

export declare interface ReverseAttrs {
    dims: number | number[];
}

export declare type ReverseInputs = Pick<NamedTensorInfoMap, 'x'>;

export declare const rfft: typeof rfft_;

/**
 * Real value input fast Fourier transform.
 *
 * Computes the 1-dimensional discrete Fourier transform over the
 * inner-most dimension of the real input.
 *
 * ```js
 * const real = tf.tensor1d([1, 2, 3]);
 *
 * real.rfft().print();
 * ```
 * @param input The real value input to compute an rfft over.
 *
 * @doc {heading: 'Operations', subheading: 'Spectral', namespace: 'spectral'}
 */
declare function rfft_(input: Tensor, fftLength?: number): Tensor;

declare function rightPad(a: string, size: number): string;

/** @doclink Optimizer */
export declare class RMSPropOptimizer extends Optimizer {
    protected learningRate: number;
    protected decay: number;
    protected momentum: number;
    protected epsilon: number;
    /** @nocollapse */
    static get className(): string;
    private centered;
    private accumulatedMeanSquares;
    private accumulatedMoments;
    private accumulatedMeanGrads;
    constructor(learningRate: number, decay?: number, momentum?: number, epsilon?: number, centered?: boolean);
    applyGradients(variableGradients: NamedTensorMap | NamedTensor[]): void;
    dispose(): void;
    getWeights(): Promise<NamedTensor[]>;
    setWeights(weightValues: NamedTensor[]): Promise<void>;
    getConfig(): ConfigDict;
    /** @nocollapse */
    static fromConfig<T extends Serializable>(cls: SerializableConstructor<T>, config: ConfigDict): T;
}

export declare const RotateWithOffset = "RotateWithOffset";

export declare interface RotateWithOffsetAttrs {
    radians: number;
    fillValue: number | [number, number, number];
    center: number | [number, number];
}

export declare type RotateWithOffsetInputs = Pick<NamedTensorInfoMap, 'image'>;

export declare const Round = "Round";

export declare const round: typeof round_;

/**
 * Computes round of input `tf.Tensor` element-wise: `round(x)`.
 * It implements banker's rounding.
 *
 * ```js
 * const x = tf.tensor1d([.6, 1.1, -3.3]);
 *
 * x.round().print();  // or tf.round(x)
 * ```
 * @param x The input tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function round_<T extends Tensor>(x: T | TensorLike): T;

export declare type RoundInputs = UnaryInputs;

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
declare enum RowPartitionType {
    FIRST_DIM_SIZE = 0,
    VALUE_ROWIDS = 1,
    ROW_LENGTHS = 2,
    ROW_SPLITS = 3,
    ROW_LIMITS = 4,
    ROW_STARTS = 5
}

export declare const Rsqrt = "Rsqrt";

export declare const rsqrt: typeof rsqrt_;

/**
 * Computes reciprocal of square root of the input `tf.Tensor` element-wise:
 * `y = 1 / sqrt(x)`
 *
 * ```js
 * const x = tf.tensor1d([1, 2, 4, -1]);
 *
 * x.rsqrt().print();  // or tf.rsqrt(x)
 * ```
 * @param x The input tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function rsqrt_<T extends Tensor>(x: T | TensorLike): T;

export declare type RsqrtInputs = UnaryInputs;

/**
 * Options for saving a model.
 * @innamespace io
 */
declare interface SaveConfig {
    /**
     * Whether to save only the trainable weights of the model, ignoring the
     * non-trainable ones.
     */
    trainableOnly?: boolean;
    /**
     * Whether the optimizer will be saved (if exists).
     *
     * Default: `false`.
     */
    includeOptimizer?: boolean;
}

/**
 * @deprecated Deprecated interface for SavedModel/GraphModel signature
 *     input/output Tensor info. User ModelTensorInfo instead.
 */
export declare interface SavedModelTensorInfo {
    dtype: string;
    shape: number[];
    name: string;
}

/**
 * Type definition for handlers of saving operations.
 */
declare type SaveHandler = (modelArtifact: ModelArtifacts) => Promise<SaveResult>;

/**
 * Type definition for handlers of synchronous saving operations.
 */
declare type SaveHandlerSync = (modelArtifact: ModelArtifacts) => SaveResult;

/**
 * Result of a saving operation.
 */
declare interface SaveResult {
    /**
     * Information about the model artifacts saved.
     */
    modelArtifactsInfo: ModelArtifactsInfo;
    /**
     * HTTP responses from the server that handled the model-saving request (if
     * any). This is applicable only to server-based saving routes.
     */
    responses?: Response[];
    /**
     * Error messages and related data (if any).
     */
    errors?: Array<{} | string>;
}

/** @doclink Tensor */
export declare type Scalar = Tensor<Rank.R0>;

/**
 * Creates rank-0 `tf.Tensor` (scalar) with the provided value and dtype.
 *
 * The same functionality can be achieved with `tf.tensor`, but in general
 * we recommend using `tf.scalar` as it makes the code more readable.
 *
 * ```js
 * tf.scalar(3.14).print();
 * ```
 *
 * @param value The value of the scalar.
 * @param dtype The data type.
 *
 * @doc {heading: 'Tensors', subheading: 'Creation'}
 */
export declare function scalar(value: number | boolean | string | Uint8Array, dtype?: DataType): Scalar;

export declare type ScalarLike = number | boolean | string | Uint8Array;

declare namespace scatter_util {
    export {
        validateUpdateShape,
        validateInput,
        calculateShapes,
        ScatterShapeInfo
    }
}
export { scatter_util }

export declare const ScatterNd = "ScatterNd";

export declare const scatterND: typeof scatterND_;

/**
 * Creates a new tensor by applying sparse updates to individual
 * values or slices within a zero tensor of the given shape tensor according to
 * indices. This operator is the inverse of the `tf.gatherND` operator which
 * extracts values or slices from a given tensor.
 *
 * ```js
 * const indices = tf.tensor2d([4, 3, 1, 7], [4, 1], 'int32');
 * const updates = tf.tensor1d([9, 10, 11, 12]);
 * const shape = [8];
 * tf.scatterND(indices, updates, shape).print() //[0, 11, 0, 10, 9, 0, 0, 12]
 * ```
 *
 * @param indices The tensor contains the indices into the output tensor.
 * @param updates The tensor contains the value for the indices.
 * @param shape: The shape of the output tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Slicing and Joining'}
 */
declare function scatterND_<R extends Rank>(indices: Tensor | TensorLike, updates: Tensor | TensorLike, shape: ShapeMap[R]): Tensor<R>;

export declare interface ScatterNdAttrs {
    shape: number[];
}

export declare type ScatterNdInputs = Pick<NamedTensorInfoMap, 'indices' | 'updates'>;

declare interface ScatterShapeInfo {
    sliceRank: number;
    numUpdates: number;
    sliceSize: number;
    strides: number[];
    outputSize: number;
}

/** @docalias Function */
declare type ScopeFn<T extends TensorContainer> = () => T;

declare interface ScopeState {
    track: Tensor[];
    name: string;
    id: number;
}

export declare const SearchSorted = "SearchSorted";

export declare const searchSorted: typeof searchSorted_;

/**
 * Searches for where a value would go in a sorted sequence.
 *
 * This is not a method for checking containment (like javascript in).
 *
 * The typical use case for this operation is "binning", "bucketing", or
 * "discretizing". The values are assigned to bucket-indices based on the edges
 * listed in 'sortedSequence'. This operation returns the bucket-index for each
 * value.
 *
 * The side argument controls which index is returned if a value lands exactly
 * on an edge.
 *
 * The axis is not settable for this operation. It always operates on the
 * innermost dimension (axis=-1). The operation will accept any number of outer
 * dimensions.
 *
 * Note: This operation assumes that 'sortedSequence' is sorted along the
 * innermost axis, maybe using 'sort(..., axis=-1)'. If the sequence is not
 * sorted no error is raised and the content of the returned tensor is not well
 * defined.
 *
 * ```js
 * const edges = tf.tensor1d([-1, 3.3, 9.1, 10.0]);
 * let values = tf.tensor1d([0.0, 4.1, 12.0]);
 * const result1 = tf.searchSorted(edges, values, 'left');
 * result1.print(); // [1, 2, 4]
 *
 * const seq = tf.tensor1d([0, 3, 9, 10, 10]);
 * values = tf.tensor1d([0, 4, 10]);
 * const result2 = tf.searchSorted(seq, values, 'left');
 * result2.print(); // [0, 2, 3]
 * const result3 = tf.searchSorted(seq, values, 'right');
 * result3.print(); // [1, 2, 5]
 *
 * const sortedSequence = tf.tensor2d([[0., 3., 8., 9., 10.],
 *                                     [1., 2., 3., 4., 5.]]);
 * values = tf.tensor2d([[9.8, 2.1, 4.3],
 *                       [0.1, 6.6, 4.5, ]]);
 * const result4 = tf.searchSorted(sortedSequence, values, 'left');
 * result4.print(); // [[4, 1, 2], [0, 5, 4]]
 * ```
 * @param sortedSequence: N-D. Sorted sequence.
 * @param values: N-D. Search values.
 * @param side: 'left'|'right'. Defaults to 'left'. 'left' corresponds to lower
 *     bound and 'right' to upper bound.
 * @return An N-D int32 tensor the size of values containing the result of
 *     applying either lower bound or upper bound (depending on side) to each
 *     value. The result is not a global index to the entire Tensor, but the
 *     index in the last dimension.
 * @doc {heading: 'Operations', subheading: 'Evaluation'}
 */
declare function searchSorted_(sortedSequence: Tensor | TensorLike, values: Tensor | TensorLike, side?: 'left' | 'right'): Tensor;

export declare interface SearchSortedAttrs {
    side: 'left' | 'right';
}

export declare type SearchSortedInputs = Pick<NamedTensorInfoMap, 'sortedSequence' | 'values'>;

declare namespace segment_util {
    export {
        segOpComputeOptimalWindowSize,
        computeOutShape_2 as computeOutShape,
        collectGatherOpShapeInfo,
        SegOpInfo,
        GatherOpShapeInfo
    }
}

declare function segOpComputeOptimalWindowSize(inSize: number, numSegments: number): number;

declare interface SegOpInfo {
    windowSize: number;
    batchSize: number;
    inSize: number;
    numSegments: number;
}

export declare const Select = "Select";

export declare type SelectInputs = Pick<NamedTensorInfoMap, 'condition' | 't' | 'e'>;

export declare const Selu = "Selu";

export declare const selu: typeof selu_;

/**
 * Computes scaled exponential linear element-wise.
 *
 * `x < 0 ? scale * alpha * (exp(x) - 1) : scale * x`
 *
 * ```js
 * const x = tf.tensor1d([-1, 2, -3, 4]);
 *
 * x.selu().print();  // or tf.selu(x)
 * ```
 * @param x The input tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function selu_<T extends Tensor>(x: T | TensorLike): T;

declare const SELU_SCALE = 1.0507009873554805;

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
declare const SELU_SCALEALPHA = 1.7580993408473768;

export declare type SeluInputs = Pick<NamedTensorInfoMap, 'x'>;

export declare const separableConv2d: typeof separableConv2d_;

/**
 * 2-D convolution with separable filters.
 *
 * Performs a depthwise convolution that acts separately on channels followed
 * by a pointwise convolution that mixes channels. Note that this is
 * separability between dimensions [1, 2] and 3, not spatial separability
 * between dimensions 1 and 2.
 *
 * See
 * [https://www.tensorflow.org/api_docs/python/tf/nn/separable_conv2d](
 *     https://www.tensorflow.org/api_docs/python/tf/nn/separable_conv2d)
 * for more details.
 *
 * @param x The input tensor, of rank 4 or rank 3, of shape
 *     `[batch, height, width, inChannels]`. If rank 3, batch of 1 is
 * assumed.
 * @param depthwiseFilter The depthwise filter tensor, rank 4, of shape
 *     `[filterHeight, filterWidth, inChannels, channelMultiplier]`. This is
 *     the filter used in the first step.
 * @param pointwiseFilter The pointwise filter tensor, rank 4, of shape
 *     `[1, 1, inChannels * channelMultiplier, outChannels]`. This is
 *     the filter used in the second step.
 * @param strides The strides of the convolution: `[strideHeight,
 * strideWidth]`. If strides is a single number, then `strideHeight ==
 * strideWidth`.
 * @param pad The type of padding algorithm.
 *   - `same` and stride 1: output will be of same size as input,
 *       regardless of filter size.
 *   - `valid`: output will be smaller than input if filter is larger
 *       than 1x1.
 *   - For more info, see this guide:
 *     [https://www.tensorflow.org/api_docs/python/tf/nn/convolution](
 *          https://www.tensorflow.org/api_docs/python/tf/nn/convolution)
 * @param dilations The dilation rates: `[dilationHeight, dilationWidth]`
 *     in which we sample input values across the height and width dimensions
 *     in atrous convolution. Defaults to `[1, 1]`. If `rate` is a single
 *     number, then `dilationHeight == dilationWidth`. If it is greater than
 *     1, then all values of `strides` must be 1.
 * @param dataFormat: An optional string from: "NHWC", "NCHW". Defaults to
 *     "NHWC". Specify the data format of the input and output data. With the
 *     default format "NHWC", the data is stored in the order of: [batch,
 *     height, width, channels]. Only "NHWC" is currently supported.
 *
 * @doc {heading: 'Operations', subheading: 'Convolution'}
 */
declare function separableConv2d_<T extends Tensor3D | Tensor4D>(x: T | TensorLike, depthwiseFilter: Tensor4D | TensorLike, pointwiseFilter: Tensor4D | TensorLike, strides: [number, number] | number, pad: 'valid' | 'same', dilation?: [number, number] | number, dataFormat?: 'NHWC' | 'NCHW'): T;

/**
 * Serializable defines the serialization contract.
 *
 * TFJS requires serializable classes to return their className when asked
 * to avoid issues with minification.
 */
declare abstract class Serializable {
    /**
     * Return the class name for this class to use in serialization contexts.
     *
     * Generally speaking this will be the same thing that constructor.name
     * would have returned.  However, the class name needs to be robust
     * against minification for serialization/deserialization to work properly.
     *
     * There's also places such as initializers.VarianceScaling, where
     * implementation details between different languages led to different
     * class hierarchies and a non-leaf node is used for serialization purposes.
     */
    getClassName(): string;
    /**
     * Return all the non-weight state needed to serialize this object.
     */
    abstract getConfig(): ConfigDict;
    /**
     * Creates an instance of T from a ConfigDict.
     *
     * This works for most descendants of serializable.  A few need to
     * provide special handling.
     * @param cls A Constructor for the class to instantiate.
     * @param config The Configuration for the object.
     */
    /** @nocollapse */
    static fromConfig<T extends Serializable>(cls: SerializableConstructor<T>, config: ConfigDict): T;
}

/**
 * Type to represent the class-type of Serializable objects.
 *
 * Ie the class prototype with access to the constructor and any
 * static members/methods. Instance methods are not listed here.
 *
 * Source for this idea: https://stackoverflow.com/a/43607255
 */
declare type SerializableConstructor<T extends Serializable> = {
    new (...args: any[]): T;
    className: string;
    fromConfig: FromConfigMethod<T>;
};

declare namespace serialization {
    export {
        registerClass,
        getRegisteredName,
        ConfigDictValue,
        ConfigDict,
        ConfigDictArray,
        SerializableConstructor,
        FromConfigMethod,
        Serializable,
        SerializationMap
    }
}
export { serialization }

/**
 * Maps string keys to class constructors.
 *
 * Used during (de)serialization from the cross-language JSON format, which
 * requires the class name in the serialization format matches the class
 * names as used in Python, should it exist.
 */
declare class SerializationMap {
    private static instance;
    classNameMap: {
        [className: string]: [
        SerializableConstructor<Serializable>,
        FromConfigMethod<Serializable>
        ];
    };
    private constructor();
    /**
     * Returns the singleton instance of the map.
     */
    static getMap(): SerializationMap;
    /**
     * Registers the class as serializable.
     */
    static register<T extends Serializable>(cls: SerializableConstructor<T>): void;
}

/**
 * Sets the backend (cpu, webgl, wasm, etc) responsible for creating tensors and
 * executing operations on those tensors. Returns a promise that resolves
 * to a boolean if the backend initialization was successful.
 *
 * Note this disposes the current backend, if any, as well as any tensors
 * associated with it. A new backend is initialized, even if it is of the
 * same type as the previous one.
 *
 * @param backendName The name of the backend. Currently supports
 *     `'webgl'|'cpu'` in the browser, `'tensorflow'` under node.js
 *     (requires tfjs-node), and `'wasm'` (requires tfjs-backend-wasm).
 *
 * @doc {heading: 'Backends'}
 */
export declare function setBackend(backendName: string): Promise<boolean>;

export declare const setdiff1dAsync: typeof setdiff1dAsync_;

/**
 * Computes the difference between two lists of numbers.
 *
 * Given a Tensor `x` and a Tensor `y`, this operation returns a Tensor `out`
 * that represents all values that are in `x` but not in `y`. The returned
 * Tensor `out` is sorted in the same order that the numbers appear in `x`
 * (duplicates are preserved). This operation also returns a Tensor indices that
 * represents the position of each out element in `x`. In other words:
 *
 * `out[i] = x[idx[i]] for i in [0, 1, ..., out.length - 1]`
 *
 * ```js
 * const x = [1, 2, 3, 4, 5, 6];
 * const y = [1, 3, 5];
 *
 * const [out, indices] = await tf.setdiff1dAsync(x, y);
 * out.print(); // [2, 4, 6]
 * indices.print(); // [1, 3, 5]
 * ```
 *
 * @param x 1-D Tensor. Values to keep.
 * @param y 1-D Tensor. Must have the same type as x. Values to exclude in the
 *     output.
 * @returns Promise of Tensor tuple [out, indices].
 *  out: Tensor with the same type as x.
 *  indices: A Tensor of type int32.
 *
 * @doc {heading: 'Tensors', subheading: 'Transformations'}
 */
declare function setdiff1dAsync_(x: Tensor | TensorLike, y: Tensor | TensorLike): Promise<[Tensor, Tensor]>;

/**
 * Sets the global platform.
 *
 * @param platformName The name of this platform.
 * @param platform A platform implementation.
 */
export declare function setPlatform(platformName: string, platform: Platform): void;

/** @doclink Optimizer */
export declare class SGDOptimizer extends Optimizer {
    protected learningRate: number;
    /** @nocollapse */
    static get className(): string;
    protected c: Scalar;
    constructor(learningRate: number);
    applyGradients(variableGradients: NamedTensorMap | NamedTensor[]): void;
    /**
     * Sets the learning rate of the optimizer.
     */
    setLearningRate(learningRate: number): void;
    dispose(): void;
    getWeights(): Promise<NamedTensor[]>;
    setWeights(weightValues: NamedTensor[]): Promise<void>;
    getConfig(): ConfigDict;
    /** @nocollapse */
    static fromConfig<T extends Serializable>(cls: SerializableConstructor<T>, config: ConfigDict): T;
}

/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
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
/// <reference path="../src/types/webgpu.d.ts" />
/** @docalias number[] */
export declare interface ShapeMap {
    R0: number[];
    R1: [number];
    R2: [number, number];
    R3: [number, number, number];
    R4: [number, number, number, number];
    R5: [number, number, number, number, number];
    R6: [number, number, number, number, number, number];
}

declare const shouldFuse: (gradientDepth: number, activation: Activation) => boolean;

/**
 * Shuffles the array in-place using Fisher-Yates algorithm.
 *
 * ```js
 * const a = [1, 2, 3, 4, 5];
 * tf.util.shuffle(a);
 * console.log(a);
 * ```
 *
 * @param array The array to shuffle in-place.
 *
 * @doc {heading: 'Util', namespace: 'util'}
 */
declare function shuffle(array: any[] | Uint32Array | Int32Array | Float32Array): void;

/**
 * Shuffles two arrays in-place the same way using Fisher-Yates algorithm.
 *
 * ```js
 * const a = [1,2,3,4,5];
 * const b = [11,22,33,44,55];
 * tf.util.shuffleCombo(a, b);
 * console.log(a, b);
 * ```
 *
 * @param array The first array to shuffle in-place.
 * @param array2 The second array to shuffle in-place with the same permutation
 *     as the first array.
 *
 * @doc {heading: 'Util', namespace: 'util'}
 */
declare function shuffleCombo(array: any[] | Uint32Array | Int32Array | Float32Array, array2: any[] | Uint32Array | Int32Array | Float32Array): void;

export declare const Sigmoid = "Sigmoid";

export declare const sigmoid: typeof sigmoid_;

/**
 * Computes sigmoid element-wise, `1 / (1 + exp(-x))`
 *
 * ```js
 * const x = tf.tensor1d([0, -1, 2, -3]);
 *
 * x.sigmoid().print();  // or tf.sigmoid(x)
 * ```
 * @param x The input tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function sigmoid_<T extends Tensor>(x: T | TensorLike): T;

export declare type SigmoidInputs = UnaryInputs;

export declare const Sign = "Sign";

export declare const sign: typeof sign_;

/**
 * Returns an element-wise indication of the sign of a number.
 *
 * ```js
 * const x = tf.tensor1d([.6, 1.1, -3.3, NaN, 0]);
 *
 * x.sign().print();  // or tf.sign(x)
 * ```
 * @param x The input Tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function sign_<T extends Tensor>(x: T | TensorLike): T;

export declare const signal: {
    hammingWindow: (windowLength: number) => Tensor1D;
    hannWindow: (windowLength: number) => Tensor1D;
    frame: (signal: Tensor1D, frameLength: number, frameStep: number, padEnd?: boolean, padValue?: number) => Tensor<Rank>;
    stft: (signal: Tensor1D, frameLength: number, frameStep: number, fftLength?: number, windowFn?: (length: number) => Tensor1D) => Tensor<Rank>;
};

/**
 * Interface for SavedModel/GraphModel SignatureDef info.
 */
export declare interface SignatureDef {
    [key: string]: SignatureDefEntry;
}

/**
 * Interface for SavedModel/GraphModel SignatureDef entry.
 */
export declare interface SignatureDefEntry {
    inputs: {
        [key: string]: ModelTensorInfo;
    };
    outputs: {
        [key: string]: ModelTensorInfo;
    };
}

/**
 * @deprecated Deprecated interface for SavedModel/GraphModel SignatureDef info.
 *     User SignatureDef instead.
 */
export declare interface SignatureDefInfo {
    [key: string]: {
        inputs: {
            [key: string]: SavedModelTensorInfo;
        };
        outputs: {
            [key: string]: SavedModelTensorInfo;
        };
    };
}

export declare type SignInputs = UnaryInputs;

export declare const Sin = "Sin";

export declare const sin: typeof sin_;

/**
 * Computes sin of the input Tensor element-wise: `sin(x)`
 *
 * ```js
 * const x = tf.tensor1d([0, Math.PI / 2, Math.PI * 3 / 4]);
 *
 * x.sin().print();  // or tf.sin(x)
 * ```
 * @param x The input tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function sin_<T extends Tensor>(x: T | TensorLike): T;

declare interface SingleValueMap {
    bool: boolean;
    int32: number;
    float32: number;
    complex64: number;
    string: string;
}

export declare const Sinh = "Sinh";

export declare const sinh: typeof sinh_;

/**
 * Computes hyperbolic sin of the input `tf.Tensor` element-wise: `sinh(x)`
 *
 * ```js
 * const x = tf.tensor1d([0, 1, -1, .7]);
 *
 * x.sinh().print();  // or tf.sinh(x)
 * ```
 * @param x The input tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function sinh_<T extends Tensor>(x: T | TensorLike): T;

export declare type SinhInputs = UnaryInputs;

export declare type SinInputs = UnaryInputs;

/**
 * Returns the size (number of elements) of the tensor given its shape.
 *
 * ```js
 * const shape = [3, 4, 2];
 * const size = tf.util.sizeFromShape(shape);
 * console.log(size);
 * ```
 *
 * @doc {heading: 'Util', namespace: 'util'}
 */
declare function sizeFromShape(shape: number[]): number;

declare function sizeToSquarishShape(size: number): [number, number];

export declare const Slice = "Slice";

export declare const slice: typeof slice_;

export declare const slice1d: typeof slice1d_;

/**
 * Extracts a 1D slice from 1D array starting at coordinates `begin` and is
 * of length `size`. See `slice` for details.
 */
declare function slice1d_(x: Tensor1D | TensorLike, begin: number, size: number): Tensor1D;

export declare const slice2d: typeof slice2d_;

/**
 * Extracts a 2D slice from a 2D array starting at coordinates `begin` and
 * is of size `size`. See `slice` for details.
 */
declare function slice2d_(x: Tensor2D | TensorLike, begin: [number, number], size: [number, number]): Tensor2D;

export declare const slice3d: typeof slice3d_;

/**
 * Extracts a 3D slice from a 3D array starting at coordinates `begin` and
 * is of size `size`. See `slice` for details.
 */
declare function slice3d_(x: Tensor3D | TensorLike, begin: [number, number, number], size: [number, number, number]): Tensor3D;

export declare const slice4d: typeof slice4d_;

/**
 * Extracts a 4D slice from a 4D array starting at coordinates `begin` and
 * is of size `size`. See `slice` for details.
 */
declare function slice4d_(x: Tensor4D | TensorLike, begin: [number, number, number, number], size: [number, number, number, number]): Tensor4D;

/**
 * Extracts a slice from a `tf.Tensor` starting at coordinates `begin`
 * and is of size `size`.
 *
 * Also available are stricter rank-specific methods with the same signature
 * as this method that assert that `x` is of the given rank:
 *   - `tf.slice1d`
 *   - `tf.slice2d`
 *   - `tf.slice3d`
 *   - `tf.slice4d`
 *
 * ```js
 * const x = tf.tensor1d([1, 2, 3, 4]);
 *
 * x.slice([1], [2]).print();
 * ```
 *
 * ```js
 * const x = tf.tensor2d([1, 2, 3, 4], [2, 2]);
 *
 * x.slice([1, 0], [1, 2]).print();
 * ```
 * @param x The input `tf.Tensor` to slice from.
 * @param begin The coordinates to start the slice from. The length can be
 *     less than the rank of x - the rest of the axes will have implicit 0 as
 *     start. Can also be a single number, in which case it specifies the
 *     first axis.
 * @param size The size of the slice. The length can be less than the rank of
 *     x - the rest of the axes will have implicit -1. A value of -1 requests
 *     the rest of the dimensions in the axis. Can also be a single number,
 *     in which case it specifies the size of the first axis.
 *
 * @doc {heading: 'Tensors', subheading: 'Slicing and Joining'}
 */
declare function slice_<R extends Rank, T extends Tensor<R>>(x: T | TensorLike, begin: number | number[], size?: number | number[]): T;

declare namespace slice_util {
    export {
        assertParamsValid,
        maskToAxes,
        computeOutShape,
        stridesWithElidedDims,
        getNormalizedAxes,
        startIndicesWithElidedDims,
        stopIndicesWithElidedDims,
        stridesForAxis,
        startForAxis,
        stopForAxis,
        isSliceContinous,
        computeFlatOffset,
        parseSliceParams,
        sliceInfo,
        SliceInfo
    }
}
export { slice_util }

export declare interface SliceAttrs {
    begin: number | number[];
    size: number | number[];
}

declare type SliceInfo = {
    finalShapeSparse: number[];
    finalShape: number[];
    isIdentity: boolean;
    sliceDim0: boolean;
    isSimpleSlice: boolean;
    begin: number[];
    end: number[];
    strides: number[];
};

declare function sliceInfo(xShape: number[], begin: number[], end: number[], strides: number[], beginMask: number, endMask: number, ellipsisMask: number, newAxisMask: number, shrinkAxisMask: number): SliceInfo;

export declare type SliceInputs = Pick<NamedTensorInfoMap, 'x'>;

export declare const Softmax = "Softmax";

export declare const softmax: typeof softmax_;

/**
 * Computes the softmax normalized vector given the logits.
 *
 * ```js
 * const a = tf.tensor1d([1, 2, 3]);
 *
 * a.softmax().print();  // or tf.softmax(a)
 * ```
 *
 * ```js
 * const a = tf.tensor2d([2, 4, 6, 1, 2, 3], [2, 3]);
 *
 * a.softmax().print();  // or tf.softmax(a)
 * ```
 *
 * @param logits The logits array.
 * @param dim The dimension softmax would be performed on. Defaults to `-1`
 *     which indicates the last dimension.
 *
 * @doc {heading: 'Operations', subheading: 'Normalization'}
 */
declare function softmax_<T extends Tensor>(logits: T | TensorLike, dim?: number): T;

export declare interface SoftmaxAttrs {
    dim: number;
}

export declare type SoftmaxInputs = Pick<NamedTensorInfoMap, 'logits'>;

export declare const Softplus = "Softplus";

export declare const softplus: typeof softplus_;

/**
 * Computes softplus of the input `tf.Tensor` element-wise: `log(exp(x) + 1)`
 *
 * ```js
 * const x = tf.tensor1d([0, 1, -1, .7]);
 *
 * x.softplus().print();  // or tf.softplus(x)
 * ```
 * @param x The input tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function softplus_<T extends Tensor>(x: T | TensorLike): T;

export declare type SoftplusInputs = UnaryInputs;

export declare const SpaceToBatchND = "SpaceToBatchND";

export declare const spaceToBatchND: typeof spaceToBatchND_;

/**
 * This operation divides "spatial" dimensions `[1, ..., M]` of the input into
 * a grid of blocks of shape `blockShape`, and interleaves these blocks with
 * the "batch" dimension (0) such that in the output, the spatial
 * dimensions `[1, ..., M]` correspond to the position within the grid,
 * and the batch dimension combines both the position within a spatial block
 * and the original batch position. Prior to division into blocks,
 * the spatial dimensions of the input are optionally zero padded
 * according to `paddings`. See below for a precise description.
 *
 * ```js
 * const x = tf.tensor4d([1, 2, 3, 4], [1, 2, 2, 1]);
 * const blockShape = [2, 2];
 * const paddings = [[0, 0], [0, 0]];
 *
 * x.spaceToBatchND(blockShape, paddings).print();
 * ```
 *
 * @param x A `tf.Tensor`. N-D with `x.shape` = `[batch] + spatialShape +
 * remainingShape`, where spatialShape has `M` dimensions.
 * @param blockShape A 1-D array. Must have shape `[M]`, all values must
 * be >= 1.
 * @param paddings A 2-D array. Must have shape `[M, 2]`, all values must be >=
 *     0. `paddings[i] = [padStart, padEnd]` specifies the amount to zero-pad
 * from input dimension `i + 1`, which corresponds to spatial dimension `i`. It
 * is required that
 * `(inputShape[i + 1] + padStart + padEnd) % blockShape[i] === 0`
 *
 * This operation is equivalent to the following steps:
 *
 * 1. Zero-pad the start and end of dimensions `[1, ..., M]` of the input
 * according to `paddings` to produce `padded` of shape paddedShape.
 *
 * 2. Reshape `padded` to `reshapedPadded` of shape:
 * `[batch] + [paddedShape[1] / blockShape[0], blockShape[0], ...,
 * paddedShape[M] / blockShape[M-1], blockShape[M-1]] + remainingShape`
 *
 * 3. Permute dimensions of `reshapedPadded` to produce `permutedReshapedPadded`
 * of shape: `blockShape + [batch] + [paddedShape[1] / blockShape[0], ...,
 * paddedShape[M] / blockShape[M-1]] + remainingShape`
 *
 * 4. Reshape `permutedReshapedPadded` to flatten `blockShape` into the
 * batch dimension, producing an output tensor of shape:
 * `[batch * prod(blockShape)] + [paddedShape[1] / blockShape[0], ...,
 * paddedShape[M] / blockShape[M-1]] + remainingShape`
 *
 * @doc {heading: 'Tensors', subheading: 'Transformations'}
 */
declare function spaceToBatchND_<T extends Tensor>(x: T | TensorLike, blockShape: number[], paddings: number[][]): T;

export declare interface SpaceToBatchNDAttrs {
    blockShape: number[];
    paddings: number[][];
}

export declare type SpaceToBatchNDInputs = Pick<NamedTensorInfoMap, 'x'>;

export declare const sparse: {
    sparseFillEmptyRows: (indices: TensorLike | Tensor2D, values: TensorLike | Tensor1D, denseShape: TensorLike | Tensor1D, defaultValue: ScalarLike | Scalar) => NamedTensorMap;
    sparseReshape: (inputIndices: TensorLike | Tensor2D, inputShape: TensorLike | Tensor1D, newShape: TensorLike | Tensor1D) => NamedTensorMap;
    sparseSegmentMean: (data: TensorLike | Tensor<Rank>, indices: TensorLike | Tensor1D, segmentIds: TensorLike | Tensor1D) => Tensor<Rank>;
    sparseSegmentSum: (data: TensorLike | Tensor<Rank>, indices: TensorLike | Tensor1D, segmentIds: TensorLike | Tensor1D) => Tensor<Rank>;
};

export declare const SparseFillEmptyRows = "SparseFillEmptyRows";

export declare type SparseFillEmptyRowsInputs = Pick<NamedTensorInfoMap, 'indices' | 'values' | 'denseShape' | 'defaultValue'>;

export declare const SparseReshape = "SparseReshape";

export declare type SparseReshapeInputs = Pick<NamedTensorInfoMap, 'inputIndices' | 'inputShape' | 'newShape'>;

export declare const SparseSegmentMean = "SparseSegmentMean";

export declare type SparseSegmentMeanInputs = Pick<NamedTensorInfoMap, 'data' | 'indices' | 'segmentIds'>;

export declare const SparseSegmentSum = "SparseSegmentSum";

export declare type SparseSegmentSumInputs = Pick<NamedTensorInfoMap, 'data' | 'indices' | 'segmentIds'>;

export declare const SparseToDense = "SparseToDense";

export declare const sparseToDense: typeof sparseToDense_;

/**
 * Converts a sparse representation into a dense tensor.
 *
 * Builds an array dense with shape outputShape such that:
 *
 * // If sparseIndices is scalar
 * dense[i] = (i == sparseIndices ? sparseValues : defaultValue)
 *
 * // If sparseIndices is a vector, then for each i
 * dense[sparseIndices[i]] = sparseValues[i]
 *
 * // If sparseIndices is an n by d matrix, then for each i in [0, n)
 * dense[sparseIndices[i][0], ..., sparseIndices[i][d-1]] = sparseValues[i]
 * All other values in dense are set to defaultValue. If sparseValues is a
 * scalar, all sparse indices are set to this single value.
 *
 * If indices are repeated the final value is summed over all values for those
 * indices.
 *
 * ```js
 * const indices = tf.tensor1d([4, 5, 6, 1, 2, 3], 'int32');
 * const values = tf.tensor1d([10, 11, 12, 13, 14, 15], 'float32');
 * const shape = [8];
 * tf.sparseToDense(indices, values, shape).print();
 * ```
 *
 * @param sparseIndices A 0-D, 1-D, or 2-D Tensor of type int32.
 * sparseIndices[i] contains the complete index where sparseValues[i] will be
 * placed.
 * @param sparseValues A 0-D or 1-D Tensor. Values
 * corresponding to each row of sparseIndices, or a scalar value to be used for
 * all sparse indices.
 * @param outputShape Shape of the dense output tensor. The type is inferred.
 * @param defaultValue Scalar. Value to set for indices not specified in
 * sparseIndices. Defaults to zero.
 *
 * @doc {heading: 'Operations', subheading: 'Normalization'}
 */
declare function sparseToDense_<R extends Rank>(sparseIndices: Tensor | TensorLike, sparseValues: Tensor | TensorLike, outputShape: ShapeMap[R], defaultValue?: Scalar | ScalarLike): Tensor<R>;

export declare interface SparseToDenseAttrs {
    outputShape: number[];
}

export declare type SparseToDenseInputs = Pick<NamedTensorInfoMap, 'sparseIndices' | 'sparseValues' | 'defaultValue'>;

export declare const spectral: {
    fft: (input: Tensor<Rank>) => Tensor<Rank>;
    ifft: (input: Tensor<Rank>) => Tensor<Rank>;
    rfft: (input: Tensor<Rank>, fftLength?: number) => Tensor<Rank>;
    irfft: (input: Tensor<Rank>) => Tensor<Rank>;
};

export declare const split: typeof split_;

/**
 * Splits a `tf.Tensor` into sub tensors.
 *
 * If `numOrSizeSplits` is a number, splits `x` along dimension `axis`
 * into `numOrSizeSplits` smaller tensors.
 * Requires that `numOrSizeSplits` evenly divides `x.shape[axis]`.
 *
 * If `numOrSizeSplits` is a number array, splits `x` into
 * `numOrSizeSplits.length` pieces. The shape of the `i`-th piece has the
 * same size as `x` except along dimension `axis` where the size is
 * `numOrSizeSplits[i]`.
 *
 * ```js
 * const x = tf.tensor2d([1, 2, 3, 4, 5, 6, 7, 8], [2, 4]);
 * const [a, b] = tf.split(x, 2, 1);
 * a.print();
 * b.print();
 *
 * const [c, d, e] = tf.split(x, [1, 2, 1], 1);
 * c.print();
 * d.print();
 * e.print();
 * ```
 *
 * @param x The input tensor to split.
 * @param numOrSizeSplits Either an integer indicating the number of
 * splits along the axis or an array of integers containing the sizes of
 * each output tensor along the axis. If a number then it must evenly divide
 * `x.shape[axis]`; otherwise the sum of sizes must match `x.shape[axis]`.
 * Can contain one -1 indicating that dimension is to be inferred.
 * @param axis The dimension along which to split. Defaults to 0 (the first
 * dim).
 *
 * @doc {heading: 'Tensors', subheading: 'Slicing and Joining'}
 */
declare function split_<T extends Tensor>(x: Tensor | TensorLike, numOrSizeSplits: number[] | number, axis?: number): T[];

/**
 * Splits a complex Float32Array into real and imag parts.
 *
 * The memory layout is interleaved as follows:
 * complex: [r0, i0, r1, i1, r2, i2]
 * real: [r0, r1, r2]
 * imag: [i0, i1, i2]
 *
 * This is the inverse of mergeRealAndImagArrays.
 *
 * @param complex The complex tensor values.
 * @returns An object with real and imag Float32Array components of the complex
 *     tensor.
 */
declare function splitRealAndImagArrays(complex: Float32Array): {
    real: Float32Array;
    imag: Float32Array;
};

export declare const SplitV = "SplitV";

export declare interface SplitVAttrs {
    numOrSizeSplits: number[] | number;
    axis: number;
}

export declare type SplitVInputs = Pick<NamedTensorInfoMap, 'x'>;

export declare const Sqrt = "Sqrt";

export declare const sqrt: typeof sqrt_;

/**
 * Computes square root of the input `tf.Tensor` element-wise: `y = sqrt(x)`
 *
 * ```js
 * const x = tf.tensor1d([1, 2, 4, -1]);
 *
 * x.sqrt().print();  // or tf.sqrt(x)
 * ```
 * @param x The input tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function sqrt_<T extends Tensor>(x: T | TensorLike): T;

export declare type SqrtInputs = UnaryInputs;

export declare const Square = "Square";

export declare const square: typeof square_;

/**
 * Computes square of `x` element-wise: `x ^ 2`
 *
 * ```js
 * const x = tf.tensor1d([1, 2, Math.sqrt(2), -1]);
 *
 * x.square().print();  // or tf.square(x)
 * ```
 * @param x The input Tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function square_<T extends Tensor>(x: T | TensorLike): T;

export declare const SquaredDifference = "SquaredDifference";

export declare const squaredDifference: typeof squaredDifference_;

/**
 * Returns (a - b) * (a - b) element-wise.
 * Supports broadcasting.
 *
 * ```js
 * const a = tf.tensor1d([1, 4, 3, 16]);
 * const b = tf.tensor1d([1, 2, 9, 4]);
 *
 * a.squaredDifference(b).print();  // or tf.squaredDifference(a, b)
 * ```
 *
 * ```js
 * // Broadcast squared difference  a with b.
 * const a = tf.tensor1d([2, 4, 6, 8]);
 * const b = tf.scalar(5);
 *
 * a.squaredDifference(b).print();  // or tf.squaredDifference(a, b)
 * ```
 *
 * @param a The first tensor.
 * @param b The second tensor. Must have the same type as `a`.
 *
 * @doc {heading: 'Operations', subheading: 'Arithmetic'}
 */
declare function squaredDifference_<T extends Tensor>(a: Tensor | TensorLike, b: Tensor | TensorLike): T;

export declare type SquaredDifferenceInputs = BinaryInputs;

export declare type SquareInputs = Pick<NamedTensorInfoMap, 'x'>;

export declare const squeeze: typeof squeeze_;

/**
 * Removes dimensions of size 1 from the shape of a `tf.Tensor`.
 *
 * ```js
 * const x = tf.tensor([1, 2, 3, 4], [1, 1, 4]);
 * x.squeeze().print();
 * ```
 *
 * @param x The input tensor to be squeezed.
 * @param axis An optional list of numbers. If specified, only
 *     squeezes the dimensions listed. The dimension index starts at 0. It
 * is an error to squeeze a dimension that is not 1.
 *
 * @doc {heading: 'Tensors', subheading: 'Transformations'}
 */
declare function squeeze_<T extends Tensor>(x: Tensor | TensorLike, axis?: number[]): T;

/** Reduces the shape by removing all dimensions of shape 1. */
declare function squeezeShape(shape: number[], axis?: number[]): {
    newShape: number[];
    keptDims: number[];
};

export declare const stack: typeof stack_;

/**
 * Stacks a list of rank-`R` `tf.Tensor`s into one rank-`(R+1)` `tf.Tensor`.
 *
 * ```js
 * const a = tf.tensor1d([1, 2]);
 * const b = tf.tensor1d([3, 4]);
 * const c = tf.tensor1d([5, 6]);
 * tf.stack([a, b, c]).print();
 * ```
 *
 * @param tensors A list of tensor objects with the same shape and dtype.
 * @param axis The axis to stack along. Defaults to 0 (the first dim).
 *
 * @doc {heading: 'Tensors', subheading: 'Slicing and Joining'}
 */
declare function stack_<T extends Tensor>(tensors: Array<T | TensorLike>, axis?: number): Tensor;

declare function startForAxis(beginMask: number, startIndices: number[], strides: number[], inputShape: number[], axis: number, ellipsisMask: number): number;

declare function startIndicesWithElidedDims(beginMask: number, ellipsisInsertionIndex: number, numElidedAxes: number, originalBegin: number[], inputShape: number[]): number[];

export declare const StaticRegexReplace = "StaticRegexReplace";

export declare interface StaticRegexReplaceAttrs {
    pattern: string;
    rewrite: string;
    replaceGlobal: boolean;
}

export declare type StaticRegexReplaceInputs = UnaryInputs;

/**
 * TensorFlow.js-only kernels
 */
export declare const Step = "Step";

export declare const step: typeof step_;

/**
 * Computes step of the input `tf.Tensor` element-wise: `x > 0 ? 1 : alpha`
 *
 * ```js
 * const x = tf.tensor1d([0, 2, -1, -3]);
 *
 * x.step(.5).print();  // or tf.step(x, .5)
 * ```
 * @param x The input tensor.
 * @param alpha The gradient when input is negative. Defaults to 0.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function step_<T extends Tensor>(x: T | TensorLike, alpha?: number): T;

export declare interface StepAttrs {
    alpha: number;
}

export declare type StepInputs = UnaryInputs;

declare function stopForAxis(endMask: number, stopIndices: number[], strides: number[], inputShape: number[], axis: number, ellipsisMask: number): number;

declare function stopIndicesWithElidedDims(endMask: number, ellipsisInsertionIndex: number, numElidedAxes: number, originalEnd: number[], inputShape: number[]): number[];

export declare const StridedSlice = "StridedSlice";

export declare const stridedSlice: typeof stridedSlice_;

/**
 * Extracts a strided slice of a tensor.
 *
 * Roughly speaking, this op extracts a slice of size (end-begin)/stride from
 * the given input tensor (x). Starting at the location specified by begin the
 * slice continues by adding stride to the index until all dimensions are not
 * less than end. Note that a stride can be negative, which causes a reverse
 * slice.
 *
 * ```js
 * const t = tf.tensor3d([1, 1, 1 ,2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6],
 *    [3, 2, 3]);
 * t.stridedSlice([1, 0, 0], [2, 1, 3], [1, 1, 1]).print()  // [[[3, 3, 3]]]
 * t.stridedSlice([1, 0, 0], [2, 2, 3], [1, 1, 1]).print()  // [[[3, 3, 3],
 *                                                     // [4, 4, 4]]]
 * t.stridedSlice([1, -1, 0], [2, -3, 3], [1, -1, 1]).print() // [[[4, 4, 4],
 *                                                     // [3, 3, 3]]]
 * ```
 *
 * @param x The tensor to stride slice.
 * @param begin The coordinates to start the slice from.
 * @param end: The coordinates to end the slice at.
 * @param strides: The size of the slice.
 * @param beginMask: If the ith bit of beginMask is set, begin[i] is ignored
 *      and the fullest possible range in that dimension is used instead.
 * @param endMask: If the ith bit of endMask is set, end[i] is ignored
 *      and the fullest possible range in that dimension is used instead.
 * @param shrinkAxisMask: a bitmask where bit i implies that
 * the ith specification should shrink the dimensionality. begin and end must
 * imply a slice of size 1 in the dimension.
 *
 * @doc {heading: 'Operations', subheading: 'Slicing and Joining'}
 */
declare function stridedSlice_(x: Tensor | TensorLike, begin: number[], end: number[], strides?: number[], beginMask?: number, endMask?: number, ellipsisMask?: number, newAxisMask?: number, shrinkAxisMask?: number): Tensor;

export declare interface StridedSliceAttrs {
    begin: number[];
    end: number[];
    strides: number[];
    beginMask: number;
    endMask: number;
    ellipsisMask: number;
    newAxisMask: number;
    shrinkAxisMask: number;
}

export declare type StridedSliceInputs = Pick<NamedTensorInfoMap, 'x'>;

declare function stridesForAxis(strides: number[], axis: number, ellipsisMask: number): number;

declare function stridesOrDilationsArePositive(values: number | number[]): boolean;

declare function stridesWithElidedDims(strides: number[], ellipsisInsertionIndex: number, numElidedAxes: number, inputShape: number[]): number[];

export declare const string: {
    stringNGrams: (data: TensorLike | Tensor1D, dataSplits: TensorLike | Tensor<Rank>, separator: string, nGramWidths: number[], leftPad: string, rightPad: string, padWidth: number, preserveShortSequences: boolean) => NamedTensorMap;
    stringSplit: (input: TensorLike | Tensor1D, delimiter: ScalarLike | Scalar, skipEmpty?: boolean) => NamedTensorMap;
    stringToHashBucketFast: (input: TensorLike | Tensor<Rank>, numBuckets: number) => Tensor<Rank>;
    staticRegexReplace: (input: TensorLike | Tensor<Rank>, pattern: string, rewrite: string, replaceGlobal?: boolean) => Tensor<Rank>;
};

export declare const StringNGrams = "StringNGrams";

export declare interface StringNGramsAttrs {
    separator: string;
    nGramWidths: number[];
    leftPad: string;
    rightPad: string;
    padWidth: number;
    preserveShortSequences: boolean;
}

export declare type StringNGramsInputs = Pick<NamedTensorInfoMap, 'data' | 'dataSplits'>;

export declare const StringSplit = "StringSplit";

export declare interface StringSplitAttrs {
    skipEmpty: boolean;
}

export declare type StringSplitInputs = Pick<NamedTensorInfoMap, 'input' | 'delimiter'>;

export declare const StringToHashBucketFast = "StringToHashBucketFast";

export declare interface StringToHashBucketFastAttrs {
    numBuckets: number;
}

export declare type StringToHashBucketFastInputs = Pick<NamedTensorInfoMap, 'input'>;

export declare const Sub = "Sub";

export declare const sub: typeof sub_;

/**
 * Subtracts two `tf.Tensor`s element-wise, A - B. Supports broadcasting.
 *
 * ```js
 * const a = tf.tensor1d([10, 20, 30, 40]);
 * const b = tf.tensor1d([1, 2, 3, 4]);
 *
 * a.sub(b).print();  // or tf.sub(a, b)
 * ```
 *
 * ```js
 * // Broadcast subtract a with b.
 * const a = tf.tensor1d([10, 20, 30, 40]);
 * const b = tf.scalar(5);
 *
 * a.sub(b).print();  // or tf.sub(a, b)
 * ```
 * @param a The first `tf.Tensor` to subtract from.
 * @param b The second `tf.Tensor` to be subtracted. Must have the same dtype as
 * `a`.
 *
 * @doc {heading: 'Operations', subheading: 'Arithmetic'}
 */
declare function sub_<T extends Tensor>(a: Tensor | TensorLike, b: Tensor | TensorLike): T;

export declare type SubInputs = BinaryInputs;

export declare const Sum = "Sum";

export declare const sum: typeof sum_;

/**
 * Computes the sum of elements across dimensions of a `tf.Tensor`.
 *
 * Reduces the input along the dimensions given in `axes`. Unless `keepDims`
 * is true, the rank of the `tf.Tensor` is reduced by 1 for each entry in
 * `axes`. If `keepDims` is true, the reduced dimensions are retained with
 * length 1. If axes has no entries, all dimensions are reduced, and a
 * `tf.Tensor` with a single element is returned.
 *
 * ```js
 * const x = tf.tensor1d([1, 2, 3]);
 *
 * x.sum().print();  // or tf.sum(x)
 * ```
 *
 * ```js
 * const x = tf.tensor2d([1, 2, 3, 4], [2, 2]);
 *
 * const axis = 1;
 * x.sum(axis).print();  // or tf.sum(x, axis)
 * ```
 *
 * @param x The input tensor to compute the sum over. If the dtype is `bool`
 *   it will be converted to `int32` and the output dtype will be `int32`.
 * @param axis The dimension(s) to reduce. By default it reduces
 *     all dimensions.
 * @param keepDims If true, retains reduced dimensions with size 1.
 *
 * @doc {heading: 'Operations', subheading: 'Reduction'}
 */
declare function sum_<T extends Tensor>(x: Tensor | TensorLike, axis?: number | number[], keepDims?: boolean): T;

declare function sum_2(arr: number[]): number;

export declare interface SumAttrs {
    axis: number | number[];
    keepDims: boolean;
}

export declare type SumInputs = Pick<NamedTensorInfoMap, 'x'>;

/** Returns the output type after summation. */
export declare function sumOutType(type: DataType): DataType;

declare function swap<T>(object: {
    [index: number]: T;
}, left: number, right: number): void;

export declare const Tan = "Tan";

export declare const tan: typeof tan_;

/**
 * Computes tan of the input `tf.Tensor` element-wise, `tan(x)`
 *
 * ```js
 * const x = tf.tensor1d([0, Math.PI / 2, Math.PI * 3 / 4]);
 *
 * x.tan().print();  // or tf.tan(x)
 * ```
 * @param x The input tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function tan_<T extends Tensor>(x: T | TensorLike): T;

export declare const Tanh = "Tanh";

export declare const tanh: typeof tanh_;

/**
 * Computes hyperbolic tangent of the input `tf.Tensor` element-wise: `tanh(x)`
 *
 * ```js
 * const x = tf.tensor1d([0, 1, -1, 70]);
 *
 * x.tanh().print();  // or tf.tanh(x)
 * ```
 * @param x The input tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function tanh_<T extends Tensor>(x: T | TensorLike): T;

declare function tanh_2(x: number): number;

export declare type TanhInputs = UnaryInputs;

export declare type TanInputs = UnaryInputs;

declare interface TapeNode {
    id: number;
    kernelName: string;
    outputs: Tensor[];
    inputs: NamedTensorMap;
    gradient?: (dys: Tensor[]) => NamedGradientMap;
    saved?: Tensor[];
}

export declare namespace Tensor { }

/**
 * A `tf.Tensor` object represents an immutable, multidimensional array of
 * numbers that has a shape and a data type.
 *
 * For performance reasons, functions that create tensors do not necessarily
 * perform a copy of the data passed to them (e.g. if the data is passed as a
 * `Float32Array`), and changes to the data will change the tensor. This is not
 * a feature and is not supported. To avoid this behavior, use the tensor before
 * changing the input data or create a copy with `copy = tf.add(yourTensor, 0)`.
 *
 * See `tf.tensor` for details on how to create a `tf.Tensor`.
 *
 * @doc {heading: 'Tensors', subheading: 'Classes'}
 */
export declare class Tensor<R extends Rank = Rank> implements TensorInfo {
    /** Unique id of this tensor. */
    readonly id: number;
    /**
     * Id of the bucket holding the data for this tensor. Multiple arrays can
     * point to the same bucket (e.g. when calling array.reshape()).
     */
    dataId: DataId;
    /** The shape of the tensor. */
    readonly shape: ShapeMap[R];
    /** Number of elements in the tensor. */
    readonly size: number;
    /** The data type for the array. */
    readonly dtype: DataType;
    /** The rank type for the array (see `Rank` enum). */
    readonly rankType: R;
    /** Whether this tensor has been globally kept. */
    kept: boolean;
    /** The id of the scope this tensor is being tracked in. */
    scopeId: number;
    /** The keras mask that some keras layers attach to the tensor */
    kerasMask?: Tensor;
    /**
     * Number of elements to skip in each dimension when indexing. See
     * https://docs.scipy.org/doc/numpy/reference/generated/\
     * numpy.ndarray.strides.html
     */
    readonly strides: number[];
    constructor(shape: ShapeMap[R], dtype: DataType, dataId: DataId, id: number);
    get rank(): number;
    /**
     * Returns a promise of `tf.TensorBuffer` that holds the underlying data.
     *
     * @doc {heading: 'Tensors', subheading: 'Classes'}
     */
    buffer<D extends DataType = 'float32'>(): Promise<TensorBuffer<R, D>>;
    /**
     * Returns a `tf.TensorBuffer` that holds the underlying data.
     * @doc {heading: 'Tensors', subheading: 'Classes'}
     */
    bufferSync<D extends DataType = 'float32'>(): TensorBuffer<R, D>;
    /**
     * Returns the tensor data as a nested array. The transfer of data is done
     * asynchronously.
     *
     * @doc {heading: 'Tensors', subheading: 'Classes'}
     */
    array(): Promise<ArrayMap[R]>;
    /**
     * Returns the tensor data as a nested array. The transfer of data is done
     * synchronously.
     *
     * @doc {heading: 'Tensors', subheading: 'Classes'}
     */
    arraySync(): ArrayMap[R];
    /**
     * Asynchronously downloads the values from the `tf.Tensor`. Returns a
     * promise of `TypedArray` that resolves when the computation has finished.
     *
     * @doc {heading: 'Tensors', subheading: 'Classes'}
     */
    data<D extends DataType = NumericDataType>(): Promise<DataTypeMap[D]>;
    /**
     * Copy the tensor's data to a new GPU resource. Comparing to the `dataSync()`
     * and `data()`, this method prevents data from being downloaded to CPU.
     *
     * For WebGL backend, the data will be stored on a densely packed texture.
     * This means that the texture will use the RGBA channels to store value.
     *
     * For WebGPU backend, the data will be stored on a buffer. There is no
     * parameter, so can not use a user-defined size to create the buffer.
     *
     * @param options:
     *     For WebGL,
     *         - customTexShape: Optional. If set, will use the user defined
     *     texture shape to create the texture.
     *
     * @returns For WebGL backend, a GPUData contains the new texture and
     *     its information.
     *     {
     *        tensorRef: The tensor that is associated with this texture,
     *        texture: WebGLTexture,
     *        texShape: [number, number] // [height, width]
     *     }
     *
     *     For WebGPU backend, a GPUData contains the new buffer.
     *     {
     *        tensorRef: The tensor that is associated with this buffer,
     *        buffer: GPUBuffer,
     *     }
     *
     *     Remember to dispose the GPUData after it is used by
     *     `res.tensorRef.dispose()`.
     *
     * @doc {heading: 'Tensors', subheading: 'Classes'}
     */
    dataToGPU(options?: DataToGPUOptions): GPUData;
    /**
     * Synchronously downloads the values from the `tf.Tensor`. This blocks the
     * UI thread until the values are ready, which can cause performance issues.
     *
     * @doc {heading: 'Tensors', subheading: 'Classes'}
     */
    dataSync<D extends DataType = NumericDataType>(): DataTypeMap[D];
    /** Returns the underlying bytes of the tensor's data. */
    bytes(): Promise<Uint8Array[] | Uint8Array>;
    /**
     * Disposes `tf.Tensor` from memory.
     *
     * @doc {heading: 'Tensors', subheading: 'Classes'}
     */
    dispose(): void;
    protected isDisposedInternal: boolean;
    get isDisposed(): boolean;
    throwIfDisposed(): void;
    /**
     * Prints the `tf.Tensor`. See `tf.print` for details.
     *
     * @param verbose Whether to print verbose information about the tensor,
     *    including dtype and size.
     *
     * @doc {heading: 'Tensors', subheading: 'Classes'}
     */
    print(verbose?: boolean): void;
    /**
     * Returns a copy of the tensor. See `tf.clone` for details.
     * @doc {heading: 'Tensors', subheading: 'Classes'}
     */
    clone<T extends Tensor>(this: T): T;
    /**
     * Returns a human-readable description of the tensor. Useful for logging.
     *
     * @doc {heading: 'Tensors', subheading: 'Classes'}
     */
    toString(verbose?: boolean): string;
    cast<T extends this>(dtype: DataType): T;
    variable(trainable?: boolean, name?: string, dtype?: DataType): Variable<R>;
}

/**
 * Creates a `tf.Tensor` with the provided values, shape and dtype.
 *
 * ```js
 * // Pass an array of values to create a vector.
 * tf.tensor([1, 2, 3, 4]).print();
 * ```
 *
 * ```js
 * // Pass a nested array of values to make a matrix or a higher
 * // dimensional tensor.
 * tf.tensor([[1, 2], [3, 4]]).print();
 * ```
 *
 * ```js
 * // Pass a flat array and specify a shape yourself.
 * tf.tensor([1, 2, 3, 4], [2, 2]).print();
 * ```
 *
 * ```js
 * // Pass a `WebGLData` object and specify a shape yourself.
 *
 * // This makes it possible for TF.js applications to avoid GPU / CPU sync.
 * // For example, if your application includes a preprocessing step on the GPU,
 * // you could upload the GPU output directly to TF.js, rather than first
 * // downloading the values.
 *
 * // Example for WebGL2:
 * if (tf.findBackend('custom-webgl') == null) {
 *   const customCanvas = document.createElement('canvas');
 *   const customBackend = new tf.MathBackendWebGL(customCanvas);
 *   tf.registerBackend('custom-webgl', () => customBackend);
 * }
 * const savedBackend = tf.getBackend();
 * await tf.setBackend('custom-webgl');
 * const gl = tf.backend().gpgpu.gl;
 * const texture = gl.createTexture();
 * const tex2d = gl.TEXTURE_2D;
 * const width = 2;
 * const height = 2;
 *
 * gl.bindTexture(tex2d, texture);
 * gl.texParameteri(tex2d, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
 * gl.texParameteri(tex2d, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
 * gl.texParameteri(tex2d, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
 * gl.texParameteri(tex2d, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
 * gl.texImage2D(
 *   tex2d, 0, gl.RGBA32F, // internalFormat
 *   width, height, 0,
 *   gl.RGBA, // textureFormat
 *   gl.FLOAT, // textureType
 *   new Float32Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
 * );
 *
 * // Currently, the `texture` has 4 pixels:
 * // Pixel0 is {R:0, G:1, B:2, A:3}
 * // Pixel1 is {R:4, G:5, B:6, A:7}
 * // Pixel2 is {R:8, G:9, B:10, A:11}
 * // Pixel3 is {R:12, G:13, B:14, A:15}
 *
 * const logicalShape = [height * width * 2];
 * const a = tf.tensor({texture, height, width, channels: 'BR'}, logicalShape);
 * a.print();
 * // Tensor value will be [2, 0, 6, 4, 10, 8, 14, 12], since [2, 0] is the
 * // values of 'B' and 'R' channels of Pixel0, [6, 4] is the values of 'B' and
 * 'R'
 * // channels of Pixel1...
 *
 * // For postprocessing on the GPU, it's possible to retrieve the texture
 * // backing any tensor by calling the tensor's `dataToGPU` method like
 * // so:
 *
 * const tex = a.dataToGPU();
 * await tf.setBackend(savedBackend);
 * ```
 *
 * ```js
 * // Pass a `WebGPUData` object and specify a shape yourself.
 *
 * // This makes it possible for TF.js applications to avoid GPU / CPU sync.
 * // For example, if your application includes a preprocessing step on the GPU,
 * // you could upload the GPU output directly to TF.js, rather than first
 * // downloading the values. Unlike WebGL, this optionally supports zero copy
 * // by WebGPUData.zeroCopy. When zeroCopy is false or undefined(default), this
 * // passing GPUBuffer can be destroyed after tensor is created. When zeroCopy
 * // is true, this GPUBuffer is bound directly by the tensor, so do not destroy
 * // this GPUBuffer until all access is done.
 *
 * // Example for WebGPU:
 * function createGPUBufferFromData(device, data, dtype) {
 *   const bytesPerElement = 4;
 *   const sizeInBytes = data.length * bytesPerElement;
 *
 *   const gpuWriteBuffer = device.createBuffer({
 *     mappedAtCreation: true,
 *     size: sizeInBytes,
 *     usage: GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC
 *   });
 *   const arrayBuffer = gpuWriteBuffer.getMappedRange();
 *   if (dtype === 'float32') {
 *     new Float32Array(arrayBuffer).set(data);
 *   } else if (dtype === 'int32') {
 *     new Int32Array(arrayBuffer).set(data);
 *   } else {
 *     throw new Error(
 *         `Creating tensor from GPUBuffer only supports` +
 *         `'float32'|'int32' dtype, while the dtype is ${dtype}.`);
 *   }
 *   gpuWriteBuffer.unmap();
 *
 *   const gpuReadBuffer = device.createBuffer({
 *     mappedAtCreation: false,
 *     size: sizeInBytes,
 *     usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE |
 *         GPUBufferUsage.COPY_SRC
 *   });
 *
 *   const copyEncoder = device.createCommandEncoder();
 *   copyEncoder.copyBufferToBuffer(
 *       gpuWriteBuffer, 0, gpuReadBuffer, 0, sizeInBytes);
 *   const copyCommands = copyEncoder.finish();
 *   device.queue.submit([copyCommands]);
 *   gpuWriteBuffer.destroy();
 *   return gpuReadBuffer;
 * }
 *
 * const savedBackend = tf.getBackend();
 * await tf.setBackend('webgpu').catch(
 *     () => {throw new Error(
 *         'Failed to use WebGPU backend. Please use Chrome Canary to run.')});
 * const dtype = 'float32';
 * const device = tf.backend().device;
 * const aData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
 * const bData = [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4];
 * const expected = [2, 4, 6, 8, 6, 8, 10, 12, 10, 12, 14, 16, 14, 16, 18, 20];
 * const aBuffer = createGPUBufferFromData(device, aData, dtype);
 * const shape = [aData.length];
 * // To use zeroCopy, use {buffer: aBuffer, zeroCopy: true} instead and destroy
 * // aBuffer untill all access is done.
 * const a = tf.tensor({buffer: aBuffer}, shape, dtype);
 * const b = tf.tensor(bData, shape, dtype);
 * const result = tf.add(a, b);
 * result.print();
 * a.dispose();
 * b.dispose();
 * result.dispose();
 * aBuffer.destroy();
 * await tf.setBackend(savedBackend);
 * ```
 * @param values The values of the tensor. Can be nested array of numbers,
 *     or a flat array, or a `TypedArray`, or a `WebGLData` object, or a
 * `WebGPUData` object. If the values are strings, they will be encoded as utf-8
 * and kept as `Uint8Array[]`. If the values is a `WebGLData` object, the dtype
 * could only be 'float32' or 'int32' and the object has to have: 1. texture, a
 * `WebGLTexture`, the texture must share the same `WebGLRenderingContext` with
 * TFJS's WebGL backend (you could create a custom WebGL backend from your
 * texture's canvas) and the internal texture format for the input texture must
 * be floating point or normalized integer; 2. height, the height of the
 * texture; 3. width, the width of the texture; 4. channels, a non-empty subset
 * of 'RGBA', indicating the values of which channels will be passed to the
 * tensor, such as 'R' or 'BR' (The order of the channels affect the order of
 * tensor values. ). (If the values passed from texture is less than the tensor
 * size, zeros will be padded at the rear.). If the values is a `WebGPUData`
 * object, the dtype could only be 'float32' or 'int32 and the object has to
 * have: buffer, a `GPUBuffer`. The buffer must: 1. share the same `GPUDevice`
 * with TFJS's WebGPU backend; 2. buffer.usage should at least support
 * GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC; 3. buffer.size should not
 * be smaller than the byte size of tensor shape. WebGPUData optionally supports
 * zero copy by flag zeroCopy. When zeroCopy is false or undefined(default),
 * this passing GPUBuffer can be destroyed after tensor is created. When
 * zeroCopy is true, this GPUBuffer is bound directly by the tensor, so do not
 * destroy this GPUBuffer until all access is done.
 * @param shape The shape of the tensor. Optional. If not provided,
 *   it is inferred from `values`.
 * @param dtype The data type.
 *
 * @doc {heading: 'Tensors', subheading: 'Creation'}
 */
export declare function tensor<R extends Rank>(values: TensorLike | WebGLData | WebGPUData, shape?: ShapeMap[R], dtype?: DataType): Tensor<R>;

/** @doclink Tensor */
export declare type Tensor1D = Tensor<Rank.R1>;

/**
 * Creates rank-1 `tf.Tensor` with the provided values, shape and dtype.
 *
 * The same functionality can be achieved with `tf.tensor`, but in general
 * we recommend using `tf.tensor1d` as it makes the code more readable.
 *
 * ```js
 * tf.tensor1d([1, 2, 3]).print();
 * ```
 *
 * @param values The values of the tensor. Can be array of numbers,
 *     or a `TypedArray`.
 * @param dtype The data type.
 *
 * @doc {heading: 'Tensors', subheading: 'Creation'}
 */
export declare function tensor1d(values: TensorLike1D, dtype?: DataType): Tensor1D;

/** @doclink Tensor */
export declare type Tensor2D = Tensor<Rank.R2>;

/**
 * Creates rank-2 `tf.Tensor` with the provided values, shape and dtype.
 *
 * The same functionality can be achieved with `tf.tensor`, but in general
 * we recommend using `tf.tensor2d` as it makes the code more readable.
 *
 *  ```js
 * // Pass a nested array.
 * tf.tensor2d([[1, 2], [3, 4]]).print();
 * ```
 * ```js
 * // Pass a flat array and specify a shape.
 * tf.tensor2d([1, 2, 3, 4], [2, 2]).print();
 * ```
 *
 * @param values The values of the tensor. Can be nested array of numbers,
 *     or a flat array, or a `TypedArray`.
 * @param shape The shape of the tensor. If not provided, it is inferred from
 *     `values`.
 * @param dtype The data type.
 *
 * @doc {heading: 'Tensors', subheading: 'Creation'}
 */
export declare function tensor2d(values: TensorLike2D, shape?: [number, number], dtype?: DataType): Tensor2D;

/** @doclink Tensor */
export declare type Tensor3D = Tensor<Rank.R3>;

/**
 * Creates rank-3 `tf.Tensor` with the provided values, shape and dtype.
 *
 * The same functionality can be achieved with `tf.tensor`, but in general
 * we recommend using `tf.tensor3d` as it makes the code more readable.
 *
 *  ```js
 * // Pass a nested array.
 * tf.tensor3d([[[1], [2]], [[3], [4]]]).print();
 * ```
 * ```js
 * // Pass a flat array and specify a shape.
 * tf.tensor3d([1, 2, 3, 4], [2, 2, 1]).print();
 * ```
 *
 * @param values The values of the tensor. Can be nested array of numbers,
 *     or a flat array, or a `TypedArray`.
 * @param shape The shape of the tensor. If not provided,  it is inferred from
 *     `values`.
 * @param dtype The data type.
 *
 * @doc {heading: 'Tensors', subheading: 'Creation'}
 */
export declare function tensor3d(values: TensorLike3D, shape?: [number, number, number], dtype?: DataType): Tensor3D;

/** @doclink Tensor */
export declare type Tensor4D = Tensor<Rank.R4>;

/**
 * Creates rank-4 `tf.Tensor` with the provided values, shape and dtype.
 *
 * The same functionality can be achieved with `tf.tensor`, but in general
 * we recommend using `tf.tensor4d` as it makes the code more readable.
 *
 *  ```js
 * // Pass a nested array.
 * tf.tensor4d([[[[1], [2]], [[3], [4]]]]).print();
 * ```
 * ```js
 * // Pass a flat array and specify a shape.
 * tf.tensor4d([1, 2, 3, 4], [1, 2, 2, 1]).print();
 * ```
 *
 * @param values The values of the tensor. Can be nested array of numbers,
 *     or a flat array, or a `TypedArray`.
 * @param shape The shape of the tensor. Optional. If not provided,
 *   it is inferred from `values`.
 * @param dtype The data type.
 *
 * @doc {heading: 'Tensors', subheading: 'Creation'}
 */
export declare function tensor4d(values: TensorLike4D, shape?: [number, number, number, number], dtype?: DataType): Tensor4D;

/** @doclink Tensor */
export declare type Tensor5D = Tensor<Rank.R5>;

/**
 * Creates rank-5 `tf.Tensor` with the provided values, shape and dtype.
 *
 * The same functionality can be achieved with `tf.tensor`, but in general
 * we recommend using `tf.tensor5d` as it makes the code more readable.
 *
 *  ```js
 * // Pass a nested array.
 * tf.tensor5d([[[[[1],[2]],[[3],[4]]],[[[5],[6]],[[7],[8]]]]]).print();
 * ```
 * ```js
 * // Pass a flat array and specify a shape.
 * tf.tensor5d([1, 2, 3, 4, 5, 6, 7, 8], [1, 2, 2, 2, 1]).print();
 * ```
 *
 * @param values The values of the tensor. Can be nested array of numbers,
 *     or a flat array, or a `TypedArray`.
 * @param shape The shape of the tensor. Optional. If not provided,
 *   it is inferred from `values`.
 * @param dtype The data type.
 *
 * @doc {heading: 'Tensors', subheading: 'Creation'}
 */
export declare function tensor5d(values: TensorLike5D, shape?: [number, number, number, number, number], dtype?: DataType): Tensor5D;

/** @doclink Tensor */
declare type Tensor6D = Tensor<Rank.R6>;

/**
 * Creates rank-6 `tf.Tensor` with the provided values, shape and dtype.
 *
 * The same functionality can be achieved with `tf.tensor`, but in general
 * we recommend using `tf.tensor6d` as it makes the code more readable.
 *
 *  ```js
 * // Pass a nested array.
 * tf.tensor6d([[[[[[1],[2]],[[3],[4]]],[[[5],[6]],[[7],[8]]]]]]).print();
 * ```
 * ```js
 * // Pass a flat array and specify a shape.
 * tf.tensor6d([1, 2, 3, 4, 5, 6, 7, 8], [1, 1, 2, 2, 2, 1]).print();
 * ```
 *
 * @param values The values of the tensor. Can be nested array of numbers,
 *     or a flat array, or a `TypedArray`.
 * @param shape The shape of the tensor. Optional. If not provided,
 *   it is inferred from `values`.
 * @param dtype The data type.
 *
 * @doc {heading: 'Tensors', subheading: 'Creation'}
 */
export declare function tensor6d(values: TensorLike6D, shape?: [number, number, number, number, number, number], dtype?: DataType): Tensor6D;

declare namespace tensor_util {
    export {
        makeTypesMatch,
        assertTypesMatch,
        isTensorInList,
        getTensorsInContainer
    }
}
export { tensor_util }

/**
 * A mutable object, similar to `tf.Tensor`, that allows users to set values
 * at locations before converting to an immutable `tf.Tensor`.
 *
 * See `tf.buffer` for creating a tensor buffer.
 *
 * @doc {heading: 'Tensors', subheading: 'Classes'}
 */
export declare class TensorBuffer<R extends Rank, D extends DataType = 'float32'> {
    dtype: D;
    size: number;
    shape: ShapeMap[R];
    strides: number[];
    values: DataTypeMap[D];
    constructor(shape: ShapeMap[R], dtype: D, values?: DataTypeMap[D]);
    /**
     * Sets a value in the buffer at a given location.
     *
     * @param value The value to set.
     * @param locs  The location indices.
     *
     * @doc {heading: 'Tensors', subheading: 'Creation'}
     */
    set(value: SingleValueMap[D], ...locs: number[]): void;
    /**
     * Returns the value in the buffer at the provided location.
     *
     * @param locs The location indices.
     *
     * @doc {heading: 'Tensors', subheading: 'Creation'}
     */
    get(...locs: number[]): SingleValueMap[D];
    locToIndex(locs: number[]): number;
    indexToLoc(index: number): number[];
    get rank(): number;
    /**
     * Creates an immutable `tf.Tensor` object from the buffer.
     *
     * @doc {heading: 'Tensors', subheading: 'Creation'}
     */
    toTensor(): Tensor<R>;
}

/**
 * @docalias void|number|string|TypedArray|Tensor|Tensor[]|{[key:
 * string]:Tensor|number|string}
 */
export declare type TensorContainer = void | Tensor | string | number | boolean | TensorContainerObject | TensorContainerArray | Float32Array | Int32Array | Uint8Array;

export declare interface TensorContainerArray extends Array<TensorContainer> {
}

export declare interface TensorContainerObject {
    [x: string]: TensorContainer;
}

/** Holds metadata for a given tensor. */
export declare interface TensorInfo {
    dataId: DataId;
    shape: number[];
    dtype: DataType;
}

/** @docalias TypedArray|Array */
export declare type TensorLike = TypedArray | number | boolean | string | RecursiveArray<number | number[] | TypedArray> | RecursiveArray<boolean> | RecursiveArray<string> | Uint8Array[];

/** @docalias TypedArray|Array */
declare type TensorLike1D = TypedArray | number[] | boolean[] | string[] | Uint8Array[];

/** @docalias TypedArray|Array */
declare type TensorLike2D = TypedArray | number[] | number[][] | boolean[] | boolean[][] | string[] | string[][] | Uint8Array[] | Uint8Array[][];

/** @docalias TypedArray|Array */
declare type TensorLike3D = TypedArray | number[] | number[][][] | boolean[] | boolean[][][] | string[] | string[][][] | Uint8Array[] | Uint8Array[][][];

/** @docalias TypedArray|Array */
declare type TensorLike4D = TypedArray | number[] | number[][][][] | boolean[] | boolean[][][][] | string[] | string[][][][] | Uint8Array[] | Uint8Array[][][][];

/** @docalias TypedArray|Array */
declare type TensorLike5D = TypedArray | number[] | number[][][][][] | boolean[] | boolean[][][][][] | string[] | string[][][][][] | Uint8Array[] | Uint8Array[][][][][];

/** @docalias TypedArray|Array */
declare type TensorLike6D = TypedArray | number[] | number[][][][][][] | boolean[] | boolean[][][][][][] | string[] | string[][][][][][] | Uint8Array[] | Uint8Array[][][][][];

export declare const TensorScatterUpdate = "TensorScatterUpdate";

export declare const tensorScatterUpdate: typeof tensorScatterUpdate_;

/**
 * Creates a new tensor by applying sparse updates to individual
 * values or slices to the passed in tensor according to
 * indices. This operator is the similar to scatterNd op, except that the
 * udpates are scattered on an existing tensor (as opposed to a zero-tensor).
 *
 * If indices contains duplicates, then we pick the last update for the index.
 *
 * If an out of bound index is found on CPU, an error is returned.
 *
 * Warning: There are some GPU specific semantics for this operation.
 *  - If an out of bound index is found, the index is ignored.
 *  - The order in which updates are applied is nondeterministic, so the output
 * will be nondeterministic if indices contains duplicates.
 * ```js
 * const shape = [8];
 * const tensor = tf.ones(shape);
 * const indices = tf.tensor2d([4, 3, 1, 7], [4, 1], 'int32');
 * const updates = tf.tensor1d([9, 10, 11, 12]);
 *
 * tf.tensorScatterUpdate(tensor, indices, updates).print();
 *    //[1, 11, 1, 10, 9, 1, 1, 12]
 * ```
 *
 * @param tensor A Tensor. Tensor to copy/update.
 * @param indices The tensor contains the indices into the output tensor, must
 *     have at least 2 axes: (num_updates, index_depth).
 * @param updates The tensor contains the value for the indices.
 *
 * @doc {heading: 'Operations', subheading: 'Slicing and Joining'}
 */
declare function tensorScatterUpdate_<R extends Rank>(tensor: Tensor<R> | TensorLike, indices: Tensor | TensorLike, updates: Tensor | TensorLike): Tensor<R>;

export declare interface TensorScatterUpdateAttrs {
}

export declare type TensorScatterUpdateInputs = Pick<NamedTensorInfoMap, 'tensor' | 'indices' | 'updates'>;

declare interface TensorStorage {
    read(dataId: DataId): Promise<BackendValues>;
    readSync(dataId: DataId): BackendValues;
    disposeData(dataId: DataId, force?: boolean): boolean;
    write(values: BackendValues, shape: number[], dtype: DataType): DataId;
    move(dataId: DataId, values: BackendValues, shape: number[], dtype: DataType, refCount: number): void;
    memory(): {
        unreliable: boolean;
    };
    /** Returns number of data ids currently in the storage. */
    numDataIds(): number;
    refCount(dataId: DataId): number;
}

declare interface TensorTracker {
    makeTensor(values: DataValues, shape: number[], dtype: DataType, backend?: Backend): Tensor;
    makeVariable(initialValue: Tensor, trainable?: boolean, name?: string, dtype?: DataType): Variable;
    incRef(a: Tensor, backend: Backend): void;
    disposeTensor(t: Tensor): void;
    disposeVariable(v: Variable): void;
    read(dataId: DataId): Promise<BackendValues>;
    readSync(dataId: DataId): BackendValues;
    readToGPU(dataId: DataId, options?: DataToGPUOptions): GPUData;
}

declare const TEST_EPSILON_FLOAT16 = 0.1;

declare namespace test_util {
    export {
        expectArraysClose,
        testEpsilon,
        expectPromiseToFail,
        expectArraysEqual,
        expectNumbersClose,
        expectValuesInRange,
        expectArrayBuffersEqual,
        encodeStrings,
        createVideoElement,
        play,
        TEST_EPSILON_FLOAT16,
        DoneFn_2 as DoneFn
    }
}
export { test_util }

declare function testEpsilon(): 0.001 | 0.1;

/**
 * Executes the provided function `fn` and after it is executed, cleans up all
 * intermediate tensors allocated by `fn` except those returned by `fn`.
 * `fn` must not return a Promise (async functions not allowed). The returned
 * result can be a complex object.
 *
 * Using this method helps avoid memory leaks. In general, wrap calls to
 * operations in `tf.tidy` for automatic memory cleanup.
 *
 * NOTE: Variables do *not* get cleaned up when inside a tidy(). If you want to
 * dispose variables, please use `tf.disposeVariables` or call dispose()
 * directly on variables.
 *
 * ```js
 * // y = 2 ^ 2 + 1
 * const y = tf.tidy(() => {
 *   // a, b, and one will be cleaned up when the tidy ends.
 *   const one = tf.scalar(1);
 *   const a = tf.scalar(2);
 *   const b = a.square();
 *
 *   console.log('numTensors (in tidy): ' + tf.memory().numTensors);
 *
 *   // The value returned inside the tidy function will return
 *   // through the tidy, in this case to the variable y.
 *   return b.add(one);
 * });
 *
 * console.log('numTensors (outside tidy): ' + tf.memory().numTensors);
 * y.print();
 * ```
 *
 * @param nameOrFn The name of the closure, or the function to execute.
 *     If a name is provided, the 2nd argument should be the function.
 *     If debug mode is on, the timing and the memory usage of the function
 *     will be tracked and displayed on the console using the provided name.
 * @param fn The function to execute.
 *
 * @doc {heading: 'Performance', subheading: 'Memory'}
 */
export declare function tidy<T extends TensorContainer>(nameOrFn: string | ScopeFn<T>, fn?: ScopeFn<T>): T;

export declare const Tile = "Tile";

export declare const tile: typeof tile_;

/**
 * Construct a tensor by repeating it the number of times given by reps.
 *
 * This operation creates a new tensor by replicating `input` `reps`
 * times. The output tensor's `i`th dimension has `input.shape[i] *
 * reps[i]` elements, and the values of `input` are replicated
 * `reps[i]` times along the `i`th dimension. For example, tiling
 * `[a, b, c, d]` by `[2]` produces `[a, b, c, d, a, b, c, d]`.
 *
 * ```js
 * const a = tf.tensor1d([1, 2]);
 *
 * a.tile([2]).print();    // or tf.tile(a, [2])
 * ```
 *
 * ```js
 * const a = tf.tensor2d([1, 2, 3, 4], [2, 2]);
 *
 * a.tile([1, 2]).print();  // or tf.tile(a, [1,2])
 * ```
 * @param x The tensor to tile.
 * @param reps Determines the number of replications per dimension.
 *
 * @doc {heading: 'Tensors', subheading: 'Slicing and Joining'}
 */
declare function tile_<T extends Tensor>(x: T | TensorLike, reps: number[]): T;

export declare interface TileAttrs {
    reps: number[];
}

export declare type TileInputs = Pick<NamedTensorInfoMap, 'x'>;

/**
 * Executes `f()` and returns a promise that resolves with timing
 * information.
 *
 * The result is an object with the following properties:
 *
 * - `wallMs`: Wall execution time.
 * - `kernelMs`: Kernel execution time, ignoring data transfer. If using the
 * WebGL backend and the query timer extension is not available, this will
 * return an error object.
 * - On `WebGL` The following additional properties exist:
 *   - `uploadWaitMs`: CPU blocking time on texture uploads.
 *   - `downloadWaitMs`: CPU blocking time on texture downloads (readPixels).
 *
 * ```js
 * const x = tf.randomNormal([20, 20]);
 * const time = await tf.time(() => x.matMul(x));
 *
 * console.log(`kernelMs: ${time.kernelMs}, wallTimeMs: ${time.wallMs}`);
 * ```
 *
 * @param f The function to execute and time.
 *
 * @doc {heading: 'Performance', subheading: 'Timing'}
 */
export declare function time(f: () => void): Promise<TimingInfo>;

export declare interface TimingInfo extends BackendTimingInfo {
    wallMs: number;
}

declare function toNestedArray(shape: number[], a: TypedArray, isComplex?: boolean): number | any[];

/**
 * Draws a `tf.Tensor` of pixel values to a byte array or optionally a
 * canvas.
 *
 * When the dtype of the input is 'float32', we assume values in the range
 * [0-1]. Otherwise, when input is 'int32', we assume values in the range
 * [0-255].
 *
 * Returns a promise that resolves when the canvas has been drawn to.
 *
 * @param img A rank-2 tensor with shape `[height, width]`, or a rank-3 tensor
 * of shape `[height, width, numChannels]`. If rank-2, draws grayscale. If
 * rank-3, must have depth of 1, 3 or 4. When depth of 1, draws
 * grayscale. When depth of 3, we draw with the first three components of
 * the depth dimension corresponding to r, g, b and alpha = 1. When depth of
 * 4, all four components of the depth dimension correspond to r, g, b, a.
 * @param canvas The canvas to draw to.
 *
 * @doc {heading: 'Browser', namespace: 'browser'}
 */
declare function toPixels(img: Tensor2D | Tensor3D | TensorLike, canvas?: HTMLCanvasElement): Promise<Uint8ClampedArray>;

export declare const TopK = "TopK";

export declare const topk: typeof topk_;

/**
 * Finds the values and indices of the `k` largest entries along the last
 * dimension.
 *
 * If the input is a vector (rank=1), finds the k largest entries in the vector
 * and outputs their values and indices as vectors. Thus values[j] is the j-th
 * largest entry in input, and its index is indices[j].
 * For higher rank inputs, computes the top k entries along the last dimension.
 *
 * If two elements are equal, the lower-index element appears first.
 *
 * ```js
 * const a = tf.tensor2d([[1, 5], [4, 3]]);
 * const {values, indices} = tf.topk(a);
 * values.print();
 * indices.print();
 * ```
 * @param x 1-D or higher `tf.Tensor` with last dimension being at least `k`.
 * @param k Number of top elements to look for along the last dimension.
 * @param sorted If true, the resulting `k` elements will be sorted by the
 *     values in descending order.
 *
 * @doc {heading: 'Operations', subheading: 'Evaluation'}
 */
declare function topk_<T extends Tensor>(x: T | TensorLike, k?: number, sorted?: boolean): {
    values: T;
    indices: T;
};

export declare interface TopKAttrs {
    k: number;
    sorted: boolean;
}

export declare type TopKInputs = Pick<NamedTensorInfoMap, 'x'>;

declare function toTypedArray(a: TensorLike, dtype: DataType): TypedArray;

export declare const train: typeof OptimizerConstructors;

/** Model training configuration. */
declare interface TrainingConfig {
    /** Optimizer used for the model training. */
    optimizer_config: {};
    /** Loss function(s) for the model's output(s). */
    loss: string | string[] | {
        [key: string]: string;
    };
    /** Metric function(s) for the model's output(s). */
    metrics?: string[] | {
        [key: string]: string;
    };
    weighted_metrics?: string[];
    sample_weight_mode?: string;
    loss_weights?: number[] | {
        [key: string]: number;
    };
}

export declare const Transform = "Transform";

export declare interface TransformAttrs {
    interpolation: 'nearest' | 'bilinear';
    fillMode: 'constant' | 'reflect' | 'wrap' | 'nearest';
    fillValue: number;
    outputShape?: [number, number];
}

export declare type TransformInputs = Pick<NamedTensorInfoMap, 'image' | 'transforms'>;

export declare const Transpose = "Transpose";

export declare const transpose: typeof transpose_;

/**
 * Transposes the `tf.Tensor`. Permutes the dimensions according to `perm`.
 *
 * The returned `tf.Tensor`'s dimension `i` will correspond to the input
 * dimension `perm[i]`. If `perm` is not given, it is set to `[n-1...0]`,
 * where `n` is the rank of the input `tf.Tensor`. Hence by default, this
 * operation performs a regular matrix transpose on 2-D input `tf.Tensor`s.
 *
 * ```js
 * const a = tf.tensor2d([1, 2, 3, 4, 5, 6], [2, 3]);
 *
 * a.transpose().print();  // or tf.transpose(a)
 * ```
 *
 * @param x The tensor to transpose.
 * @param perm The permutation of the dimensions of a.
 * @param conjugate Will conjugate complex input if true.
 *
 * @doc {heading: 'Operations', subheading: 'Matrices'}
 */
declare function transpose_<T extends Tensor>(x: T | TensorLike, perm?: number[], conjugate?: boolean): T;

export declare interface TransposeAttrs {
    perm: number[];
}

export declare type TransposeInputs = Pick<NamedTensorInfoMap, 'x'>;

export declare const truncatedNormal: typeof truncatedNormal_;

/**
 * Creates a `tf.Tensor` with values sampled from a truncated normal
 * distribution.
 *
 * ```js
 * tf.truncatedNormal([2, 2]).print();
 * ```
 *
 * The generated values follow a normal distribution with specified mean and
 * standard deviation, except that values whose magnitude is more than 2
 * standard deviations from the mean are dropped and re-picked.
 *
 * @param shape An array of integers defining the output tensor shape.
 * @param mean The mean of the normal distribution.
 * @param stdDev The standard deviation of the normal distribution.
 * @param dtype The data type of the output tensor.
 * @param seed The seed for the random number generator.
 *
 * @doc {heading: 'Tensors', subheading: 'Creation'}
 */
declare function truncatedNormal_<R extends Rank>(shape: ShapeMap[R], mean?: number, stdDev?: number, dtype?: 'float32' | 'int32', seed?: number): Tensor<R>;

declare function tupleValuesAreOne(param: number | number[]): boolean;

export declare type TypedArray = Float32Array | Int32Array | Uint8Array;

export declare type UnaryInputs = Pick<NamedTensorInfoMap, 'x'>;

export declare const Unique = "Unique";

export declare const unique: typeof unique_;

/**
 * Finds unique elements along an axis of a tensor.
 *
 * It returns a tensor `values` containing all of the unique elements along the
 * `axis` of the given tensor `x` in the same order that they occur along the
 * `axis` in `x`; `x` does not need to be sorted. It also returns a tensor
 * `indices` the same size as the number of the elements in `x` along the `axis`
 * dimension. It contains the index in the unique output `values`.
 *
 * ```js
 * // A 1-D tensor
 * const a = tf.tensor1d([1, 1, 2, 4, 4, 4, 7, 8, 8]);
 * const {values, indices} = tf.unique(a);
 * values.print();   // [1, 2, 4, 7, 8,]
 * indices.print();  // [0, 0, 1, 2, 2, 2, 3, 4, 4]
 * ```
 *
 * ```js
 * // A 2-D tensor with axis=0
 * //
 * // 'a' is: [[1, 0, 0],
 * //          [1, 0, 0],
 * //          [2, 0, 0]]
 * const a = tf.tensor2d([[1, 0, 0], [1, 0, 0], [2, 0, 0]]);
 * const {values, indices} = tf.unique(a, 0)
 * values.print();   // [[1, 0, 0],
 *                   //  [2, 0, 0]]
 * indices.print();  // [0, 0, 1]
 * ```
 *
 * ```js
 * // A 2-D tensor with axis=1
 * //
 * // 'a' is: [[1, 0, 0],
 * //          [1, 0, 0],
 * //          [2, 0, 0]]
 * const a = tf.tensor2d([[1, 0, 0], [1, 0, 0], [2, 0, 0]]);
 * const {values, indices} = tf.unique(a, 1)
 * values.print();   // [[1, 0],
 *                   //  [1, 0],
 *                   //  [2, 0]]
 * indices.print();  // [0, 1, 1]
 * ```
 * @param x A tensor (int32, string, bool).
 * @param axis The axis of the tensor to find the unique elements.
 * @returns [uniqueElements, indices] (see above for details)
 *
 * @doc {heading: 'Operations', subheading: 'Evaluation'}
 */
declare function unique_<T extends Tensor>(x: T | TensorLike, axis?: number): {
    values: T;
    indices: Tensor1D;
};

export declare interface UniqueAttrs {
    axis: number;
}

export declare type UniqueInputs = Pick<NamedTensorInfoMap, 'x'>;

export declare const Unpack = "Unpack";

export declare interface UnpackAttrs {
    axis: number;
}

export declare type UnpackInputs = Pick<NamedTensorInfoMap, 'value'>;

/** Removes the registered gradient from the global registry. */
export declare function unregisterGradient(kernelName: string): void;

/**
 * Removes the kernel function from the registry.
 *
 * @param kernelName The official name of the kernel.
 * @param backendName The official name of the backend.
 *
 */
export declare function unregisterKernel(kernelName: string, backendName: string): void;

export declare const UnsortedSegmentSum = "UnsortedSegmentSum";

export declare const unsortedSegmentSum: typeof unsortedSegmentSum_;

/**
 * Computes the sum along segments of a `tf.Tensor`.
 *
 * ```js
 * const x = tf.tensor1d([1, 2, 3, 4]);
 * const segmentIds = tf.tensor1d([1, 2, 0, 1], 'int32');
 * const numSegments = 3;
 *
 * x.unsortedSegmentSum(segmentIds, numSegments).print()
 * //or tf.unsortedSegmentSum(x, segmentIds, numSegments)
 * ```
 * @param x The `tf.Tensor` that will be summed along its segments.
 * @param segmentIds A `tf.Tensor1D` whose rank is equal to the rank of `x`'s
 * dimension along the `axis`.  Maps each element of `x` to a segment.
 * @param numSegments The number of distinct `segmentIds`.
 *
 * @doc {heading: 'Operations', subheading: 'Segment'}
 */
declare function unsortedSegmentSum_<T extends Tensor>(x: T | TensorLike, segmentIds: Tensor1D | TensorLike, numSegments: number): T;

export declare interface UnsortedSegmentSumAttrs {
    numSegments: number;
}

export declare type UnsortedSegmentSumInputs = Pick<NamedTensorInfoMap, 'x' | 'segmentIds'>;

export declare const unstack: typeof unstack_;

/**
 * Unstacks a `tf.Tensor` of rank-`R` into a list of rank-`(R-1)` `tf.Tensor`s.
 *
 * ```js
 * const a = tf.tensor2d([1, 2, 3, 4], [2, 2]);
 *
 * tf.unstack(a).forEach(tensor => tensor.print());
 * ```
 *
 * @param x A tensor object.
 * @param axis The axis to unstack along. Defaults to 0 (the first dim).
 *
 * @doc {heading: 'Tensors', subheading: 'Slicing and Joining'}
 */
declare function unstack_(x: Tensor | TensorLike, axis?: number): Tensor[];

export declare function upcastType(typeA: DataType, typeB: DataType): DataType;

export declare const UpperBound = "UpperBound";

/**
 * Searches for where a value would go in a sorted sequence.
 *
 * This is not a method for checking containment (like javascript in).
 *
 * The typical use case for this operation is "binning", "bucketing", or
 * "discretizing". The values are assigned to bucket-indices based on the edges
 * listed in 'sortedSequence'. This operation returns the bucket-index for each
 * value.
 *
 * The index returned corresponds to the first edge greater than the value.
 *
 * The axis is not settable for this operation. It always operates on the
 * innermost dimension (axis=-1). The operation will accept any number of outer
 * dimensions.
 *
 * Note: This operation assumes that 'upperBound' is sorted along the
 * innermost axis, maybe using 'sort(..., axis=-1)'. If the sequence is not
 * sorted no error is raised and the content of the returned tensor is not well
 * defined.
 *
 * ```js
 * const seq = tf.tensor1d([0, 3, 9, 10, 10]);
 * const values = tf.tensor1d([0, 4, 10]);
 * const result = tf.upperBound(seq, values);
 * result.print(); // [1, 2, 5]
 * ```
 * @param sortedSequence: N-D. Sorted sequence.
 * @param values: N-D. Search values.
 * @return An N-D int32 tensor the size of values containing the result of
 *     applying upper bound to each value. The result is not a global index to
 *     the entire Tensor, but the index in the last dimension.
 * @doc {heading: 'Operations', subheading: 'Evaluation'}
 */
export declare function upperBound(sortedSequence: Tensor | TensorLike, values: Tensor | TensorLike): Tensor;

export declare type UpperBoundInputs = Pick<NamedTensorInfoMap, 'sortedSequence' | 'values'>;

declare namespace util {
    export {
        createScalarValue,
        toTypedArray,
        now,
        fetch_2 as fetch,
        encodeString,
        decodeString,
        isTypedArray,
        flatten,
        shuffle,
        shuffleCombo,
        clamp,
        nearestLargerEven,
        swap,
        sum_2 as sum,
        randUniform,
        distSquared,
        assert,
        assertShapesMatch,
        assertNonNull,
        sizeFromShape,
        isScalarShape,
        arraysEqualWithNull,
        arraysEqual,
        isInt,
        tanh_2 as tanh,
        sizeToSquarishShape,
        createShuffledIndices,
        rightPad,
        repeatedTry,
        inferFromImplicitShape,
        parseAxisParam,
        squeezeShape,
        getTypedArrayFromDType,
        getArrayFromDType,
        checkConversionForErrors,
        isValidDtype,
        hasEncodingLoss,
        bytesPerElement,
        bytesFromStringArray,
        isString,
        isBoolean,
        isNumber,
        inferDtype,
        isFunction,
        nearestDivisor,
        computeStrides,
        toNestedArray,
        convertBackendValuesAndArrayBuffer,
        makeOnesTypedArray,
        makeZerosTypedArray,
        makeZerosNestedTypedArray,
        assertNonNegativeIntegerDimensions,
        locToIndex,
        indexToLoc,
        isPromise,
        hexToLong,
        fingerPrint64
    }
}
export { util }

declare function validateDefaultValueShape(defaultValueShape: number[], valueShape: number[]): void;

/**
 * Validate scatter nd inputs.
 *
 * @param update The tensor contains the update values.
 * @param indices The tensor contains the indices for the update values.
 * @param shape The shape of the output tensor.
 */
declare function validateInput(updates: Tensor, indices: Tensor, shape: number[]): void;

/**
 * Check whether updates.shape = indices.shape[:batchDim] +
 * shape[sliceDim:]
 *
 * @param x The input tensor.
 */
declare function validateUpdateShape(shape: number[], indices: Tensor, updates: Tensor): void;

/**
 * Like `tf.grad`, but also returns the value of `f()`. Useful when `f()`
 * returns a metric you want to show.
 *
 * The result is a rich object with the following properties:
 * - grad: The gradient of `f(x)` w.r.t. `x` (result of `tf.grad`).
 * - value: The value returned by `f(x)`.
 *
 * ```js
 * // f(x) = x ^ 2
 * const f = x => x.square();
 * // f'(x) = 2x
 * const g = tf.valueAndGrad(f);
 *
 * const x = tf.tensor1d([2, 3]);
 * const {value, grad} = g(x);
 *
 * console.log('value');
 * value.print();
 * console.log('grad');
 * grad.print();
 * ```
 *
 * @doc {heading: 'Training', subheading: 'Gradients'}
 */
export declare function valueAndGrad<I extends Tensor, O extends Tensor>(f: (x: I) => O): (x: I, dy?: O) => {
    value: O;
    grad: I;
};

/**
 * Like `tf.grads`, but returns also the value of `f()`. Useful when `f()`
 * returns a metric you want to show.
 *
 * The result is a rich object with the following properties:
 * - grads: The gradients of `f()` w.r.t. each input (result of `tf.grads`).
 * - value: The value returned by `f(x)`.
 *
 * ```js
 * // f(a, b) = a * b
 * const f = (a, b) => a.mul(b);
 * // df/da = b, df/db = a
 * const g = tf.valueAndGrads(f);
 *
 * const a = tf.tensor1d([2, 3]);
 * const b = tf.tensor1d([-2, -3]);
 * const {value, grads} = g([a, b]);
 *
 * const [da, db] = grads;
 *
 * console.log('value');
 * value.print();
 *
 * console.log('da');
 * da.print();
 * console.log('db');
 * db.print();
 * ```
 *
 * @doc {heading: 'Training', subheading: 'Gradients'}
 */
export declare function valueAndGrads<O extends Tensor>(f: (...args: Tensor[]) => O): (args: Tensor[], dy?: O) => {
    grads: Tensor[];
    value: O;
};

/**
 * A mutable `tf.Tensor`, useful for persisting state, e.g. for training.
 *
 * @doc {heading: 'Tensors', subheading: 'Classes'}
 */
export declare class Variable<R extends Rank = Rank> extends Tensor<R> {
    trainable: boolean;
    name: string;
    constructor(initialValue: Tensor<R>, trainable: boolean, name: string, tensorId: number);
    /**
     * Assign a new `tf.Tensor` to this variable. The new `tf.Tensor` must have
     * the same shape and dtype as the old `tf.Tensor`.
     *
     * @param newValue New tensor to be assigned to this variable.
     *
     * @doc {heading: 'Tensors', subheading: 'Classes'}
     */
    assign(newValue: Tensor<R>): void;
    dispose(): void;
}

/**
 * Creates a new variable with the provided initial value.
 * ```js
 * const x = tf.variable(tf.tensor([1, 2, 3]));
 * x.assign(tf.tensor([4, 5, 6]));
 *
 * x.print();
 * ```
 *
 * @param initialValue Initial value for the tensor.
 * @param trainable If true, optimizers are allowed to update it.
 * @param name Name of the variable. Defaults to a unique id.
 * @param dtype If set, initialValue will be converted to the given type.
 *
 * @doc {heading: 'Tensors', subheading: 'Creation'}
 */
export declare function variable<R extends Rank>(initialValue: Tensor<R>, trainable?: boolean, name?: string, dtype?: DataType): Variable<R>;

/**
 * Computes and returns the gradient of f(x) with respect to the list of
 * trainable variables provided by `varList`. If no list is provided, it
 * defaults to all trainable variables.
 *
 * ```js
 * const a = tf.variable(tf.tensor1d([3, 4]));
 * const b = tf.variable(tf.tensor1d([5, 6]));
 * const x = tf.tensor1d([1, 2]);
 *
 * // f(a, b) = a * x ^ 2 + b * x
 * const f = () => a.mul(x.square()).add(b.mul(x)).sum();
 * // df/da = x ^ 2, df/db = x
 * const {value, grads} = tf.variableGrads(f);
 *
 * Object.keys(grads).forEach(varName => grads[varName].print());
 * ```
 *
 * @param f The function to execute. f() should return a scalar.
 * @param varList The list of variables to compute the gradients with respect
 *     to. Defaults to all trainable variables.
 * @returns An object with the following keys and values:
 *   - `value`: The value of the function `f`.
 *   - `grads`: A map from the names of the variables to the gradients.
 *     If the `varList` argument is provided explicitly and contains a subset of
 *     non-trainable variables, this map in the return value will contain keys
 *     that map the names of the non-trainable variables to `null`.
 *
 * @doc {heading: 'Training', subheading: 'Gradients'}
 */
export declare function variableGrads(f: () => Scalar, varList?: Variable[]): {
    value: Scalar;
    grads: NamedTensorMap;
};

/** @license See the LICENSE file. */
export declare const version_core = "0.0.0";

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
declare function warn(...msg: Array<{}>): void;

/**
 * Type for representing all permutations and combinations of 'RGBA' channels.
 */
declare type WebGLChannels = 'A' | 'B' | 'G' | 'R' | 'AB' | 'AG' | 'AR' | 'BA' | 'BG' | 'BR' | 'GA' | 'GB' | 'GR' | 'RA' | 'RB' | 'RG' | 'ABG' | 'ABR' | 'AGB' | 'AGR' | 'ARB' | 'ARG' | 'BAG' | 'BAR' | 'BGA' | 'BGR' | 'BRA' | 'BRG' | 'GAB' | 'GAR' | 'GBA' | 'GBR' | 'GRA' | 'GRB' | 'RAB' | 'RAG' | 'RBA' | 'RBG' | 'RGA' | 'RGB' | 'ABGR' | 'ABRG' | 'AGBR' | 'AGRB' | 'ARBG' | 'ARGB' | 'BAGR' | 'BARG' | 'BGAR' | 'BGRA' | 'BRAG' | 'BRGA' | 'GABR' | 'GARB' | 'GBAR' | 'GBRA' | 'GRAB' | 'GRBA' | 'RABG' | 'RAGB' | 'RBAG' | 'RBGA' | 'RGAB' | 'RGBA';

/** Type for representing a texture data to create a tensor. */
export declare interface WebGLData {
    texture: WebGLTexture;
    height: number;
    width: number;
    channels: WebGLChannels;
}

/**
 * Type for representing a buffer data to create a tensor. Buffer usage should
 * at least support GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC. When
 * zeroCopy is false or undefined (default), this GPUBuffer will be copied to
 * the tensor's resource buffer. When zeroCopy is true, tensor will use this
 * GPUBuffer as tensor's resource buffer, user should not destroy this GPUBuffer
 * until all access is done. If not specified at creating a tensor, tensor type
 * is float32.
 */
export declare interface WebGPUData {
    buffer: GPUBuffer;
    zeroCopy?: boolean;
}

declare type WeightData = ArrayBuffer | ArrayBuffer[];

/**
 * Group to which the weight belongs.
 *
 * - 'optimizer': Weight from a stateful optimizer.
 */
declare type WeightGroup = 'model' | 'optimizer';

/**
 * Creates a function, which reads a weights manifest JSON configuration,
 * fetches the weight files using the specified function and returns them as
 * `Tensor`s.
 *
 * ```js
 * // example for creating a nodejs weight loader, which reads the weight files
 * // from disk using fs.readFileSync
 *
 * import * as fs from 'fs'
 *
 * const fetchWeightsFromDisk = (filePaths: string[]) =>
 *   filePaths.map(filePath => fs.readFileSync(filePath).buffer)
 *
 * const loadWeights = tf.io.weightsLoaderFactory(fetchWeightsFromDisk)
 *
 * const manifest = JSON.parse(
 *   fs.readFileSync('./my_model-weights_manifest').toString()
 * )
 * const weightMap = await loadWeights(manifest, './')
 * ```
 * @param fetchWeightsFunction The function used for fetching the weight files.
 * @returns Weight loading function.
 */
declare function weightsLoaderFactory(fetchWeightsFunction: (fetchUrls: string[]) => Promise<ArrayBuffer[]>): (manifest: WeightsManifestConfig, filePathPrefix?: string, weightNames?: string[]) => Promise<NamedTensorMap>;

/**
 * A weight manifest.
 *
 * The weight manifest consists of an ordered list of weight-manifest groups.
 * Each weight-manifest group ("group" for short hereafter) consists of a
 * number of weight values stored in a number of paths.
 * See the documentation of `WeightManifestGroupConfig` below for more details.
 */
declare type WeightsManifestConfig = WeightsManifestGroupConfig[];

/**
 * An entry in the weight manifest.
 *
 * The entry contains specification of a weight.
 */
declare interface WeightsManifestEntry {
    /**
     * Name of the weight, e.g., 'Dense_1/bias'
     */
    name: string;
    /**
     * Shape of the weight.
     */
    shape: number[];
    /**
     * Data type of the weight.
     */
    dtype: 'float32' | 'int32' | 'bool' | 'string' | 'complex64';
    /**
     * Type of the weight.
     *
     * Optional.
     *
     * The value 'optimizer' indicates the weight belongs to an optimizer
     * (i.e., used only during model training and not during inference).
     */
    group?: WeightGroup;
    /**
     * Information for dequantization of the weight.
     */
    quantization?: {
        scale?: number;
        min?: number;
        dtype: 'uint16' | 'uint8' | 'float16';
    };
}

/**
 * A weight-manifest group.
 *
 * Consists of an ordered list of weight values encoded in binary format,
 * stored in an ordered list of paths.
 */
declare interface WeightsManifestGroupConfig {
    /**
     * An ordered list of paths.
     *
     * Paths are intentionally abstract in order to be general. For example, they
     * can be relative URL paths or relative paths on the file system.
     */
    paths: string[];
    /**
     * Specifications of the weights stored in the paths.
     */
    weights: WeightsManifestEntry[];
}

export declare const where: typeof where_;

/**
 * Returns the elements, either `a` or `b` depending on the `condition`.
 *
 * If the condition is true, select from `a`, otherwise select from `b`.
 *
 * ```js
 * const cond = tf.tensor1d([false, false, true], 'bool');
 * const a = tf.tensor1d([1 , 2, 3]);
 * const b = tf.tensor1d([-1, -2, -3]);
 *
 * a.where(cond, b).print();
 * ```
 *
 * @param condition The input condition. Must be of dtype bool.
 * @param a If `condition` is rank 1, `a` may have a higher rank but
 *     its first dimension must match the size of `condition`.
 * @param b A tensor with the same dtype as `a` and with shape that is
 *     compatible with `a`.
 * @return A tensor with same dtype as `a` and `b`, and shape that is
 *     broadcastable from `a` and `b`.
 *
 * @doc {heading: 'Operations', subheading: 'Logical'}
 */
declare function where_<T extends Tensor>(condition: Tensor | TensorLike, a: T | TensorLike, b: T | TensorLike): T;

export declare const whereAsync: typeof whereAsync_;

/**
 * Returns the coordinates of true elements of condition.
 *
 * The coordinates are returned in a 2-D tensor where the first dimension (rows)
 * represents the number of true elements, and the second dimension (columns)
 * represents the coordinates of the true elements. Keep in mind, the shape of
 * the output tensor can vary depending on how many true values there are in
 * input. Indices are output in row-major order. The resulting tensor has the
 * shape `[numTrueElems, condition.rank]`.
 *
 * This is analogous to calling the python `tf.where(cond)` without an x or y.
 *
 * ```js
 * const cond = tf.tensor1d([false, false, true], 'bool');
 * const result = await tf.whereAsync(cond);
 * result.print();
 * ```
 *
 * @doc {heading: 'Operations', subheading: 'Logical'}
 */
declare function whereAsync_(condition: Tensor | TensorLike): Promise<Tensor2D>;

declare function whereImpl(condShape: number[], condVals: TypedArray): Tensor2D;

/**
 * Creates an IOHandler that passes saved model artifacts to a callback.
 *
 * ```js
 * function handleSave(artifacts) {
 *   // ... do something with the artifacts ...
 *   return {modelArtifactsInfo: {...}, ...};
 * }
 *
 * const saveResult = model.save(tf.io.withSaveHandler(handleSave));
 * ```
 *
 * @param saveHandler A function that accepts a `ModelArtifacts` and returns a
 *     promise that resolves to a `SaveResult`.
 */
declare function withSaveHandler(saveHandler: (artifacts: ModelArtifacts) => Promise<SaveResult>): IOHandler;

/**
 * Creates an IOHandlerSync that passes saved model artifacts to a callback.
 *
 * ```js
 * function handleSave(artifacts) {
 *   // ... do something with the artifacts ...
 *   return {modelArtifactsInfo: {...}, ...};
 * }
 *
 * const saveResult = model.save(tf.io.withSaveHandler(handleSave));
 * ```
 *
 * @param saveHandler A function that accepts a `ModelArtifacts` and returns a
 *     `SaveResult`.
 */
declare function withSaveHandlerSync(saveHandler: (artifacts: ModelArtifacts) => SaveResult): IOHandlerSync;

/**
 * Creates a `tf.Tensor` with all elements set to 0.
 *
 * ```js
 * tf.zeros([2, 2]).print();
 * ```
 *
 * @param shape An array of integers defining the output tensor shape.
 * @param dtype The type of an element in the resulting tensor. Can
 *     be 'float32', 'int32' or 'bool'. Defaults to 'float'.
 *
 * @doc {heading: 'Tensors', subheading: 'Creation'}
 */
export declare function zeros<R extends Rank>(shape: ShapeMap[R], dtype?: DataType): Tensor<R>;

export declare const ZerosLike = "ZerosLike";

export declare const zerosLike: typeof zerosLike_;

/**
 * Creates a `tf.Tensor` with all elements set to 0 with the same shape as the
 * given tensor.
 *
 * ```js
 * const x = tf.tensor([1, 2]);
 * tf.zerosLike(x).print();
 * ```
 *
 * @param x The tensor of required shape.
 *
 * @doc {heading: 'Tensors', subheading: 'Creation'}
 */
declare function zerosLike_<T extends Tensor>(x: T | TensorLike): T;

export declare type ZerosLikeInputs = UnaryInputs;

export { }
