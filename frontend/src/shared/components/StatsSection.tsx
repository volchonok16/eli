import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

interface RingProps {
  progress: number;
  size: number;
  strokeWidth: number;
  label: string;
  suffix: string;
  maxValue: number;
}

const AnimatedRing = ({ progress, size, strokeWidth, label, suffix, maxValue }: RingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState('0');
  useEffect(() => {
    const unsub = rounded.on('change', (v) => setDisplay(String(v)));
    return unsub;
  }, [rounded]);

  useEffect(() => {
    count.set(progress);
  }, [count, progress]);

  const strokeDashoffset = useTransform(count, [0, maxValue], [circumference, 0]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center"
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#CA8A04"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl md:text-3xl text-accent">{display}{suffix}</span>
        </div>
      </div>
      <p className="text-text-inverse/50 text-xs mt-3 text-center">{label}</p>
    </motion.div>
  );
};

interface Stat {
  value: number;
  maxValue: number;
  suffix: string;
  label: string;
}

const defaultStats: Stat[] = [
  { value: 98, maxValue: 100, suffix: '%', label: 'Приживаемость' },
  { value: 15, maxValue: 15, suffix: '+', label: 'Лет опыта' },
  { value: 10000, maxValue: 10000, suffix: '+', label: 'Елей посажено' },
  { value: 500, maxValue: 500, suffix: '+', label: 'Довольных клиентов' },
];

interface StatsSectionProps {
  items?: Stat[];
}

export const StatsSection = ({ items = defaultStats }: StatsSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.3 },
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-4xl mx-auto">
      {items.map((stat, index) => (
        <AnimatedRing
          key={index}
          progress={inView ? stat.value : 0}
          maxValue={stat.maxValue}
          size={110}
          strokeWidth={4}
          label={stat.label}
          suffix={stat.suffix}
        />
      ))}
    </div>
  );
};
