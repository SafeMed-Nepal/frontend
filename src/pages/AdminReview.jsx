import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { useToast } from '../lib/ToastContext';
import { useAuth } from '../lib/AuthContext';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ThumbsUp,
  Edit3,
  Leaf,
  List,
  Shield,
  Play,
  Link2,
  Trash2,
  RefreshCw,
} from 'lucide-react';

export default function AdminReview() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const [remedy, setRemedy] = useState(null);
  const [counts, setCounts] = useState({ approve: 0, needs_revision: 0, reject: 0 });
  const [recentReviews, setRecentReviews] = useState([]);
  const [reviewComment, setReviewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editFields, setEditFields] = useState({
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
    video_url: '',
    source_url: '',
    source_label: '',
  });

  const getField = (en, ne) => (i18n.language === 'ne' && ne ? ne : en);

  const fetchRemedyAndReviews = async () => {
    setLoading(true);
    try {
      const remedyResult = await api.getRemedyById(id);
      const loadedRemedy = remedyResult.data;
      setRemedy(loadedRemedy);
      setEditFields({
        title_en: loadedRemedy.title_en || '',
        title_ne: loadedRemedy.title_ne || '',
        description_en: loadedRemedy.description_en || '',
        description_ne: loadedRemedy.description_ne || '',
        ingredients_en: loadedRemedy.ingredients_en || '',
        ingredients_ne: loadedRemedy.ingredients_ne || '',
        steps_en: loadedRemedy.steps_en || '',
        steps_ne: loadedRemedy.steps_ne || '',
        precautions_en: loadedRemedy.precautions_en || '',
        precautions_ne: loadedRemedy.precautions_ne || '',
        warnings_en: loadedRemedy.warnings_en || '',
        warnings_ne: loadedRemedy.warnings_ne || '',
        video_url: loadedRemedy.video_url || '',
        source_url: loadedRemedy.source_url || '',
        source_label: loadedRemedy.source_label || '',
      });

      const reviewResult = await api.getReviews(id);
      setCounts(reviewResult.counts || { approve: 0, needs_revision: 0, reject: 0 });
      setRecentReviews(reviewResult.recent || []);
    } catch (err) {
      console.error('AdminReview load error:', err);
      showToast(err.message || 'Failed to load remedy review page', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemedyAndReviews();
  }, [id]);

  const canEditRemedy = Boolean(remedy && user && (user.id === remedy.author_id || userProfile?.role === 'admin'));

  const handleReviewAction = async (decision) => {
    if (!remedy) return;
    setActionLoading(true);
    try {
      if (userProfile?.role === 'admin') {
        if (!['published', 'needs_revision', 'rejected'].includes(decision)) {
          showToast('Invalid admin action', 'error');
          return;
        }
        await api.updateRemedyStatus(id, decision, { reviewNotes: reviewComment });
        showToast(
          decision === 'published'
            ? 'Remedy published successfully'
            : decision === 'needs_revision'
            ? 'Remedy marked for revision'
            : 'Remedy rejected',
          'success'
        );
      } else {
        await api.postReview(id, { decision, comment: reviewComment });
        showToast('Review submitted', 'success');
      }
      setReviewComment('');
      await fetchRemedyAndReviews();
    } catch (err) {
      console.error('Review action failed:', err);
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRemedy = async (e) => {
    e.preventDefault();
    if (!remedy) return;
    setActionLoading(true);
    try {
      await api.updateRemedy(id, editFields);
      showToast('Remedy updated successfully', 'success');
      setIsEditing(false);
      await fetchRemedyAndReviews();
    } catch (err) {
      console.error('Remedy update failed:', err);
      showToast(err.message || 'Failed to update remedy', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRemedy = async () => {
    if (!remedy) return;
    setShowDeleteConfirm(false);
    setActionLoading(true);
    try {
      await api.deleteRemedy(id);
      showToast('Remedy deleted successfully', 'success');
      navigate('/admin');
    } catch (err) {
      console.error('Delete remedy failed:', err);
      showToast(err.message || 'Failed to delete remedy', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center text-gray-700">Loading remedy review...</div>
      </div>
    );
  }

  if (!remedy) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm p-6 text-center">
          <p className="text-gray-700">Remedy not found.</p>
          <button
            onClick={() => navigate('/admin')}
            className="mt-4 px-5 py-3 bg-amber-600 text-white rounded-2xl"
          >
            Back to reviewer dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <Link to="/admin" className="inline-flex items-center text-amber-700 hover:underline text-sm mb-2">
            ← Back to reviewer dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Review Remedy</h1>
          <p className="text-gray-600 mt-2">
            {getField(remedy.description_en, remedy.description_ne)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`min-h-[44px] px-3.5 py-2 rounded-full text-sm font-semibold capitalize inline-flex items-center gap-2 border ${
            remedy.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' :
            remedy.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
            remedy.status === 'needs_revision' ? 'bg-amber-50 text-amber-700 border-amber-200' :
            'bg-slate-50 text-slate-700 border-slate-200'
          }`}>
            {remedy.status === 'published' ? (
              <CheckCircle2 className="w-4 h-4 text-green-700" />
            ) : remedy.status === 'rejected' ? (
              <XCircle className="w-4 h-4 text-red-700" />
            ) : remedy.status === 'needs_revision' ? (
              <AlertTriangle className="w-4 h-4 text-amber-700" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-slate-500" />
            )}
            {remedy.status.replace('_', ' ')}
          </span>

          <span className="min-h-[44px] px-3 py-2 rounded-full bg-green-50 text-sm text-green-700 inline-flex items-center gap-2">
            <ThumbsUp className="w-4 h-4" />
            {counts.approve || 0} approves
          </span>

          <span className="min-h-[44px] px-3 py-2 rounded-full bg-amber-50 text-sm text-amber-700 inline-flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            {counts.needs_revision || 0} revisions
          </span>

          <span className="min-h-[44px] px-3 py-2 rounded-full bg-red-50 text-sm text-red-700 inline-flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            {counts.reject || 0} rejects
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h2 className="font-semibold text-xl mb-4">Remedy Details</h2>
              </div>
              {canEditRemedy && (
                <button
                  type="button"
                  onClick={() => setIsEditing((value) => !value)}
                  className="px-4 py-2 rounded-2xl border border-amber-600 text-amber-700 hover:bg-amber-50"
                >
                  {isEditing ? 'Cancel edit' : 'Edit remedy'}
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateRemedy} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title (English)</label>
                    <input
                      type="text"
                      value={editFields.title_en}
                      onChange={(e) => setEditFields({ ...editFields, title_en: e.target.value })}
                      className="w-full p-4 border rounded-3xl"
                      placeholder="Title (English)"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title (Nepali)</label>
                    <input
                      type="text"
                      value={editFields.title_ne}
                      onChange={(e) => setEditFields({ ...editFields, title_ne: e.target.value })}
                      className="w-full p-4 border rounded-3xl"
                      placeholder="Title (Nepali)"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description (English)</label>
                  <textarea
                    value={editFields.description_en}
                    onChange={(e) => setEditFields({ ...editFields, description_en: e.target.value })}
                    className="w-full p-4 border rounded-3xl h-28"
                    placeholder="Description (English)"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Nepali)</label>
                  <textarea
                    value={editFields.description_ne}
                    onChange={(e) => setEditFields({ ...editFields, description_ne: e.target.value })}
                    className="w-full p-4 border rounded-3xl h-28"
                    placeholder="Description (Nepali)"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ingredients (English)</label>
                    <textarea
                      value={editFields.ingredients_en}
                      onChange={(e) => setEditFields({ ...editFields, ingredients_en: e.target.value })}
                      className="w-full p-4 border rounded-3xl h-28"
                      placeholder="Ingredients (English)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ingredients (Nepali)</label>
                    <textarea
                      value={editFields.ingredients_ne}
                      onChange={(e) => setEditFields({ ...editFields, ingredients_ne: e.target.value })}
                      className="w-full p-4 border rounded-3xl h-28"
                      placeholder="Ingredients (Nepali)"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Steps (English)</label>
                    <textarea
                      value={editFields.steps_en}
                      onChange={(e) => setEditFields({ ...editFields, steps_en: e.target.value })}
                      className="w-full p-4 border rounded-3xl h-32"
                      placeholder="Steps (English)"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Steps (Nepali)</label>
                    <textarea
                      value={editFields.steps_ne}
                      onChange={(e) => setEditFields({ ...editFields, steps_ne: e.target.value })}
                      className="w-full p-4 border rounded-3xl h-32"
                      placeholder="Steps (Nepali)"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Precautions (English)</label>
                    <textarea
                      value={editFields.precautions_en}
                      onChange={(e) => setEditFields({ ...editFields, precautions_en: e.target.value })}
                      className="w-full p-4 border rounded-3xl h-28"
                      placeholder="Precautions (English)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Precautions (Nepali)</label>
                    <textarea
                      value={editFields.precautions_ne}
                      onChange={(e) => setEditFields({ ...editFields, precautions_ne: e.target.value })}
                      className="w-full p-4 border rounded-3xl h-28"
                      placeholder="Precautions (Nepali)"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Warnings (English)</label>
                    <textarea
                      value={editFields.warnings_en}
                      onChange={(e) => setEditFields({ ...editFields, warnings_en: e.target.value })}
                      className="w-full p-4 border rounded-3xl h-28"
                      placeholder="Warnings (English)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Warnings (Nepali)</label>
                    <textarea
                      value={editFields.warnings_ne}
                      onChange={(e) => setEditFields({ ...editFields, warnings_ne: e.target.value })}
                      className="w-full p-4 border rounded-3xl h-28"
                      placeholder="Warnings (Nepali)"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Video URL</label>
                    <input
                      type="url"
                      value={editFields.video_url}
                      onChange={(e) => setEditFields({ ...editFields, video_url: e.target.value })}
                      className="w-full p-4 border rounded-3xl"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Source URL</label>
                    <input
                      type="url"
                      value={editFields.source_url}
                      onChange={(e) => setEditFields({ ...editFields, source_url: e.target.value })}
                      className="w-full p-4 border rounded-3xl"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Source Label</label>
                  <input
                    type="text"
                    value={editFields.source_label}
                    onChange={(e) => setEditFields({ ...editFields, source_label: e.target.value })}
                    className="w-full p-4 border rounded-3xl"
                    placeholder="Clinical guidance, hospital handout, reviewed article"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-600 text-white font-semibold hover:bg-amber-700 disabled:opacity-50"
                  >
                    Save changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-5 text-gray-700">
                <div>
                  <h3 className="font-semibold">Ingredients</h3>
                  <p className="mt-2 whitespace-pre-line">{getField(remedy.ingredients_en, remedy.ingredients_ne)}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Steps</h3>
                  <p className="mt-2 whitespace-pre-line">{getField(remedy.steps_en, remedy.steps_ne)}</p>
                </div>
                {remedy.precautions_en || remedy.precautions_ne ? (
                  <div>
                    <h3 className="font-semibold">Precautions</h3>
                    <p className="mt-2 whitespace-pre-line">{getField(remedy.precautions_en, remedy.precautions_ne)}</p>
                  </div>
                ) : null}
                {remedy.warnings_en || remedy.warnings_ne ? (
                  <div>
                    <h3 className="font-semibold">Warnings</h3>
                    <p className="mt-2 whitespace-pre-line text-amber-700">{getField(remedy.warnings_en, remedy.warnings_ne)}</p>
                  </div>
                ) : null}
                {remedy.video_url ? (
                  <div>
                    <h3 className="font-semibold">Video</h3>
                    <a className="mt-2 inline-block text-amber-700 underline break-all" href={remedy.video_url} target="_blank" rel="noreferrer">
                      {remedy.video_url}
                    </a>
                  </div>
                ) : null}
                {remedy.source_url ? (
                  <div>
                    <h3 className="font-semibold">Source</h3>
                    <a className="mt-2 inline-block text-amber-700 underline break-all" href={remedy.source_url} target="_blank" rel="noreferrer">
                      {remedy.source_label || remedy.source_url}
                    </a>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-6">
            <h2 className="font-semibold text-xl mb-4">Reviewer Feedback</h2>
            {userProfile?.role !== 'admin' ? (
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">Review comment (optional)</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  className="w-full p-4 border rounded-3xl bg-gray-50 text-gray-900"
                  placeholder="Add feedback or revision details"
                />

                <div className="grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => handleReviewAction('approve')}
                    disabled={actionLoading}
                    className="w-full min-h-[44px] py-4 rounded-2xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReviewAction('needs_revision')}
                    disabled={actionLoading}
                    className="w-full py-4 rounded-2xl bg-amber-600 text-white font-semibold hover:bg-amber-700 disabled:opacity-50"
                  >
                    Request revision
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReviewAction('reject')}
                    disabled={actionLoading}
                    className="w-full py-4 rounded-2xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Admins can update status or delete this remedy.</p>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  className="w-full p-4 border rounded-3xl bg-gray-50 text-gray-900"
                  placeholder="Revision or rejection note"
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => handleReviewAction('published')}
                    disabled={actionLoading}
                    className="w-full py-4 rounded-2xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
                  >
                    Publish remedy
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReviewAction('needs_revision')}
                    disabled={actionLoading}
                    className="w-full py-4 rounded-2xl bg-amber-600 text-white font-semibold hover:bg-amber-700 disabled:opacity-50"
                  >
                    Request revision
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReviewAction('rejected')}
                    disabled={actionLoading}
                    className="w-full py-4 rounded-2xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject remedy
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={actionLoading}
                  className="w-full py-4 rounded-2xl border border-red-600 text-red-600 font-semibold hover:bg-red-50 disabled:opacity-50"
                >
                  Delete remedy
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-6">
            <h2 className="font-semibold text-xl mb-4">Recent Reviewer Decisions</h2>
            <div className="space-y-4">
              {recentReviews.length === 0 ? (
                <p className="text-gray-500">No decisions submitted yet.</p>
              ) : (
                recentReviews.map((review) => (
                  <div key={`${review.reviewer_id}-${review.updated_at}`} className="border border-gray-100 rounded-3xl p-4 bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {review.reviewer_name || review.reviewer_id}
                          {review.reviewer_credentials ? `, ${review.reviewer_credentials}` : ''}
                        </p>
                        <p className="text-sm text-gray-500">{new Date(review.updated_at).toLocaleString()}</p>
                      </div>
                      <div className={`rounded-full px-3 py-1 text-sm font-semibold capitalize border ${
                        review.decision === 'approve' ? 'bg-green-50 text-green-700 border-green-200' :
                        review.decision === 'needs_revision' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        review.decision === 'reject' || review.decision === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {review.decision.replace('_', ' ')}
                      </div>
                    </div>
                    {review.comment ? <p className="mt-3 text-gray-700 whitespace-pre-line">{review.comment}</p> : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <h2 className="font-semibold text-xl mb-4">Remedy summary</h2>
            <div className="space-y-3 text-gray-700">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Title</h3>
                <p className="mt-2 text-lg font-semibold text-gray-900">{getField(remedy.title_en, remedy.title_ne)}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Symptoms</h3>
                <p className="mt-2 text-gray-700">{(remedy.symptom_tags || []).join(', ') || 'None'}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Submitted</h3>
                <p className="mt-2 text-gray-700">{new Date(remedy.created_at).toLocaleString()}</p>
              </div>
              {remedy.reviewer_name ? (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Last reviewer</h3>
                  <p className="mt-2 text-gray-700">
                    {remedy.reviewer_name}
                    {remedy.reviewer_credentials ? `, ${remedy.reviewer_credentials}` : ''}
                  </p>
                </div>
              ) : null}
              {remedy.review_notes ? (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Review notes</h3>
                  <p className="mt-2 text-gray-700 whitespace-pre-line">{remedy.review_notes}</p>
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900">Delete remedy?</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              This will soft-delete the remedy from public and reviewer lists. Admins can recover it later from the database if needed.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleDeleteRemedy}
                disabled={actionLoading}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={actionLoading}
                className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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
