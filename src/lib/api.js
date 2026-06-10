import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error('No active session token. Please log in again.');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function getOptionalAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}

export const api = {
  async getRemedies(symptom = null, { forAdmin = false, page = 1, limit = 10 } = {}) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (symptom) {
      params.set('symptom', symptom);
    }

    const url = `${API_BASE}/api/remedies?${params.toString()}`;

    const headers = forAdmin ? await getOptionalAuthHeaders() : {};

    const res = await fetch(url, {
      credentials: 'include',
      headers,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'Failed to fetch remedies');

    // return { data: [...], count }
    return data;
  },

  async postReview(remedyId, payload) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/remedies/${remedyId}/reviews`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body?.error || 'Failed to submit review');
    return body;
  },

  async getReviews(remedyId) {
    const headers = await getOptionalAuthHeaders();
    const res = await fetch(`${API_BASE}/api/remedies/${remedyId}/reviews`, {
      headers,
      credentials: 'include',
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body?.error || 'Failed to fetch reviews');
    // backend returns { success: true, counts: {approve,needs_revision,reject}, recent: [...] }
    return body;
  },

  async getRemedyById(id) {
    const headers = await getOptionalAuthHeaders();
    const res = await fetch(`${API_BASE}/api/remedies/${id}`, {
      credentials: 'include',
      headers,
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body?.error || 'Failed to fetch remedy');
    return body;
  },

  async updateRemedyStatus(id, status, { reviewNotes = '' } = {}) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/remedies/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        status,
        review_notes: reviewNotes,
      }),
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(payload?.error || 'Failed to update remedy status');
    }
    return payload;
  },

  async updateRemedy(id, changes) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/remedies/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(changes),
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(payload?.error || 'Failed to update remedy');
    }
    return payload;
  },

  async deleteRemedy(id) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/remedies/${id}`, {
      method: 'DELETE',
      headers,
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(payload?.error || 'Failed to delete remedy');
    }
    return payload;
  },

  async createRemedy(remedy) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/remedies`, {
      method: 'POST',
      headers,
      body: JSON.stringify(remedy),
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(payload?.error || 'Failed to create remedy');
    }
    return payload;
  },
};

