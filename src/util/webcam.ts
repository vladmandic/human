import { log } from './util';

// const log = (...msg) => console.log('webcam', ...msg); // eslint-disable-line no-console

/** WebCam configuration */
export interface WebCamConfig {
  /**
   * element can be:
   * - string which indicates dom element id
   * - actual HTMLVideo dom element
   * - undefined in which case a new HTMLVideoElement will be created
   */
  element: string | HTMLVideoElement | undefined,
  /** print messages on console */
  debug: boolean,
  /** use front or back camera */
  mode: 'front' | 'back',
  /** camera crop mode */
  crop: boolean,
  /** desired webcam width */
  width: number,
  /** desired webcam height */
  height: number,
  /** deviceId of the video device to use */
  id?: string,
}

export class WebCam { // eslint-disable-line @typescript-eslint/no-extraneous-class
  /** current webcam configuration */
  config: WebCamConfig;
  /** instance of dom element associated with webcam stream */
  element: HTMLVideoElement | undefined;
  /** active webcam stream */
  stream: MediaStream | undefined;
  /** enumerated video devices */
  devices: MediaDeviceInfo[] = [];

  constructor() {
    this.config = {
      element: undefined,
      debug: true,
      mode: 'front',
      crop: false,
      width: 0,
      height: 0,
    };
  }

  /** get active webcam stream track */
  public get track(): MediaStreamTrack | undefined {
    if (!this.stream) return undefined;
    return this.stream.getVideoTracks()[0];
  }

  /** get webcam capabilities */
  public get capabilities(): MediaTrackCapabilities | undefined {
    if (!this.track) return undefined;
    return this.track.getCapabilities ? this.track.getCapabilities() : undefined;
  }

  /** get webcam constraints */
  public get constraints(): MediaTrackConstraints | undefined {
    if (!this.track) return undefined;
    return this.track.getConstraints ? this.track.getConstraints() : undefined;
  }

  /** get webcam settings */
  public get settings(): MediaTrackSettings | undefined {
    if (!this.stream) return undefined;
    const track: MediaStreamTrack = this.stream.getVideoTracks()[0];
    return track.getSettings ? track.getSettings() : undefined;
  }

  /** get webcam label */
  public get label(): string {
    if (!this.track) return '';
    return this.track.label;
  }

  /** is webcam paused */
  public get paused(): boolean {
    return this.element?.paused || false;
  }

  /** webcam current width */
  public get width(): number {
    return this.element?.videoWidth || 0;
  }

  /** webcam current height */
  public get height(): number {
    return this.element?.videoHeight || 0;
  }

  public enumerate = async (): Promise<MediaDeviceInfo[]> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.devices = devices.filter((device) => device.kind === 'videoinput');
    } catch {
      this.devices = [];
    }
    return this.devices;
  };

  /** start method initializizes webcam stream and associates it with a dom video element */
  public start = async (webcamConfig?: Partial<WebCamConfig>): Promise<string> => {
    // set config
    if (webcamConfig?.debug) this.config.debug = webcamConfig?.debug;
    if (webcamConfig?.crop) this.config.crop = webcamConfig?.crop;
    if (webcamConfig?.mode) this.config.mode = webcamConfig?.mode;
    if (webcamConfig?.width) this.config.width = webcamConfig?.width;
    if (webcamConfig?.height) this.config.height = webcamConfig?.height;
    if (webcamConfig?.id) this.config.id = webcamConfig?.id;

    // use or create dom element
    if (webcamConfig?.element) {
      if (typeof webcamConfig.element === 'string') {
        const el = document.getElementById(webcamConfig.element);
        if (el && el instanceof HTMLVideoElement) {
          this.element = el;
        } else {
          if (this.config.debug) log('webcam', 'cannot get dom element', webcamConfig.element);
          return `webcam error: cannot get dom element: ${webcamConfig.element}`;
        }
      } else if (webcamConfig.element instanceof HTMLVideoElement) {
        this.element = webcamConfig.element;
      } else {
        if (this.config.debug) log('webcam', 'unknown dom element', webcamConfig.element);
        return `webcam error: unknown dom element: ${webcamConfig.element}`;
      }
    } else {
      this.element = document.createElement('video');
    }

    // set constraints to use
    const requestedConstraints: MediaStreamConstraints = {
      audio: false,
      video: {
        facingMode: this.config.mode === 'front' ? 'user' : 'environment',
        // @ts-ignore // resizeMode is still not defined in tslib
        resizeMode: this.config.crop ? 'crop-and-scale' : 'none',
      },
    };
    if (this.config?.width > 0) (requestedConstraints.video as MediaTrackConstraints).width = { ideal: this.config.width };
    if (this.config?.height > 0) (requestedConstraints.video as MediaTrackConstraints).height = { ideal: this.config.height };
    if (this.config.id) (requestedConstraints.video as MediaTrackConstraintSet).deviceId = this.config.id;

    // set default event listeners
    this.element.addEventListener('play', () => { if (this.config.debug) log('webcam', 'play'); });
    this.element.addEventListener('pause', () => { if (this.config.debug) log('webcam', 'pause'); });
    this.element.addEventListener('click', async () => { // pause when clicked on screen and resume on next click
      if (!this.element || !this.stream) return;
      if (this.element.paused) await this.element.play();
      else this.element.pause();
    });

    // get webcam and set it to run in dom element
    if (!navigator?.mediaDevices) {
      if (this.config.debug) log('webcam error', 'no devices');
      return 'webcam error: no devices';
    }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia(requestedConstraints); // get stream that satisfies constraints
    } catch (err) {
      log('webcam', err);
      return `webcam error: ${err}`;
    }
    if (!this.stream) {
      if (this.config.debug) log('webcam error', 'no stream');
      return 'webcam error no stream';
    }
    this.element.srcObject = this.stream; // assign it to dom element
    const ready = new Promise((resolve) => { // wait until stream is ready
      if (!this.element) resolve(false);
      else this.element.onloadeddata = () => resolve(true);
    });
    await ready;
    await this.element.play(); // start playing

    if (this.config.debug) {
      log('webcam', {
        width: this.width,
        height: this.height,
        label: this.label,
        stream: this.stream,
        track: this.track,
        settings: this.settings,
        constraints: this.constraints,
        capabilities: this.capabilities,
      });
    }
    return `webcam: ${this.label}`;
  };

  /** pause webcam video method */
  public pause = (): void => {
    if (this.element) this.element.pause();
  };

  /** play webcam video method */
  public play = async (): Promise<void> => {
    if (this.element) await this.element.play();
  };

  /** stop method stops active webcam stream track and disconnects webcam */
  public stop = (): void => {
    if (this.config.debug) log('webcam', 'stop');
    if (this.track) this.track.stop();
  };
}
