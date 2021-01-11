import { log } from '../log.js';
import * as tf from '../../dist/tfjs.esm.js';
// import * as helpers from './helpers.js';
// import * as profile from '../profile.js';

const models = {};
let config = {};
const anchors = [];
const kMidHipCenter = 0;
const kPoseDetectKeyNum = 2;
const kFullBodySizeRot = 1;

function calculateScale(min_scale, max_scale, stride_index, num_strides) {
  if (num_strides === 1) return (min_scale + max_scale) * 0.5;
  return min_scale + (max_scale - min_scale) * 1.0 * stride_index / (num_strides - 1.0);
}

export function generateAnchors() {
  const options = {};
  options.strides = [];
  options.aspect_ratios = [];
  options.feature_map_height = [];
  options.num_layers = 4;
  options.min_scale = 0.1484375;
  options.max_scale = 0.75;
  options.input_size_height = 128;
  options.input_size_width = 128;
  options.anchor_offset_x = 0.5;
  options.anchor_offset_y = 0.5;
  options.strides.push(8);
  options.strides.push(16);
  options.strides.push(16);
  options.strides.push(16);
  options.aspect_ratios.push(1.0);
  options.reduce_boxes_in_lowest_layer = false;
  options.interpolated_scale_aspect_ratio = 1.0;
  options.fixed_anchor_size = true;
  let layer_id = 0;
  while (layer_id < options.strides.length) {
    const anchor_height = [];
    const anchor_width = [];
    const aspect_ratios = [];
    const scales = [];
    // For same strides, we merge the anchors in the same order.
    let last_same_stride_layer = layer_id;
    while (last_same_stride_layer < options.strides.length && options.strides[last_same_stride_layer] === options.strides[layer_id]) {
      const scale = calculateScale(options.min_scale, options.max_scale, last_same_stride_layer, options.strides.length);
      if (last_same_stride_layer === 0 && options.reduce_boxes_in_lowest_layer) {
        // For first layer, it can be specified to use predefined anchors.
        aspect_ratios.push(1.0);
        aspect_ratios.push(2.0);
        aspect_ratios.push(0.5);
        scales.push(0.1);
        scales.push(scale);
        scales.push(scale);
      } else {
        for (let aspect_ratio_id = 0; aspect_ratio_id < options.aspect_ratios.length; ++aspect_ratio_id) {
          aspect_ratios.push(options.aspect_ratios[aspect_ratio_id]);
          scales.push(scale);
        }
        if (options.interpolated_scale_aspect_ratio > 0.0) {
          const scale_next = last_same_stride_layer === options.strides.length - 1 ? 1.0 : calculateScale(options.min_scale, options.max_scale, last_same_stride_layer + 1, options.strides.length);
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
}

export async function load(cfg) {
  config = cfg;
  if (!models.blazepose) {
    models.blazepose = await tf.loadGraphModel(config.pose.modelPath);
    log(`load model: ${config.pose.modelPath.match(/\/(.*)\./)[1]}`);
  }
  generateAnchors();
  return models.blazepose;
}

function rotateRegion(region) {
  const x0 = region.keys[kMidHipCenter].x;
  const y0 = region.keys[kMidHipCenter].y;
  const x1 = (region.box[0] + region.box[2]) * 0.5;
  const y1 = (region.box[1] + region.box[3]) * 0.5;
  const target_angle = Math.PI * 0.5;
  const angle = target_angle - Math.atan2(-(y1 - y0), x1 - x0);
  return Math.round(1000 * (angle - 2 * Math.PI * Math.floor((angle - (-Math.PI)) / (2 * Math.PI)))) / 1000;
}

function rotateVecor(vec, rotation) {
  const sx = vec.x;
  const sy = vec.y;
  vec.x = sx * Math.cos(rotation) - sy * Math.sin(rotation);
  vec.y = sx * Math.sin(rotation) + sy * Math.cos(rotation);
}

async function decode(logits) {
  const scores = await logits[0].data();
  const boxes = await logits[1].data();
  // todo: add nms
  // todo scale output with image.shape
  const regions = [];
  for (let i = 0; i < anchors.length; i++) {
    const region = {};
    const score = 1.0 / (1.0 + Math.exp(-scores[i]));
    if (score > config.pose.scoreThreshold) {
      const idx = (4 + 2 * kPoseDetectKeyNum) * i;
      /* boundary box */
      const sx = boxes[idx + 0];
      const sy = boxes[idx + 1];
      const w = boxes[idx + 2] / config.pose.inputSize;
      const h = boxes[idx + 3] / config.pose.inputSize;
      const cx = (sx + anchors[i].x_center * config.pose.inputSize) / config.pose.inputSize;
      const cy = (sy + anchors[i].y_center * config.pose.inputSize) / config.pose.inputSize;
      region.score = Math.round(1000 * score) / 1000;
      region.box = [cx - w * 0.5, cy - h * 0.5, w * 0.5, h * 0.5];
      /* landmark positions (6 keys) */
      const keys = new Array(kPoseDetectKeyNum);
      for (let j = 0; j < kPoseDetectKeyNum; j++) {
        const lx = (boxes[idx + 4 + (2 * j) + 0] + anchors[i].x_center * config.pose.inputSize) / config.pose.inputSize;
        const ly = (boxes[idx + 4 + (2 * j) + 1] + anchors[i].y_center * config.pose.inputSize) / config.pose.inputSize;
        keys[j] = { x: lx, y: ly };
      }
      region.keys = keys;
      region.angle = rotateRegion(region);
      // add points
      const x_center = region.keys[kMidHipCenter].x * config.pose.inputSize;
      const y_center = region.keys[kMidHipCenter].y * config.pose.inputSize;
      const x_scale = region.keys[kFullBodySizeRot].x * config.pose.inputSize;
      const y_scale = region.keys[kFullBodySizeRot].y * config.pose.inputSize;
      // Bounding box size as double distance from center to scale point.
      const box_size = Math.sqrt((x_scale - x_center) * (x_scale - x_center) + (y_scale - y_center) * (y_scale - y_center)) * 2.0;
      /* RectTransformationCalculator::TransformNormalizedRect() */
      const roi_cx = region.angle === 0.0 ? x_center + box_size : x_center + box_size * Math.cos(region.angle) - box_size * Math.sin(region.angle);
      const roi_cy = region.angle === 0.0 ? y_center + box_size : y_center + box_size * Math.sin(region.angle) + box_size * Math.cos(region.angle);
      const long_side = Math.max(box_size, box_size);
      const roi_w = long_side * 1.5;
      const roi_h = long_side * 1.5;
      region.center = { x: roi_cx / config.pose.inputSize, y: roi_cy / config.pose.inputSize };
      region.size = { x: roi_w / config.pose.inputSize, y: roi_h / config.pose.inputSize };
      /* calculate ROI coordinates */
      const dx = roi_w * 0.5;
      const dy = roi_h * 0.5;
      region.coords = [];
      region.coords[0] = { x: -dx, y: -dy };
      region.coords[1] = { x: +dx, y: -dy };
      region.coords[2] = { x: +dx, y: +dy };
      region.coords[3] = { x: -dx, y: +dy };
      for (let j = 0; j < 4; j++) {
        rotateVecor(region.coords[i], region.angle);
        region.coords[j].x = (region.coords[j].x + roi_cx) / config.pose.inputSize;
        region.coords[j].y = (region.coords[j].y + roi_cy) / config.pose.inputSize;
      }

      regions.push(region);
    }
  }
  return regions;
}

export async function predict(image, cfg) {
  if (!models.blazepose) return null;
  return new Promise(async (resolve) => {
    config = cfg;
    const resize = tf.image.resizeBilinear(image, [config.pose.inputSize, config.pose.inputSize], false);
    const enhance = tf.div(resize, 127.5).sub(1);
    tf.dispose(resize);
    const logits = await models.blazepose.predict(enhance);
    // todo: add landmarks model
    tf.dispose(enhance);
    const regions = await decode(logits);
    logits[0].dispose();
    logits[1].dispose();
    log('poses', regions);
    resolve(regions);
  });
}
