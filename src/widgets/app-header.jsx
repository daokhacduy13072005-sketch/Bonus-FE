// WIDGET: Thanh đầu trang — menu theo vai trò sau đăng nhập, mega-menu khi chưa đăng nhập.
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Button, Dropdown, Menu } from 'antd';
import { BankOutlined, DownOutlined, LogoutOutlined } from '@ant-design/icons';
import { BRAND } from '@shared/config.js';
import { ROLES, useAuth } from '@entities/user.jsx';
import './widgets.css';

// Menu theo vai trò: [đường dẫn, nhãn]
const NAV = {
  customer: [['/customer/new', 'Gửi phản hồi'], ['/customer/history', 'Phiếu của tôi'], ['/customer/track', 'Tra cứu mã'], ['/customer/profile', 'Hồ sơ']],
  cs_staff: [['/staff/queue', 'Hàng đợi'], ['/staff/customers', 'Cư dân'], ['/staff/directory', 'Nhân sự & Danh mục']],
  dept_staff: [['/dept/tasks', 'Việc được giao']],
  manager: [['/manager/dashboard', 'Dashboard'], ['/manager/escalated', 'Chuyển cấp / Chờ duyệt'], ['/staff/customers', 'Cư dân'], ['/staff/directory', 'Nhân sự & Danh mục']],
};

const GUIDE = (
  <div className="mega-panel wide">
    <Link to="/register" className="mega-feature"><strong>Cổng Cư Dân</strong><p>Gửi phản ánh, theo dõi tiến độ xử lý và đánh giá dịch vụ tòa nhà trực tuyến.</p></Link>
    <div className="mega-col">
      <Link to="/register" className="mega-link"><strong>Đăng ký tài khoản</strong><span>Tạo tài khoản cư dân để sử dụng hệ thống.</span></Link>
      <Link to="/forgot" className="mega-link"><strong>Khôi phục mật khẩu</strong><span>Hướng dẫn lấy lại quyền truy cập tài khoản.</span></Link>
      <Link to="/" className="mega-link"><strong>Quy trình xử lý</strong><span>Các bước tiếp nhận phản ánh &amp; khiếu nại.</span></Link>
    </div>
  </div>
);
const SERVICES = (
  <div className="mega-panel">
    <Link to="/login" className="mega-link"><strong>Kỹ thuật &amp; Điện nước</strong><span>Tiếp nhận sự cố bảo trì căn hộ 24/7.</span></Link>
    <Link to="/login" className="mega-link"><strong>An ninh &amp; Gửi xe</strong><span>Hỗ trợ thẻ từ, bãi đỗ xe và an toàn khu dân cư.</span></Link>
    <Link to="/login" className="mega-link"><strong>Vệ sinh &amp; Tiện ích</strong><span>Góp ý chất lượng cảnh quan, thang máy, hồ bơi.</span></Link>
  </div>
);

function PublicNav() {
  const { pathname } = useLocation();
  return (
    <nav className="public-nav" aria-label="Điều hướng chính">
      <Dropdown trigger={['hover']} dropdownRender={() => GUIDE}><button type="button" className="nav-trigger">Hướng dẫn <DownOutlined /></button></Dropdown>
      <Dropdown trigger={['hover']} dropdownRender={() => SERVICES}><button type="button" className="nav-trigger">Dịch vụ tòa nhà <DownOutlined /></button></Dropdown>
      <Link to="/login" className={`nav-link ${pathname === '/login' ? 'on' : ''}`}>Đăng nhập</Link>
      <Link to="/register"><Button type="primary" className="btn-accent">Đăng ký</Button></Link>
    </nav>
  );
}

function UserNav({ user }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const items = NAV[user.role] || [];
  const active = items.filter(([p]) => pathname.startsWith(p)).sort((a, b) => b[0].length - a[0].length)[0]?.[0];
  const displayName = user.name || user.fullName || user.full_name || user.username || user.email || 'Khách hàng';
  const initial = displayName.trim().split(/\s+/).pop().charAt(0).toUpperCase();
  return (
    <>
      <Menu mode="horizontal" className="main-nav" selectedKeys={active ? [active] : []} disabledOverflow
        items={items.map(([p, label]) => ({ key: p, label: <Link to={p}>{label}</Link> }))} />
      <Dropdown trigger={['click']} placement="bottomRight"
        menu={{ items: [{ key: 'out', icon: <LogoutOutlined />, danger: true, label: 'Đăng xuất', onClick: () => { logout(); navigate('/'); } }] }}>
        <div className="user-chip" role="button" tabIndex={0}>
          <Avatar style={{ background: 'linear-gradient(135deg,#f36f21,#ff9a5a)' }}>{initial}</Avatar>
          <span className="user-info"><b>{displayName}</b><small>{ROLES[user.role]}</small></span>
          <DownOutlined style={{ fontSize: 11, color: '#64748b' }} />
        </div>
      </Dropdown>
    </>
  );
}

export function AppHeader() {
  const { user } = useAuth();
  return (
    <>
      <div className="topstrip"><div className="container">
        <span>🏢 Cổng phản hồi &amp; khiếu nại cư dân</span>
        <span className="hide-sm">Tiếp nhận 24/7 · Theo dõi tiến độ theo thời gian thực</span>
      </div></div>
      <header className="top"><div className="container top-inner">
        <Link className="brand" to="/">
          <span className="brand-icon"><BankOutlined /></span>
          <span className="brand-text"><b>{BRAND}</b><small>Phản hồi &amp; Khiếu nại</small></span>
        </Link>
        {user ? <UserNav user={user} /> : <PublicNav />}
      </div></header>
    </>
  );
}
