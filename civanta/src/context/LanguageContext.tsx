import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { UI_TRANSLATIONS } from '../data/translations';

interface LanguageContextType {
  language: 'en' | 'kn';
  setLanguage: (lang: 'en' | 'kn') => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'en' | 'kn'>(() => StorageService.getLanguage());

  useEffect(() => {
    StorageService.setLanguage(language);
  }, [language]);

  const setLanguage = (lang: 'en' | 'kn') => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState(prev => (prev === 'en' ? 'kn' : 'en'));
  };

  const t = (key: string): string => {
    if (!key) return '';
    // 1. Direct key match
    const entry = UI_TRANSLATIONS[key];
    if (entry) {
      return entry[language] || entry.en;
    }
    // 2. Case-insensitive key or english text match
    const lowerKey = key.trim().toLowerCase();
    for (const k of Object.keys(UI_TRANSLATIONS)) {
      const item = UI_TRANSLATIONS[k];
      if (k.toLowerCase() === lowerKey || item.en.toLowerCase() === lowerKey) {
        return item[language] || item.en;
      }
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
