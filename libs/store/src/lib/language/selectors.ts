import { RootState } from '../types';

export const selectCurrentLanguage = (state: RootState) => state.language.currentLanguage;
export const selectAvailableLanguages = (state: RootState) => state.language.availableLanguages;
export const selectLanguageState = (state: RootState) => state.language;
