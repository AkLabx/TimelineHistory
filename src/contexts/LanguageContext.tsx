
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'hi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Hindi ('hi') as requested
  const [language, setLanguage] = useState<Language>('hi');

  // Persist preference
  useEffect(() => {
    const savedLang = localStorage.getItem('app-language') as Language;
    if (savedLang === 'hi' || savedLang === 'en') {
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app-language', lang);
  };

  const toggleLanguage = () => {
    handleSetLanguage(language === 'hi' ? 'en' : 'hi');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
