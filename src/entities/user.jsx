// Thực thể NGƯỜI DÙNG: vai trò, trang chủ theo vai trò, phiên đăng nhập.
// ⚠ Tài liệu chưa chốt JWT hay session. Hiện lưu token trong sessionStorage (mất khi đóng tab).
// Nếu backend dùng cookie HttpOnly thì bỏ token ở đây và bật `credentials: 'include'` ở shared/api.js.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Vai trò (SRS mục 1.1)
export const ROLES = {
  customer: 'Khách hàng',
  cs_staff: 'Nhân viên CSKH',
  dept_staff: 'Nhân viên bộ phận',
  manager: 'Quản lý CSKH',
  admin: 'Quản trị hệ thống',
};

// Trang chủ theo vai trò (SC-06)
export const HOME = {
  customer: '/customer/history',
  cs_staff: '/staff/queue',
  dept_staff: '/dept/tasks',
  manager: '/manager/dashboard',
  admin: '/admin',
};
export const homeFor = (role) => HOME[role] || '/';

// ---------- Phiên đăng nhập (sessionStorage) ----------
const KEY = 'ccms_session';
export function getSession() { try { return JSON.parse(sessionStorage.getItem(KEY)); } catch { return null; } }
export function setSession(s) { try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch { /* bỏ qua */ } }
export function clearSession() { try { sessionStorage.removeItem(KEY); } catch { /* bỏ qua */ } }

// ---------- Context: mọi component đọc người dùng hiện tại bằng useAuth() ----------
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSess] = useState(getSession);
  const login = useCallback((s) => { setSession(s); setSess(s); }, []);
  const logout = useCallback(() => { clearSession(); setSess(null); }, []);

  // api.js báo phiên hết hạn (401) bằng sự kiện này → xoá phiên trong state
  useEffect(() => {
    const onExpired = () => setSess(null);
    window.addEventListener('ccms:session-expired', onExpired);
    return () => window.removeEventListener('ccms:session-expired', onExpired);
  }, []);

  const value = useMemo(() => ({ user: session?.user || null, login, logout }), [session, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
