import { motion } from 'framer-motion';
import { SectionHeading } from '@/shared/components';

const priceTable = [
  { height: '1.5 – 2.0 м', upTo10: '22 000', upTo50: '19 500', upTo100: '17 000', over100: 'договорная' },
  { height: '2.0 – 2.5 м', upTo10: '28 000', upTo50: '24 500', upTo100: '21 000', over100: 'договорная' },
  { height: '2.5 – 3.0 м', upTo10: '35 000', upTo50: '30 000', upTo100: '26 000', over100: 'договорная' },
  { height: '3.0 – 4.0 м', upTo10: '48 000', upTo50: '41 000', upTo100: '36 000', over100: 'договорная' },
];

const formatPrice = (v: string) => (v === 'договорная' ? v : `${parseInt(v).toLocaleString()} ₽`);

export const WholesalePage = () => (
  <div className="min-h-screen bg-surface">
    <section className="py-16 bg-surface-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl md:text-5xl text-primary mb-4">Ёлки оптом</h1>
          <p className="text-text-muted text-lg max-w-xl">
            Специальные условия для организаций. Гибкие цены, персональный менеджер, доставка по графику.
          </p>
        </motion.div>
      </div>
    </section>

    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Оптовые цены" subtitle="Стоимость зависит от высоты дерева и объёма закупки" />

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-muted">
                <th className="text-left py-3 px-4 font-medium text-text-muted">Высота</th>
                <th className="text-right py-3 px-4 font-medium text-text-muted">до 10 шт</th>
                <th className="text-right py-3 px-4 font-medium text-text-muted">до 50 шт</th>
                <th className="text-right py-3 px-4 font-medium text-text-muted">до 100 шт</th>
                <th className="text-right py-3 px-4 font-medium text-text-muted">100+ шт</th>
              </tr>
            </thead>
            <tbody>
              {priceTable.map((row) => (
                <tr key={row.height} className="border-b border-surface-muted/50 hover:bg-surface-dark transition-colors">
                  <td className="py-3 px-4 text-primary">{row.height}</td>
                  <td className="py-3 px-4 text-right text-text-muted">{formatPrice(row.upTo10)}</td>
                  <td className="py-3 px-4 text-right text-text-muted">{formatPrice(row.upTo50)}</td>
                  <td className="py-3 px-4 text-right text-text-muted">{formatPrice(row.upTo100)}</td>
                  <td className="py-3 px-4 text-right text-accent font-medium">{formatPrice(row.over100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-16 card p-8 text-center">
          <SectionHeading title="Запросить коммерческое предложение" subtitle="Оставьте заявку, и наш менеджер свяжется с вами в течение 2 часов" />
          <form className="max-w-md mx-auto space-y-4">
            <input className="input-field" placeholder="Название организации" required />
            <input className="input-field" placeholder="Контактное лицо" required />
            <input className="input-field" type="tel" placeholder="Телефон" required />
            <input className="input-field" type="email" placeholder="Email" required />
            <textarea className="input-field" rows={3} placeholder="Комментарий (желаемый объём, высота, сорт)" />
            <button type="submit" className="btn-primary w-full">Отправить заявку</button>
          </form>
        </div>
      </div>
    </section>
  </div>
);
