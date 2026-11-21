import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const COUNTER_ID = 114440418;

export const YandexMetrika = () => {
  const location = useLocation();
  const isFirstHit = useRef(true);

  useEffect(() => {
    if (isFirstHit.current) {
      isFirstHit.current = false;
      return;
    }

    window.ym?.(COUNTER_ID, 'hit', window.location.href, {
      title: document.title,
      referer: document.referrer,
    });
  }, [location.pathname, location.search]);

  return null;
};
