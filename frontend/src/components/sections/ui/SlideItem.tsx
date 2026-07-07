import { type FC } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import type { Slide } from "./types";

interface SlideItemProps {
  slide: Slide;
  index: number;
  slideHeight: number;
  scrollYProgress: MotionValue<number>;
}

export const SlideItem: FC<SlideItemProps> = ({ slide, index, slideHeight, scrollYProgress }) => {
  const start = index * slideHeight;
  const end = start + slideHeight;
  const opacity = useTransform(scrollYProgress, [start, start + slideHeight * 0.25, end - slideHeight * 0.2, end], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [start, start + slideHeight * 0.4, end], [0.95, 1, 0.97]);
  const imgScale = useTransform(scrollYProgress, [start, start + slideHeight * 0.5, end], [1.1, 1, 0.92]);
  const contentY = useTransform(scrollYProgress, [start, start + slideHeight * 0.25], [40, 0]);
  const contentOpacity = useTransform(scrollYProgress, [start, start + slideHeight * 0.2], [0, 1]);

  return (
    <motion.div style={{ opacity, scale }} className="absolute inset-0 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 sm:py-0">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-16 items-center">
          <motion.div style={{ y: contentY, opacity: contentOpacity }} className="order-2 lg:order-1 text-center lg:text-left">
            <p className="text-accent/70 text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-3 sm:mb-4 font-medium">0{index + 1} / Хит сезона</p>
            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl text-text-inverse mb-2 sm:mb-3">{slide.title}</h2>
            {slide.subtitle && <p className="text-text-inverse/40 text-xs sm:text-sm italic mb-4 sm:mb-6">{slide.subtitle}</p>}
            <p className="text-text-inverse/70 text-sm sm:text-lg leading-relaxed mb-6 sm:mb-8 max-w-md mx-auto lg:mx-0">{slide.description}</p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-4 mb-6 sm:mb-8">
              {slide.stats.map((stat) => (
                <span key={stat} className="px-3 py-1.5 sm:px-4 sm:py-2 border border-text-inverse/10 text-text-inverse/60 text-xs sm:text-sm">{stat}</span>
              ))}
            </div>
            {slide.id ? (
              <a href={`/product/${slide.id}`} className="inline-block border-b-2 border-accent text-accent text-sm font-medium pb-1 transition-all hover:border-accent-light hover:text-accent-light">Подробнее →</a>
            ) : (
              <a href="/catalog" className="inline-block border-b-2 border-accent text-accent text-sm font-medium pb-1 transition-all hover:border-accent-light hover:text-accent-light">Все характеристики →</a>
            )}
          </motion.div>
          <motion.div style={{ scale: imgScale }} className="order-1 lg:order-2 flex items-center justify-center">
            <div className="relative w-48 h-64 sm:w-64 sm:h-80 lg:w-full lg:max-w-sm lg:aspect-[3/4]">
              <motion.div animate={{ rotateY: [0, 2, -2, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} className="w-full h-full">
                <img src={slide.image} alt={slide.title} className="w-full h-full object-contain drop-shadow-2xl" loading="lazy" />
              </motion.div>
              <div className="absolute -inset-4 sm:-inset-8 bg-accent/[0.03] blur-3xl rounded-full -z-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
