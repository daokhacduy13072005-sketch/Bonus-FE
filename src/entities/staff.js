// Thực thể NHÂN VIÊN: danh sách nhân viên, vai trò, bộ phận và trạng thái trực.
import { api } from '@shared/api.js';

export const STAFF_ROLE_LABEL = {
  CUSTOMER: 'Khách hàng',
  CS_STAFF: 'Nhân viên CSKH',
  DEPT_STAFF: 'Nhân viên bộ phận',
  CS_MANAGER: 'Quản lý CSKH',
};

export const DEPARTMENT_LABEL = {
  CSKH: 'Chăm sóc khách hàng',
  KY_THUAT: 'Kỹ thuật',
  VE_SINH: 'Vệ sinh',
  AN_NINH: 'An ninh',
  KE_TOAN: 'Kế toán',
  BAN_QUAN_LY: 'Ban quản lý',
};

export const listStaff = () => api('/api/staff');
export const getStaff = (id) => api(`/api/staff/${encodeURIComponent(id)}`);
