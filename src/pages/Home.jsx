import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';

const symptoms = [
  { labelKey: 'home.symptoms.headache', tag: 'headache', en: 'Headache' },
  { labelKey: 'home.symptoms.cough', tag: 'cough', en: 'Cough' },
  { labelKey: 'home.symptoms.cold', tag: 'cold', en: 'Cold' },
  { labelKey: 'home.symptoms.fever', tag: 'fever', en: 'Fever' },
  { labelKey: 'home.symptoms.acidity', tag: 'acidity', en: 'Acidity' },
  { labelKey: 'home.symptoms.backPain', tag: 'backPain', en: 'Back Pain' },
  { labelKey: 'home.symptoms.soreThroat', tag: 'soreThroat', en: 'Sore Throat' },
];

export default function Home() {
  const { t, i18n } = useTranslation();
  const [remedies, setRemedies] = useState([]);
  const [allRemedies, setAllRemedies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRemedies = async (symptom = null) => {
    setLoading(true);
    setSelectedSymptom(symptom);
    try {
      const result = await api.getRemedies(symptom);
      const fetchedRemedies = result.data || [];
      setRemedies(fetchedRemedies);
      if (!symptom) {
        setAllRemedies(fetchedRemedies);
      }
    } catch (err) {
      console.error(err);
      setRemedies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemedies();
  }, []);

  const applySearch = (rawQuery) => {
    const query = rawQuery.trim().toLowerCase();
    setSelectedSymptom(null);

    if (!query) {
      setRemedies(allRemedies);
      return;
    }

    const filtered = allRemedies.filter((remedy) => {
      const englishTitle = (remedy.title_en || '').toLowerCase();
      const nepaliTitle = (remedy.title_ne || '').toLowerCase();
      const englishDescription = (remedy.description_en || '').toLowerCase();
      const nepaliDescription = (remedy.description_ne || '').toLowerCase();
      const tags = (remedy.symptom_tags || []).join(' ').toLowerCase();

      return (
        englishTitle.includes(query) ||
        nepaliTitle.includes(query) ||
        englishDescription.includes(query) ||
        nepaliDescription.includes(query) ||
        tags.includes(query)
      );
    });

    setRemedies(filtered);
  };

  const handleSearch = () => {
    applySearch(searchQuery);
  };

  useEffect(() => {
    if (loading) return;
    const timeoutId = setTimeout(() => {
      applySearch(searchQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, allRemedies, loading]);

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedSymptom(null);
    setRemedies(allRemedies);
  };

  const getTitle = (remedy) => i18n.language === 'ne' && remedy.title_ne ? remedy.title_ne : remedy.title_en;
  const getDescription = (remedy) => i18n.language === 'ne' && remedy.description_ne ? remedy.description_ne : remedy.description_en;

  return (
    <div className="max-w-2xl mx-auto p-4 pb-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-amber-600 mb-2">SafeMed Nepal</h1>
        <p className="text-gray-600">Doctor-verified traditional remedies</p>
      </div>

      <div className="mb-8 space-y-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          placeholder={t('home.searchPlaceholder', 'Search symptoms or remedies...')}
          className="w-full p-3 sm:p-4 rounded-2xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 text-base sm:text-lg"
        />
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSearch}
            className="w-full px-4 py-3 rounded-2xl bg-amber-600 text-white font-medium hover:bg-amber-700 active:scale-[0.99] transition"
          >
            {t('home.searchButton', 'Search')}
          </button>
          <button
            onClick={clearSearch}
            className="w-full px-4 py-3 rounded-2xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 active:scale-[0.99] transition"
          >
            {t('home.clearButton', 'Clear')}
          </button>
        </div>
      </div>

      <div className="mb-8 sm:mb-10 -mx-1 px-1 overflow-x-auto sm:overflow-visible">
        <div className="flex sm:flex-wrap gap-2 min-w-max sm:min-w-0 pb-1">
          {symptoms.map((sym) => (
            <button
              key={sym.tag}
              onClick={() => fetchRemedies(sym.tag)}
              className={`shrink-0 px-4 sm:px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                selectedSymptom === sym.tag
                  ? 'bg-amber-600 text-white'
                  : 'bg-white border border-gray-200 hover:border-amber-300'
              }`}
            >
              {t(sym.labelKey, sym.en)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">{t('home.loading', 'Loading remedies...')}</div>
      ) : remedies.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {t('home.noResults', 'No remedies found. Please consult a doctor.')}
        </div>
      ) : (
        <div className="space-y-4">
          {remedies.map((remedy) => (
            <Link
              key={remedy.id}
              to={`/remedy/${remedy.id}`}
              className="block bg-white p-4 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-amber-100"
            >
              <h3 className="text-xl font-semibold mb-2">{getTitle(remedy)}</h3>
              <p className="text-gray-600 line-clamp-2 mb-4">{getDescription(remedy)}</p>
              
              <div className="flex flex-wrap gap-2">
                {remedy.symptom_tags?.slice(0, 3).map((tag, i) => (
                  <span key={i} className="text-xs bg-amber-100 text-amber-700 px-4 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}