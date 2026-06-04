import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import Toast from '../components/Toast';
import { useToast } from '../lib/ToastContext';
import VerifiedBadge from '../components/VerifiedBadge';
import { ArrowLeft, AlertTriangle, DownloadCloud, CheckCircle } from 'lucide-react';

export default function RemedyDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [remedy, setRemedy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchRemedy = async () => {
      setLoading(true);
      try {
        const result = await api.getRemedyById(id);
        setRemedy(result.data);
      } catch (err) {
        // Fallback to offline cache
        const cached = localStorage.getItem(`remedy_${id}`);
        if (cached) {
          setRemedy(JSON.parse(cached));
        } else {
          console.error('Failed to load remedy:', err);
          showToast(i18n.t('toast.error.loadRemedy', { error: err.message || 'Unknown error' }), 'error');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRemedy();
  }, [id]);

  const saveForOffline = () => {
    if (!remedy) return;
    
    localStorage.setItem(`remedy_${remedy.id}`, JSON.stringify(remedy));
    setSaved(true);
    showToast(i18n.t('toast.success.savedOffline'), 'success');
    
    setTimeout(() => setSaved(false), 2000);
  };

  const getTitle = () => i18n.language === 'ne' && remedy?.title_ne ? remedy.title_ne : remedy?.title_en;
  const getField = (enField, neField) => i18n.language === 'ne' && neField ? neField : enField;

  if (loading) return <div className="text-center mt-20 text-lg">Loading remedy...</div>;
  if (!remedy) return <div className="text-center mt-20">Remedy not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 pb-12">
    <Link to="/" className="inline-flex items-center text-amber-600 mb-6 hover:underline">
        <ArrowLeft aria-hidden size={18} className="mr-2" /> {t('remedy.back', 'Back to Home')}
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold mb-4 leading-tight">{getTitle()}</h1>

      <div className="mb-6">
        <VerifiedBadge remedy={remedy} />
      </div>

      {/* Prominent Warning Box */}
      {(remedy.warnings_en || remedy.warnings_ne) && (
        <div className="bg-amber-100 border-l-4 border-amber-500 p-5 rounded-2xl mb-8 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle size={28} className="text-amber-700" aria-hidden />
            <div>
              <p className="font-bold text-amber-800 text-lg mb-1">
                {t('remedy.warnings', 'When to see a doctor')}:
              </p>
              <p className="text-amber-700 leading-relaxed">
                {getField(remedy.warnings_en, remedy.warnings_ne)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm">
          <h2 className="font-semibold text-lg mb-3">{t('remedy.ingredients', 'Ingredients')}</h2>
          <p className="text-gray-700 leading-relaxed">
            {getField(remedy.ingredients_en, remedy.ingredients_ne)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm">
          <h2 className="font-semibold text-lg mb-3">{t('remedy.steps', 'Steps')}</h2>
          <div className="whitespace-pre-line text-gray-700 leading-relaxed">
            {getField(remedy.steps_en, remedy.steps_ne)}
          </div>
        </div>
      </div>

      {/* Save for Offline Button */}
      <button
        onClick={saveForOffline}
        className="mt-8 w-full py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-semibold text-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
        disabled={saved}
      >
        {saved ? <CheckCircle size={18} aria-hidden /> : <DownloadCloud size={18} aria-hidden />} {t('remedy.saveOffline', 'Save for Offline')}
      </button>

      {/* Toast displayed via ToastProvider */}
    </div>
  );
}