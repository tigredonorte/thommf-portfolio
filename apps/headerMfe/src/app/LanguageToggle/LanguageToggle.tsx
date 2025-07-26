import { useAppSelector, useAppDispatch, setLanguage, selectCurrentLanguage } from '@thommf-portfolio/store';
import { FiGlobe } from 'react-icons/fi';
import './LanguageToggle.scss';
import { useCallback } from 'react';

const DISABLE_LANGUAGE_TOGGLE = true;
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

  const handleLanguageToggle = useCallback(() => {
    dispatch(setLanguage(currentLanguage === 'en' ? 'pt' : 'en'));
    onToggle?.();
  }, [currentLanguage, dispatch, onToggle]);

  if (DISABLE_LANGUAGE_TOGGLE) {
    return null;
  }

  const isMobile = variant === 'mobile';

  return (
    <button 
      className={`language-toggle ${isMobile ? 'mobile' : ''}`}
      onClick={handleLanguageToggle} 
      aria-label={`Switch to ${currentLanguage === 'en' ? 'Português' : 'English'}`}
    >
      <span className="flag-icon">{FLAG_ICONS[currentLanguage]}</span>
      <FiGlobe size={isMobile ? 24 : 16} />
      <span className="language-text">
        {isMobile 
          ? (currentLanguage === 'en' ? 'Mudar para Português' : 'Switch to English')
          : (currentLanguage === 'en' ? 'EN' : 'PT')
        }
      </span>
    </button>
  );
}
