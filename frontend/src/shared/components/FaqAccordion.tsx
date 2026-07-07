import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FaqItem {
  question: string;
  answer: string;
}

const faqItems: FaqItem[] = [
  {
    question: 'Как выбрать ёлку нужной высоты?',
    answer: 'Измерьте высоту потолка и вычтите 30–40 см на подставку и верхушку. Для квартир со стандартными потолками 2,5–2,7 м подойдут ёлки 1,5–2,2 м. Для офисов и загородных домов — 2,5 м и выше. Наш менеджер поможет с выбором.',
  },
  {
    question: 'Сколько времени ёлка простоит свежей?',
    answer: 'При правильном уходе (свежий срез, установка в подставку с водой, подальше от батарей) ёлка простоит свежей до 4 недель — весь декабрь и январь. К каждому заказу прилагаем инструкцию по уходу.',
  },
  {
    question: 'Как происходит доставка?',
    answer: 'Доставка осуществляется по Москве в пределах МКАД (бесплатно при заказе от 3 000 ₽) и по области. Курьер привозит ёлку в удобное для вас время, заносит в помещение и помогает установить в подставку.',
  },
  {
    question: 'Что делать с ёлкой после праздников?',
    answer: 'Мы организуем сбор ёлок после Нового года и отвозим их на переработку в щепу. Услуга включена при заказе. Щепа используется для благоустройства городских парков и клумб.',
  },
  {
    question: 'Какая подставка нужна для ёлки?',
    answer: 'Рекомендуем подставки с резервуаром для воды — это продлит свежесть ёлки. Для ёлок до 2 м подойдут стандартные подставки, для более высоких — усиленные. Подставки можно приобрести вместе с ёлкой.',
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
