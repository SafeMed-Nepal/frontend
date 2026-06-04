import { api } from './api';

const KEY = 'safemed_review_queue_v1';

function readQueue() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read review queue', e);
    return [];
  }
}

function writeQueue(q) {
  try {
    localStorage.setItem(KEY, JSON.stringify(q || []));
  } catch (e) {
    console.error('Failed to write review queue', e);
  }
}

export async function enqueueReview(item) {
  const q = readQueue();
  q.push({ ...item, queued_at: new Date().toISOString() });
  writeQueue(q);
  window.dispatchEvent(new CustomEvent('offlineReviews:queued', { detail: { length: q.length } }));
}

export async function flushQueue() {
  if (!navigator.onLine) return 0;
  const q = readQueue();
  if (!q || q.length === 0) return 0;

  let remaining = [];
  let synced = 0;
  for (const item of q) {
    try {
      await api.postReview(item.remedyId, { decision: item.decision, comment: item.comment });
      synced += 1;
    } catch (e) {
      remaining.push(item);
    }
  }

  writeQueue(remaining);
  window.dispatchEvent(new CustomEvent('offlineReviews:flushed', { detail: { synced, remaining: remaining.length } }));
  return synced;
}

export function initOfflineReviews() {
  // try flush on init and when coming online
  setTimeout(() => {
    flushQueue().catch((e) => console.error('flushQueue init failed', e));
  }, 2000);

  window.addEventListener('online', () => {
    flushQueue().catch((e) => console.error('flushQueue online failed', e));
  });
}

export function getQueueLength() {
  return readQueue().length;
}
