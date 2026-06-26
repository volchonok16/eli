import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SectionHeading } from '@/shared/components';

export const AboutPage = () => (
  <div className="min-h-screen bg-surface">
    <section className="py-16 bg-surface-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="font-display text-4xl md:text-5xl text-primary mb-4">О компании Eli</h1>
          <p className="text-text-muted text-lg max-w-xl">15 лет создаём красоту, которой доверяют</p>
        </motion.div>
      </div>
    </section>

    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <SectionHeading
              title="Наша история"
              subtitle="С 2011 года мы помогаем создавать праздничную атмосферу в домах и на участках наших клиентов"
              centered={false}
            />
            <div className="space-y-4 text-text-muted leading-relaxed">
              <p>
                Eli начинался как небольшой семейный питомник в Подмосковье. За 15 лет мы выросли
                в одного из лидеров рынка живых хвойных деревьев Центральной России.
              </p>
              <p>
                Мы лично отбираем каждый саженец в европейских и российских питомниках. Наши
                агрономы сопровождают клиента от первого звонка до послепосадочного ухода.
              </p>
              <p>
                Качество, проверенное временем — это не просто слоган. Это наш принцип работы
                с первого дня.
              </p>
            </div>
            <div className="mt-8">
              <Link to="/catalog" className="btn-primary">Смотреть каталог</Link>
            </div>
          </div>
          <div className="aspect-[4/3] bg-surface-dark border border-surface-muted flex items-center justify-center">
            <img src="/images/nursery.svg" alt="Питомник Eli" className="w-full h-full object-cover" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  </div>
);
