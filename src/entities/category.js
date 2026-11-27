//  DANH MỤC PHẢN HỒI:(/api/categories) phục vụ phân loại tự động & tạo phiếu.
import { api } from '@shared/api.js';

export const CATEGORY_GROUP_LABEL = {
  FACILITY: 'Cơ sở vật chất',
  SERVICE: 'Dịch vụ',
  SECURITY: 'An ninh',
  FINANCE: 'Tài chính / Phí',
  ATTITUDE: 'Thái độ phục vụ',
  OTHER: 'Khác',
};

export const listCategories = () => api('/api/categories');
export const getCategory = (id) => api(`/api/categories/${encodeURIComponent(id)}`);
