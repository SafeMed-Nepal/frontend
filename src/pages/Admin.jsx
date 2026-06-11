import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from "../lib/api";
import { useToast } from "../lib/ToastContext";
import { useAuth } from '../lib/AuthContext';
import {
  ThumbsUp,
  Edit3,
  ThumbsDown,
  RefreshCw,
  Plus,
  LayoutGrid,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

const STATUS_FILTERS = [
  { key: 'all', label: 'All', Icon: LayoutGrid },
  { key: 'draft', label: 'Draft', Icon: FileText },
  { key: 'needs_revision', label: 'Revision', Icon: AlertTriangle },
  { key: 'published', label: 'Published', Icon: CheckCircle2 },
  { key: 'rejected', label: 'Rejected', Icon: XCircle },
];

const EMPTY_REMEDY = {
  title_en: '', title_ne: '',
  description_en: '', description_ne: '',
  ingredients_en: '', ingredients_ne: '',
  steps_en: '', steps_ne: '',
  precautions_en: '', precautions_ne: '',
  warnings_en: '', warnings_ne: '',
  symptom_tags: '',
  video_url: '', source_url: '', source_label: '',
};

function StatusBadge({ status }) {
  const map = {
    published: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
    rejected: { bg: 'bg-red-50 text-red-700 border-red-200', Icon: XCircle },
    needs_revision: { bg: 'bg-amber-50 text-amber-700 border-amber-200', Icon: AlertTriangle },
    draft: { bg: 'bg-slate-50 text-slate-600 border-slate-200', Icon: FileText },
  };
  const config = map[status] || map.draft;
  const Icon = config.Icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${config.bg}`}>
      <Icon className="w-3 h-3" />
      {status.replace('_', ' ')}
    </span>
  );
}

function ReviewCounts({ counts }) {
  if (!counts) return null;
  return (
    <div className="flex items-center gap-2.5 text-xs text-gray-500">
      <span className="inline-flex items-center gap-0.5">
        <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
        {counts.approve || 0}
      </span>
      <span className="inline-flex items-center gap-0.5">
        <Edit3 className="w-3.5 h-3.5 text-amber-500" />
        {counts.needs_revision || 0}
      </span>
      <span className="inline-flex items-center gap-0.5">
        <ThumbsDown className="w-3.5 h-3.5 text-red-400" />
        {counts.reject || 0}
      </span>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export default function Admin() {
  const { i18n } = useTranslation();
  const [remedies, setRemedies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { userProfile } = useAuth();
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const [newRemedy, setNewRemedy] = useState({ ...EMPTY_REMEDY });

  // Open form via ?add=true query param (from deep-links)
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setShowAddForm(true);
      searchParams.delete('add');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const fetchRemedies = async () => {
    setLoading(true);
    try {
      const result = await api.getRemedies(null, { forAdmin: true, page, limit: 10 });
      setRemedies(result.data || []);
      setTotalCount(result.count || 0);
    } catch (err) {
      console.error('Admin fetchRemedies error:', err);
      showToast(`Failed to fetch remedies: ${err.message || 'Unknown error'}`, 'error');
      setRemedies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRemedies(); }, [page]);

  useEffect(() => {
    const onQueued = (e) => showToast(`Queued ${e.detail?.length || 0} offline review(s)`, 'success');
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
      const tagsArray = newRemedy.symptom_tags.split(',').map((t) => t.trim()).filter(Boolean);
      await api.createRemedy({ ...newRemedy, symptom_tags: tagsArray, status: 'draft' });
      showToast('Draft remedy created', 'success');
      setShowAddForm(false);
      setNewRemedy({ ...EMPTY_REMEDY });
      fetchRemedies();
    } catch (err) {
      showToast(err.message || 'Failed to create remedy', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRemedies = remedies.filter((r) => filter === 'all' || r.status === filter);
  const getField = (en, ne) => (i18n.language === 'ne' && ne ? ne : en);

  // Status counts for filter badges
  const statusCounts = remedies.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const inputClass = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition";
  const textareaClass = `${inputClass} resize-none`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-12">
      {/* ─── Header ─── */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Reviewer Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1 hidden sm:block">Select a remedy to review</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchRemedies}
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Remedy</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Filter chips (horizontally scrollable on mobile) ─── */}
      <div className="-mx-4 px-4 mb-5 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max pb-1">
          {STATUS_FILTERS.map(({ key, label, Icon }) => {
            const count = key === 'all' ? remedies.length : (statusCounts[key] || 0);
            const isActive = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${isActive
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                <span className={`text-xs ${isActive ? 'text-amber-100' : 'text-gray-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Remedy list ─── */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center">
            <RefreshCw className="w-6 h-6 text-amber-500 animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading remedies...</p>
          </div>
        ) : filteredRemedies.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-400 text-sm">No remedies found</p>
          </div>
        ) : (
          filteredRemedies.map((remedy) => (
            <button
              key={remedy.id}
              type="button"
              onClick={() => navigate(`/admin/remedy/${remedy.id}`)}
              className="w-full text-left bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-1 min-w-0">
                  {getField(remedy.title_en, remedy.title_ne)}
                </h2>
                <StatusBadge status={remedy.status} />
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                {getField(remedy.description_en, remedy.description_ne)}
              </p>
              <ReviewCounts counts={remedy.review_counts} />
            </button>
          ))
        )}
      </div>

      {/* ─── Pagination ─── */}
      {!loading && filteredRemedies.length > 0 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-400">{totalCount} total</span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-gray-50 rounded-lg disabled:opacity-40 hover:bg-gray-100 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>
            <span className="px-3 py-2 text-sm text-gray-600 bg-white border rounded-lg min-w-[4rem] text-center">
              {page}
            </span>
            <button
              disabled={remedies.length < 10}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-gray-50 rounded-lg disabled:opacity-40 hover:bg-gray-100 transition"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Add Remedy Modal ─── */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full sm:max-w-2xl rounded-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Add New Remedy</h2>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="w-9 h-9 rounded-full inline-flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body (scrollable) */}
            <div className="overflow-y-auto flex-1 px-5 py-4">
              <form id="add-remedy-form" onSubmit={handleAddRemedy} className="space-y-4">
                {/* Titles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="Title (English) *">
                    <input type="text" value={newRemedy.title_en} onChange={(e) => setNewRemedy({ ...newRemedy, title_en: e.target.value })} className={inputClass} placeholder="e.g. Ginger Honey Tea" required />
                  </FormField>
                  <FormField label="Title (Nepali)">
                    <input type="text" value={newRemedy.title_ne} onChange={(e) => setNewRemedy({ ...newRemedy, title_ne: e.target.value })} className={inputClass} placeholder="नेपाली शीर्षक" />
                  </FormField>
                </div>

                {/* Descriptions */}
                <FormField label="Description (English) *">
                  <textarea value={newRemedy.description_en} onChange={(e) => setNewRemedy({ ...newRemedy, description_en: e.target.value })} className={`${textareaClass} h-20`} placeholder="Brief description..." required />
                </FormField>
                <FormField label="Description (Nepali)">
                  <textarea value={newRemedy.description_ne} onChange={(e) => setNewRemedy({ ...newRemedy, description_ne: e.target.value })} className={`${textareaClass} h-20`} placeholder="नेपाली विवरण..." />
                </FormField>

                {/* Ingredients */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="Ingredients (EN)">
                    <textarea value={newRemedy.ingredients_en} onChange={(e) => setNewRemedy({ ...newRemedy, ingredients_en: e.target.value })} className={`${textareaClass} h-24`} placeholder="List ingredients..." />
                  </FormField>
                  <FormField label="Ingredients (NE)">
                    <textarea value={newRemedy.ingredients_ne} onChange={(e) => setNewRemedy({ ...newRemedy, ingredients_ne: e.target.value })} className={`${textareaClass} h-24`} placeholder="सामग्रीहरू..." />
                  </FormField>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="Steps (EN) *">
                    <textarea value={newRemedy.steps_en} onChange={(e) => setNewRemedy({ ...newRemedy, steps_en: e.target.value })} className={`${textareaClass} h-28`} placeholder="Step-by-step instructions..." required />
                  </FormField>
                  <FormField label="Steps (NE)">
                    <textarea value={newRemedy.steps_ne} onChange={(e) => setNewRemedy({ ...newRemedy, steps_ne: e.target.value })} className={`${textareaClass} h-28`} placeholder="चरणहरू..." />
                  </FormField>
                </div>

                {/* Precautions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="Precautions (EN)">
                    <textarea value={newRemedy.precautions_en} onChange={(e) => setNewRemedy({ ...newRemedy, precautions_en: e.target.value })} className={`${textareaClass} h-20`} placeholder="Any precautions..." />
                  </FormField>
                  <FormField label="Precautions (NE)">
                    <textarea value={newRemedy.precautions_ne} onChange={(e) => setNewRemedy({ ...newRemedy, precautions_ne: e.target.value })} className={`${textareaClass} h-20`} placeholder="सावधानीहरू..." />
                  </FormField>
                </div>

                {/* Warnings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="Warnings (EN)">
                    <textarea value={newRemedy.warnings_en} onChange={(e) => setNewRemedy({ ...newRemedy, warnings_en: e.target.value })} className={`${textareaClass} h-20`} placeholder="When to see a doctor..." />
                  </FormField>
                  <FormField label="Warnings (NE)">
                    <textarea value={newRemedy.warnings_ne} onChange={(e) => setNewRemedy({ ...newRemedy, warnings_ne: e.target.value })} className={`${textareaClass} h-20`} placeholder="डाक्टर कहिले भेट्ने..." />
                  </FormField>
                </div>

                {/* Tags */}
                <FormField label="Symptom Tags">
                  <input type="text" value={newRemedy.symptom_tags} onChange={(e) => setNewRemedy({ ...newRemedy, symptom_tags: e.target.value })} className={inputClass} placeholder="fever, cough, headache" />
                </FormField>

                {/* Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="Video URL">
                    <input type="url" value={newRemedy.video_url} onChange={(e) => setNewRemedy({ ...newRemedy, video_url: e.target.value })} className={inputClass} placeholder="https://youtube.com/..." />
                  </FormField>
                  <FormField label="Source URL">
                    <input type="url" value={newRemedy.source_url} onChange={(e) => setNewRemedy({ ...newRemedy, source_url: e.target.value })} className={inputClass} placeholder="https://..." />
                  </FormField>
                </div>
                <FormField label="Source Label">
                  <input type="text" value={newRemedy.source_label} onChange={(e) => setNewRemedy({ ...newRemedy, source_label: e.target.value })} className={inputClass} placeholder="e.g. Clinical guidance" />
                </FormField>
              </form>
            </div>

            {/* Modal footer (sticky) */}
            <div className="px-5 py-4 border-t border-gray-100 flex gap-3 shrink-0 bg-gray-50/80">
              <button
                type="submit"
                form="add-remedy-form"
                disabled={actionLoading}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-sm disabled:opacity-50 transition"
              >
                {actionLoading ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-5 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
