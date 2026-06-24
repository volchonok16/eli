import { motion } from 'framer-motion';

interface TrustBadgeProps {
  label: string;
  value: string;
  index: number;
}

export const TrustBadge = ({ label, value, index }: TrustBadgeProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className="text-center px-4"
  >
    <p className="font-serif text-3xl md:text-4xl text-accent mb-1">{value}</p>
    <p className="text-sm text-text-muted">{label}</p>
  </motion.div>
);
