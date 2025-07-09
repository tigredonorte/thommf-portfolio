import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import App from './app';

// Mock the config module
jest.mock('@thommf-portfolio/config', () => ({
  config: {
    developerName: 'Thompson Filgueiras',
  },
}));

describe('App', () => {
  it('should render successfully', async () => {
    const { baseElement } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    expect(baseElement).toBeTruthy();
    
    // Wait for lazy components to load
    await waitFor(() => {
      expect(screen.getByTestId('header-module')).toBeTruthy();
      expect(screen.getByTestId('project-list-module')).toBeTruthy();
    });
  });

  it('should render the main app layout', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Check main layout structure using semantic roles
    await waitFor(() => {
      expect(screen.getByRole('main')).toBeTruthy();
      expect(screen.getByRole('contentinfo')).toBeTruthy(); // footer has contentinfo role
    });
  });

  it('should display the footer with developer name', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/© 2025 Thompson Filgueiras/)).toBeTruthy();
      expect(screen.getByText(/Built with Microfrontends/)).toBeTruthy();
    });
  });

  it('should load header and project list components', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Wait for both microfrontend components to load
    await waitFor(() => {
      expect(screen.getByTestId('header-module')).toBeTruthy();
      expect(screen.getByTestId('project-list-module')).toBeTruthy();
    });
  });
});
