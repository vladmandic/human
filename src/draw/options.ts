/** Draw Options
 * - Accessed via `human.draw.options` or provided per each draw method as the drawOptions optional parameter
 */

export interface DrawOptions {
  /** draw line color */
  color: string,
  /** alpha value used for lines */
  alpha: number,
  /** label color */
  labelColor: string,
  /** label shadow color */
  shadowColor: string,
  /** label font */
  font: string,
  /** line spacing between labels */
  lineHeight: number,
  /** line width for drawn lines */
  lineWidth: number,
  /** size of drawn points */
  pointSize: number,
  /** draw rounded boxes by n pixels */
  roundRect: number,
  /** should points be drawn? */
  drawPoints: boolean,
  /** should labels be drawn? */
  drawLabels: boolean,
  /** should face attention keypoints be highlighted */
  drawAttention: boolean;
  /** should detected gestures be drawn? */
  drawGestures: boolean,
  /** should draw boxes around detection results? */
  drawBoxes: boolean,
  /** should draw polygons from detection points? */
  drawPolygons: boolean,
  /** should draw gaze arrows? */
  drawGaze: boolean,
  /** should fill polygons? */
  fillPolygons: boolean,
  /** use z-coordinate when available */
  useDepth: boolean,
  /** should lines be curved? */
  useCurves: boolean,
  /** string template for face labels */
  faceLabels: string,
  /** string template for body labels */
  bodyLabels: string,
  /** string template for body part labels */
  bodyPartLabels: string,
  /** string template for hand labels */
  handLabels: string,
  /** string template for hand labels */
  fingerLabels: string,
  /** string template for object labels */
  objectLabels: string,
  /** string template for gesture labels */
  gestureLabels: string,
}

/** currently set draw options {@link DrawOptions} */
export const options: DrawOptions = {
  color: 'rgba(173, 216, 230, 0.6)' as string, // 'lightblue' with light alpha channel
  labelColor: 'rgba(173, 216, 230, 1)' as string, // 'lightblue' with dark alpha channel
  shadowColor: 'black' as string,
  alpha: 0.5 as number,
  font: 'small-caps 16px "Segoe UI"' as string,
  lineHeight: 18 as number,
  lineWidth: 4 as number,
  pointSize: 2 as number,
  roundRect: 8 as number,
  drawPoints: false as boolean,
  drawLabels: true as boolean,
  drawBoxes: true as boolean,
  drawAttention: true as boolean,
  drawGestures: true as boolean,
  drawPolygons: true as boolean,
  drawGaze: true as boolean,
  fillPolygons: false as boolean,
  useDepth: true as boolean,
  useCurves: false as boolean,
  faceLabels: '' as string,
  bodyLabels: '' as string,
  bodyPartLabels: '' as string,
  objectLabels: '' as string,
  handLabels: '' as string,
  fingerLabels: '' as string,
  gestureLabels: '' as string,
};
