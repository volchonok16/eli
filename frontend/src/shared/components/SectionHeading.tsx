import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

interface SectionHeadingProps {
  title: string;
  subtitle: string;
  centered?: boolean;
  light?: boolean;
  display?: boolean;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const SectionHeading = ({ title, subtitle, centered = true, light = false, display = false }: SectionHeadingProps) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-80px' }}
    variants={fadeInUp}
    transition={{ duration: 0.6 }}
    className={`mb-16 ${centered ? 'text-center' : ''}`}
  >
    <h2 className={`text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 ${display ? 'font-display' : 'font-serif'} ${light ? 'text-text-inverse' : 'text-primary'}`}>
      {title}
    </h2>
    <p className={`text-base sm:text-lg max-w-2xl leading-relaxed ${centered ? 'mx-auto' : ''} ${light ? 'text-text-inverse/60' : 'text-text-muted'}`}>
      {subtitle}
    </p>
  </motion.div>
);

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card = ({ children, className = '', onClick }: CardProps) => (
  <div
    className={`card p-5 sm:p-6 lg:p-8 ${className}`}
    onClick={onClick}
    onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(); } : undefined}
    tabIndex={onClick ? 0 : undefined}
    role={onClick ? 'button' : undefined}
  >
    {children}
  </div>
);

interface IconBoxProps {
  icon: ReactNode;
  className?: string;
}

export const IconBox = ({ icon, className = '' }: IconBoxProps) => (
  <div className={`w-12 h-12 bg-accent/10 flex items-center justify-center mb-6 ${className}`}>
    {icon}
  </div>
);
