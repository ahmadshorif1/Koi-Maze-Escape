import { CircularMaze, WallArc, WallRadial } from './types';

export class MazeGenerator {
  /**
   * Generates a deterministic circular maze given a level index and rings count.
   */
  public generateMaze(
    levelId: number,
    ringsCount: number,
    targetExit: number
  ): CircularMaze {
    const innerRadius = 75;
    const outerRadius = 425;
    const ringWidth = (outerRadius - innerRadius) / ringsCount;

    const arcWalls: WallArc[] = [];
    const radialWalls: WallRadial[] = [];

    // Simple pseudo-random generator based on level seed
    let seed = levelId * 1337 + 42;
    const lcg = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    // Define 6 outer exit positions around outer perimeter (Exit 1 to 6)
    const exits = [1, 2, 3, 4, 5, 6].map((num) => {
      // Angle offset so exits are nicely distributed around the circle
      const angle = (num - 1) * ((2 * Math.PI) / 6) + Math.PI / 6;
      return { number: num, angle };
    });

    // Outer boundary ring (ring N) has 6 gate openings corresponding to the 6 exits
    const outerRingIndex = ringsCount;
    const exitGateWidth = 0.42; // radians opening per exit

    exits.forEach((exit) => {
      const startG = exit.angle - exitGateWidth / 2;
      const endG = exit.angle + exitGateWidth / 2;

      // Ensure arc angles are normalized [0, 2PI]
      const startNorm = (startG + 2 * Math.PI) % (2 * Math.PI);
      const endNorm = (endG + 2 * Math.PI) % (2 * Math.PI);

      // Arc wall exists around the outer ring EXCEPT at the exit gates
      // We fill the outer wall ring by adding arcs between consecutive gates
    });

    // Fill outer perimeter ring arcs between exit gates
    for (let i = 0; i < 6; i++) {
      const exit1 = exits[i];
      const exit2 = exits[(i + 1) % 6];

      const startArc = exit1.angle + exitGateWidth / 2;
      let endArc = exit2.angle - exitGateWidth / 2;
      if (endArc < startArc) endArc += 2 * Math.PI;

      arcWalls.push({
        ringIndex: outerRingIndex,
        startAngle: startArc,
        endAngle: endArc,
      });
    }

    // Generate concentric inner rings (rings 1 to N-1)
    for (let ring = 1; ring < ringsCount; ring++) {
      // Sectors per ring (e.g. 8 for ring 1, 12 for ring 2, 16 for ring 3...)
      const numSectors = 8 + ring * 4;
      const sectorAngle = (2 * Math.PI) / numSectors;

      // Create arc walls with opening gaps
      for (let s = 0; s < numSectors; s++) {
        const angleStart = s * sectorAngle;
        const angleEnd = (s + 1) * sectorAngle;

        // Deterministically leave opening gaps
        const roll = lcg();
        // Lower levels have more gaps; higher levels have tighter passages
        const gapProbability = Math.max(0.2, 0.45 - levelId * 0.012);

        if (roll > gapProbability) {
          arcWalls.push({
            ringIndex: ring,
            startAngle: angleStart,
            endAngle: angleEnd,
          });
        }
      }

      // Create radial spoke walls connecting ring k to ring k+1
      for (let s = 0; s < numSectors; s++) {
        const spokeAngle = s * sectorAngle + sectorAngle / 2;
        const roll = lcg();
        if (roll < 0.5) {
          radialWalls.push({
            ringIndex: ring,
            angle: spokeAngle,
          });
        }
      }
    }

    // Ensure central start pond boundary has clear openings
    // Ring 0 is start boundary (innerRadius)
    const centerOpeningAngle = exits.find((e) => e.number === targetExit)?.angle || 0;
    const numCenterOpenings = 4;
    for (let c = 0; c < numCenterOpenings; c++) {
      const angle = (c * (2 * Math.PI)) / numCenterOpenings;
      if (Math.abs(angle - centerOpeningAngle) > 0.5) {
        arcWalls.push({
          ringIndex: 0,
          startAngle: angle,
          endAngle: angle + Math.PI / 3,
        });
      }
    }

    return {
      ringsCount,
      innerRadius,
      outerRadius,
      ringWidth,
      arcWalls,
      radialWalls,
      exits,
      startPos: { x: 0, y: 0 },
    };
  }

  /**
   * Performs exact mathematical collision detection and wall sliding physics for the Koi circle.
   */
  public resolveWallCollisions(
    px: number,
    py: number,
    radius: number,
    maze: CircularMaze
  ): { x: number; y: number; collided: boolean } {
    let newX = px;
    let newY = py;
    let collided = false;

    const currentRadius = Math.sqrt(newX * newX + newY * newY);
    let currentAngle = Math.atan2(newY, newX);
    if (currentAngle < 0) currentAngle += 2 * Math.PI;

    // 1. Check Concentric Arc Walls
    for (const wall of maze.arcWalls) {
      const ringR = maze.innerRadius + wall.ringIndex * maze.ringWidth;

      // Distance from Koi center to concentric ring
      const distToRing = Math.abs(currentRadius - ringR);

      if (distToRing < radius) {
        // Check if koi angle falls within the arc wall
        let startA = wall.startAngle % (2 * Math.PI);
        let endA = wall.endAngle % (2 * Math.PI);

        let inArc = false;
        if (startA <= endA) {
          inArc = currentAngle >= startA && currentAngle <= endA;
        } else {
          // Wrap around 2PI
          inArc = currentAngle >= startA || currentAngle <= endA;
        }

        if (inArc) {
          collided = true;
          // Radial push back
          const pushDist = radius - distToRing;
          const radialFactor = currentRadius > ringR ? 1 : -1;
          const nx = currentRadius > 0 ? newX / currentRadius : 1;
          const ny = currentRadius > 0 ? newY / currentRadius : 0;

          newX += nx * pushDist * radialFactor;
          newY += ny * pushDist * radialFactor;
        }
      }
    }

    // 2. Check Radial Spoke Walls
    for (const wall of maze.radialWalls) {
      const rInner = maze.innerRadius + wall.ringIndex * maze.ringWidth;
      const rOuter = rInner + maze.ringWidth;

      // Spoke line segment from (rInner * cos(A), rInner * sin(A)) to (rOuter * cos(A), rOuter * sin(A))
      if (currentRadius >= rInner - radius && currentRadius <= rOuter + radius) {
        const wallA = wall.angle % (2 * Math.PI);
        let angleDiff = Math.abs(currentAngle - wallA);
        if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

        // Tangential distance to spoke line roughly r * angleDiff
        const tangentialDist = currentRadius * Math.sin(angleDiff);

        if (tangentialDist < radius) {
          collided = true;
          // Perpendicular push away from spoke line
          const pushDist = radius - tangentialDist;
          // Determine side of wall
          const perpAngle = wallA + (currentAngle > wallA ? Math.PI / 2 : -Math.PI / 2);

          newX += Math.cos(perpAngle) * pushDist * 0.8;
          newY += Math.sin(perpAngle) * pushDist * 0.8;
        }
      }
    }

    // 3. Keep within outer world boundary
    const maxBoundary = maze.outerRadius + 30;
    const distFromCenter = Math.sqrt(newX * newX + newY * newY);
    if (distFromCenter > maxBoundary) {
      newX = (newX / distFromCenter) * maxBoundary;
      newY = (newY / distFromCenter) * maxBoundary;
    }

    return { x: newX, y: newY, collided };
  }

  /**
   * Generates path waypoints from current koi position to target exit for the HINT system.
   */
  public getHintWaypoints(
    currentX: number,
    currentY: number,
    targetExitNumber: number,
    maze: CircularMaze
  ): { x: number; y: number }[] {
    const targetExitObj = maze.exits.find((e) => e.number === targetExitNumber);
    if (!targetExitObj) return [];

    const waypoints: { x: number; y: number }[] = [];
    waypoints.push({ x: currentX, y: currentY });

    // Waypoints outward through ring paths
    const startR = Math.sqrt(currentX * currentX + currentY * currentY);
    const startAngle = Math.atan2(currentY, currentX);

    const steps = 6;
    for (let i = 1; i <= steps; i++) {
      const frac = i / steps;
      const wayR = startR + (maze.outerRadius - startR) * frac;
      // Interpolate angle towards target exit angle
      let angleDiff = targetExitObj.angle - startAngle;
      while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

      const wayA = startAngle + angleDiff * frac;
      waypoints.push({
        x: Math.cos(wayA) * wayR,
        y: Math.sin(wayA) * wayR,
      });
    }

    return waypoints;
  }
}

export const mazeGenerator = new MazeGenerator();
