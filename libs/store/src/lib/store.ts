import { configureStore } from '@reduxjs/toolkit';
import { portfolioListenerMiddleware, portfolioReducer, setupPortfolioStore } from '@thommf-portfolio/portfolio-store';
import { languageReducer, setLanguage } from './language';

export const store = configureStore({
  reducer: {
    language: languageReducer,
    portfolio: portfolioReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).prepend(portfolioListenerMiddleware.middleware),
});

setupPortfolioStore(setLanguage);
