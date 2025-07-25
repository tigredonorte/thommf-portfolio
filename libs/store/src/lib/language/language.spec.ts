import { store } from '../store';
import { setLanguage, toggleLanguage } from './languageSlice';
import { selectCurrentLanguage } from './selectors';

describe('Language Store', () => {
  beforeEach(() => {
    // Reset store to initial state
    store.dispatch(setLanguage('en'));
  });

  it('should have initial language as en', () => {
    const state = store.getState();
    expect(selectCurrentLanguage(state)).toBe('en');
  });

  it('should set language to pt', () => {
    store.dispatch(setLanguage('pt'));
    const state = store.getState();
    expect(selectCurrentLanguage(state)).toBe('pt');
  });

  it('should toggle language from en to pt', () => {
    store.dispatch(setLanguage('en'));
    store.dispatch(toggleLanguage(undefined));
    const state = store.getState();
    expect(selectCurrentLanguage(state)).toBe('pt');
  });

  it('should toggle language from pt to en', () => {
    store.dispatch(setLanguage('pt'));
    store.dispatch(toggleLanguage(undefined));
    const state = store.getState();
    expect(selectCurrentLanguage(state)).toBe('en');
  });
});
