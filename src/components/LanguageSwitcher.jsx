import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ne' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-full text-sm font-medium transition-colors"
    >
      {i18n.language === 'en' ? '🇳🇵 नेपाली' : '🇬🇧 English'}
    </button>
  );
}