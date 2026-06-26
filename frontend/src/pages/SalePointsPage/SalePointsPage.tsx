import { motion } from 'framer-motion';

const points = [
  { id: 1, address: 'ул. Ленина, 45', city: 'Москва', hours: '15–31 декабря, 9:00–22:00', status: 'active' },
  { id: 2, address: 'пр. Мира, 120', city: 'Москва', hours: '15–31 декабря, 9:00–22:00', status: 'active' },
  { id: 3, address: 'ул. Центральная, 7', city: 'Химки', hours: '15–31 декабря, 10:00–20:00', status: 'active' },
  { id: 4, address: 'ш. Дмитровское, 89', city: 'Долгопрудный', hours: '15–31 декабря, 9:00–21:00', status: 'active' },
];

export const SalePointsPage = () => (
  <div className="min-h-screen bg-surface">
    <section className="py-16 bg-surface-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl md:text-5xl text-primary mb-4">Наши ёлочные базары</h1>
          <p className="text-text-muted text-lg max-w-xl">
            Удобные точки продаж по всей Москве и области. Выберите ближайший базар и заберите свою ель.
          </p>
        </motion.div>
      </div>
    </section>

    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="aspect-[21/9] bg-surface-dark border border-surface-muted flex items-center justify-center mb-12">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor" className="w-16 h-16 text-primary/10 mx-auto mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <p className="text-text-muted/30 font-serif">Карта загрузится здесь</p>
            <p className="text-xs text-text-muted/20 mt-1">Яндекс.Карты / 2ГИС</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {points.map((point, index) => (
            <motion.div
              key={point.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-text-muted uppercase tracking-wider">Работает</span>
              </div>
              <h3 className="font-serif text-lg text-primary mb-2">{point.city}</h3>
              <p className="text-text-muted text-sm mb-1">{point.address}</p>
              <p className="text-text-muted text-xs">{point.hours}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </div>
);
