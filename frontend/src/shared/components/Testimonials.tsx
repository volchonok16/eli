import { motion } from 'framer-motion';

interface Testimonial {
  text: string;
  author: string;
  role: string;
  rating: number;
}

const defaultTestimonials: Testimonial[] = [
  {
    text: 'Заказали три голубые ели для загородного дома. Доставили в идеальном состоянии, деревья прижились и радуют глаз каждый день. Сервис на высшем уровне.',
    author: 'Александр М.',
    role: 'Владелец загородного дома',
    rating: 5,
  },
  {
    text: 'Искал редкую сербскую ель для ландшафтного проекта. В Eli нашли идеальный экземпляр. Консультация, доставка, посадка — всё безупречно.',
    author: 'Дмитрий К.',
    role: 'Ландшафтный дизайнер',
    rating: 5,
  },
  {
    text: 'Приятно удивлена уровнем сервиса. Помогли выбрать ель для небольшого участка, дали рекомендации по уходу. Чувствуется, что люди любят своё дело.',
    author: 'Елена В.',
    role: 'Частный клиент',
    rating: 5,
  },
];

interface TestimonialProps {
  items?: Testimonial[];
}

export const Testimonials = ({ items = defaultTestimonials }: TestimonialProps) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    {items.map((t, index) => (
      <motion.blockquote
        key={index}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, delay: index * 0.15 }}
        className="card p-5 sm:p-6 lg:p-8 flex flex-col"
      >
        <div className="flex gap-1 mb-4">
          {Array.from({ length: t.rating }).map((_, i) => (
            <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-accent">
              <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
            </svg>
          ))}
        </div>
        <p className="text-text-muted leading-relaxed mb-6 flex-1 italic">&ldquo;{t.text}&rdquo;</p>
        <footer>
          <p className="font-medium text-primary">{t.author}</p>
          <p className="text-sm text-text-muted/70">{t.role}</p>
        </footer>
      </motion.blockquote>
    ))}
  </div>
);
