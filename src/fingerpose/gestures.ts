import { Finger, FingerCurl, FingerDirection } from './description';
import Gesture from './gesture';

// describe thumbs up gesture 👍
const ThumbsUp = new Gesture('thumbs up');
ThumbsUp.addCurl(Finger.thumb, FingerCurl.none, 1.0);
ThumbsUp.addDirection(Finger.thumb, FingerDirection.verticalUp, 1.0);
ThumbsUp.addDirection(Finger.thumb, FingerDirection.diagonalUpLeft, 0.25);
ThumbsUp.addDirection(Finger.thumb, FingerDirection.diagonalUpRight, 0.25);
for (const finger of [Finger.index, Finger.middle, Finger.ring, Finger.pinky]) {
  ThumbsUp.addCurl(finger, FingerCurl.full, 1.0);
  ThumbsUp.addDirection(finger, FingerDirection.horizontalLeft, 1.0);
  ThumbsUp.addDirection(finger, FingerDirection.horizontalRight, 1.0);
}

// describe Victory gesture ✌️
const Victory = new Gesture('victory');
Victory.addCurl(Finger.thumb, FingerCurl.half, 0.5);
Victory.addCurl(Finger.thumb, FingerCurl.none, 0.5);
Victory.addDirection(Finger.thumb, FingerDirection.verticalUp, 1.0);
Victory.addDirection(Finger.thumb, FingerDirection.diagonalUpLeft, 1.0);
Victory.addCurl(Finger.index, FingerCurl.none, 1.0);
Victory.addDirection(Finger.index, FingerDirection.verticalUp, 0.75);
Victory.addDirection(Finger.index, FingerDirection.diagonalUpLeft, 1.0);
Victory.addCurl(Finger.middle, FingerCurl.none, 1.0);
Victory.addDirection(Finger.middle, FingerDirection.verticalUp, 1.0);
Victory.addDirection(Finger.middle, FingerDirection.diagonalUpLeft, 0.75);
Victory.addCurl(Finger.ring, FingerCurl.full, 1.0);
Victory.addDirection(Finger.ring, FingerDirection.verticalUp, 0.2);
Victory.addDirection(Finger.ring, FingerDirection.diagonalUpLeft, 1.0);
Victory.addDirection(Finger.ring, FingerDirection.horizontalLeft, 0.2);
Victory.addCurl(Finger.pinky, FingerCurl.full, 1.0);
Victory.addDirection(Finger.pinky, FingerDirection.verticalUp, 0.2);
Victory.addDirection(Finger.pinky, FingerDirection.diagonalUpLeft, 1.0);
Victory.addDirection(Finger.pinky, FingerDirection.horizontalLeft, 0.2);
Victory.setWeight(Finger.index, 2);
Victory.setWeight(Finger.middle, 2);

export default [ThumbsUp, Victory];
