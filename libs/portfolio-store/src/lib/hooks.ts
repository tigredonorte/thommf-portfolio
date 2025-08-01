import { useSelector, useDispatch, TypedUseSelectorHook } from 'react-redux';
import { PortfolioState } from './portfolioTypes';
import { Dispatch } from '@reduxjs/toolkit';
import { portfolioActions } from './portfolioSlice';

interface RootState {
  portfolio: PortfolioState;
}

type PortfolioActions = ReturnType<typeof portfolioActions[keyof typeof portfolioActions]>;
type AppDispatch = Dispatch<PortfolioActions>;

export const usePortfolioDispatch = () => useDispatch<AppDispatch>();
export const usePortfolioSelector: TypedUseSelectorHook<RootState> = useSelector;
