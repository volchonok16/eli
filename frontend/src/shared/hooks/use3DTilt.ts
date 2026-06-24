import { useState, useCallback, useRef } from 'react';
import type { MouseEvent } from 'react';

interface TiltValues {
  rotateX: number;
  rotateY: number;
  scale: number;
  shadowX: number;
  shadowY: number;
  isHovered: boolean;
}

export const use3DTilt = (intensity: number = 8) => {
  const [values, setValues] = useState<TiltValues>({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    shadowX: 0,
    shadowY: 0,
    isHovered: false,
  });
  const frameRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      setValues({
        rotateX: (y - 0.5) * -intensity,
        rotateY: (x - 0.5) * intensity,
        scale: 1.02,
        shadowX: (x - 0.5) * 20,
        shadowY: (y - 0.5) * 20,
        isHovered: true,
      });
    });
  }, [intensity]);

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    setValues({
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      shadowX: 0,
      shadowY: 0,
      isHovered: false,
    });
  }, []);

  return { values, handleMouseMove, handleMouseLeave };
};
