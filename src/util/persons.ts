/**
 * Analyze detection Results and sort&combine them into per-person view
 */

import type { FaceResult, BodyResult, HandResult, GestureResult, PersonResult, Box } from '../result';

export function join(faces: Array<FaceResult>, bodies: Array<BodyResult>, hands: Array<HandResult>, gestures: Array<GestureResult>, shape: Array<number> | undefined): Array<PersonResult> {
  let id = 0;
  const persons: Array<PersonResult> = [];
  for (const face of faces) { // person is defined primarily by face and then we append other objects as found
    const person: PersonResult = { id: id++, face, body: null, hands: { left: null, right: null }, gestures: [], box: [0, 0, 0, 0] };
    for (const body of bodies) {
      if (face.box[0] > body.box[0] // x within body
        && face.box[0] < body.box[0] + body.box[2]
        && face.box[1] + face.box[3] > body.box[1] // y within body
        && face.box[1] + face.box[3] < body.box[1] + body.box[3]) {
        person.body = body;
      }
    }
    if (person.body) { // only try to join hands if body is found
      for (const hand of hands) {
        if (hand.box[0] + hand.box[2] > person.body.box[0] // x within body for left hand
          && hand.box[0] + hand.box[2] < person.body.box[0] + person.body.box[2]
          && hand.box[1] + hand.box[3] > person.body.box[1] // x within body for left hand
          && hand.box[1] + hand.box[3] < person.body.box[1] + person.body.box[3]) {
          if (person.hands) person.hands.left = hand;
        }
        if (hand.box[0] < person.body.box[0] + person.body.box[2] // x within body for right hand
          && hand.box[0] > person.body.box[0]
          && hand.box[1] + hand.box[3] > person.body.box[1] // x within body for right hand
          && hand.box[1] + hand.box[3] < person.body.box[1] + person.body.box[3]) {
          if (person.hands) person.hands.right = hand;
        }
      }
    }
    for (const gesture of gestures) { // append all gestures according to ids
      if (gesture['face'] !== undefined && gesture['face'] === face.id) person.gestures?.push(gesture);
      else if (gesture['iris'] !== undefined && gesture['iris'] === face.id) person.gestures?.push(gesture);
      else if (gesture['body'] !== undefined && gesture['body'] === person.body?.id) person.gestures?.push(gesture);
      else if (gesture['hand'] !== undefined && gesture['hand'] === person.hands?.left?.id) person.gestures?.push(gesture);
      else if (gesture['hand'] !== undefined && gesture['hand'] === person.hands?.right?.id) person.gestures?.push(gesture);
    }

    // create new overarching box from all boxes belonging to person
    const x: number[] = [];
    const y: number[] = [];
    const extractXY = (box: Box | undefined) => { // extract all [x, y] coordinates from boxes [x, y, width, height]
      if (box && box.length === 4) {
        x.push(box[0], box[0] + box[2]);
        y.push(box[1], box[1] + box[3]);
      }
    };
    extractXY(person.face?.box);
    extractXY(person.body?.box);
    extractXY(person.hands?.left?.box);
    extractXY(person.hands?.right?.box);
    const minX = Math.min(...x);
    const minY = Math.min(...y);
    person.box = [minX, minY, Math.max(...x) - minX, Math.max(...y) - minY]; // create new overarching box

    // shape is known so we calculate boxRaw as well
    if (shape && shape[1] && shape[2]) person.boxRaw = [person.box[0] / shape[2], person.box[1] / shape[1], person.box[2] / shape[2], person.box[3] / shape[1]];

    persons.push(person);
  }
  return persons;
}
