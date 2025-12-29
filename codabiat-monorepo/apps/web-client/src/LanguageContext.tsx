
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'fa' | 'en';

interface LanguageContextType {
  lang: Language;
  dir: 'rtl' | 'ltr';
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  fa: {
    home: 'خانه',
    learn: 'آموزش',
    glossary: 'فرهنگ اصطلاحات',
    archive: 'آرشیو',
    lab: 'آزمایشگاه',
    profile: 'پروفایل',
    admin: 'مدیریت',
    login: 'ورود',
    about: 'درباره',
    hero_title: 'ادبیات الکترونیک',
    hero_sub: 'کد و شعر سایبری',
    hero_desc: 'پلتفرمی آوانگارد برای تلاقی کدنویسی خلاق و ادبیات فارسی. جایی که الگوریتم‌ها شعر می‌سرایند.',
    code_academy: 'آکادمی کد',
    article_archive: 'آرشیو مقالات',
    lab_title: 'ترمینال شعر',
    search_lexicon: 'جستجو در واژگان...',
    no_matches: 'نتیجه‌ای یافت نشد',
    select_term: 'یک اصطلاح را انتخاب کنید',
    language_toggle: 'English'
  },
  en: {
    home: 'Home',
    learn: 'Learn',
    glossary: 'Glossary',
    archive: 'Archive',
    lab: 'Lab',
    profile: 'Profile',
    admin: 'Admin',
    login: 'Login',
    about: 'About',
    hero_title: 'Electronic Literature',
    hero_sub: 'CYBER_POETRY & CODE',
    hero_desc: 'An avant-garde platform merging creative coding and Persian literature. Where algorithms compose poetry.',
    code_academy: 'Code Academy',
    article_archive: 'Articles',
    lab_title: 'Poetry Terminal',
    search_lexicon: 'Search lexicon...',
    no_matches: 'NO_MATCHES_FOUND',
    select_term: 'Select Term from Library',
    language_toggle: 'فارسی'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('fa');
  const dir = lang === 'fa' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  const t = (key: string) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, dir, setLang, t }}>
      <div className={lang === 'fa' ? 'font-sans' : 'font-sans-en'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
