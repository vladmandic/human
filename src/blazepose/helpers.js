/* ------------------------------------------------ *
 * The MIT License (MIT)
 * Copyright (c) 2020 terryky1220@gmail.com
 * ------------------------------------------------ */

// Copyright 2019 The MediaPipe Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

function CalculateScale(min_scale, max_scale, stride_index, num_strides) {
  if (num_strides === 1) return (min_scale + max_scale) * 0.5;
  return min_scale + (max_scale - min_scale) * 1.0 * stride_index / (num_strides - 1.0);
}

export function GenerateAnchors(anchors, options) {
  let layer_id = 0;
  while (layer_id < options.strides.length) {
    const anchor_height = [];
    const anchor_width = [];
    const aspect_ratios = [];
    const scales = [];
    // For same strides, we merge the anchors in the same order.
    let last_same_stride_layer = layer_id;
    while (last_same_stride_layer < options.strides.length
               && options.strides[last_same_stride_layer] === options.strides[layer_id]) {
      const scale = CalculateScale(options.min_scale, options.max_scale,
        last_same_stride_layer, options.strides.length);
      if (last_same_stride_layer === 0 && options.reduce_boxes_in_lowest_layer) {
        // For first layer, it can be specified to use predefined anchors.
        aspect_ratios.push(1.0);
        aspect_ratios.push(2.0);
        aspect_ratios.push(0.5);
        scales.push(0.1);
        scales.push(scale);
        scales.push(scale);
      } else {
        for (let aspect_ratio_id = 0;
          aspect_ratio_id < options.aspect_ratios.length;
          ++aspect_ratio_id) {
          aspect_ratios.push(options.aspect_ratios[aspect_ratio_id]);
          scales.push(scale);
        }
        if (options.interpolated_scale_aspect_ratio > 0.0) {
          const scale_next = last_same_stride_layer === options.strides.length - 1
            ? 1.0
            : CalculateScale(options.min_scale, options.max_scale,
              last_same_stride_layer + 1,
              options.strides.length);
          scales.push(Math.sqrt(scale * scale_next));
          aspect_ratios.push(options.interpolated_scale_aspect_ratio);
        }
      }
      last_same_stride_layer++;
    }
    for (let i = 0; i < aspect_ratios.length; ++i) {
      const ratio_sqrts = Math.sqrt(aspect_ratios[i]);
      anchor_height.push(scales[i] / ratio_sqrts);
      anchor_width.push(scales[i] * ratio_sqrts);
    }
    let feature_map_height = 0;
    let feature_map_width = 0;
    if (options.feature_map_height.length) {
      feature_map_height = options.feature_map_height[layer_id];
      feature_map_width = options.feature_map_width[layer_id];
    } else {
      const stride = options.strides[layer_id];
      feature_map_height = Math.ceil(1.0 * options.input_size_height / stride);
      feature_map_width = Math.ceil(1.0 * options.input_size_width / stride);
    }
    for (let y = 0; y < feature_map_height; ++y) {
      for (let x = 0; x < feature_map_width; ++x) {
        for (let anchor_id = 0; anchor_id < anchor_height.length; ++anchor_id) {
          // TODO: Support specifying anchor_offset_x, anchor_offset_y.
          const x_center = (x + options.anchor_offset_x) * 1.0 / feature_map_width;
          const y_center = (y + options.anchor_offset_y) * 1.0 / feature_map_height;
          const new_anchor = {};
          new_anchor.x_center = x_center;
          new_anchor.y_center = y_center;
          if (options.fixed_anchor_size) {
            new_anchor.w = 1.0;
            new_anchor.h = 1.0;
          } else {
            new_anchor.w = anchor_width[anchor_id];
            new_anchor.h = anchor_height[anchor_id];
          }
          anchors.push(new_anchor);
        }
      }
    }
    layer_id = last_same_stride_layer;
  }
  return 0;
}

/* -------------------------------------------------- *
 *  Apply NonMaxSuppression:
 *      https://github.com/tensorflow/tfjs/blob/master/tfjs-core/src/ops/image_ops.ts
 * -------------------------------------------------- */
function calc_intersection_over_union(region0, region1) {
  const sx0 = region0.box[0];
  const sy0 = region0.box[1];
  const ex0 = region0.box[2];
  const ey0 = region0.box[3];
  const sx1 = region1.box[0];
  const sy1 = region1.box[1];
  const ex1 = region1.box[2];
  const ey1 = region1.box[3];
  const xmin0 = Math.min(sx0, ex0);
  const ymin0 = Math.min(sy0, ey0);
  const xmax0 = Math.max(sx0, ex0);
  const ymax0 = Math.max(sy0, ey0);
  const xmin1 = Math.min(sx1, ex1);
  const ymin1 = Math.min(sy1, ey1);
  const xmax1 = Math.max(sx1, ex1);
  const ymax1 = Math.max(sy1, ey1);
  const area0 = (ymax0 - ymin0) * (xmax0 - xmin0);
  const area1 = (ymax1 - ymin1) * (xmax1 - xmin1);
  if (area0 <= 0 || area1 <= 0) return 0.0;
  const intersect_xmin = Math.max(xmin0, xmin1);
  const intersect_ymin = Math.max(ymin0, ymin1);
  const intersect_xmax = Math.min(xmax0, xmax1);
  const intersect_ymax = Math.min(ymax0, ymax1);
  const intersect_area = Math.max(intersect_ymax - intersect_ymin, 0.0) * Math.max(intersect_xmax - intersect_xmin, 0.0);
  return intersect_area / (area0 + area1 - intersect_area);
}

function compare(v1, v2) {
  if (v1.score > v2.score) return 1;
  return -1;
}

export function NMS(region_list, region_nms_list, iou_thresh) {
  region_list.sort(compare);
  for (let i = 0; i < region_list.length; i++) {
    const region_candidate = region_list[i];
    let ignore_candidate = false;
    for (let j = 0; j < region_nms_list.length; j++) {
      const region_nms = region_nms_list[j];
      const iou = calc_intersection_over_union(region_candidate, region_nms);
      if (iou >= iou_thresh) {
        ignore_candidate = true;
        break;
      }
    }
    if (!ignore_candidate) {
      region_nms_list.push(region_candidate);
    }
  }
  return 0;
}
