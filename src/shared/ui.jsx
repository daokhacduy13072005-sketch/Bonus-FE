// Các khối giao diện + hook dùng chung, không mang nghiệp vụ.
import { useEffect, useRef, useState } from 'react';
import { App, Button, Card, Empty, Result, Skeleton } from 'antd';
import { ApiError } from './api.js';
import { useCountUp } from './lib.js';

// Khung nội dung chuẩn của mọi trang (căn giữa, có lề)
export const Page = ({ children, size }) => (
  <div className={`container page ${size ? `page-${size}` : ''}`}>{children}</div>
);

// Tiêu đề trang + nút bên phải
export const PageBar = ({ title, subtitle, extra }) => (
  <div className="page-bar">
    <div><h2>{title}</h2>{subtitle && <p className="mu">{subtitle}</p>}</div>
    <div className="page-bar-extra">{extra}</div>
  </div>
);

// Hiệu ứng hiện dần khi cuộn tới (IntersectionObserver). delay = ms để các thẻ lần lượt hiện.
export function Reveal({ children, delay = 0, className = '', as: Tag = 'div', ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setShown(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref} className={`reveal ${shown ? 'in' : ''} ${className}`} style={{ '--d': `${delay}ms` }} {...rest}>{children}</Tag>;
}

// Số chạy lên khi hiện
export function CountUp({ value, suffix = '', decimals = 0 }) {
  const n = useCountUp(Number(value));
  return <>{Number.isFinite(n) ? n.toFixed(decimals) : value}{suffix}</>;
}

export const Loading = () => <Card className="lift"><Skeleton active paragraph={{ rows: 6 }} /></Card>;

export const EmptyState = ({ text = 'Không có dữ liệu.' }) => <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={text} style={{ padding: '24px 0' }} />;

export const ErrorState = ({ error, onRetry }) => (
  <Result status="error" title="Có lỗi xảy ra"
    subTitle={error instanceof ApiError ? error.message : 'Không thể hiển thị trang này.'}
    extra={onRetry && <Button type="primary" onClick={onRetry}>Thử lại</Button>} />
);

// Dùng chung cho mọi hành động gửi form:
//  - khóa nút khi đang gửi (chống gửi đúp)
//  - lỗi 400 có `fields` → hiện đúng dưới từng ô nhập
//  - lỗi 409 (dữ liệu đã bị người khác sửa) → báo và tải lại thay vì ghi đè
//  - thành công → hiện thông báo + gọi onDone
export function useAction(fn, { form, success, onDone } = {}) {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);
  const run = async (...args) => {
    setLoading(true);
    try {
      const res = await fn(...args);
      if (success) message.success(success);
      await onDone?.(res);
      return res;
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 401) return undefined;               // api.js đã chuyển về đăng nhập
        if (e.fields && form) form.setFields(Object.entries(e.fields).map(([name, msg]) => ({ name, errors: [msg] })));
        message.error(e.message, e.status === 409 ? 6 : 4);
        if (e.status === 409) await onDone?.();
      } else { console.error(e); message.error('Có lỗi không mong muốn, vui lòng thử lại.'); }
      return undefined;
    } finally { if (mounted.current) setLoading(false); }
  };
  return [run, loading];
}
