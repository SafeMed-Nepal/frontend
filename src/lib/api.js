const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const api = {
  async getRemedies(symptom = null) {
    let url = `${API_BASE}/api/remedies`;
    if (symptom) {
      url += `?symptom=${encodeURIComponent(symptom)}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch remedies');
    return res.json();
  },

  async getRemedyById(id) {
    const res = await fetch(`${API_BASE}/api/remedies/${id}`);
    if (!res.ok) throw new Error('Failed to fetch remedy');
    return res.json();
  }
};