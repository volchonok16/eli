import { useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useRef } from 'react';

export const useParallax = (speed: number = 0.5): { ref: React.RefObject<HTMLDivElement | null>; y: MotionValue<number> } => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, speed * -300]);
  return { ref, y };
};

export const useScaleReveal = (): { ref: React.RefObject<HTMLDivElement | null>; scale: MotionValue<number>; opacity: MotionValue<number> } => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  });
  const scale = useTransform(scrollYProgress, [0, 0.6, 1], [0.85, 0.98, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.4, 1], [0, 0.6, 1]);
  return { ref, scale, opacity };
};
