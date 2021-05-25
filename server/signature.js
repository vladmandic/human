#!/usr/bin/env -S node --no-deprecation --trace-warnings

/**
 * Helper app that analyzes any TensorFlow SavedModel or GraphModel for inputs and outputs
 */

const fs = require('fs');
const path = require('path');
const log = require('@vladmandic/pilogger');
const tf = require('@tensorflow/tfjs-node');

async function analyzeGraph(modelPath) {
  const model = await tf.loadGraphModel(`file://${modelPath}`);
  log.info('graph model:', path.resolve(modelPath));
  log.info('size:', tf.engine().memory());

  const inputs = [];
  if (model.modelSignature && model.modelSignature['inputs']) {
    log.info('model inputs based on signature');
    for (const [key, val] of Object.entries(model.modelSignature['inputs'])) {
      const shape = val.tensorShape.dim.map((a) => parseInt(a.size));
      inputs.push({ name: key, dtype: val.dtype, shape });
    }
  // @ts-ignore
  } else if (model.executor.graph['inputs']) {
    log.info('model inputs based on executor');
    // @ts-ignore
    for (const t of model.executor.graph['inputs']) {
      inputs.push({ name: t.name, dtype: t.attrParams.dtype.value, shape: t.attrParams.shape.value });
    }
  } else {
    log.warn('model inputs: cannot determine');
  }

  const outputs = [];
  let i = 0;
  if (model.modelSignature && model.modelSignature['outputs'] && Object.values(model.modelSignature['outputs'])[0].dtype) {
    log.info('model outputs based on signature');
    for (const [key, val] of Object.entries(model.modelSignature['outputs'])) {
      const shape = val.tensorShape?.dim.map((a) => parseInt(a.size));
      outputs.push({ id: i++, name: key, dytpe: val.dtype, shape });
    }
  // @ts-ignore
  } else if (model.executor.graph['outputs']) {
    log.info('model outputs based on executor');
    // @ts-ignore
    for (const t of model.executor.graph['outputs']) {
      outputs.push({ id: i++, name: t.name, dtype: t.attrParams.dtype?.value || t.rawAttrs.T.type, shape: t.attrParams.shape?.value });
    }
  } else {
    log.warn('model outputs: cannot determine');
  }

  log.data('inputs:', inputs);
  log.data('outputs:', outputs);
}

async function analyzeSaved(modelPath) {
  const meta = await tf.node.getMetaGraphsFromSavedModel(modelPath);
  log.info('saved model:', path.resolve(modelPath));
  const sign = Object.values(meta[0].signatureDefs)[0];
  log.data('tags:', meta[0].tags);
  log.data('signature:', Object.keys(meta[0].signatureDefs));
  const inputs = Object.values(sign.inputs)[0];
  // @ts-ignore
  const inputShape = inputs.shape?.map((a) => a.array[0]);
  log.data('inputs:', { name: inputs.name, dtype: inputs.dtype, shape: inputShape });
  const outputs = [];
  let i = 0;
  for (const [key, val] of Object.entries(sign.outputs)) {
    // @ts-ignore
    const shape = val.shape?.map((a) => a.array[0]);
    outputs.push({ id: i++, name: key, dytpe: val.dtype, shape });
  }
  log.data('outputs:', outputs);
}

async function main() {
  log.header();
  const param = process.argv[2];
  if (process.argv.length !== 3) {
    log.error('path required');
    process.exit(0);
  } else if (!fs.existsSync(param)) {
    log.error(`path does not exist: ${param}`);
    process.exit(0);
  }
  const stat = fs.statSync(param);
  log.data('created on:', stat.birthtime);
  if (stat.isFile()) {
    if (param.endsWith('.json')) analyzeGraph(param);
  }
  if (stat.isDirectory()) {
    if (fs.existsSync(path.join(param, '/saved_model.pb'))) analyzeSaved(param);
    if (fs.existsSync(path.join(param, '/model.json'))) analyzeGraph(path.join(param, '/model.json'));
  }
}

main();
