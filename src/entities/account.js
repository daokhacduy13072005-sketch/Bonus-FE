// Thực thể ACCOUNT: quản lý tài khoản nhân viên CSKH và khách hàng thuộc phạm vi CSKH.
// Dùng cho manager (toàn quyền) và cs_staff (xem/khoá khách hàng của mình).
import { api } from '@shared/api.js';

// ---- Nhãn trạng thái ----
export const ACCOUNT_STATUS_LABEL = { active: 'Hoạt động', locked: 'Bị khóa', inactive: 'Vô hiệu hóa' };
export const ACCOUNT_STATUS_COLOR = { active: 'green', locked: 'red', inactive: 'default' };

// ---- Nhãn vai trò dùng trong màn hình account ----
export const ACCOUNT_ROLE_LABEL = {
  cs_staff:   'Nhân viên CSKH',
  manager:    'Quản lý CSKH',
  customer:   'Khách hàng',
  dept_staff: 'Nhân viên bộ phận',
};
export const ACCOUNT_ROLE_COLOR = {
  cs_staff:   'blue',
  manager:    'gold',
  customer:   'purple',
  dept_staff: 'cyan',
};

// ======== API — Staff accounts ========
/** Danh sách tất cả tài khoản nhân viên (cs_staff + manager + dept_staff). */
export const listStaffAccounts  = ()         => api('/api/accounts/staff');
/** Tạo mới tài khoản nhân viên. body: { fullName, email, phone, role, department, password } */
export const createStaffAccount = (body)     => api('/api/accounts/staff', { method: 'POST', body });
/** Cập nhật thông tin tài khoản nhân viên. */
export const updateStaffAccount = (id, body) => api(`/api/accounts/staff/${encodeURIComponent(id)}`, { method: 'PUT', body });
/** Đặt lại mật khẩu nhân viên (gửi email hoặc trả về temp password). */
export const resetStaffPassword = (id)       => api(`/api/accounts/staff/${encodeURIComponent(id)}/reset-password`, { method: 'POST' });
/** Khoá / mở khoá tài khoản nhân viên. body: { active: boolean } */
export const toggleStaffStatus  = (id, body) => api(`/api/accounts/staff/${encodeURIComponent(id)}/status`, { method: 'PATCH', body });

// ======== API — Customer accounts ========
/** Danh sách tất cả tài khoản khách hàng thuộc phạm vi CSKH. */
export const listCustomerAccounts  = ()         => api('/api/accounts/customers');
/** Cập nhật thông tin tài khoản khách hàng. */
export const updateCustomerAccount = (id, body) => api(`/api/accounts/customers/${encodeURIComponent(id)}`, { method: 'PUT', body });
/** Khoá / mở khoá / đặt lại spam-strikes. body: { blocked?, spamStrikes?, verifiedResident?, active? } */
export const patchCustomerAccount  = (id, body) => api(`/api/accounts/customers/${encodeURIComponent(id)}/status`, { method: 'PATCH', body });
/** Đặt lại mật khẩu khách hàng (gửi email reset link). */
export const resetCustomerPassword = (id)       => api(`/api/accounts/customers/${encodeURIComponent(id)}/reset-password`, { method: 'POST' });
