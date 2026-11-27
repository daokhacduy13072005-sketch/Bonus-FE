// Thực thể CƯ DÂN: hồ sơ cá nhân, hợp đồng thuê, trạng thái xác minh/khóa.
import { api } from '@shared/api.js';

export const RESIDENT_TYPE_LABEL = {
  OWNER: 'Chủ căn hộ',
  TENANT: 'Người thuê',
};

export const CONTRACT_STATUS_LABEL = {
  PENDING: 'Chờ duyệt',
  ACTIVE: 'Đang hiệu lực',
  EXPIRED: 'Hết hạn',
  TERMINATED: 'Đã chấm dứt',
};

export const CONTRACT_STATUS_COLOR = {
  PENDING: 'orange',
  ACTIVE: 'green',
  EXPIRED: 'default',
  TERMINATED: 'red',
};

export const getMyProfile = () => api('/api/customers/me');
export const updateMyProfile = (body) => api('/api/customers/me', { method: 'PUT', body });
export const listCustomers = () => api('/api/customers');
export const getCustomer = (id) => api(`/api/customers/${encodeURIComponent(id)}`);
export const updateCustomer = (id, body) => api(`/api/customers/${encodeURIComponent(id)}`, { method: 'PUT', body });
