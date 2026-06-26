import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useNewsletterSubscribe } from './useNewsletterSubscribe';

export const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const subscribe = useNewsletterSubscribe();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email) {
      subscribe.mutate(email);
    }
  };

  if (subscribe.isSuccess) {
    return (
      <section className="py-20 bg-surface border-y border-surface-muted">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-accent font-medium text-lg"
          >
            Спасибо! Вы подписаны на рассылку.
          </motion.p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-surface border-y border-surface-muted">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-serif text-2xl sm:text-3xl text-primary mb-2 sm:mb-3">Будьте в курсе</h2>
          <p className="text-sm sm:text-base text-text-muted mb-6 sm:mb-8 px-2">
            Сезонные новинки, советы по уходу и специальные предложения — без спама
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <label htmlFor="newsletter-email" className="sr-only">Email для рассылки</label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ваш email"
              required
              className="input-field flex-1"
              disabled={subscribe.isPending}
            />
            <button
              type="submit"
              className="btn-primary whitespace-nowrap"
              disabled={subscribe.isPending}
            >
              {subscribe.isPending ? 'Отправка...' : 'Подписаться'}
            </button>
          </form>

          {subscribe.isError && (
            <p className="text-error text-sm mt-3">
              Не удалось подписаться. Попробуйте позже.
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
};
