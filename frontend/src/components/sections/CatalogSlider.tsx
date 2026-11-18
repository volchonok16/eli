import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useMotionValue, useScroll } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/api/endpoints/products";
import type { ProductResponse } from "@/api/endpoints/products";
import { resolveProductImage } from "@/shared/utils/mediaUrl";
import { SlideItem, type Slide } from "./ui";
import styles from './CatalogSlider.module.css';

function productToSlide(p: ProductResponse): Slide {
  const image = p.images?.[0] ? resolveProductImage(p.images[0]) : "/images/spruce-blue.svg";
  return {
    id: p.id,
    title: p.name,
    subtitle: p.sort ?? "",
    description: p.description?.slice(0, 150) ?? "",
    image,
    stats: [p.heightLabel ? `Высота: ${p.heightLabel} м` : "", `от ${p.price.toLocaleString()} ₽`, p.inStock ? "В наличии" : "Под заказ"].filter(Boolean),
  };
}

const defaultSlide: Slide = {
  id: "",
  title: "Русская ель",
  subtitle: "Классика Нового года",
  description: "Традиционная русская ель с густой тёмно-зелёной хвоей и ярким хвойным ароматом.",
  image: "/images/spruce-blue.svg",
  stats: ["Высота: 1,5–2,5 м", "Аромат: насыщенный", "От 4 900 ₽"],
};

function getStickyScrollRange(container: HTMLElement, stage: HTMLElement) {
  return Math.max(0, container.offsetHeight - stage.offsetHeight);
}

export const StickyShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const trackX = useMotionValue(0);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "featured-slides"],
    queryFn: () => productsApi.getAll({ sort: "popularity", limit: 4 }),
    staleTime: 10 * 60 * 1000,
  });

  const slides: Slide[] = products?.length ? products.map(productToSlide).slice(0, 4) : [defaultSlide];
  const [activeSlide, setActiveSlide] = useState(0);
  const { scrollY } = useScroll();

  useEffect(() => {
    const container = containerRef.current;
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!container || !stage || !track) return;

    const updatePosition = () => {
      if (isMobile) {
        trackX.set(0);
        return;
      }

      const stickyTop = Number.parseFloat(window.getComputedStyle(stage).top) || 0;
      const range = getStickyScrollRange(container, stage);
      const containerTop = window.scrollY + container.getBoundingClientRect().top;
      const progress = range
        ? Math.min(1, Math.max(0, (scrollY.get() - containerTop + stickyTop) / range))
        : 0;
      trackX.set(-(track.scrollWidth - track.clientWidth) * progress);
      setActiveSlide(Math.round(progress * (slides.length - 1)));
    };

    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(container);
    resizeObserver.observe(stage);
    resizeObserver.observe(track);
    const unsubscribe = scrollY.on("change", updatePosition);
    window.addEventListener("resize", updatePosition);
    updatePosition();

    return () => {
      resizeObserver.disconnect();
      unsubscribe();
      window.removeEventListener("resize", updatePosition);
    };
  }, [isLoading, isMobile, scrollY, slides.length, trackX]);

  const scrollToSlide = (index: number) => {
    if (!containerRef.current) return;
    if (isMobile) {
      trackRef.current?.children[index]?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      return;
    }
    const stage = stageRef.current;
    if (!stage) return;
    const stickyTop = Number.parseFloat(window.getComputedStyle(stage).top) || 0;
    const containerTop = window.scrollY + containerRef.current.getBoundingClientRect().top;
    const scrollRange = getStickyScrollRange(containerRef.current, stage);
    const progress = slides.length > 1 ? index / (slides.length - 1) : 0;
    window.scrollTo({ top: containerTop - stickyTop + scrollRange * progress, behavior: 'smooth' });
  };

  return (
    <div ref={containerRef} className={styles.showcase} style={{ '--showcase-count': slides.length } as CSSProperties}>
      <div ref={stageRef} className={styles.stage}>
        <div className={styles.atmosphere} aria-hidden="true" />
        {isLoading ? (
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 sm:py-0">
              <div className="grid lg:grid-cols-2 gap-8 sm:gap-16 items-center">
                <div className="order-2 lg:order-1 space-y-4">
                  <div className="h-3 bg-text-inverse/10 w-20 animate-pulse" />
                  <div className="h-10 bg-text-inverse/10 w-3/4 animate-pulse" />
                  <div className="h-4 bg-text-inverse/10 w-1/2 animate-pulse" />
                </div>
                <div className="order-1 lg:order-2 flex items-center justify-center">
                  <div className="w-48 h-64 sm:w-64 sm:h-80 bg-text-inverse/5 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <motion.div ref={trackRef} className={`${styles.track} relative z-10`} style={{ x: trackX }} onScroll={(event) => {
              if (!isMobile) return;
              const target = event.currentTarget;
              const width = target.clientWidth;
              if (width) setActiveSlide(Math.round(target.scrollLeft / width));
            }}>
              {slides.map((slide, i) => (
                <SlideItem key={slide.id || i} slide={slide} index={i} />
              ))}
            </motion.div>
            <div className={`${styles.controls} glass-panel`}>
              <button type="button" aria-label="Предыдущий товар" onClick={() => {
                scrollToSlide(Math.max(0, activeSlide - 1));
              }}>‹</button>
              <div className={styles.dots} style={{ '--active-index': activeSlide } as CSSProperties}>
                {slides.map((_, i) => (
                  <button key={i} type="button" aria-label={`Показать товар ${i + 1}`} aria-pressed={activeSlide === i} onClick={() => scrollToSlide(i)}>
                    {i + 1}
                  </button>
                ))}
              </div>
              <button type="button" aria-label="Следующий товар" onClick={() => {
                scrollToSlide(Math.min(slides.length - 1, activeSlide + 1));
              }}>›</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
