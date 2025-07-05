import React, { useRef, useState } from 'react';

interface KnobProps {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  size?: number;
}

export default function Knob({
  min,
  max,
  value,
  onChange,
  size = 60,
}: KnobProps) {
  const radius = size / 2;
  const center = { x: radius, y: radius };
  const [isDragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const angle = (value - min) / (max - min) * 270 - 135;

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseUp = () => {
    setDragging(false);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = e.clientX - cx;
    const dy = cy - e.clientY; // inverted Y for canvas coordinates
    let theta = Math.atan2(dy, dx) * (180 / Math.PI); // in degrees
    theta = ((theta + 360) % 360); // normalize

    // Clamp angle between 135 and 405 (270 degrees total)
    const clamped = Math.min(Math.max(theta, 135), 405);
    const newValue = min + ((clamped - 135) / 270) * (max - min);
    onChange(parseFloat(newValue.toFixed(2)));
  };

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      onMouseDown={handleMouseDown}
      style={{ cursor: 'pointer' }}
    >
      <circle cx={center.x} cy={center.y} r={radius - 5} fill="#444" />
      <line
        x1={center.x}
        y1={center.y}
        x2={center.x + (radius - 10) * Math.cos((angle * Math.PI) / 180)}
        y2={center.y - (radius - 10) * Math.sin((angle * Math.PI) / 180)}
        stroke="#bd7d45"
        strokeWidth={4}
        strokeLinecap="round"
      />
    </svg>
  );
}
