import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { languageSlice, type Language } from '@thommf-portfolio/store';
import { LanguageToggle } from './LanguageToggle';

// Create a test store
const createTestStore = (initialLanguage: Language = 'en') => {
  return configureStore({
    reducer: {
      language: languageSlice.reducer,
    },
    preloadedState: {
      language: {
        currentLanguage: initialLanguage,
        availableLanguages: ['en', 'pt'] as Language[],
      },
    },
  });
};

const renderWithProvider = (component: React.ReactElement, initialLanguage: Language = 'en') => {
  const store = createTestStore(initialLanguage);
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('LanguageToggle', () => {
  it('should render desktop version by default', () => {
    renderWithProvider(<LanguageToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('language-toggle');
    expect(button).not.toHaveClass('mobile');
  });

  it('should render mobile version when variant is mobile', () => {
    renderWithProvider(<LanguageToggle variant="mobile" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('language-toggle', 'mobile');
  });

  it('should display correct flag and text for English', () => {
    renderWithProvider(<LanguageToggle />);
    
    expect(screen.getByText('🇺🇸')).toBeInTheDocument();
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('should display correct flag and text for Portuguese', () => {
    renderWithProvider(<LanguageToggle />, 'pt');
    
    expect(screen.getByText('🇧🇷')).toBeInTheDocument();
    expect(screen.getByText('PT')).toBeInTheDocument();
  });

  it('should display full text in mobile version', () => {
    renderWithProvider(<LanguageToggle variant="mobile" />);
    
    expect(screen.getByText('Switch to Português')).toBeInTheDocument();
  });

  it('should call onToggle when clicked', () => {
    const mockOnToggle = jest.fn();
    renderWithProvider(<LanguageToggle onToggle={mockOnToggle} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('should have correct aria-label', () => {
    renderWithProvider(<LanguageToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to Português');
  });
});
