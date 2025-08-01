import { Dispatch } from '@reduxjs/toolkit';
import { languageReducer } from './language';

export type RootState = {
  language: ReturnType<typeof languageReducer>;
};

export type AppDispatch = Dispatch;
