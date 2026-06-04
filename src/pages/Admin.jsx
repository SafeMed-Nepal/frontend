import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../lib/api";
import { useToast } from "../lib/ToastContext";
import { useAuth } from '../lib/AuthContext';
import { ThumbsUp, Edit3, ThumbsDown } from 'lucide-react';
import { enqueueReview } from '../lib/offlineReviews';

export default function Admin() {
  const { i18n } = useTranslation();
  const [remedies, setRemedies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRemedy, setSelectedRemedy] = useState(null);
  const { user, userProfile } = useAuth();
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const { showToast } = useToast();

  // Form State
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

  const fetchRemedies = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const result = await api.getRemedies(null, { forAdmin: true });
      // backend returns { success: true, data: [...], count }
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

  const submitReview = async (remedyId, decision) => {
    try {
      setActionLoading(true);
      if (!navigator.onLine) {
        // offline: enqueue for later sync
        await enqueueReview({ remedyId, decision, comment: '' });
        showToast('Offline: review queued and will be submitted when online', 'success');
      } else {
        await api.postReview(remedyId, { decision });
        showToast('Review submitted', 'success');
      }
      // refresh the list and the selected remedy's reviews
      await fetchRemedies();
      if (selectedRemedy?.id === remedyId) {
        const rev = await api.getReviews(remedyId);
        setSelectedRemedy((s) => ({ ...s, review_counts: rev.counts || {}, recent_reviews: rev.recent || [] }));
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      fetchRemedies(page);
    }, 0);

    return () => clearTimeout(t);
  }, [page]);

  useEffect(() => {
    // When a remedy is selected, fetch its reviews to show recent decisions
    if (!selectedRemedy) return;

    let mounted = true;
    const loadReviews = async () => {
      try {
        const res = await api.getReviews(selectedRemedy.id);
        if (!mounted) return;
        // backend returns { success: true, counts: {...}, recent: [...] }
        setSelectedRemedy((s) => ({ ...s, review_counts: res.counts || {}, recent_reviews: res.recentWithNames || res.recent || [] }));
      } catch (err) {
        console.error('Failed to load reviews:', err);
      }
    };

    loadReviews();

    const onQueued = (e) => {
      showToast(`Queued ${e.detail?.length || 0} offline review(s)`, 'success');
    };
    const onFlushed = (e) => {
      const { synced } = e.detail || {};
      if (synced > 0) {
        showToast(`${synced} offline review(s) synced`, 'success');
        fetchRemedies();
      }
    }
    window.addEventListener('offlineReviews:queued', onQueued);
    window.addEventListener('offlineReviews:flushed', onFlushed);

    return () => { mounted = false; };
  }, [selectedRemedy?.id]);

  const updateRemedyStatus = async (id, newStatus) => {
    setActionLoading(true);
    try {
      await api.updateRemedyStatus(id, newStatus);
      showToast(i18n.t('toast.success.marked', { status: newStatus }), 'success');
      setSelectedRemedy(null);
      fetchRemedies();
    } catch (err) {
      showToast(i18n.t('toast.error.updateRemedy', { error: err.message || 'Unknown error' }), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddRemedy = async (e) => {
    e.preventDefault();
    setActionLoading(true);

      try {
      const tagsArray = newRemedy.symptom_tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await api.createRemedy({
          ...newRemedy,
          symptom_tags: tagsArray,
          status: "draft",
      });
      showToast(i18n.t('toast.success.addedDraft'), 'success');
      setShowAddForm(false);
      setNewRemedy({
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
      fetchRemedies();
    } catch (err) {
      showToast(i18n.t('toast.error.addRemedy', { error: err.message || 'Unknown error' }), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRemedies = remedies.filter(
    (r) => filter === "all" || r.status === filter,
  );

  const getField = (en, ne) => (i18n.language === "ne" && ne ? ne : en);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-amber-700">
          SafeMed Nepal - Reviewer Dashboard
        </h1>
        <div className="flex gap-3">
          <button
            onClick={fetchRemedies}
            className="px-6 py-2 bg-gray-600 text-white rounded-xl"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-2 bg-amber-600 text-white rounded-xl font-semibold"
          >
            + Add New Remedy
          </button>
        </div>

              {/* placeholder for header area - recent reviews are shown in the right-side panel when a remedy is selected */}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "draft", "needs_revision", "published", "rejected"].map(
          (s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-6 py-2 rounded-full capitalize ${filter === s ? "bg-amber-600 text-white" : "bg-white border"}`}
            >
              {s.replace("_", " ")}
            </button>
          ),
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Remedies List */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl shadow-sm divide-y">
            {loading ? (
              <p className="p-12 text-center">Loading...</p>
            ) : (
              filteredRemedies.map((remedy) => (
                <div
                  key={remedy.id}
                  onClick={() => setSelectedRemedy(remedy)}
                  className="p-6 hover:bg-amber-50 cursor-pointer"
                >
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {getField(remedy.title_en, remedy.title_ne)}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {getField(remedy.description_en, remedy.description_ne)}
                      </p>
                    </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-4 py-1 text-xs rounded-full self-start ${remedy.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                >
                  {remedy.status}
                </span>
                <div className="text-xs text-gray-500 flex items-center gap-3">
                  <div className="flex items-center gap-1"><ThumbsUp className="w-4 h-4 text-green-600" /> <span>{remedy.review_counts?.approve || 0}</span></div>
                  <div className="flex items-center gap-1"><Edit3 className="w-4 h-4 text-amber-600" /> <span>{remedy.review_counts?.needs_revision || 0}</span></div>
                  <div className="flex items-center gap-1"><ThumbsDown className="w-4 h-4 text-red-600" /> <span>{remedy.review_counts?.reject || 0}</span></div>
                </div>

              {/* Recent reviewer decisions */}
              <div className="mt-6">
                <h4 className="font-semibold">Recent Reviewer Decisions</h4>
                <div className="mt-2 space-y-2">
                  {(!selectedRemedy?.recent_reviews || selectedRemedy.recent_reviews.length === 0) && (
                    <p className="text-sm text-gray-500">No reviews yet</p>
                  )}
                  {(selectedRemedy?.recent_reviews || []).map((r) => (
                    <div key={r.reviewer_id + r.updated_at} className="p-3 bg-gray-50 rounded-2xl">
                      <div className="flex justify-between">
                        <div>
                          <div className="text-sm font-medium">{r.reviewer_name || r.reviewer_display_name || r.reviewer_id}</div>
                          <div className="text-xs text-gray-600">{new Date(r.updated_at).toLocaleString()}</div>
                        </div>
                        <div className="text-sm font-semibold">
                          {r.decision}
                        </div>
          {/* pagination controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">Total: {totalCount}</div>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50">Prev</button>
              <div className="px-3 py-1 bg-white border rounded">Page {page}</div>
              <button disabled={remedies.length === 0 || remedies.length < 10} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50">Next</button>
            </div>
          </div>
                      </div>
                      {r.comment && <div className="mt-2 text-sm text-gray-700">{r.comment}</div>}
                    </div>
                  ))}
                </div>
              </div>
              </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Review Panel */}
        <div className="lg:col-span-5">
          {selectedRemedy ? (
            <div className="bg-white rounded-3xl shadow-sm p-6 sticky top-6 max-h-[85vh] overflow-auto">
              {/* Full remedy content display (same as before) */}
              <h2 className="font-bold text-xl mb-4">Reviewing Remedy</h2>
              <h3 className="text-2xl font-semibold">
                {getField(selectedRemedy.title_en, selectedRemedy.title_ne)}
              </h3>
              <p className="text-gray-600 mt-2">
                {getField(
                  selectedRemedy.description_en,
                  selectedRemedy.description_ne,
                )}
              </p>

              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="font-semibold">Ingredients</h4>
                  <p className="bg-gray-50 p-4 rounded-2xl">
                    {getField(
                      selectedRemedy.ingredients_en,
                      selectedRemedy.ingredients_ne,
                    )}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Steps</h4>
                  <div className="bg-gray-50 p-4 rounded-2xl whitespace-pre-line">
                    {getField(selectedRemedy.steps_en, selectedRemedy.steps_ne)}
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                {userProfile?.role === 'admin' ? (
                  <button
                    onClick={() =>
                      updateRemedyStatus(selectedRemedy.id, "published")
                    }
                    className="w-full py-4 bg-green-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-2"
                  >
                    Approve & Publish
                  </button>
                ) : (
                  <button
                    onClick={() => submitReview(selectedRemedy.id, 'approve')}
                    className="w-full py-4 bg-green-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-2"
                  >
                    Approve (Recommend)
                  </button>
                )}

                <button
                  onClick={() => submitReview(selectedRemedy.id, 'needs_revision')}
                  className="w-full py-4 bg-amber-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-2"
                >
                  Request Revision
                </button>
                <button
                  onClick={() => submitReview(selectedRemedy.id, 'reject')}
                  className="w-full py-4 bg-red-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-2"
                >
                  Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-gray-500">
              Select a remedy to review
            </div>
          )}
        </div>
      </div>

      {/* Add New Remedy Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-auto p-8">
            <h2 className="text-2xl font-bold mb-6">Add New Remedy</h2>

            <form onSubmit={handleAddRemedy} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Title (English) *"
                  value={newRemedy.title_en}
                  onChange={(e) =>
                    setNewRemedy({ ...newRemedy, title_en: e.target.value })
                  }
                  className="p-4 border rounded-2xl"
                  required
                />
                <input
                  type="text"
                  placeholder="Title (Nepali)"
                  value={newRemedy.title_ne}
                  onChange={(e) =>
                    setNewRemedy({ ...newRemedy, title_ne: e.target.value })
                  }
                  className="p-4 border rounded-2xl"
                />
              </div>

              <textarea
                placeholder="Description (English) *"
                value={newRemedy.description_en}
                onChange={(e) =>
                  setNewRemedy({ ...newRemedy, description_en: e.target.value })
                }
                className="w-full p-4 border rounded-2xl h-24"
                required
              />

              <textarea
                placeholder="Description (Nepali)"
                value={newRemedy.description_ne}
                onChange={(e) =>
                  setNewRemedy({ ...newRemedy, description_ne: e.target.value })
                }
                className="w-full p-4 border rounded-2xl h-24"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea
                  placeholder="Ingredients (English)"
                  value={newRemedy.ingredients_en}
                  onChange={(e) =>
                    setNewRemedy({
                      ...newRemedy,
                      ingredients_en: e.target.value,
                    })
                  }
                  className="p-4 border rounded-2xl h-28"
                />
                <textarea
                  placeholder="Ingredients (Nepali)"
                  value={newRemedy.ingredients_ne}
                  onChange={(e) =>
                    setNewRemedy({
                      ...newRemedy,
                      ingredients_ne: e.target.value,
                    })
                  }
                  className="p-4 border rounded-2xl h-28"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea
                  placeholder="Steps (English)"
                  value={newRemedy.steps_en}
                  onChange={(e) =>
                    setNewRemedy({ ...newRemedy, steps_en: e.target.value })
                  }
                  className="p-4 border rounded-2xl h-32"
                  required
                />
                <textarea
                  placeholder="Steps (Nepali)"
                  value={newRemedy.steps_ne}
                  onChange={(e) =>
                    setNewRemedy({ ...newRemedy, steps_ne: e.target.value })
                  }
                  className="p-4 border rounded-2xl h-32"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea
                  placeholder="Precautions (English)"
                  value={newRemedy.precautions_en}
                  onChange={(e) =>
                    setNewRemedy({ ...newRemedy, precautions_en: e.target.value })
                  }
                  className="p-4 border rounded-2xl h-28"
                />
                <textarea
                  placeholder="Precautions (Nepali)"
                  value={newRemedy.precautions_ne}
                  onChange={(e) =>
                    setNewRemedy({ ...newRemedy, precautions_ne: e.target.value })
                  }
                  className="p-4 border rounded-2xl h-28"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea
                  placeholder="Warnings (English)"
                  value={newRemedy.warnings_en}
                  onChange={(e) =>
                    setNewRemedy({ ...newRemedy, warnings_en: e.target.value })
                  }
                  className="p-4 border rounded-2xl h-28"
                />
                <textarea
                  placeholder="Warnings (Nepali)"
                  value={newRemedy.warnings_ne}
                  onChange={(e) =>
                    setNewRemedy({ ...newRemedy, warnings_ne: e.target.value })
                  }
                  className="p-4 border rounded-2xl h-28"
                />
              </div>

              <input
                type="text"
                placeholder="Symptom Tags (comma separated) e.g. fever,cough"
                value={newRemedy.symptom_tags}
                onChange={(e) =>
                  setNewRemedy({ ...newRemedy, symptom_tags: e.target.value })
                }
                className="w-full p-4 border rounded-2xl"
              />

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-semibold"
                >
                  {actionLoading ? "Saving..." : "Save as Draft"}
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
      {/* Using global ToastProvider: individual Toast usage removed */}
    </div>
  );
}
