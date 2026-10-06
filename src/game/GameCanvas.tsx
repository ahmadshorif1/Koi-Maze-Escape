import React, { useEffect, useRef } from 'react';
import { KoiState, LevelConfig } from './types';
import { mazeGenerator } from './mazeGenerator';

interface GameCanvasProps {
  levelConfig: LevelConfig;
  koiState: KoiState;
  showHintPath: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  levelConfig,
  koiState,
  showHintPath,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particlePhase = 0;

    const render = () => {
      particlePhase += 0.015;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Logical game dimension 1000 x 1000 centered at (width/2, height/2)
      const minDim = Math.min(width, height);
      const scale = minDim / 920; // Fit circular board inside screen

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Render Aquatic Water Environment Background
      const waterGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        minDim * 0.65
      );
      waterGrad.addColorStop(0, levelConfig.waterColorTop);
      waterGrad.addColorStop(1, levelConfig.waterColorBottom);

      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, 0, width, height);

      // Water Caustics / Soft Waves
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const waveR = (minDim * 0.2 + (particlePhase * 30 + i * 80) % (minDim * 0.45));
        ctx.arc(centerX, centerY, waveR, 0, Math.PI * 2);
        ctx.lineWidth = 12;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.stroke();
      }

      // 2. Render Background Environmental Creature
      ctx.save();
      ctx.translate(centerX, centerY);

      renderBackgroundCreature(
        ctx,
        levelConfig.backgroundCreature,
        particlePhase,
        scale
      );

      // 3. Render Maze Geometry
      const maze = mazeGenerator.generateMaze(
        levelConfig.id,
        levelConfig.ringsCount,
        levelConfig.targetExit
      );

      // Render Concentric Arc Walls
      for (const wall of maze.arcWalls) {
        const ringR = (maze.innerRadius + wall.ringIndex * maze.ringWidth) * scale;

        ctx.beginPath();
        ctx.arc(0, 0, ringR, wall.startAngle, wall.endAngle);

        applyMazeMaterialStyle(ctx, levelConfig.mazeTheme, scale);
        ctx.stroke();
      }

      // Render Radial Spoke Walls
      for (const wall of maze.radialWalls) {
        const rInner = (maze.innerRadius + wall.ringIndex * maze.ringWidth) * scale;
        const rOuter = (rInner + maze.ringWidth * scale);

        ctx.beginPath();
        ctx.moveTo(Math.cos(wall.angle) * rInner, Math.sin(wall.angle) * rInner);
        ctx.lineTo(Math.cos(wall.angle) * rOuter, Math.sin(wall.angle) * rOuter);

        applyMazeMaterialStyle(ctx, levelConfig.mazeTheme, scale);
        ctx.stroke();
      }

      // 4. Render Numbered Exits 1 to 6 Around Outer Ring
      for (const exit of maze.exits) {
        const exitR = maze.outerRadius * scale + 15 * scale;
        const ex = Math.cos(exit.angle) * exitR;
        const ey = Math.sin(exit.angle) * exitR;

        const isTarget = exit.number === levelConfig.targetExit;

        // Glowing exit marker circle
        ctx.beginPath();
        ctx.arc(ex, ey, 22 * scale, 0, Math.PI * 2);

        if (isTarget) {
          ctx.fillStyle = '#f59e0b'; // Gold target exit
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 18 * scale;
        } else {
          ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
          ctx.shadowBlur = 0;
        }
        ctx.fill();

        ctx.lineWidth = isTarget ? 3.5 * scale : 2 * scale;
        ctx.strokeStyle = isTarget ? '#fef08a' : '#94a3b8';
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Exit Number Text
        ctx.fillStyle = isTarget ? '#0f172a' : '#f8fafc';
        ctx.font = `bold ${Math.round(18 * scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${exit.number}`, ex, ey);

        // Arrow or Target label for target exit
        if (isTarget) {
          ctx.fillStyle = '#fef08a';
          ctx.font = `bold ${Math.round(11 * scale)}px sans-serif`;
          ctx.fillText('TARGET', ex, ey - 30 * scale);
        }
      }

      // 5. Render Hint Path Ribbon if Active
      if (showHintPath) {
        const waypoints = mazeGenerator.getHintWaypoints(
          koiState.x,
          koiState.y,
          levelConfig.targetExit,
          maze
        );

        ctx.beginPath();
        waypoints.forEach((pt, idx) => {
          const wx = pt.x * scale;
          const wy = pt.y * scale;
          if (idx === 0) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        });

        ctx.lineWidth = 6 * scale;
        ctx.strokeStyle = '#38bdf8';
        ctx.setLineDash([12 * scale, 8 * scale]);
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12 * scale;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
      }

      // 6. Render Swimming Koi Fish Entity
      const kx = koiState.x * scale;
      const ky = koiState.y * scale;

      // Swim ripples trail
      ctx.beginPath();
      ctx.arc(kx, ky, 20 * scale, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2 * scale;
      ctx.stroke();

      ctx.save();
      ctx.translate(kx, ky);
      ctx.rotate(koiState.angle);

      // Multi-segment Koi rendering
      const tailWiggle = Math.sin(koiState.tailPhase) * 0.45;

      // Pectoral Fins
      ctx.fillStyle = 'rgba(251, 146, 60, 0.85)';
      ctx.beginPath();
      ctx.ellipse(-2 * scale, -10 * scale, 10 * scale, 4 * scale, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(-2 * scale, 10 * scale, 10 * scale, 4 * scale, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // Tail Fin (oscillating)
      ctx.save();
      ctx.translate(-14 * scale, 0);
      ctx.rotate(tailWiggle);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-12 * scale, -10 * scale, -22 * scale, -14 * scale);
      ctx.quadraticCurveTo(-16 * scale, 0, -22 * scale, 14 * scale);
      ctx.quadraticCurveTo(-12 * scale, 10 * scale, 0, 0);

      const tailGrad = ctx.createLinearGradient(0, 0, -22 * scale, 0);
      tailGrad.addColorStop(0, '#f97316');
      tailGrad.addColorStop(1, '#fef08a');
      ctx.fillStyle = tailGrad;
      ctx.fill();
      ctx.restore();

      // Main Koi Body Oval
      ctx.beginPath();
      ctx.ellipse(0, 0, 16 * scale, 10 * scale, 0, 0, Math.PI * 2);

      const bodyGrad = ctx.createRadialGradient(
        4 * scale,
        -3 * scale,
        2 * scale,
        0,
        0,
        16 * scale
      );
      bodyGrad.addColorStop(0, '#fed7aa');
      bodyGrad.addColorStop(0.4, '#f97316');
      bodyGrad.addColorStop(1, '#ea580c');

      ctx.fillStyle = bodyGrad;
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 8 * scale;
      ctx.fill();
      ctx.shadowBlur = 0;

      // White/Red Calico Scale Patches
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(2 * scale, -3 * scale, 5 * scale, 3 * scale, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Cute Eyes
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(10 * scale, -5 * scale, 2.2 * scale, 0, Math.PI * 2);
      ctx.arc(10 * scale, 5 * scale, 2.2 * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(10.8 * scale, -5.5 * scale, 0.8 * scale, 0, Math.PI * 2);
      ctx.arc(10.8 * scale, 5.5 * scale, 0.8 * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 7. Foreground Water Flora (Lotus blossoms / Lily pads around edge)
      renderForegroundFlora(ctx, particlePhase, minDim);

      ctx.restore();

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [levelConfig, koiState, showHintPath]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block touch-none pointer-events-auto"
    />
  );
};

function applyMazeMaterialStyle(
  ctx: CanvasRenderingContext2D,
  theme: string,
  scale: number
) {
  ctx.lineCap = 'round';

  switch (theme) {
    case 'wood':
    case 'ebony_wood':
    case 'maple_wood':
      ctx.lineWidth = 14 * scale;
      ctx.strokeStyle = theme === 'ebony_wood' ? '#331800' : '#78350f';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 6 * scale;
      break;
    case 'stone':
    case 'mossy_stone':
    case 'basalt':
      ctx.lineWidth = 16 * scale;
      ctx.strokeStyle = theme === 'mossy_stone' ? '#15803d' : '#475569';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 8 * scale;
      break;
    case 'crystal':
    case 'glowing_magic':
    case 'bioluminescent':
    case 'plasma':
      ctx.lineWidth = 12 * scale;
      ctx.strokeStyle = theme === 'bioluminescent' ? '#06b6d4' : '#e879f9';
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 14 * scale;
      break;
    case 'ice':
      ctx.lineWidth = 14 * scale;
      ctx.strokeStyle = '#bae6fd';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10 * scale;
      break;
    case 'coral':
      ctx.lineWidth = 16 * scale;
      ctx.strokeStyle = '#f43f5e';
      ctx.shadowColor = 'rgba(244, 63, 94, 0.4)';
      ctx.shadowBlur = 8 * scale;
      break;
    case 'temple_gold':
    case 'imperial_marble':
    case 'celestial':
      ctx.lineWidth = 15 * scale;
      ctx.strokeStyle = '#fbbf24';
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 12 * scale;
      break;
    default:
      ctx.lineWidth = 14 * scale;
      ctx.strokeStyle = '#d97706';
      ctx.shadowBlur = 4 * scale;
      break;
  }
}

function renderBackgroundCreature(
  ctx: CanvasRenderingContext2D,
  creature: string,
  phase: number,
  scale: number
) {
  ctx.save();
  const floatX = Math.cos(phase * 0.8) * 120 * scale;
  const floatY = Math.sin(phase * 0.6) * 120 * scale;

  ctx.translate(floatX, floatY);

  switch (creature) {
    case 'turtle': {
      // Cute swimming turtle
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(0, 0, 24 * scale, 18 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Flippers
      ctx.fillStyle = '#166534';
      const flipperWiggle = Math.sin(phase * 2) * 0.3;
      ctx.beginPath();
      ctx.arc(-16 * scale, -16 * scale, 8 * scale, 0, Math.PI * 2);
      ctx.arc(-16 * scale, 16 * scale, 8 * scale, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'frog': {
      // Frog sitting on lotus pad
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(0, 0, 16 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(-5 * scale, -5 * scale, 3 * scale, 0, Math.PI * 2);
      ctx.arc(5 * scale, -5 * scale, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'dragon':
    case 'ancient_dragon': {
      // Mystical dragon silhouette
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.4)';
      ctx.lineWidth = 6 * scale;
      ctx.beginPath();
      ctx.moveTo(-40 * scale, Math.sin(phase) * 10);
      ctx.quadraticCurveTo(0, Math.cos(phase) * 30, 40 * scale, Math.sin(phase) * 10);
      ctx.stroke();
      break;
    }
    default: {
      // Floating glowing spirit orb
      ctx.fillStyle = 'rgba(254, 240, 138, 0.6)';
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 15 * scale;
      ctx.beginPath();
      ctx.arc(0, 0, 10 * scale, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}

function renderForegroundFlora(
  ctx: CanvasRenderingContext2D,
  phase: number,
  minDim: number
) {
  // Render floating lotus leaves in corners
  ctx.save();
  ctx.fillStyle = 'rgba(22, 101, 52, 0.85)';

  const padRadius = minDim * 0.08;

  // Top Left Lily Pad
  ctx.beginPath();
  ctx.arc(-minDim * 0.4, -minDim * 0.4, padRadius, 0.2, Math.PI * 1.8);
  ctx.fill();

  // Bottom Right Lily Pad
  ctx.beginPath();
  ctx.arc(minDim * 0.4, minDim * 0.4, padRadius, 0.8, Math.PI * 2.4);
  ctx.fill();

  // Pink Lotus Flower
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(-minDim * 0.4, -minDim * 0.4, padRadius * 0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
