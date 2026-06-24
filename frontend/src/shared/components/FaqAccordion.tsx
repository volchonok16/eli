import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FaqItem {
  question: string;
  answer: string;
}

const faqItems: FaqItem[] = [
  {
    question: 'Как выбрать подходящую ель для участка?',
    answer: 'Наши специалисты помогут подобрать ель исходя из размера участка, климатических условий и ваших эстетических предпочтений. Свяжитесь с нами для бесплатной консультации.',
  },
  {
    question: 'Как происходит доставка?',
    answer: 'Мы доставляем ели в специальных контейнерах, обеспечивающих сохранность корневой системы. Доставка осуществляется собственной службой по всей Центральной России в течение 3–7 дней.',
  },
  {
    question: 'Какая гарантия на деревья?',
    answer: 'Мы предоставляем гарантию приживаемости 2 года. Если в течение этого срока дерево не приживётся, мы заменим его бесплатно.',
  },
  {
    question: 'Можно ли заказать посадку ели?',
    answer: 'Да, мы предлагаем услугу профессиональной посадки с подготовкой грунта и удобрениями. Стоимость рассчитывается индивидуально.',
  },
  {
    question: 'Как ухаживать за елью после посадки?',
    answer: 'К каждому заказу прилагается подробная инструкция по уходу. В первый год рекомендуется регулярный полив и мульчирование приствольного круга.',
  },
];

interface FaqAccordionProps {
  items?: FaqItem[];
}

export const FaqAccordion = ({ items = faqItems }: FaqAccordionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {items.map((item, index) => (
        <div key={index} className="border border-surface-muted">
          <button
            className="w-full px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center text-left bg-surface hover:bg-surface-dark transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 min-h-[44px]"
            onClick={() => toggle(index)}
            aria-expanded={openIndex === index}
          >
            <span className="font-serif text-base sm:text-lg text-primary pr-4">{item.question}</span>
            <motion.svg
              animate={{ rotate: openIndex === index ? 45 : 0 }}
              transition={{ duration: 0.25 }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-accent shrink-0"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </motion.svg>
          </button>
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="px-4 sm:px-6 pb-4 sm:pb-5 text-sm sm:text-base text-text-muted leading-relaxed">{item.answer}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};
