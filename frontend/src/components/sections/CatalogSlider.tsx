import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Slide {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  stats: string[];
}

const defaultSlides: Slide[] = [
  {
    title: 'Голубая ель',
    subtitle: 'Picea pungens',
    description: 'Благородный серебристо-голубой оттенок хвои. Идеальный выбор для парадной зоны участка. Вырастает до 15 метров, живёт более 100 лет.',
    image: '/images/spruce-blue.svg',
    stats: ['Высота: 1.5–2.5 м', 'Мороз: -40°C', 'Солнце'],
  },
  {
    title: 'Сербская ель',
    subtitle: 'Picea omorika',
    description: 'Узкая изящная крона с серебристой изнанкой хвои. Одна из самых быстрорастущих — до 50 см в год. Идеальна для аллей.',
    image: '/images/spruce-serbian.svg',
    stats: ['Высота: 1.8–2.8 м', 'Мороз: -35°C', 'Полутень'],
  },
  {
    title: 'Ель колючая',
    subtitle: 'Picea pungens Glauca',
    description: 'Самая яркая из голубых елей. Интенсивный сине-стальной цвет круглый год. Символ статуса в ландшафтном дизайне.',
    image: '/images/spruce-glauca.svg',
    stats: ['Высота: 2.0–3.5 м', 'Мороз: -45°C', 'Солнце'],
  },
];

interface StickyShowcaseProps {
  slides?: Slide[];
}

export const StickyShowcase = ({ slides = defaultSlides }: StickyShowcaseProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const totalSlides = slides.length;
  const slideHeight = 1 / totalSlides;

  return (
    <div ref={containerRef} className="relative bg-primary" style={{ height: `${totalSlides * 100}vh` }}>
      <div className="absolute inset-0 opacity-10">
        <img src="/images/photos/evening-winter-showcase.png" alt="" className="w-full h-full object-cover" aria-hidden="true" loading="lazy" />
      </div>
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        {slides.map((slide, i) => {
          const start = i * slideHeight;
          const end = start + slideHeight;

          const opacity = useTransform(scrollYProgress, [start, start + slideHeight * 0.25, end - slideHeight * 0.2, end], [0, 1, 1, 0]);
          const scale = useTransform(scrollYProgress, [start, start + slideHeight * 0.4, end], [0.95, 1, 0.97]);
          const imgScale = useTransform(scrollYProgress, [start, start + slideHeight * 0.5, end], [1.1, 1, 0.92]);
          const contentY = useTransform(scrollYProgress, [start, start + slideHeight * 0.25], [40, 0]);
          const contentOpacity = useTransform(scrollYProgress, [start, start + slideHeight * 0.2], [0, 1]);

          return (
            <motion.div
              key={i}
              style={{ opacity, scale }}
              className="absolute inset-0 flex items-center"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 sm:py-0">
                <div className="grid lg:grid-cols-2 gap-8 sm:gap-16 items-center">
                  <motion.div
                    style={{ y: contentY, opacity: contentOpacity }}
                    className="order-2 lg:order-1 text-center lg:text-left"
                  >
                    <p className="text-accent/70 text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-3 sm:mb-4 font-medium">
                      0{i + 1} / Премиальный сорт
                    </p>
                    <h2 className="font-display text-3xl sm:text-5xl md:text-6xl text-text-inverse mb-2 sm:mb-3">
                      {slide.title}
                    </h2>
                    <p className="text-text-inverse/40 text-xs sm:text-sm italic mb-4 sm:mb-6">{slide.subtitle}</p>
                    <p className="text-text-inverse/70 text-sm sm:text-lg leading-relaxed mb-6 sm:mb-8 max-w-md mx-auto lg:mx-0">
                      {slide.description}
                    </p>
                    <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-4 mb-6 sm:mb-8">
                      {slide.stats.map((stat) => (
                        <span key={stat} className="px-3 py-1.5 sm:px-4 sm:py-2 border border-text-inverse/10 text-text-inverse/60 text-xs sm:text-sm">
                          {stat}
                        </span>
                      ))}
                    </div>
                    <Link to="/catalog" className="inline-block border-b-2 border-accent text-accent text-sm font-medium pb-1 transition-all hover:border-accent-light hover:text-accent-light">
                      Все характеристики →
                    </Link>
                  </motion.div>

                  <motion.div
                    style={{ scale: imgScale }}
                    className="order-1 lg:order-2 flex items-center justify-center"
                  >
                    <div className="relative w-48 h-64 sm:w-64 sm:h-80 lg:w-full lg:max-w-sm lg:aspect-[3/4]">
                      <motion.div
                        animate={{ rotateY: [0, 2, -2, 0] }}
                        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-full h-full"
                      >
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-contain drop-shadow-2xl"
                          loading="lazy"
                        />
                      </motion.div>
                      <div className="absolute -inset-4 sm:-inset-8 bg-accent/[0.03] blur-3xl rounded-full -z-10" />
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}

        <div className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2 sm:gap-3 z-20">
          {slides.map((_, i) => {
            const start = i * slideHeight;
            const end = start + slideHeight;
            const bgColor = useTransform(scrollYProgress, [start, end], ['rgba(255,255,255,0.12)', 'rgba(202,138,4,0.9)']);
            const width = useTransform(scrollYProgress, [start, end], [6, 24]);
            return (
              <motion.div
                key={i}
                style={{ backgroundColor: bgColor, width }}
                className="h-1.5 sm:h-2 rounded-full"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
