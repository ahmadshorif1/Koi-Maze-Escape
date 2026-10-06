import { GameSettings, InputVector } from './types';

export class SensorManager {
  private currentInput: InputVector = { x: 0, y: 0 };
  private rawInput: InputVector = { x: 0, y: 0 };
  private keyboardInput: InputVector = { x: 0, y: 0 };
  private touchInput: InputVector = { x: 0, y: 0 };

  // Calibration neutral angles
  private neutralBeta = 0; // Pitch (front/back tilt)
  private neutralGamma = 0; // Roll (left/right tilt)
  private calibrated = false;

  // Sensor state
  private isMotionSupported = false;
  private isPermissionGranted = false;
  private activeDeviceOrientation = false;

  // Sensitivity maps
  private sensitivityMap = {
    LOW: 0.6,
    MEDIUM: 1.0,
    HIGH: 1.5,
  };

  // Dead zone threshold in degrees
  private deadZoneDegrees = 3.0;

  // Shake detection
  private lastAccelX = 0;
  private lastAccelY = 0;
  private lastAccelZ = 0;
  private lastShakeTime = 0;
  private onShakeCallback?: () => void;

  // Keyboard keys active
  private keysPressed = new Set<string>();

  constructor() {
    this.checkSupport();
    this.initKeyboardListeners();
  }

  public checkSupport(): boolean {
    this.isMotionSupported = typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;
    return this.isMotionSupported;
  }

  public async requestMotionPermission(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // Check iOS 13+ permission request requirement
    const DeviceOrientation = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
    };

    if (typeof DeviceOrientation?.requestPermission === 'function') {
      try {
        const response = await DeviceOrientation.requestPermission();
        if (response === 'granted') {
          this.isPermissionGranted = true;
          this.startMotionListeners();
          return true;
        } else {
          this.isPermissionGranted = false;
          return false;
        }
      } catch (err) {
        console.warn('DeviceOrientation permission error:', err);
        this.isPermissionGranted = false;
        return false;
      }
    } else if (this.isMotionSupported) {
      // Android / standard desktop / older browsers don't require permission call
      this.isPermissionGranted = true;
      this.startMotionListeners();
      return true;
    }

    return false;
  }

  public startMotionListeners() {
    if (typeof window === 'undefined') return;

    window.removeEventListener('deviceorientation', this.handleOrientation);
    window.addEventListener('deviceorientation', this.handleOrientation, true);

    window.removeEventListener('devicemotion', this.handleMotion);
    window.addEventListener('devicemotion', this.handleMotion, true);
  }

  public stopMotionListeners() {
    if (typeof window === 'undefined') return;
    window.removeEventListener('deviceorientation', this.handleOrientation);
    window.removeEventListener('devicemotion', this.handleMotion);
    this.activeDeviceOrientation = false;
  }

  public setOnShake(cb: () => void) {
    this.onShakeCallback = cb;
  }

  public calibrate(currentBeta?: number, currentGamma?: number) {
    if (currentBeta !== undefined && currentGamma !== undefined) {
      this.neutralBeta = currentBeta;
      this.neutralGamma = currentGamma;
    } else {
      // Use current raw orientation
      this.neutralBeta = this.lastRawBeta;
      this.neutralGamma = this.lastRawGamma;
    }
    this.calibrated = true;
  }

  private lastRawBeta = 0;
  private lastRawGamma = 0;

  private handleOrientation = (e: DeviceOrientationEvent) => {
    if (e.beta === null || e.gamma === null) return;
    this.activeDeviceOrientation = true;

    this.lastRawBeta = e.beta;
    this.lastRawGamma = e.gamma;

    // If not calibrated yet, auto-calibrate initial angle on first reading
    if (!this.calibrated) {
      this.neutralBeta = e.beta;
      this.neutralGamma = e.gamma;
      this.calibrated = true;
    }

    let diffBeta = e.beta - this.neutralBeta; // Front (+ forward) / Back (- backward)
    let diffGamma = e.gamma - this.neutralGamma; // Right (+ right) / Left (- left)

    // Handle screen orientation variations (Portrait vs Landscape)
    const orientationAngle = (window.screen?.orientation?.angle) || 0;
    if (orientationAngle === 90) {
      // Landscape Left
      const temp = diffBeta;
      diffBeta = -diffGamma;
      diffGamma = temp;
    } else if (orientationAngle === -90 || orientationAngle === 270) {
      // Landscape Right
      const temp = diffBeta;
      diffBeta = diffGamma;
      diffGamma = -temp;
    }

    // Apply dead zone filtering
    if (Math.abs(diffGamma) < this.deadZoneDegrees) diffGamma = 0;
    if (Math.abs(diffBeta) < this.deadZoneDegrees) diffBeta = 0;

    // Map tilt angles (roughly 0 to 30 deg) to normalized range -1 to +1
    const maxTiltAngle = 25.0;

    let targetX = Math.max(-1, Math.min(1, diffGamma / maxTiltAngle));
    let targetY = Math.max(-1, Math.min(1, diffBeta / maxTiltAngle));

    this.rawInput = { x: targetX, y: targetY };
  };

  private handleMotion = (e: DeviceMotionEvent) => {
    if (!e.accelerationIncludingGravity) return;

    const { x, y, z } = e.accelerationIncludingGravity;
    if (x === null || y === null || z === null) return;

    const now = Date.now();
    if (now - this.lastShakeTime > 1000) {
      const deltaX = x - this.lastAccelX;
      const deltaY = y - this.lastAccelY;
      const deltaZ = z - this.lastAccelZ;

      const change = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
      if (change > 22) {
        // High acceleration spike detected
        this.lastShakeTime = now;
        if (this.onShakeCallback) {
          this.onShakeCallback();
        }
      }
    }

    this.lastAccelX = x;
    this.lastAccelY = y;
    this.lastAccelZ = z;
  };

  public setTouchInput(x: number, y: number) {
    this.touchInput = { x, y };
  }

  private initKeyboardListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k)) {
        this.keysPressed.add(k);
        this.updateKeyboardInput();
      }
    });

    window.addEventListener('keyup', (e) => {
      const k = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k)) {
        this.keysPressed.delete(k);
        this.updateKeyboardInput();
      }
    });
  }

  private updateKeyboardInput() {
    let kx = 0;
    let ky = 0;

    if (this.keysPressed.has('arrowleft') || this.keysPressed.has('a')) kx -= 1;
    if (this.keysPressed.has('arrowright') || this.keysPressed.has('d')) kx += 1;
    if (this.keysPressed.has('arrowup') || this.keysPressed.has('w')) ky -= 1;
    if (this.keysPressed.has('arrowdown') || this.keysPressed.has('s')) ky += 1;

    // Normalize diagonal keyboard speed
    const len = Math.sqrt(kx * kx + ky * ky);
    if (len > 0) {
      kx /= len;
      ky /= len;
    }

    this.keyboardInput = { x: kx, y: ky };
  }

  /**
   * Smoothly computes the active combined input vector based on current settings
   */
  public updateAndGetInput(settings: GameSettings, dt: number): InputVector {
    let targetX = 0;
    let targetY = 0;

    const sensMult = this.sensitivityMap[settings.sensitivity];

    // Combine active input sources according to control mode
    if (settings.controlMode === 'motion' || settings.controlMode === 'both') {
      targetX += this.rawInput.x * sensMult;
      targetY += this.rawInput.y * sensMult;
    }

    if (settings.controlMode === 'touch' || settings.controlMode === 'both') {
      targetX += this.touchInput.x;
      targetY += this.touchInput.y;
    }

    // Desktop keyboard input always works as a baseline
    targetX += this.keyboardInput.x;
    targetY += this.keyboardInput.y;

    // Clamp total magnitude to 1
    const totalMag = Math.sqrt(targetX * targetX + targetY * targetY);
    if (totalMag > 1) {
      targetX /= totalMag;
      targetY /= totalMag;
    }

    // Apply Invert toggles
    if (settings.invertX) targetX = -targetX;
    if (settings.invertY) targetY = -targetY;

    // Sensor Smoothing (LERP / Exponential interpolation)
    const lerpFactor = Math.min(1.0, dt * 14.0); // Smooth responsive follow
    this.currentInput.x += (targetX - this.currentInput.x) * lerpFactor;
    this.currentInput.y += (targetY - this.currentInput.y) * lerpFactor;

    return { ...this.currentInput };
  }

  public isMotionActive(): boolean {
    return this.activeDeviceOrientation && this.isPermissionGranted;
  }

  public getRawAngles() {
    return {
      beta: this.lastRawBeta,
      gamma: this.lastRawGamma,
      neutralBeta: this.neutralBeta,
      neutralGamma: this.neutralGamma,
    };
  }
}

export const sensorManager = new SensorManager();
