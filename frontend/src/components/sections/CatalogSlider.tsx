import { useRef } from "react";
import { useScroll } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/api/endpoints/products";
import type { ProductResponse } from "@/api/endpoints/products";
import { SlideItem, Dot, type Slide } from "./ui";

function productToSlide(p: ProductResponse): Slide {
  const image = p.images?.[0]?.url ?? "";
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

export const StickyShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "featured-slides"],
    queryFn: () => productsApi.getAll({ sort: "popularity" }),
    staleTime: 10 * 60 * 1000,
  });

  const slides: Slide[] = products?.length ? products.map(productToSlide).slice(0, 4) : [defaultSlide];
  const slideHeight = 1 / slides.length;

  return (
    <div ref={containerRef} className="relative bg-primary" style={{ height: `${slides.length * 100}vh` }}>
      <div className="absolute inset-0 opacity-10">
        <img src="/images/photos/evening-winter-showcase.png" alt="" className="w-full h-full object-cover" aria-hidden="true" loading="lazy" />
      </div>
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
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
          slides.map((slide, i) => (
            <SlideItem key={slide.id || i} slide={slide} index={i} slideHeight={slideHeight} scrollYProgress={scrollYProgress} />
          ))
        )}
        <div className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2 sm:gap-3 z-20">
          {slides.map((_, i) => (
            <Dot key={i} index={i} total={slides.length} scrollYProgress={scrollYProgress} />
          ))}
        </div>
      </div>
    </div>
  );
};
