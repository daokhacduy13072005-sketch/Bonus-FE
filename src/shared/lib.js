// Hàm tiện ích + hook dùng chung. Không chứa nghiệp vụ.
import { useCallback, useEffect, useRef, useState } from 'react';

// ---------- Định dạng ----------
export const fmt = (iso) => iso
  ? new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '–';

export const sizeText = (b) => b < 1024 ? `${b} B`
  : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

// ---------- Kiểm tra dữ liệu (chỉ để báo lỗi sớm; server vẫn kiểm tra lại) ----------
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v || '');
export const isPhone = (v) => /^0\d{9}$/.test(v || '');
export const isStrongPassword = (v) => (v || '').length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v);

// Chỉ cho phép chuyển hướng nội bộ (tránh open redirect)
export const safeNext = (next) => (next && next.startsWith('/') && !next.startsWith('//') ? next : null);

// ---------- Hook tải dữ liệu ----------
// const { data, loading, error, reload } = useRequest(() => api('/api/x'), [dep])
// reload() tải lại ÂM THẦM (giữ dữ liệu cũ, không nháy skeleton).
export function useRequest(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const seq = useRef(0);
  const run = useCallback(async (silent) => {
    const id = ++seq.current;
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetcher();
      if (id === seq.current) setState({ data, loading: false, error: null });
    } catch (error) {
      if (id === seq.current) setState({ data: null, loading: false, error });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => { run(); return () => { seq.current++; }; }, [run]);
  return { ...state, reload: () => run(true) };
}

// ---------- Hook đếm số chạy lên (hiệu ứng cho thống kê) ----------
export function useCountUp(target, duration = 900) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !Number.isFinite(target)) { setN(target); return undefined; }
    let raf; const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      setN(target * (1 - Math.pow(1 - p, 3)));          // easeOutCubic
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}
