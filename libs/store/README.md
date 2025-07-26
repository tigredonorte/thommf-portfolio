# @thommf-portfolio/store

A Redux-based shared store library for managing global state across microfrontends in the portfolio application.

## Features

- **Language Management**: Switch between Portuguese (pt) and English (en)
- **Persistent Storage**: Automatically saves language preference to localStorage
- **Browser Language Detection**: Detects user's browser language on first visit
- **Type Safety**: Full TypeScript support with typed hooks and selectors

## Installation

This library is automatically available in the workspace. To use it in your microfrontend:

```typescript
import { 
  StoreProvider, 
  useAppSelector, 
  useAppDispatch,
  setLanguage,
  toggleLanguage,
  selectCurrentLanguage 
} from '@thommf-portfolio/store';
```

## Usage

### 1. Wrap your application with StoreProvider

```tsx
import { StoreProvider } from '@thommf-portfolio/store';

function App() {
  return (
    <StoreProvider>
      <YourApplication />
    </StoreProvider>
  );
}
```

### 2. Use language state in components

```tsx
import { useAppSelector, useAppDispatch, setLanguage, setLanguage, selectCurrentLanguage } from '@thommf-portfolio/store';

function LanguageSwitcher() {
  const currentLanguage = useAppSelector(selectCurrentLanguage);
  const dispatch = useAppDispatch();

  const handleToggle = () => {
    dispatch(setLanguage(currentLanguage === 'en' ? 'pt' : 'en'));
  };

  const handleSetLanguage = (lang: 'en' | 'pt') => {
    dispatch(setLanguage(lang));
  };

  return (
    <div>
      <span>Current: {currentLanguage}</span>
      <button onClick={handleToggle}>
        Switch to {currentLanguage === 'en' ? 'Português' : 'English'}
      </button>
    </div>
  );
}
```

## API Reference

### State Structure

```typescript
interface LanguageState {
  currentLanguage: 'en' | 'pt';
  availableLanguages: ['en', 'pt'];
}
```

### Actions

- `setLanguage(language: 'en' | 'pt')`: Set a specific language
- `toggleLanguage()`: Toggle between available languages

### Selectors

- `selectCurrentLanguage(state)`: Get the current language
- `selectAvailableLanguages(state)`: Get available languages
- `selectLanguageState(state)`: Get the complete language state

### Hooks

- `useAppSelector`: Typed selector hook
- `useAppDispatch`: Typed dispatch hook

## Architecture

This store is designed to work across microfrontends using Module Federation. Each microfrontend can:

1. Import the store library
2. Wrap their components with the StoreProvider (or connect to an existing provider)
3. Use the typed hooks to access and modify global state
4. Have state changes automatically synchronized across all connected microfrontends

## Testing

Run tests with:

```bash
nx test store
```

## Building

Build the library with:

```bash
nx build store
```
