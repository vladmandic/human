#!/usr/bin/env -S node --no-deprecation --trace-warnings

const fs = require('fs');
const path = require('path');
const log = require('@vladmandic/pilogger');
const tf = require('@tensorflow/tfjs-node');

async function analyzeGraph(modelPath) {
  if (!fs.existsSync(modelPath)) log.warn('path does not exist:', modelPath);
  const stat = fs.statSync(modelPath);
  let model;
  if (stat.isFile()) model = await tf.loadGraphModel(`file://${modelPath}`);
  else model = await tf.loadGraphModel(`file://${path.join(modelPath, 'model.json')}`);
  log.info('graph model:', modelPath, tf.memory());
  // log(model.executor.graph.signature.inputs);
  // log(model.executor.graph.inputs);
  if (model.executor.graph.signature.inputs) {
    const inputs = Object.values(model.executor.graph.signature.inputs)[0];
    log.data('inputs:', { name: inputs.name, dtype: inputs.dtype, shape: inputs.tensorShape.dim });
  } else {
    const inputs = model.executor.graph.inputs[0];
    log.data('inputs:', { name: inputs.name, dtype: inputs.attrParams.dtype.value, shape: inputs.attrParams.shape.value });
  }
  const outputs = [];
  let i = 0;
  if (model.executor.graph.signature.outputs) {
    for (const [key, val] of Object.entries(model.executor.graph.signature.outputs)) {
      outputs.push({ id: i++, name: key, dytpe: val.dtype, shape: val.tensorShape?.dim });
    }
  } else {
    for (const out of model.executor.graph.outputs) {
      outputs.push({ id: i++, name: out.name });
    }
  }
  log.data('outputs:', outputs);
}

async function analyzeSaved(modelPath) {
  const meta = await tf.node.getMetaGraphsFromSavedModel(modelPath);
  log.info('saved model:', modelPath);
  const sign = Object.values(meta[0].signatureDefs)[0];
  log.data('tags:', meta[0].tags);
  log.data('signature:', Object.keys(meta[0].signatureDefs));
  const inputs = Object.values(sign.inputs)[0];
  log.data('inputs:', { name: inputs.name, dtype: inputs.dtype, dimensions: inputs.shape?.length });
  const outputs = [];
  let i = 0;
  for (const [key, val] of Object.entries(sign.outputs)) {
    outputs.push({ id: i++, name: key, dytpe: val.dtype, dimensions: val.shape?.length });
  }
  log.data('outputs:', outputs);
}

async function main() {
  log.header();
  if (process.argv.length !== 3) log.error('path required');
  else if (!fs.existsSync(process.argv[2])) log.error(`path does not exist: ${process.argv[2]}`);
  else if (fs.existsSync(path.join(process.argv[2], '/saved_model.pb'))) analyzeSaved(process.argv[2]);
  else if (fs.existsSync(path.join(process.argv[2], '/model.json')) || process.argv[2].endsWith('.json')) analyzeGraph(process.argv[2]);
  else log.error('path does not contain valid model');
}

main();
