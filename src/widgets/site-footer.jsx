// WIDGET: Chân trang.
import { Link } from 'react-router-dom';
import { BRAND } from '@shared/config.js';
import './widgets.css';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">🏢 {BRAND}</div>
          <p>Cổng thông tin giúp cư dân gửi khiếu nại, góp ý và theo dõi tiến độ xử lý minh bạch cùng Ban quản lý.</p>
        </div>
        <div><h4>Dành cho cư dân</h4><Link to="/register">Đăng ký tài khoản</Link><Link to="/login">Đăng nhập</Link><Link to="/customer/track">Tra cứu theo mã</Link></div>
        <div><h4>Dịch vụ</h4><span>Kỹ thuật &amp; Điện nước</span><span>An ninh &amp; Gửi xe</span><span>Vệ sinh &amp; Tiện ích</span></div>
      </div>
      <div className="footer-bottom"><div className="container">© {new Date().getFullYear()} {BRAND} — Hệ thống Phản hồi &amp; Khiếu nại Cư dân</div></div>
    </footer>
  );
}
