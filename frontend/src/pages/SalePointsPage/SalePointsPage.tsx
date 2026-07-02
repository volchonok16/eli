import { motion } from 'framer-motion';
import { useSalePoints } from './hooks/useSalePoints';

export const SalePointsPage = () => {
  const { data: points, isLoading, isError } = useSalePoints();

  return (
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

          {isLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-4 bg-surface-dark rounded w-1/3 mb-3" />
                  <div className="h-5 bg-surface-dark rounded w-2/3 mb-2" />
                  <div className="h-4 bg-surface-dark rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="text-center py-12">
              <p className="text-text-muted">Не удалось загрузить точки продаж</p>
            </div>
          )}

          {points && points.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-muted">Информация о точках продаж появится ближе к сезону</p>
            </div>
          )}

          {points && points.length > 0 && (
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
                    <span className={`w-2 h-2 rounded-full ${point.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-xs text-text-muted uppercase tracking-wider">
                      {point.isActive ? 'Работает' : 'Не работает'}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg text-primary mb-2">{point.shortName}</h3>
                  <p className="text-text-muted text-sm mb-1">{point.address}</p>
                  {point.phone && (
                    <p className="text-text-muted text-xs">{point.phone}</p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
