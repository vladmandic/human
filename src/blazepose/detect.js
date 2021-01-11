import * as tf from '../../dist/tfjs.esm.js';
import * as mp from './helpers.js';

/* ------------------------------------------------ *
 * The MIT License (MIT)
 * Copyright (c) 2020 terryky1220@gmail.com
 * ------------------------------------------------ */

const kMidHipCenter = 0;
const kFullBodySizeRot = 1;
const kMidShoulderCenter = 2;
const kUpperBodySizeRot = 3;
const kPoseDetectKeyNum = 2;
const POSE_JOINT_NUM = 33;
let s_detect_model;
let s_detect_tensor_input;
let s_landmark_model;
let s_landmark_tensor_input;
const s_anchors = [];

function create_ssd_anchors() {
  const anchor_options = {};
  anchor_options.strides = [];
  anchor_options.aspect_ratios = [];
  anchor_options.feature_map_height = [];
  anchor_options.num_layers = 4;
  anchor_options.min_scale = 0.1484375;
  anchor_options.max_scale = 0.75;
  anchor_options.input_size_height = 128;
  anchor_options.input_size_width = 128;
  anchor_options.anchor_offset_x = 0.5;
  anchor_options.anchor_offset_y = 0.5;
  anchor_options.strides.push(8);
  anchor_options.strides.push(16);
  anchor_options.strides.push(16);
  anchor_options.strides.push(16);
  anchor_options.aspect_ratios.push(1.0);
  anchor_options.reduce_boxes_in_lowest_layer = false;
  anchor_options.interpolated_scale_aspect_ratio = 1.0;
  anchor_options.fixed_anchor_size = true;
  mp.GenerateAnchors(s_anchors, anchor_options);
  return 0;
}

/* -------------------------------------------------- *
 *  Create TensorFlow.js Model
 * -------------------------------------------------- */
async function init_tfjs_blazepose() {
  const url = './model/tfjs_model_full_pose_detection_float32/model.json';
  s_detect_model = await tf.loadGraphModel(url);
  const url_landmark = './model/tfjs_model_full_pose_landmark_39kp_float32/model.json';
  s_landmark_model = await tf.loadGraphModel(url_landmark);
  /* Pose detect */
  s_detect_tensor_input = tfjs_get_tensor_by_name(s_detect_model, 0, 'input');
  /* Pose Landmark */
  s_landmark_tensor_input = tfjs_get_tensor_by_name(s_landmark_model, 0, 'input');
  const det_input_w = s_detect_tensor_input.shape[2];
  const det_input_h = s_detect_tensor_input.shape[1];
  create_ssd_anchors(det_input_w, det_input_h);
  return 0;
}

/* -------------------------------------------------- *
 * Invoke TensorFlow.js (Pose detection)
 * -------------------------------------------------- */
async function decode_bounds(region_list, logits, score_thresh, input_img_w, input_img_h) {
  const scores_ptr = await logits[0].data();
  const bbox_ptr = await logits[1].data();
  for (let i = 0; i < s_anchors.length; i++) {
    const region = {};
    const anchor = s_anchors[i];
    const score0 = scores_ptr[i];
    const score = 1.0 / (1.0 + Math.exp(-score0));
    if (score > score_thresh) {
      /*
             *  cx, cy, width, height
             *  key0_x, key0_y
             *  key1_x, key1_y
             */
      const numkey = kPoseDetectKeyNum;
      const bbx_idx = (4 + 2 * numkey) * i;
      /* boundary box */
      const sx = bbox_ptr[bbx_idx + 0];
      const sy = bbox_ptr[bbx_idx + 1];
      let w = bbox_ptr[bbx_idx + 2];
      let h = bbox_ptr[bbx_idx + 3];
      let cx = sx + anchor.x_center * input_img_w;
      let cy = sy + anchor.y_center * input_img_h;
      cx /= input_img_w;
      cy /= input_img_h;
      w /= input_img_w;
      h /= input_img_h;
      const topleft = {};
      const btmright = {};
      topleft.x = cx - w * 0.5;
      topleft.y = cy - h * 0.5;
      btmright.x = cx + w * 0.5;
      btmright.y = cy + h * 0.5;
      region.score = score;
      region.topleft = topleft;
      region.btmright = btmright;
      /* landmark positions (6 keys) */
      const keys = new Array(kPoseDetectKeyNum);
      for (let j = 0; j < kPoseDetectKeyNum; j++) {
        let lx = bbox_ptr[bbx_idx + 4 + (2 * j) + 0];
        let ly = bbox_ptr[bbx_idx + 4 + (2 * j) + 1];
        lx += anchor.x_center * input_img_w;
        ly += anchor.y_center * input_img_h;
        lx /= input_img_w;
        ly /= input_img_h;
        keys[j] = { x: lx, y: ly };
      }
      region.keys = keys;
      region_list.push(region);
    }
  }
  return 0;
}

/* -------------------------------------------------- *
 *  extract ROI
 *  based on:
 *   - mediapipe/calculators/util/alignment_points_to_rects_calculator.cc
 *       AlignmentPointsRectsCalculator::DetectionToNormalizedRect()
 *   - mediapipe\calculators\util\rect_transformation_calculator.cc
 *       RectTransformationCalculator::TransformNormalizedRect()
 * -------------------------------------------------- */
function normalize_radians(angle) {
  return angle - 2 * Math.PI * Math.floor((angle - (-Math.PI)) / (2 * Math.PI));
}

function compute_rotation(region) {
  const x0 = region.keys[kMidHipCenter].x;
  const y0 = region.keys[kMidHipCenter].y;
  const x1 = (region.topleft.x + region.btmright.x) * 0.5;
  const y1 = (region.topleft.y + region.btmright.y) * 0.5;
  const target_angle = Math.PI * 0.5;
  const rotation = target_angle - Math.atan2(-(y1 - y0), x1 - x0);
  region.rotation = normalize_radians(rotation);
}

function rot_vec(vec, rotation) {
  const sx = vec.x;
  const sy = vec.y;
  vec.x = sx * Math.cos(rotation) - sy * Math.sin(rotation);
  vec.y = sx * Math.sin(rotation) + sy * Math.cos(rotation);
}

function compute_detect_to_roi(region) {
  const input_img_w = s_detect_tensor_input.shape[2];
  const input_img_h = s_detect_tensor_input.shape[1];
  const x_center = region.keys[kMidHipCenter].x * input_img_w;
  const y_center = region.keys[kMidHipCenter].y * input_img_h;
  const x_scale = region.keys[kFullBodySizeRot].x * input_img_w;
  const y_scale = region.keys[kFullBodySizeRot].y * input_img_h;
  // Bounding box size as double distance from center to scale point.
  const box_size = Math.sqrt((x_scale - x_center) * (x_scale - x_center) + (y_scale - y_center) * (y_scale - y_center)) * 2.0;
  /* RectTransformationCalculator::TransformNormalizedRect() */
  const width = box_size;
  const height = box_size;
  const rotation = region.rotation;
  const shift_x = 0.0;
  const shift_y = 0.0;
  let roi_cx;
  let roi_cy;
  if (rotation === 0.0) {
    roi_cx = x_center + (width * shift_x);
    roi_cy = y_center + (height * shift_y);
  } else {
    const dx = (width * shift_x) * Math.cos(rotation) - (height * shift_y) * Math.sin(rotation);
    const dy = (width * shift_x) * Math.sin(rotation) + (height * shift_y) * Math.cos(rotation);
    roi_cx = x_center + dx;
    roi_cy = y_center + dy;
  }
  /*
     *  calculate ROI width and height.
     *  scale parameter is based on
     *      "mediapipe/modules/pose_landmark/pose_detection_to_roi.pbtxt"
     */
  const scale_x = 1.5;
  const scale_y = 1.5;
  const long_side = Math.max(width, height);
  const roi_w = long_side * scale_x;
  const roi_h = long_side * scale_y;
  region.roi_center = { x: roi_cx / input_img_w, y: roi_cy / input_img_h };
  region.roi_size = { x: roi_w / input_img_w, y: roi_h / input_img_h };
  /* calculate ROI coordinates */
  const dx = roi_w * 0.5;
  const dy = roi_h * 0.5;
  region.roi_coord = [];
  region.roi_coord[0] = { x: -dx, y: -dy };
  region.roi_coord[1] = { x: +dx, y: -dy };
  region.roi_coord[2] = { x: +dx, y: +dy };
  region.roi_coord[3] = { x: -dx, y: +dy };
  for (let i = 0; i < 4; i++) {
    rot_vec(region.roi_coord[i], rotation);
    region.roi_coord[i].x += roi_cx;
    region.roi_coord[i].y += roi_cy;
    region.roi_coord[i].x /= input_img_h;
    region.roi_coord[i].y /= input_img_h;
  }
}

function pack_detect_result(detect_result, region_list) {
  for (let i = 0; i < region_list.length; i++) {
    region = region_list[i];
    compute_rotation(region);
    compute_detect_to_roi(region);
    detect_result.push(region);
  }
}

/* -------------------------------------------------- *
 * Invoke TensorFlow.js (Pose detection)
 * -------------------------------------------------- */
function exec_tfjs(img) {
  const w = s_detect_tensor_input.shape[2];
  const h = s_detect_tensor_input.shape[1];
  const logits = tf.tidy(() => {
    img_tensor1d = tf.tensor1d(img);
    img_tensor = img_tensor1d.reshape([h, w, 3]);
    // normalize [0, 255] to [-1, 1].
    const min = -1;
    const max = 1;
    const normalized = img_tensor.toFloat().mul((max - min) / 255.0).add(min);
    // resize, reshape
    const batched = normalized.reshape([-1, w, h, 3]);
    return s_detect_model.predict(batched);
  });
  return logits;
}

async function invoke_pose_detect(img) {
  const logits = exec_tfjs(img);
  const score_thresh = 0.75;
  const detect_result = [];
  const region_list = [];
  const w = s_detect_tensor_input.shape[2];
  const h = s_detect_tensor_input.shape[1];
  await decode_bounds(region_list, logits, score_thresh, w, h);
  if (true) { /* USE NMS */
    const iou_thresh = 0.3;
    const region_nms_list = [];
    non_max_suppression(region_list, region_nms_list, iou_thresh);
    pack_detect_result(detect_result, region_nms_list);
  } else {
    pack_detect_result(detect_result, region_list);
  }
  /* release the resource of output tensor */
  logits[0].dispose();
  logits[1].dispose();
  return detect_result;
}

/* -------------------------------------------------- *
 * Invoke TensorFlow.js (Pose landmark)
 * -------------------------------------------------- */
function exec_tfjs_landmark(img) {
  const w = s_landmark_tensor_input.shape[2];
  const h = s_landmark_tensor_input.shape[1];
  const logits = tf.tidy(() => {
    img_tensor1d = tf.tensor1d(img);
    img_tensor = img_tensor1d.reshape([h, w, 3]);
    // normalize [0, 255] to [-1, 1].
    const min = -1;
    const max = 1;
    const normalized = img_tensor.toFloat().mul((max - min) / 255.0).add(min);
    // resize, reshape
    const batched = normalized.reshape([-1, w, h, 3]);
    return s_landmark_model.predict(batched);
  });
  return logits;
}

async function invoke_pose_landmark(img) {
  const logits = exec_tfjs_landmark(img);
  const poseflag_ptr = await logits[1].data(); /* shape: (1, 1, 1, 1) */
  const landmark_ptr = await logits[2].data(); /* shape: (1, 156)     */
  const img_w = s_landmark_tensor_input.shape[2];
  const img_h = s_landmark_tensor_input.shape[1];
  const landmark_result = {};
  landmark_result.joint = [];
  landmark_result.score = poseflag_ptr[0];
  for (let i = 0; i < POSE_JOINT_NUM; i++) {
    landmark_result.joint[i] = {
      x: landmark_ptr[4 * i + 0] / img_w,
      y: landmark_ptr[4 * i + 1] / img_h,
      z: landmark_ptr[4 * i + 2],
    };
  }
  logits[0].dispose();
  logits[1].dispose();
  logits[2].dispose();
  return landmark_result;
}
