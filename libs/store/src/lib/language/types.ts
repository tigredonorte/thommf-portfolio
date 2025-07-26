export type Language = 'en' | 'pt';

export interface LanguageState {
  currentLanguage: Language;
  availableLanguages: Language[];
}

export interface LanguageActions {
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
}
