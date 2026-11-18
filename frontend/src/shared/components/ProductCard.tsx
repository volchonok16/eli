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
      className="card group cursor-pointer transition-shadow duration-300 origin-center"
    >
      <Link to={`/product/${id}`} className="block">
          <div className="relative mx-[10px] mt-[10px] flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[15px] border border-[#afc4b37a] bg-[radial-gradient(ellipse_at_50%_35%,#fcfdf7,#e5e9da)]">
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-primary/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ scale: values.isHovered ? 1.05 : 1 }}
          />
          {image ? (
            <motion.img
              src={image}
              alt={name}
              className="h-full w-full object-contain"
              loading="lazy"
              style={{ scale: values.isHovered ? 1.035 : 1 }}
              transition={{ duration: 0.7, ease: [0.2, 0.65, 0.2, 1] }}
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
        <div className="flex h-full min-h-[260px] flex-col px-6 py-[21px]">
          {sort && (
            <p className="text-xs text-text-muted/50 uppercase tracking-widest mb-2 font-medium">{sort}</p>
          )}
          <h3 className="mb-2 min-h-[62px] font-serif text-[29px] leading-[1.08] tracking-[-0.025em] text-[#1a4432] group-hover:text-accent transition-colors duration-300">
            {name}
          </h3>
          {heightLabel && (
            <p className="mb-4 text-xs text-[#516b59]">{heightLabel} м</p>
          )}
          <p className="mt-auto pt-[18px] font-sans text-[21px] font-semibold tracking-[-0.035em] text-[#174b36]">{formatPrice(price)}</p>
        </div>
      </Link>
    </motion.article>
  );
};
