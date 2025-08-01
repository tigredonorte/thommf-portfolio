import { createSlice, PayloadAction, Slice, ActionCreatorWithPayload } from '@reduxjs/toolkit';
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
  },
});

export const setLanguage = languageSlice.actions.setLanguage as ActionCreatorWithPayload<'en' | 'pt', string>;

export default languageSlice.reducer;
