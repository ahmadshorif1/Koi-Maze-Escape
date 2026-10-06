import { InputVector, KoiState, LevelConfig } from './types';
import { mazeGenerator } from './mazeGenerator';
import { soundManager } from './audio';

export class KoiPhysics {
  private koi: KoiState = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    tailPhase: 0,
    speed: 0,
    radius: 14,
  };

  private movesCount = 0;
  private lastHeadingAngle = 0;
  private lastBumpTime = 0;

  public reset(startX = 0, startY = 0) {
    this.koi = {
      x: startX,
      y: startY,
      vx: 0,
      vy: 0,
      angle: 0,
      tailPhase: 0,
      speed: 0,
      radius: 14,
    };
    this.movesCount = 0;
    this.lastHeadingAngle = 0;
  }

  public update(
    input: InputVector,
    levelConfig: LevelConfig,
    dt: number,
    vibrationEnabled: boolean
  ): {
    state: KoiState;
    moves: number;
    exitReached: number | null; // number 1-6 if reached
  } {
    // Base swimming acceleration
    const accelBase = 1200 * levelConfig.playerSpeed;
    const friction = 0.88; // Swimming water drag

    let ax = input.x * accelBase;
    let ay = input.y * accelBase;

    // Apply optional water currents in higher levels
    if (levelConfig.waterCurrentSpeed) {
      ax += Math.cos(Date.now() * 0.001) * 150 * levelConfig.waterCurrentSpeed;
      ay += Math.sin(Date.now() * 0.001) * 150 * levelConfig.waterCurrentSpeed;
    }

    // Integrate velocity
    this.koi.vx = (this.koi.vx + ax * dt) * friction;
    this.koi.vy = (this.koi.vy + ay * dt) * friction;

    // Compute speed and heading angle
    this.koi.speed = Math.sqrt(this.koi.vx * this.koi.vx + this.koi.vy * this.koi.vy);

    if (this.koi.speed > 5) {
      const currentHeading = Math.atan2(this.koi.vy, this.koi.vx);

      // Track moves count on meaningful direction change (> 45 deg change)
      let angleDelta = Math.abs(currentHeading - this.lastHeadingAngle);
      if (angleDelta > Math.PI) angleDelta = 2 * Math.PI - angleDelta;

      if (angleDelta > Math.PI / 4) {
        this.movesCount++;
        this.lastHeadingAngle = currentHeading;
      }

      // Smooth heading angle interpolation
      let diff = currentHeading - this.koi.angle;
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;

      this.koi.angle += diff * Math.min(1.0, dt * 10);

      // Swimming tail wiggling phase speed proportional to swimming velocity
      this.koi.tailPhase += dt * (8 + this.koi.speed * 0.05);

      // Swim water ripple sound occasionally
      if (Math.random() < 0.08) {
        soundManager.playSwimRipple();
      }
    } else {
      // Idle tail gentle sway
      this.koi.tailPhase += dt * 3.0;
    }

    // Proposed new position
    let nextX = this.koi.x + this.koi.vx * dt;
    let nextY = this.koi.y + this.koi.vy * dt;

    // Resolve circular maze wall collisions
    const maze = mazeGenerator.generateMaze(levelConfig.id, levelConfig.ringsCount, levelConfig.targetExit);
    const colResult = mazeGenerator.resolveWallCollisions(nextX, nextY, this.koi.radius, maze);

    this.koi.x = colResult.x;
    this.koi.y = colResult.y;

    if (colResult.collided) {
      // Reduce velocity on wall impact
      this.koi.vx *= 0.4;
      this.koi.vy *= 0.4;

      const now = Date.now();
      if (now - this.lastBumpTime > 300) {
        this.lastBumpTime = now;
        soundManager.playWallBump();
        soundManager.triggerHaptic('light', vibrationEnabled);
      }
    }

    // Check Outer Exit Reached (1 to 6)
    let exitReached: number | null = null;
    const distFromCenter = Math.sqrt(this.koi.x * this.koi.x + this.koi.y * this.koi.y);

    if (distFromCenter >= maze.outerRadius - 5) {
      let currentAngle = Math.atan2(this.koi.y, this.koi.x);
      if (currentAngle < 0) currentAngle += 2 * Math.PI;

      for (const exitObj of maze.exits) {
        let diffA = Math.abs(currentAngle - exitObj.angle);
        if (diffA > Math.PI) diffA = 2 * Math.PI - diffA;

        if (diffA < 0.35) {
          exitReached = exitObj.number;
          break;
        }
      }
    }

    return {
      state: { ...this.koi },
      moves: this.movesCount,
      exitReached,
    };
  }

  public getKoi(): KoiState {
    return { ...this.koi };
  }
}

export const koiPhysics = new KoiPhysics();
