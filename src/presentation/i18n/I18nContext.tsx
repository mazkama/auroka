'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import idLocale from './locales/id.json';
import enLocale from './locales/en.json';
import jvLocale from './locales/jv.json';

export type SupportedLanguage = 'id' | 'en' | 'jv';

type TranslationDictionary = typeof idLocale;

const translations: Record<SupportedLanguage, TranslationDictionary> = {
  id: idLocale,
  en: enLocale as unknown as TranslationDictionary,
  jv: jvLocale as unknown as TranslationDictionary,
};

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('id');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('auroka_lang') as SupportedLanguage;
      if (savedLang && (savedLang === 'id' || savedLang === 'en' || savedLang === 'jv')) {
        setLanguageState(savedLang);
      } else {
        const storedUser = localStorage.getItem('auroka_user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (parsed.languagePreference && ['id', 'en', 'jv'].includes(parsed.languagePreference)) {
              setLanguageState(parsed.languagePreference);
              localStorage.setItem('auroka_lang', parsed.languagePreference);
            }
          } catch {
            // ignore
          }
        }
      }
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('auroka_lang', lang);
      window.dispatchEvent(new Event('auroka:language-changed'));
    }
  };

  const t = (keyPath: string, params?: Record<string, string | number>): string => {
    const keys = keyPath.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = translations[language] || translations.id;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to Indonesian if missing in current dictionary
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let fallback: any = translations.id;
        for (const fbKey of keys) {
          if (fallback && typeof fallback === 'object' && fbKey in fallback) {
            fallback = fallback[fbKey];
          } else {
            return keyPath;
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current !== 'string') {
      return keyPath;
    }

    let result = current;
    if (params) {
      for (const [pKey, pVal] of Object.entries(params)) {
        result = result.replace(new RegExp(`{${pKey}}`, 'g'), String(pVal));
      }
    }

    return result;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    // Graceful fallback for non-provider renders
    return {
      language: 'id' as SupportedLanguage,
      setLanguage: () => {},
      t: (k: string) => k,
    };
  }
  return context;
};
