import { type FC } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Slide } from "./types";
import styles from '../CatalogSlider.module.css';

interface SlideItemProps {
  slide: Slide;
  index: number;
}

export const SlideItem: FC<SlideItemProps> = ({ slide, index }) => {
  return (
      <motion.div className={styles.slide}>
          <motion.div className={`${styles.copy} order-2 text-center lg:order-2 lg:text-left`}>
            <p className={`${styles.index} font-medium uppercase`}>0{index + 1} / ИЗБРАННОЕ</p>
            <h2 className={`${styles.title} mb-2 font-display sm:mb-3`}>{slide.title}</h2>
            {slide.subtitle && <p className="mb-4 text-xs italic text-text-muted sm:mb-6 sm:text-sm">{slide.subtitle}</p>}
            <p className="text-text-muted text-sm sm:text-lg leading-relaxed mb-6 sm:mb-8 max-w-md mx-auto lg:mx-0">{slide.description}</p>
            <div className={`${styles.facts} flex flex-wrap justify-center lg:justify-start`}>
              {slide.stats.map((stat) => (
                <span key={stat}>{stat}</span>
              ))}
            </div>
            <Link to={slide.id ? `/product/${slide.id}` : '/catalog'} className="btn-primary inline-flex items-center gap-4">
              Рассмотреть дерево <span aria-hidden="true">↗</span>
            </Link>
          </motion.div>
          <motion.div className="order-1 flex items-center justify-center lg:order-1">
            <div className={`${styles.photo} relative`}>
              <img
                src={slide.image}
                alt={slide.title}
                className={`${styles.photoImage} ${slide.image.endsWith('.svg') ? styles.illustration : ''}`}
                loading="lazy"
              />
              {slide.image.endsWith('.svg') && (
                <small className="absolute bottom-3 inset-x-4 text-center">Иллюстрация · фото товара не добавлено</small>
              )}
            </div>
          </motion.div>
      </motion.div>
  );
};
