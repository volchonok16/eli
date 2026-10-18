import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SectionHeading } from '@/shared/components';

export const AboutPage = () => (
  <div className="min-h-screen bg-surface">
    <section className="py-16 bg-surface-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="font-display text-4xl md:text-5xl text-primary mb-4">О компании «Премиум ель»</h1>
          <p className="text-text-muted text-lg max-w-xl">С 2023 года создаём праздник в каждом доме</p>
        </motion.div>
      </div>
    </section>

    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <SectionHeading
              title="Наша история"
              subtitle="Наша история началась в 2023 году с желания дарить людям улыбки и праздник"
              centered={false}
            />
            <div className="space-y-4 text-text-muted leading-relaxed">
              <p>
                В 2023 году мы поняли, как много радости приносит возможность видеть улыбки и создавать
                праздник в каждом доме. Так началась история «Премиум ели».
              </p>
              <p>
                Сегодня «Премиум ель» — один из лидеров рынка Москвы и Подмосковья. Каждый год наша
                команда ездит в Европу и отбирает самые красивые, пышные деревья правильной формы.
              </p>
              <p>
                На наших базарах вы увидите деревья, которые мы тщательно отобрали для вас. Мы предлагаем
                премиальный сервис: выбор заранее, хранение, доставку, установку, а после праздников —
                вынос и утилизацию ёлки.
              </p>
            </div>
            <div className="mt-8">
              <Link to="/catalog" className="btn-primary">Смотреть каталог</Link>
            </div>
          </div>
          <div className="aspect-[4/3] bg-surface-dark border border-surface-muted flex items-center justify-center overflow-hidden">
            <img src="/images/photos/signature-noble-fir.png" alt="Питомник Eli" className="w-full h-full object-cover" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  </div>
);
