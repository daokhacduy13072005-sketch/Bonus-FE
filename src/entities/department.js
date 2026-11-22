// Thực thể BỘ PHẬN xử lý
import { api } from '@shared/api.js';

export const getDepartments = async () => (await api('/api/meta')).departments;
