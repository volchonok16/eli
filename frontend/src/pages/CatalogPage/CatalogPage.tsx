import { motion } from 'framer-motion';
import { use3DTilt } from '@/shared/hooks/use3DTilt';

const products = [
  { id: 1, name: 'Ель Голубая (Picea pungens)', height: '1.5 – 2.5 м', price: 'от 25 000 ₽', image: '/images/spruce-blue.svg' },
  { id: 2, name: 'Ель Обыкновенная (Picea abies)', height: '2.0 – 3.0 м', price: 'от 15 000 ₽', image: '/images/spruce-green.svg' },
  { id: 3, name: 'Ель Сербская (Picea omorika)', height: '1.8 – 2.8 м', price: 'от 28 000 ₽', image: '/images/spruce-serbian.svg' },
  { id: 4, name: 'Ель Коника (Picea glauca Conica)', height: '0.8 – 1.2 м', price: 'от 12 000 ₽', image: '/images/spruce-green.svg' },
  { id: 5, name: 'Ель Канадская (Picea glauca)', height: '2.5 – 4.0 м', price: 'от 35 000 ₽', image: '/images/spruce-green.svg' },
  { id: 6, name: 'Ель Колючая (Picea pungens Glauca)', height: '2.0 – 3.5 м', price: 'от 42 000 ₽', image: '/images/spruce-glauca.svg' },
];

const CatalogCard = ({ product, index }: { product: typeof products[0]; index: number }) => {
  const { values, handleMouseMove, handleMouseLeave } = use3DTilt(5);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(800px) rotateX(${values.rotateX}deg) rotateY(${values.rotateY}deg) scale(${values.scale})`,
        boxShadow: values.isHovered
          ? `${values.shadowX}px ${values.shadowY}px 30px rgba(28, 25, 23, 0.1)`
          : 'none',
      }}
      className="card group cursor-pointer transition-shadow duration-300 origin-center"
    >
      <div className="aspect-[4/3] bg-surface-dark flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="p-6">
        <h3 className="font-serif text-lg text-primary mb-2 group-hover:text-accent transition-colors leading-tight">
          {product.name}
        </h3>
        <p className="text-text-muted text-sm mb-3">Высота: {product.height}</p>
        <p className="font-sans text-xl text-accent font-semibold">{product.price}</p>
      </div>
    </motion.article>
  );
};

export const CatalogPage = () => (
  <div className="min-h-screen bg-surface">
    <section className="py-16 bg-surface-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display text-4xl md:text-5xl text-primary mb-4">Каталог елей</h1>
          <p className="text-text-muted text-lg max-w-xl">
            Коллекция премиальных хвойных деревьев для вашего ландшафта
          </p>
        </motion.div>
      </div>
    </section>

    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {products.map((product, index) => (
            <CatalogCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  </div>
);
