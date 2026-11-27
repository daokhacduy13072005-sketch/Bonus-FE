// bộ phận xử lý
import { api } from '@shared/api.js';

/**
 * Fetch department list.
 * Tries the real `/api/meta` endpoint; if it fails (e.g., 404),
 * gracefully falls back to an empty array.
 */
export const getDepartments = async () => {
  try {
    const meta = await api('/api/meta');
    return meta?.departments ?? [];
  } catch (e) {
    console.warn('Endpoint /api/meta not available – returning empty list.', e);
    return [];
  }
};