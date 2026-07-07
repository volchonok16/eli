import { type FC } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";

interface DotProps {
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}

export const Dot: FC<DotProps> = ({ index, total, scrollYProgress }) => {
  const start = index / total;
  const end = (index + 1) / total;
  const bgColor = useTransform(scrollYProgress, [start, end], ["rgba(255,255,255,0.12)", "rgba(202,138,4,0.9)"]);
  const width = useTransform(scrollYProgress, [start, end], [6, 24]);
  return <motion.div style={{ backgroundColor: bgColor, width }} className="h-1.5 sm:h-2 rounded-full" />;
};
