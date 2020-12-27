import * as modelPoseNet from './modelPoseNet';
import * as keypoints from './keypoints';
import * as util from './util';

// @ts-ignore
exports.load = modelPoseNet.load;
// @ts-ignore
exports.PoseNet = modelPoseNet.PoseNet;

exports.partChannels = keypoints.partChannels;
exports.partIds = keypoints.partIds;
exports.partNames = keypoints.partNames;
exports.poseChain = keypoints.poseChain;
// @ts-ignore
exports.getAdjacentKeyPoints = util.getAdjacentKeyPoints;
// @ts-ignore
exports.getBoundingBox = util.getBoundingBox;
// @ts-ignore
exports.getBoundingBoxPoints = util.getBoundingBoxPoints;
// @ts-ignore
exports.scaleAndFlipPoses = util.scaleAndFlipPoses;
// @ts-ignore
exports.scalePose = util.scalePose;
