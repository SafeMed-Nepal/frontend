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
  async getRemedies(symptom = null, { forAdmin = false } = {}) {
    let url = `${API_BASE}/api/remedies`;
    if (symptom) {
      url += `?symptom=${encodeURIComponent(symptom)}`;
    }

    const headers = forAdmin ? await getOptionalAuthHeaders() : {};

    const res = await fetch(url, {
      credentials: 'include',
      headers,
    });

    if (!res.ok) throw new Error('Failed to fetch remedies');
    return res.json();
  },

  async getRemedyById(id) {
    const res = await fetch(`${API_BASE}/api/remedies/${id}`, {
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Failed to fetch remedy');
    return res.json();
  },

  async updateRemedyStatus(id, status, reviewerName = 'Reviewer') {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/remedies/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        status,
        reviewer_name: reviewerName,
      }),
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(payload?.error || 'Failed to update remedy status');
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

