import { Face, Body, Hand, Gesture, Person } from './result';

export function join(faces: Array<Face>, bodies: Array<Body>, hands: Array<Hand>, gestures: Array<Gesture>): Array<Person> {
  let id = 0;
  const persons: Array<Person> = [];
  for (const face of faces) { // person is defined primarily by face and then we append other objects as found
    const person: Person = { id: id++, face, body: null, hands: { left: null, right: null }, gestures: [], box: [0, 0, 0, 0] };
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
    person.box = [ // this is incorrect as should be a caclulated value
      Math.min(person.face?.box[0] || Number.MAX_SAFE_INTEGER, person.body?.box[0] || Number.MAX_SAFE_INTEGER, person.hands?.left?.box[0] || Number.MAX_SAFE_INTEGER, person.hands?.right?.box[0] || Number.MAX_SAFE_INTEGER),
      Math.min(person.face?.box[1] || Number.MAX_SAFE_INTEGER, person.body?.box[1] || Number.MAX_SAFE_INTEGER, person.hands?.left?.box[1] || Number.MAX_SAFE_INTEGER, person.hands?.right?.box[1] || Number.MAX_SAFE_INTEGER),
      Math.max(person.face?.box[2] || 0, person.body?.box[2] || 0, person.hands?.left?.box[2] || 0, person.hands?.right?.box[2] || 0),
      Math.max(person.face?.box[3] || 0, person.body?.box[3] || 0, person.hands?.left?.box[3] || 0, person.hands?.right?.box[3] || 0),
    ];
    persons.push(person);
  }
  return persons;
}
