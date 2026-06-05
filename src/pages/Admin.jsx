import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import { api } from "../lib/api";
import { useToast } from "../lib/ToastContext";
import { useAuth } from '../lib/AuthContext';
import { ThumbsUp, Edit3, ThumbsDown } from 'lucide-react';

export default function Admin() {
  const { i18n } = useTranslation();
  const [remedies, setRemedies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { userProfile } = useAuth();
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [newRemedy, setNewRemedy] = useState({
    title_en: "",
    title_ne: "",
    description_en: "",
    description_ne: "",
    ingredients_en: "",
    ingredients_ne: "",
    steps_en: "",
    steps_ne: "",
    precautions_en: "",
    precautions_ne: "",
    warnings_en: "",
    warnings_ne: "",
    symptom_tags: "",
  });

  const fetchRemedies = async () => {
    setLoading(true);
    try {
      const result = await api.getRemedies(null, { forAdmin: true });
      setRemedies(result.data || []);
      setTotalCount(result.count || 0);
      if (!result.data) console.warn('No data field in getRemedies response:', result);
    } catch (err) {
      console.error('Admin fetchRemedies error:', err);
      showToast(`Failed to fetch remedies: ${err.message || 'Unknown error'}`, 'error');
      setRemedies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemedies();
  }, [page]);

  useEffect(() => {
    const onQueued = (e) => {
      showToast(`Queued ${e.detail?.length || 0} offline review(s)`, 'success');
    };
    const onFlushed = (e) => {
      const { synced } = e.detail || {};
      if (synced > 0) {
        showToast(`${synced} offline review(s) synced`, 'success');
        fetchRemedies();
      }
    };

    window.addEventListener('offlineReviews:queued', onQueued);
    window.addEventListener('offlineReviews:flushed', onFlushed);

    return () => {
      window.removeEventListener('offlineReviews:queued', onQueued);
      window.removeEventListener('offlineReviews:flushed', onFlushed);
    };
  }, []);

  const handleAddRemedy = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const tagsArray = newRemedy.symptom_tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await api.createRemedy({
        ...newRemedy,
        symptom_tags: tagsArray,
        status: 'draft',
      });
      showToast('Draft remedy created', 'success');
      setShowAddForm(false);
      setNewRemedy({
        title_en: '',
        title_ne: '',
        description_en: '',
        description_ne: '',
        ingredients_en: '',
        ingredients_ne: '',
        steps_en: '',
        steps_ne: '',
        precautions_en: '',
        precautions_ne: '',
        warnings_en: '',
        warnings_ne: '',
        symptom_tags: '',
      });
      fetchRemedies();
    } catch (err) {
      showToast(err.message || 'Failed to create remedy', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRemedies = remedies.filter((r) => filter === 'all' || r.status === filter);
  const getField = (en, ne) => (i18n.language === 'ne' && ne ? ne : en);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-amber-700">SafeMed Nepal - Reviewer Dashboard</h1>
          <p className="text-gray-600 mt-2">Select a remedy to review and open a dedicated interaction page.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={fetchRemedies} className="px-6 py-2 bg-gray-600 text-white rounded-xl">
            Refresh
          </button>
          <button onClick={() => navigate('/admin/profile')} className="px-6 py-2 bg-slate-100 text-slate-800 rounded-xl hover:bg-slate-200">
            Profile
          </button>
          <button onClick={() => setShowAddForm(true)} className="px-6 py-2 bg-amber-600 text-white rounded-xl font-semibold">
            + Add New Remedy
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'draft', 'needs_revision', 'published', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-6 py-2 rounded-full capitalize ${filter === s ? 'bg-amber-600 text-white' : 'bg-white border'}`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="p-12 text-center">Loading remedies...</p>
        ) : filteredRemedies.length === 0 ? (
          <p className="p-12 text-center text-gray-500">No remedies found.</p>
        ) : (
          filteredRemedies.map((remedy) => (
            <div
              key={remedy.id}
              onClick={() => navigate(`/admin/remedy/${remedy.id}`)}
              className="group cursor-pointer rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md hover:bg-amber-50"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">{getField(remedy.title_en, remedy.title_ne)}</h2>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">{getField(remedy.description_en, remedy.description_ne)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${remedy.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {remedy.status.replace('_', ' ')}
                  </span>
                  <div className="text-xs text-gray-500 flex items-center gap-3">
                    <div className="flex items-center gap-1"><ThumbsUp className="w-4 h-4 text-green-600" /> <span>{remedy.review_counts?.approve || 0}</span></div>
                    <div className="flex items-center gap-1"><Edit3 className="w-4 h-4 text-amber-600" /> <span>{remedy.review_counts?.needs_revision || 0}</span></div>
                    <div className="flex items-center gap-1"><ThumbsDown className="w-4 h-4 text-red-600" /> <span>{remedy.review_counts?.reject || 0}</span></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-auto p-8">
            <h2 className="text-2xl font-bold mb-6">Add New Remedy</h2>
            <form onSubmit={handleAddRemedy} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title (English)</label>
                  <input
                    type="text"
                    placeholder="Title (English) *"
                    value={newRemedy.title_en}
                    onChange={(e) => setNewRemedy({ ...newRemedy, title_en: e.target.value })}
                    className="w-full p-4 border rounded-2xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title (Nepali)</label>
                  <input
                    type="text"
                    placeholder="Title (Nepali)"
                    value={newRemedy.title_ne}
                    onChange={(e) => setNewRemedy({ ...newRemedy, title_ne: e.target.value })}
                    className="w-full p-4 border rounded-2xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description (English)</label>
                <textarea
                  placeholder="Description (English) *"
                  value={newRemedy.description_en}
                  onChange={(e) => setNewRemedy({ ...newRemedy, description_en: e.target.value })}
                  className="w-full p-4 border rounded-2xl h-24"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Nepali)</label>
                <textarea
                  placeholder="Description (Nepali)"
                  value={newRemedy.description_ne}
                  onChange={(e) => setNewRemedy({ ...newRemedy, description_ne: e.target.value })}
                  className="w-full p-4 border rounded-2xl h-24"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ingredients (English)</label>
                  <textarea
                    placeholder="Ingredients (English)"
                    value={newRemedy.ingredients_en}
                    onChange={(e) => setNewRemedy({ ...newRemedy, ingredients_en: e.target.value })}
                    className="w-full p-4 border rounded-2xl h-28"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ingredients (Nepali)</label>
                  <textarea
                    placeholder="Ingredients (Nepali)"
                    value={newRemedy.ingredients_ne}
                    onChange={(e) => setNewRemedy({ ...newRemedy, ingredients_ne: e.target.value })}
                    className="w-full p-4 border rounded-2xl h-28"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Steps (English)</label>
                  <textarea
                    placeholder="Steps (English)"
                    value={newRemedy.steps_en}
                    onChange={(e) => setNewRemedy({ ...newRemedy, steps_en: e.target.value })}
                    className="w-full p-4 border rounded-2xl h-32"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Steps (Nepali)</label>
                  <textarea
                    placeholder="Steps (Nepali)"
                    value={newRemedy.steps_ne}
                    onChange={(e) => setNewRemedy({ ...newRemedy, steps_ne: e.target.value })}
                    className="w-full p-4 border rounded-2xl h-32"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Precautions (English)</label>
                  <textarea
                    placeholder="Precautions (English)"
                    value={newRemedy.precautions_en}
                    onChange={(e) => setNewRemedy({ ...newRemedy, precautions_en: e.target.value })}
                    className="w-full p-4 border rounded-2xl h-28"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Precautions (Nepali)</label>
                  <textarea
                    placeholder="Precautions (Nepali)"
                    value={newRemedy.precautions_ne}
                    onChange={(e) => setNewRemedy({ ...newRemedy, precautions_ne: e.target.value })}
                    className="w-full p-4 border rounded-2xl h-28"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Warnings (English)</label>
                  <textarea
                    placeholder="Warnings (English)"
                    value={newRemedy.warnings_en}
                    onChange={(e) => setNewRemedy({ ...newRemedy, warnings_en: e.target.value })}
                    className="w-full p-4 border rounded-2xl h-28"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Warnings (Nepali)</label>
                  <textarea
                    placeholder="Warnings (Nepali)"
                    value={newRemedy.warnings_ne}
                    onChange={(e) => setNewRemedy({ ...newRemedy, warnings_ne: e.target.value })}
                    className="w-full p-4 border rounded-2xl h-28"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Symptom Tags</label>
                <input
                  type="text"
                  placeholder="Symptom Tags (comma separated) e.g. fever,cough"
                  value={newRemedy.symptom_tags}
                  onChange={(e) => setNewRemedy({ ...newRemedy, symptom_tags: e.target.value })}
                  className="w-full p-4 border rounded-2xl"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-semibold"
                >
                  {actionLoading ? 'Saving...' : 'Save as Draft'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-4 bg-gray-200 hover:bg-gray-300 rounded-2xl font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
