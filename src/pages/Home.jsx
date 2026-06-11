import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import VerifiedBadge from '../components/VerifiedBadge';
import { useToast } from '../lib/ToastContext';

const symptoms = [
  { labelKey: 'home.symptoms.headache', tag: 'headache', en: 'Headache' },
  { labelKey: 'home.symptoms.cough', tag: 'cough', en: 'Cough' },
  { labelKey: 'home.symptoms.cold', tag: 'cold', en: 'Cold' },
  { labelKey: 'home.symptoms.fever', tag: 'fever', en: 'Fever' },
  { labelKey: 'home.symptoms.acidity', tag: 'acidity', en: 'Acidity' },
  { labelKey: 'home.symptoms.backPain', tag: 'backPain', en: 'Back Pain' },
  { labelKey: 'home.symptoms.soreThroat', tag: 'soreThroat', en: 'Sore Throat' },
];

function SkeletonCard() {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 animate-pulse">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="h-5 bg-gray-200 rounded-lg w-3/5" />
        <div className="h-5 bg-green-100 rounded-full w-24" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3.5 bg-gray-100 rounded w-full" />
        <div className="h-3.5 bg-gray-100 rounded w-4/5" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 bg-amber-50 rounded-full w-16" />
        <div className="h-6 bg-amber-50 rounded-full w-14" />
      </div>
    </div>
  );
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const [remedies, setRemedies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [allRemedies, setAllRemedies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRemedies = async (symptom = null, pg = 1) => {
    setLoading(true);
    setSelectedSymptom(symptom);
    try {
      const result = await api.getRemedies(symptom, { page: pg, limit: 10 });
      const fetchedRemedies = result.data || [];
      setRemedies(fetchedRemedies);
      setTotalCount(result.count || 0);
      if (!symptom) {
        setAllRemedies(fetchedRemedies);
      }
    } catch (err) {
      console.error(err);
      setRemedies([]);
      showToast(t('toast.error.fetchRemedies', { error: err.message || 'Unknown error' }), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemedies(selectedSymptom, page);
  }, [page]);

  const filterRemedies = useCallback((list, rawQuery) => {
    const query = rawQuery.trim().toLowerCase();
    if (!query) return list;

    return list.filter((remedy) => {
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
  }, []);

  const handleSymptomClick = (tag) => {
    setSearchQuery('');
    setPage(1);
    fetchRemedies(tag);
  };

  const handleSearch = () => {
    if (selectedSymptom) {
      const filtered = filterRemedies(remedies, searchQuery);
      setRemedies(filtered);
      return;
    }
    setRemedies(filterRemedies(allRemedies, searchQuery));
  };

  useEffect(() => {
    if (loading || selectedSymptom) return;

    const timeoutId = setTimeout(() => {
      setRemedies(filterRemedies(allRemedies, searchQuery));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, allRemedies, loading, selectedSymptom, filterRemedies]);

  const clearSearch = () => {
    setSearchQuery('');
    if (selectedSymptom) {
      fetchRemedies(selectedSymptom);
      return;
    }
    setRemedies(allRemedies);
  };

  const clearSymptomFilter = () => {
    setSelectedSymptom(null);
    setSearchQuery('');
    setPage(1);
    fetchRemedies();
  };

  const getTitle = (remedy) => i18n.language === 'ne' && remedy.title_ne ? remedy.title_ne : remedy.title_en;
  const getDescription = (remedy) => i18n.language === 'ne' && remedy.description_ne ? remedy.description_ne : remedy.description_en;

  return (
    <div className="max-w-2xl mx-auto p-4 pb-12">
      <div className="text-center mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-amber-600 mb-2">SafeMed Nepal</h1>
        <p className="text-gray-600">{t('home.tagline')}</p>
      </div>

      <div className="mb-8 space-y-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
          placeholder={t('home.searchPlaceholder')}
          className="w-full p-3 sm:p-4 rounded-2xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 text-base sm:text-lg"
        />
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleSearch}
            className="w-full px-4 py-3 rounded-2xl bg-amber-600 text-white font-medium hover:bg-amber-700 active:scale-[0.99] transition"
          >
            {t('home.searchButton')}
          </button>
          <button
            type="button"
            onClick={clearSearch}
            className="w-full px-4 py-3 rounded-2xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 active:scale-[0.99] transition"
          >
            {t('home.clearButton')}
          </button>
        </div>
      </div>

      <div className="mb-8 sm:mb-10 -mx-1 px-1 overflow-x-auto sm:overflow-visible scrollbar-hide">
        <div className="flex sm:flex-wrap gap-2 min-w-max sm:min-w-0 pb-1">
          {symptoms.map((sym) => (
            <button
              key={sym.tag}
              type="button"
              onClick={() => handleSymptomClick(sym.tag)}
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
        {selectedSymptom && (
          <button
            type="button"
            onClick={clearSymptomFilter}
            className="mt-2 text-sm text-amber-700 underline"
          >
            {t('home.clearButton')} ({selectedSymptom})
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : remedies.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {t('home.noResults')}
        </div>
      ) : (
        <div className="space-y-4">
          {remedies.map((remedy) => (
            <Link
              key={remedy.id}
              to={`/remedy/${remedy.id}`}
              className="block bg-white p-4 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-amber-100"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <h3 className="text-lg sm:text-xl font-semibold flex-1">{getTitle(remedy)}</h3>
                <VerifiedBadge remedy={remedy} size="sm" />
              </div>
              <p className="text-gray-600 line-clamp-2 mb-4">{getDescription(remedy)}</p>

              <div className="flex flex-wrap gap-2">
                {remedy.symptom_tags?.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs bg-amber-100 text-amber-700 px-4 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 max-w-2xl mx-auto">
        <div className="text-sm text-gray-600">Total: {totalCount}</div>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50">Prev</button>
          <div className="px-3 py-1 bg-white border rounded">Page {page}</div>
          <button disabled={remedies.length === 0 || remedies.length < 10} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}
