import type { Tensor } from '../tfjs/types';
import type { FaceResult } from '../result';
import * as tf from '../../dist/tfjs.esm.js';
import { meshAnnotations } from './facemeshcoords';

const expandFact = 0.1;
const alpha = 0.5;

// point inclusion in polygon based on https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html
function insidePoly(x: number, y: number, polygon: Array<{ x: number, y: number }>): boolean {
  let inside = false;
  let j = polygon.length - 1;
  for (let i = 0; i < polygon.length; j = i++) {
    if (((polygon[i].y > y) !== (polygon[j].y > y)) && (x < (polygon[j].x - polygon[i].x) * (y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x)) inside = !inside;
  }
  return inside;
}

export async function mask(face: FaceResult): Promise<Tensor | undefined> {
  if (!face.tensor) return face.tensor;
  if (!face.mesh || face.mesh.length < 100) return face.tensor;
  const width = face.tensor.shape[2] || 0;
  const height = face.tensor.shape[1] || 0;
  const buffer = await face.tensor.buffer();
  let silhouette: Array<{ x: number, y: number }> = [];
  for (const pt of meshAnnotations.silhouette) silhouette.push({ x: (face.mesh[pt][0] - face.box[0]) / face.box[2], y: (face.mesh[pt][1] - face.box[1]) / face.box[3] }); // add all silhouette points scaled to local box
  if (expandFact && expandFact > 0) silhouette = silhouette.map((pt) => ({ x: pt.x > 0.5 ? pt.x + expandFact : pt.x - expandFact, y: pt.y > 0.5 ? pt.y + expandFact : pt.y - expandFact })); // expand silhouette
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const inside = insidePoly(x / width, y / width, silhouette);
      if (!inside) {
        buffer.set(alpha * buffer.get(0, y, x, 0), 0, y, x, 0);
        buffer.set(alpha * buffer.get(0, y, x, 1), 0, y, x, 1);
        buffer.set(alpha * buffer.get(0, y, x, 2), 0, y, x, 2);
      }
    }
  }
  const output = buffer.toTensor();
  tf.dispose(buffer);
  return output;
}
