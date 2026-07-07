import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { use3DTilt } from '@/shared/hooks/use3DTilt';
import { resolveProductImage } from '@/shared/utils/mediaUrl';
import type { ProductImage } from '@/api/endpoints/products';

interface ProductCardProps {
  id: string;
  name: string;
  sort: string | null;
  heightLabel: string | null;
  price: number;
  images: ProductImage[];
  index: number;
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const formatPrice = (v: number) => `от ${v.toLocaleString()} ₽`;

export const ProductCard = ({ id, name, sort, heightLabel, price, images, index }: ProductCardProps) => {
  const { values, handleMouseMove, handleMouseLeave } = use3DTilt(6);
  const image = resolveProductImage(images?.[0]);

  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={fadeUp}
      transition={{ duration: 0.45, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(800px) rotateX(${values.rotateX}deg) rotateY(${values.rotateY}deg) scale(${values.scale})`,
        boxShadow: values.isHovered
          ? `${values.shadowX}px ${values.shadowY}px 40px rgba(28, 25, 23, 0.12)`
          : 'none',
      }}
      className="card group cursor-pointer transition-shadow duration-300 origin-center"
    >
      <Link to={`/product/${id}`} className="block">
        <div className="aspect-[4/5] bg-surface-dark flex items-center justify-center overflow-hidden relative">
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-primary/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ scale: values.isHovered ? 1.05 : 1 }}
          />
          {image ? (
            <motion.img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
              loading="lazy"
              style={{ scale: values.isHovered ? 1.08 : 1 }}
              transition={{ duration: 0.6 }}
            />
          ) : (
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor" className="w-16 h-16 text-primary/10 group-hover:text-accent/20 transition-colors duration-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25M4.5 2.25h15M5.25 3v1.5M18.75 3v1.5M3 12.75h18M5.25 20.25h13.5M8.25 15.75L12 12l3.75 3.75" />
              </svg>
              <span className="block text-text-muted/20 text-xs mt-2 font-sans">ELI</span>
            </div>
          )}
        </div>
        <div className="p-6">
          {sort && (
            <p className="text-xs text-text-muted/50 uppercase tracking-widest mb-2 font-medium">{sort}</p>
          )}
          <h3 className="font-serif text-xl text-primary mb-2 group-hover:text-accent transition-colors duration-300 leading-tight">
            {name}
          </h3>
          {heightLabel && (
            <p className="text-text-muted text-sm mb-4">{heightLabel} м</p>
          )}
          <p className="font-sans text-xl text-accent font-semibold">{formatPrice(price)}</p>
        </div>
      </Link>
    </motion.article>
  );
};
