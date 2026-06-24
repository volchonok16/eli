import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { SectionHeading } from '@/shared/components';

const steps = [
  {
    step: '01',
    title: 'Консультация и подбор',
    description: 'Свяжитесь с нами или оставьте заявку. Наш агроном подберёт идеальную ель под ваш участок и бюджет.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Оформление и доставка',
    description: 'Подписываем договор, готовим дерево к транспортировке и доставляем в специальном контейнере с климат-контролем.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Посадка и гарантия',
    description: 'Профессиональная посадка с удобрениями и мульчированием. Предоставляем гарантию приживаемости 2 года и инструкцию по уходу.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
];

export const HowItWorks = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  const lineProgress = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section ref={containerRef} className="py-24 bg-surface relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full hidden md:block">
        <motion.div
          style={{ height: lineProgress }}
          className="w-full bg-accent/30 origin-top"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeading
          title="Как мы работаем"
          subtitle="Три простых шага от идеи до великолепной ели на вашем участке"
        />

        <div className="space-y-24 md:space-y-32">
          {steps.map((step, index) => {
            const start = index / steps.length;
            const end = (index + 1) / steps.length;
            const stepOpacity = useTransform(scrollYProgress, [start, start + 0.15, end - 0.15, end], [0.3, 1, 1, 0.3]);
            const stepX = useTransform(scrollYProgress, [start, start + 0.15], [index % 2 === 0 ? -40 : 40, 0]);

            return (
              <motion.div
                key={step.step}
                style={{ opacity: stepOpacity, x: stepX }}
                className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <motion.div
                  whileInView={{ scale: [0.8, 1], opacity: [0, 1] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="relative z-10"
                >
                  <div className="w-20 h-20 rounded-full bg-accent text-surface flex items-center justify-center shadow-lg shadow-accent/20">
                    <span className="font-display text-2xl font-bold">{step.step}</span>
                  </div>
                </motion.div>

                <motion.div
                  whileInView={{ opacity: [0, 1], y: [20, 0] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex-1 md:max-w-md bg-surface border border-surface-muted p-5 sm:p-6 lg:p-8"
                >
                  <div className="w-10 h-10 bg-accent/10 flex items-center justify-center mb-4">
                    <span className="text-accent">{step.icon}</span>
                  </div>
                  <h3 className="font-serif text-xl text-primary mb-3">{step.title}</h3>
                  <p className="text-text-muted leading-relaxed">{step.description}</p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
