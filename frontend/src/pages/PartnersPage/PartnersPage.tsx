import { motion } from 'framer-motion';
import { SectionHeading } from '@/shared/components';

const benefits = [
  { title: 'Гарантированный доход', description: 'Стабильная арендная плата за участок на весь сезон. Выплаты производятся авансом.' },
  { title: 'Полное обеспечение', description: 'Мы берём на себя завоз товара, оформление точки, вывоз остатков и уборку территории.' },
  { title: 'Юридическая чистота', description: 'Официальный договор аренды, все разрешения и согласования — наша забота.' },
];

export const PartnersPage = () => (
  <div className="min-h-screen bg-surface">
    <section className="py-16 bg-surface-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl md:text-5xl text-primary mb-4">Сотрудничество</h1>
          <p className="text-text-muted text-lg max-w-xl">
            Сдайте участок под ёлочный базар и получите стабильный доход в декабре
          </p>
        </motion.div>
      </div>
    </section>

    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Почему с нами выгодно" subtitle="Мы создаём праздник, а вы получаете доход" />

        <div className="grid sm:grid-cols-3 gap-8 mb-24">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="card p-6"
            >
              <div className="w-10 h-10 bg-accent/10 flex items-center justify-center mb-4">
                <span className="font-display text-accent text-lg font-bold">{i + 1}</span>
              </div>
              <h3 className="font-serif text-lg text-primary mb-3">{b.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{b.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <SectionHeading
            title="Оставить заявку"
            subtitle="Заполните форму, и наш менеджер свяжется с вами для обсуждения условий"
          />
          <form className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input className="input-field" placeholder="ФИО / Организация" required />
              <input className="input-field" type="tel" placeholder="Телефон" required />
            </div>
            <input className="input-field" type="email" placeholder="Email" required />
            <input className="input-field" placeholder="Адрес участка" required />
            <div className="grid sm:grid-cols-2 gap-4">
              <input className="input-field" placeholder="Площадь участка (м²)" />
              <input className="input-field" placeholder="Желаемый срок аренды" />
            </div>
            <textarea className="input-field" rows={3} placeholder="Дополнительная информация и пожелания" />
            <div className="card p-4 text-center text-text-muted text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mx-auto mb-2 text-primary/10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Прикрепите фото участка (до 3 файлов)
            </div>
            <button type="submit" className="btn-primary w-full">Отправить заявку</button>
          </form>
        </div>
      </div>
    </section>
  </div>
);
