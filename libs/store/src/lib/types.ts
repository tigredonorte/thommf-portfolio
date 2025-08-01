import { Dispatch } from '@reduxjs/toolkit';
import { languageReducer } from './language';
import { portfolioReducer } from '@thommf-portfolio/portfolio-store';

export type RootState = {
  language: ReturnType<typeof languageReducer>;
  portfolio: ReturnType<typeof portfolioReducer>;
};

export type AppDispatch = Dispatch;
