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
      className="px-4 py-2 bg-white border border-amber-300 rounded-full font-medium hover:bg-amber-50"
    >
      {i18n.language === 'en' ? '🇳🇵 नेपाली' : '🇬🇧 English'}
    </button>
  );
}