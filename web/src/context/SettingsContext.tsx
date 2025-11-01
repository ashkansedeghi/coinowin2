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
  const [theme, setTheme] = useState<Theme>('dark');
  const [language, setLang] = useState<Language>('en');
  const [currency, setCurrencyState] = useState<Currency>('USD');

  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light');
  }, [theme]);

  useEffect(() => {
    document.body.classList.toggle('rtl', language === 'fa');
    document.documentElement.lang = language;
    i18n.changeLanguage(language);
  }, [language]);

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
