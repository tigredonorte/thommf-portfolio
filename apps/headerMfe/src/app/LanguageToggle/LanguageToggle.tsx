import { useAppSelector, useAppDispatch, setLanguage, selectCurrentLanguage } from '@thommf-portfolio/store';
import { FiGlobe } from 'react-icons/fi';
import './LanguageToggle.scss';
import { useCallback, useEffect } from 'react';

const FLAG_ICONS = {
  pt: '🇧🇷',
  en: '🇺🇸'
} as const;

interface LanguageToggleProps {
  variant?: 'desktop' | 'mobile';
  onToggle?: () => void;
}

export const LanguageToggle = ({ variant = 'desktop', onToggle }: LanguageToggleProps) => {
  const currentLanguage = useAppSelector(selectCurrentLanguage);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const savedLanguage = localStorage.getItem('portfolio-language') as 'en' | 'pt' | null;
    if (savedLanguage && ['en', 'pt'].includes(savedLanguage)) {
      dispatch(setLanguage(savedLanguage));
    }
  }, [dispatch]);

  const handleLanguageToggle = useCallback(() => {
    const newLanguage = currentLanguage === 'en' ? 'pt' : 'en';
    localStorage.setItem('portfolio-language', newLanguage);
    dispatch(setLanguage(newLanguage));
    onToggle?.();
  }, [currentLanguage, dispatch, onToggle]);

  const isMobile = variant === 'mobile';
  const label = currentLanguage === 'en' ? 'Mudar para Português' : 'Switch to English';

  return (
    <button 
      className={`language-toggle ${isMobile ? 'mobile' : ''}`}
      onClick={handleLanguageToggle} 
      aria-label={label}
    >
      <span className="flag-icon">{FLAG_ICONS[currentLanguage]}</span>
      <FiGlobe size={isMobile ? 24 : 16} />
      <span className="language-text">
        {isMobile 
          ? label
          : (currentLanguage === 'en' ? 'EN' : 'PT')
        }
      </span>
    </button>
  );
}
