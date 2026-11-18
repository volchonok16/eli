import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import styles from './HeroSection.module.css';

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
      className={styles.hero}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_35%,rgba(186,213,195,0.18),transparent_60%),radial-gradient(ellipse_at_25%_80%,rgba(28,62,51,0.03),transparent_55%)]" />

      <motion.div
        style={{ scale: bgScale }}
        className={styles.image}
      >
        <div className="absolute inset-0">
          <img
            src="/images/photos/snow-covered-premium-fir.png"
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true"
            loading="eager"
          />
        </div>
        <div className={styles.imageBlend} />
      </motion.div>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className={styles.content}
      >
        <div className={styles.contentInner}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="text-xs sm:text-sm text-text-muted/70 uppercase tracking-[0.25em] mb-4 sm:mb-6 font-medium">
              Коллекция зима 2026–2027
            </p>
          </motion.div>

          <h1 className="mb-4 sm:mb-6">
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <span className={`${styles.display} block font-display text-primary tracking-tight`}>
                Элитные
              </span>
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <span className={`${styles.display} block font-display text-primary tracking-tight`}>
                ёлки
              </span>
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <span className={`${styles.display} block font-display text-accent italic tracking-tight`}>
                для вашего праздника
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
            className={`${styles.description} mb-6 text-text-muted/90 sm:mb-10`}
          >
            Новогодняя традиция в её самом красивом воплощении.
            <br className="hidden sm:block" />
            Выберите размер, а об остальном позаботимся мы.
            <br className="hidden sm:block" />
            Бережная доставка по Москве и области.
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
              to="/bases"
              className="text-sm sm:text-base text-text-muted hover:text-primary transition-colors border-b border-transparent hover:border-primary/30 pb-1"
            >
              Наши базары
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            className="flex items-center gap-6 sm:gap-12 mt-10 sm:mt-16"
          >
            {[
              ['2800+', 'ёлок продано'],
              ['3 года', 'на рынке'],
              ['от 2 часов', 'доставка до дома'],
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
