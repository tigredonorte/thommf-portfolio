import { portfolioReducer, initialState } from './portfolioSlice';

describe('portfolioSlice', () => {
  it('should set initial state', () => {
    const state = portfolioReducer(undefined, { type: '' });
    expect(state).toEqual(initialState);
  });
});
