import { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { initializePortfolioLanguageListener } from './portfolioMiddleware';
import { portfolioEn } from './lang/en';
import { portfolioPtBr } from './lang/ptBr';

export const setupPortfolioStore = (setLanguageAction: ActionCreatorWithPayload<'en' | 'pt', string>) => {
  initializePortfolioLanguageListener(setLanguageAction, {
    en: portfolioEn,
    pt: portfolioPtBr,
  });
};
