import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const HeroTitle = () => (
  <motion.span>
    {'Элитные ели'.split('').map((char, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0, y: 40, rotateX: -60 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.2 + i * 0.05,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="inline-block"
        style={char === ' ' ? { width: '0.25em' } : undefined}
      >
        {char}
      </motion.span>
    ))}
  </motion.span>
);

export const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const imgParallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  return (
    <section ref={sectionRef} className="relative min-h-[100vh] flex items-center bg-surface overflow-hidden">
      <motion.div className="absolute inset-0 bg-surface-dark" style={{ y: bgY }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(202,138,4,0.05),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(28,25,23,0.04),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.04]">
          <img src="/images/hero-forest.svg" alt="" className="w-full h-full object-cover scale-110" aria-hidden="true" />
        </div>
      </motion.div>

      <div className="absolute top-20 sm:top-32 right-0 w-64 sm:w-[30rem] h-64 sm:h-[30rem] bg-accent/[0.03] rounded-full blur-3xl" />
      <div className="absolute bottom-16 sm:bottom-32 left-0 sm:left-10 w-48 sm:w-[24rem] h-48 sm:h-[24rem] bg-primary/[0.04] rounded-full blur-3xl" />

      <motion.div
        style={{}}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full"
      >
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="inline-flex items-center gap-3 px-4 py-2 border border-accent/20 bg-accent/[0.03] mb-8 origin-left"
            >
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-2 h-2 rounded-full bg-accent"
              />
              <span className="text-xs text-accent uppercase tracking-[0.2em] font-medium">
                Премиальная коллекция 2026
              </span>
            </motion.div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-primary leading-[0.95] mb-6 sm:mb-8 text-balance">
              <HeroTitle />
              <br />
              <motion.span
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.0, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-accent block"
              >
                для вашего
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-accent block italic"
              >
                сада
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.4, ease: 'easeOut' }}
              className="text-base sm:text-lg md:text-xl text-text-muted mb-8 sm:mb-10 max-w-lg leading-relaxed"
            >
              Создайте атмосферу вечной красоты и престижа с нашими хвойными деревьями.
              Индивидуальный подбор, бережная доставка и пожизненная гарантия качества.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.6 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <Link to="/catalog" className="btn-primary text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 text-center">
                Смотреть каталог
              </Link>
              <Link to="/about" className="btn-outline text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 text-center">
                О компании
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.8 }}
              className="flex items-center justify-center sm:justify-start gap-6 sm:gap-8 mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-surface-muted"
            >
              {[
                ['500+', 'клиентов'],
                ['15 лет', 'опыта'],
                ['98%', 'приживаемость'],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="font-display text-2xl text-primary">{value}</p>
                  <p className="text-xs text-text-muted">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: 15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="hidden lg:block relative perspective-[1200px]"
          >
            <motion.div
              animate={{ rotateY: [0, 1, -1, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="aspect-[3/4] bg-gradient-to-br from-surface-dark via-surface to-accent/[0.04] border border-surface-muted relative overflow-hidden"
            >
              <motion.div
                style={{ y: imgParallaxY }}
                className="absolute inset-0"
              >
                <img
                  src="/images/spruce-blue.svg"
                  alt="Ель голубая"
                  className="w-full h-full object-cover opacity-90"
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-surface/30 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <p className="font-display text-5xl text-primary font-bold italic opacity-8">Eli</p>
                <p className="text-xs text-primary/12 uppercase tracking-[0.3em] mt-1 font-medium">Premium Collection</p>
              </div>
            </motion.div>
            <div className="absolute -bottom-4 -right-4 w-full h-full border border-accent/8 -z-10" />
            <div className="absolute -bottom-8 -right-8 w-full h-full border border-accent/4 -z-20" />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-6 h-6 text-text-muted/20">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </motion.div>
    </section>
  );
};
