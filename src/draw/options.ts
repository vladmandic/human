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
}

/** currently set draw options {@link DrawOptions} */
export const options: DrawOptions = {
  color: <string>'rgba(173, 216, 230, 0.6)', // 'lightblue' with light alpha channel
  labelColor: <string>'rgba(173, 216, 230, 1)', // 'lightblue' with dark alpha channel
  shadowColor: <string>'black',
  alpha: 0.5,
  font: <string>'small-caps 16px "Segoe UI"',
  lineHeight: <number>18,
  lineWidth: <number>4,
  pointSize: <number>2,
  roundRect: <number>8,
  drawPoints: <boolean>false,
  drawLabels: <boolean>true,
  drawBoxes: <boolean>true,
  drawAttention: <boolean>true,
  drawGestures: <boolean>true,
  drawPolygons: <boolean>true,
  drawGaze: <boolean>true,
  fillPolygons: <boolean>false,
  useDepth: <boolean>true,
  useCurves: <boolean>false,
};
