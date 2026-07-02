import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const contentY = useTransform(scrollYProgress, [0, 0.6], ['0%', '-8%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7], [1, 0.7, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100vh] flex flex-col lg:flex-row overflow-hidden bg-surface-dark"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_35%,rgba(202,138,4,0.04),transparent_60%),radial-gradient(ellipse_at_25%_80%,rgba(28,25,23,0.02),transparent_55%)] pointer-events-none" />

      <motion.div
        style={{ scale: bgScale }}
        className="relative w-full lg:absolute lg:right-0 lg:top-0 lg:bottom-0 lg:w-[55%] h-[50vh] lg:h-full shrink-0"
      >
        <div className="absolute inset-0 lg:left-24">
          <img
            src="/images/photos/snow-covered-premium-fir.png"
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true"
            loading="eager"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-surface-dark/30 via-transparent to-surface-dark lg:bg-gradient-to-r lg:from-surface-dark/98 lg:via-surface-dark/45 lg:to-transparent" />
      </motion.div>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 flex items-center w-full lg:absolute lg:inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-28"
      >
        <div className="max-w-xl lg:max-w-[34rem]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="text-xs sm:text-sm text-text-muted/70 uppercase tracking-[0.25em] mb-4 sm:mb-6 font-medium">
              Коллекция 2026
            </p>
          </motion.div>

          <h1 className="mb-4 sm:mb-6">
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <span className="block font-display text-4xl sm:text-7xl md:text-8xl text-primary leading-[0.92] tracking-tight">
                Элитные
              </span>
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <span className="block font-display text-4xl sm:text-7xl md:text-8xl text-primary leading-[0.92] tracking-tight">
                ели
              </span>
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <span className="block font-display text-4xl sm:text-7xl md:text-8xl text-accent italic leading-[0.92] tracking-tight">
                для вашего сада
              </span>
            </motion.span>
          </h1>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-16 h-px bg-accent/40 mb-5 sm:mb-8 origin-left"
          />

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3, ease: 'easeOut' }}
            className="text-sm sm:text-lg text-text-muted/90 mb-6 sm:mb-10 max-w-md leading-relaxed"
          >
            Премиальные хвойные деревья из европейских питомников.
            <br className="hidden sm:block" />
            Персональный подбор, бережная доставка, гарантия качества.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.5 }}
            className="flex flex-wrap items-center gap-3 sm:gap-6"
          >
            <Link
              to="/catalog"
              className="btn-primary text-sm sm:text-base px-6 sm:px-10 py-3 sm:py-4"
            >
              Смотреть каталог
            </Link>
            <Link
              to="/about"
              className="text-sm sm:text-base text-text-muted hover:text-primary transition-colors border-b border-transparent hover:border-primary/30 pb-1"
            >
              О компании
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            className="flex items-center gap-6 sm:gap-12 mt-10 sm:mt-16"
          >
            {[
              ['500+', 'довольных клиентов'],
              ['15 лет', 'опыта и экспертизы'],
              ['98%', 'приживаемость'],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="font-display text-lg sm:text-2xl text-primary">{value}</p>
                <p className="text-[10px] sm:text-sm text-text-muted/70 sm:text-text-muted/80 mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
