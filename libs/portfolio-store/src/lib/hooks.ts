import { useSelector, useDispatch, TypedUseSelectorHook } from 'react-redux';
import { PortfolioState } from './portfolioTypes';

interface RootState {
  portfolio: PortfolioState;
}

type AppDispatch = ReturnType<typeof useDispatch>;

export const usePortfolioDispatch = () => useDispatch<AppDispatch>();
export const usePortfolioSelector: TypedUseSelectorHook<RootState> = useSelector;
