import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const ScrollReveal = ({ children, className = '' }: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 0.5, 1], [60, 0, -30]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0.4]);
  const scale = useTransform(scrollYProgress, [0, 0.6, 1], [0.95, 1, 0.97]);

  return (
    <motion.div ref={ref} className={className} style={{ y, opacity, scale }}>
      {children}
    </motion.div>
  );
};

interface StaggerRevealProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const StaggerReveal = ({ children, className = '', staggerDelay = 0.08 }: StaggerRevealProps) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-80px' }}
    className={className}
  >
    {typeof children === 'string' ? (
      <span>
        {children.split('').map((char, i) => (
          <motion.span
            key={i}
            variants={{
              hidden: { opacity: 0, y: 20, rotateX: -90 },
              visible: {
                opacity: 1,
                y: 0,
                rotateX: 0,
                transition: { duration: 0.5, delay: staggerDelay * i, ease: [0.25, 0.46, 0.45, 0.94] },
              },
            }}
            className="inline-block"
            style={char === ' ' ? { width: '0.3em' } : undefined}
          >
            {char}
          </motion.span>
        ))}
      </span>
    ) : (
      children
    )}
  </motion.div>
);
