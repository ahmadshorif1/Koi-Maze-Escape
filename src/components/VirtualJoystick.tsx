import React, { useState, useRef, useCallback } from 'react';

interface VirtualJoystickProps {
  onMove: (x: number, y: number) => void;
  onEnd: () => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  onMove,
  onEnd,
}) => {
  const [active, setActive] = useState(false);
  const [basePos, setBasePos] = useState({ x: 0, y: 0 });
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });

  const maxRadius = 45;
  const joystickRef = useRef<HTMLDivElement | null>(null);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    setActive(true);
    setBasePos({ x: clientX, y: clientY });
    setStickPos({ x: clientX, y: clientY });
  }, []);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!active) return;

    let dx = clientX - basePos.x;
    let dy = clientY - basePos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    setStickPos({ x: basePos.x + dx, y: basePos.y + dy });

    // Send normalized vector (-1 to 1)
    onMove(dx / maxRadius, dy / maxRadius);
  }, [active, basePos, onMove]);

  const handleStop = useCallback(() => {
    setActive(false);
    onEnd();
  }, [onEnd]);

  return (
    <div
      ref={joystickRef}
      className="absolute inset-0 z-10 touch-none pointer-events-auto"
      onTouchStart={(e) => {
        if (e.touches.length > 0) {
          handleStart(e.touches[0].clientX, e.touches[0].clientY);
        }
      }}
      onTouchMove={(e) => {
        if (e.touches.length > 0) {
          handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      }}
      onTouchEnd={handleStop}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleStop}
    >
      {active && (
        <div
          className="fixed pointer-events-none -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-slate-900/60 border-2 border-teal-400/50 backdrop-blur-sm flex items-center justify-center z-30"
          style={{ left: basePos.x, top: basePos.y }}
        >
          {/* Inner Knob */}
          <div
            className="fixed pointer-events-none -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg border border-amber-200"
            style={{ left: stickPos.x, top: stickPos.y }}
          />
        </div>
      )}
    </div>
  );
};
