import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import i18n from '@lib/i18n';

type Theme = 'dark' | 'light';
type Language = 'en' | 'fa';
type Currency = 'USD' | 'IRR';

interface SettingsContextProps {
  theme: Theme;
  language: Language;
  currency: Currency;
  toggleTheme: () => void;
  setLanguage: (language: Language) => void;
  setCurrency: (currency: Currency) => void;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') {
      return 'dark';
    }
    const stored = window.localStorage.getItem('coinowin-theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    const mediaQuery = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: light)')
      : undefined;
    return mediaQuery?.matches ? 'light' : 'dark';
  };

  const getInitialLanguage = (): Language => {
    if (typeof window === 'undefined') {
      return 'en';
    }
    const stored = window.localStorage.getItem('coinowin-language');
    if (stored === 'fa' || stored === 'en') {
      return stored;
    }
    return 'en';
  };

  const getInitialCurrency = (): Currency => {
    if (typeof window === 'undefined') {
      return 'USD';
    }
    const stored = window.localStorage.getItem('coinowin-currency');
    if (stored === 'USD' || stored === 'IRR') {
      return stored;
    }
    return 'USD';
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [language, setLang] = useState<Language>(getInitialLanguage);
  const [currency, setCurrencyState] = useState<Currency>(getInitialCurrency);

  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light');
    document.documentElement.dataset.theme = theme;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('coinowin-theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    document.body.classList.toggle('rtl', language === 'fa');
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('coinowin-language', language);
    }
    i18n.changeLanguage(language);
  }, [language]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('coinowin-currency', currency);
    }
  }, [currency]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  const value = useMemo(
    () => ({
      theme,
      language,
      currency,
      toggleTheme,
      setLanguage: setLang,
      setCurrency: setCurrencyState
    }),
    [theme, language, currency]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
