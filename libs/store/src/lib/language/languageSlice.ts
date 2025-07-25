import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';
import { Language, LanguageState } from './types';

const getInitialLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const savedLanguage = localStorage.getItem('portfolio-language') as Language;
    if (savedLanguage && ['en', 'pt'].includes(savedLanguage)) {
      return savedLanguage;
    }
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('pt')) {
      return 'pt';
    }
  }
  return 'en';
};

const initialState: LanguageState = {
  currentLanguage: getInitialLanguage(),
  availableLanguages: ['en', 'pt'],
};

export const languageSlice: Slice<LanguageState> = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.currentLanguage = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('portfolio-language', action.payload);
      }
    },
    toggleLanguage: {
      reducer: (state) => {
        const currentIndex = state.availableLanguages.indexOf(state.currentLanguage);
        const nextIndex = (currentIndex + 1) % state.availableLanguages.length;
        const newLanguage = state.availableLanguages[nextIndex];
        
        state.currentLanguage = newLanguage;
        if (typeof window !== 'undefined') {
          localStorage.setItem('portfolio-language', newLanguage);
        }
      },
      prepare: () => ({ payload: undefined })
    },
  },
});

export const { setLanguage, toggleLanguage } = languageSlice.actions;

export default languageSlice.reducer;
