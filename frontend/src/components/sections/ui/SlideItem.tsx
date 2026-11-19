import { type FC } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { Link } from "react-router-dom";
import type { Slide } from "./types";
import styles from '../CatalogSlider.module.css';

interface SlideItemProps {
  slide: Slide;
  index: number;
  slidePosition: MotionValue<number>;
}

export const SlideItem: FC<SlideItemProps> = ({ slide, index, slidePosition }) => {
  const localPosition = useTransform(slidePosition, (position) => position - index);
  const revealOpacity = useTransform(localPosition, (position) => {
    if (position < 0) {
      const progress = Math.max(0, Math.min(1, (position + 0.45) / 0.45));
      return progress ** 6;
    }

    const progress = Math.max(0, Math.min(1, (position - 0.45) / 0.1));
    return (1 - progress) ** 6;
  });
  const copyX = useTransform(localPosition, [-1, -0.2, 0, 0.55, 1], [90, 24, 0, -28, -72]);
  const copyY = useTransform(localPosition, [-1, 0, 1], [22, 0, -12]);
  const photoX = useTransform(localPosition, [-1, -0.2, 0, 0.55, 1], [145, 36, 0, -42, -115]);
  const photoScale = useTransform(localPosition, [-1, 0, 1], [0.84, 1, 0.9]);
  const photoRotateY = useTransform(localPosition, [-1, 0, 1], [11, 0, -8]);
  const imageScale = useTransform(localPosition, [-1, 0, 1], [1.15, 1, 1.08]);
  const eyebrowOpacity = useTransform(localPosition, [-1, -0.72, -0.35, 0, 0.3, 0.72, 1], [0, 0, 1, 1, 0.8, 0, 0]);
  const eyebrowY = useTransform(localPosition, [-1, -0.3, 0, 1], [16, 5, 0, -8]);
  const titleOpacity = useTransform(localPosition, [-1, -0.58, -0.18, 0, 0.28, 0.7, 1], [0, 0, 1, 1, 0.8, 0, 0]);
  const titleY = useTransform(localPosition, [-1, -0.2, 0, 1], [26, 8, 0, -10]);
  const detailsOpacity = useTransform(localPosition, [-1, -0.4, -0.05, 0.15, 0.5, 0.82, 1], [0, 0, 1, 1, 0.75, 0, 0]);
  const detailsY = useTransform(localPosition, [-1, -0.05, 0, 1], [22, 6, 0, -8]);
  const actionOpacity = useTransform(localPosition, [-1, -0.2, 0.08, 0.28, 0.58, 0.86, 1], [0, 0, 1, 1, 0.65, 0, 0]);
  const actionY = useTransform(localPosition, [-1, 0.08, 0.28, 1], [20, 12, 0, -8]);

  return (
      <motion.div className={styles.slide}>
          <motion.div style={{ opacity: revealOpacity, x: copyX, y: copyY }} className={`${styles.copy} order-2 text-center lg:order-2 lg:text-left`}>
            <motion.p style={{ opacity: eyebrowOpacity, y: eyebrowY }} className={`${styles.index} font-medium uppercase`}>0{index + 1} / ИЗБРАННОЕ</motion.p>
            <motion.h2 style={{ opacity: titleOpacity, y: titleY }} className={`${styles.title} mb-2 font-display sm:mb-3`}>{slide.title}</motion.h2>
            <motion.div style={{ opacity: detailsOpacity, y: detailsY }}>
              {slide.subtitle && <p className="mb-4 text-xs italic text-text-muted sm:mb-6 sm:text-sm">{slide.subtitle}</p>}
              <p className="text-text-muted text-sm sm:text-lg leading-relaxed mb-6 sm:mb-8 max-w-md mx-auto lg:mx-0">{slide.description}</p>
            </motion.div>
            <motion.div style={{ opacity: detailsOpacity, y: detailsY }} className={`${styles.facts} flex flex-wrap justify-center lg:justify-start`}>
              {slide.stats.map((stat) => (
                <span key={stat}>{stat}</span>
              ))}
            </motion.div>
            <motion.div style={{ opacity: actionOpacity, y: actionY }}>
              <Link to={slide.id ? `/product/${slide.id}` : '/catalog'} className="btn-primary inline-flex items-center gap-4">
                Рассмотреть дерево <span aria-hidden="true">↗</span>
              </Link>
            </motion.div>
          </motion.div>
          <motion.div
            style={{ opacity: revealOpacity, x: photoX, scale: photoScale, rotateY: photoRotateY, transformPerspective: 1200 }}
            className="order-1 flex items-center justify-center lg:order-1"
          >
            <div className={`${styles.photo} relative`}>
              <motion.img
                style={{ scale: imageScale }}
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
