import { render } from '@testing-library/react';

import PortfolioStore from './portfolio-store';

describe('PortfolioStore', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PortfolioStore />);
    expect(baseElement).toBeTruthy();
  });
});
