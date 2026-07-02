import { motion } from 'framer-motion';
import { useState, type FormEvent } from 'react';
import { SectionHeading } from '@/shared/components';
import { useWholesalePrices } from './hooks/useWholesalePrices';
import { useCpRequest } from './hooks/useCpRequest';

export const WholesalePage = () => {
  const { data: prices, isLoading } = useWholesalePrices();
  const cpRequest = useCpRequest();
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!company || !contact || !phone) {
      setError('Заполните обязательные поля');
      return;
    }

    cpRequest.mutate(
      { companyName: company, contactName: contact, phone, email: email || undefined, requirements: comment || undefined },
      {
        onSuccess: () => { setSuccess(true); setError(''); },
        onError: (err) => setError(err instanceof Error ? err.message : 'Ошибка при отправке'),
      },
    );
  };

  return (
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
                  <th className="text-left py-3 px-4 font-medium text-text-muted">Товар</th>
                  <th className="text-right py-3 px-4 font-medium text-text-muted">Мин. объём</th>
                  <th className="text-right py-3 px-4 font-medium text-text-muted">Цена</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-text-muted">Загрузка цен...</td>
                  </tr>
                ) : prices && prices.length > 0 ? (
                  prices.map((row) => (
                    <tr key={row.id} className="border-b border-surface-muted/50 hover:bg-surface-dark transition-colors">
                      <td className="py-3 px-4 text-primary">{row.productName}</td>
                      <td className="py-3 px-4 text-right text-text-muted">от {row.minQuantity} шт</td>
                      <td className="py-3 px-4 text-right text-accent font-medium">{row.price.toLocaleString()} ₽</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-text-muted">Цены уточняйте у менеджера</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-16 card p-8 text-center">
            <SectionHeading title="Запросить коммерческое предложение" subtitle="Оставьте заявку, и наш менеджер свяжется с вами в течение 2 часов" />

            {success ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto">
                <p className="text-green-700 text-lg mb-2">Заявка отправлена!</p>
                <p className="text-text-muted text-sm">Менеджер свяжется с вами в ближайшее время</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
                {error && <p className="text-error text-sm bg-error/5 border border-error/20 p-3">{error}</p>}
                <input className="input-field" placeholder="Название организации" required value={company} onChange={(e) => setCompany(e.target.value)} />
                <input className="input-field" placeholder="Контактное лицо" required value={contact} onChange={(e) => setContact(e.target.value)} />
                <input className="input-field" type="tel" placeholder="Телефон" required value={phone} onChange={(e) => setPhone(e.target.value)} />
                <input className="input-field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <textarea className="input-field" rows={3} placeholder="Комментарий (желаемый объём, высота, сорт)" value={comment} onChange={(e) => setComment(e.target.value)} />
                <button type="submit" disabled={cpRequest.isPending} className="btn-primary w-full">
                  {cpRequest.isPending ? 'Отправка...' : 'Отправить заявку'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
