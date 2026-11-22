// Bảng route (theo Screen Flow). Tầng app là nơi DUY NHẤT biết toàn bộ các trang.
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { homeFor, useAuth } from '@entities/user.jsx';

import { LandingPage } from '@pages/landing.jsx';
import { LoginPage } from '@pages/login.jsx';
import { RegisterPage } from '@pages/register.jsx';
import { OtpPage } from '@pages/otp.jsx';
import { ForgotPage } from '@pages/forgot.jsx';
import { NewTicketPage } from '@pages/customer-new-ticket.jsx';
import { HistoryPage } from '@pages/customer-history.jsx';
import { TrackPage } from '@pages/customer-track.jsx';
import { CustomerTicketPage } from '@pages/customer-ticket.jsx';
import { StaffQueuePage } from '@pages/staff-queue.jsx';
import { TicketDetailPage } from '@pages/ticket-detail.jsx';
import { MyTasksPage } from '@pages/dept-tasks.jsx';
import { TaskDetailPage } from '@pages/dept-task.jsx';
import { DashboardPage } from '@pages/manager-dashboard.jsx';
import { EscalatedPage } from '@pages/manager-escalated.jsx';
import { AdminPage } from '@pages/admin.jsx';
import { ForbiddenPage, NotFoundPage } from '@pages/errors.jsx';

// roles: null = công khai | 'guest' = chỉ khi CHƯA đăng nhập | [..] = các vai trò được vào
function Guard({ roles, children }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  if (roles === 'guest' && user) return <Navigate to={homeFor(user.role)} replace />;
  if (Array.isArray(roles)) {
    if (!user) return <Navigate to={`/login?next=${encodeURIComponent(pathname)}`} replace />;
    // Chỉ ẩn/chặn ở UI cho gọn — backend vẫn kiểm tra quyền thật (IA-CF02)
    if (!roles.includes(user.role)) return <ForbiddenPage user={user} />;
  }
  return children;
}

const CUSTOMER = ['customer'], STAFF = ['cs_staff'], DEPT = ['dept_staff'], MANAGER = ['manager'], ADMIN = ['admin'];

const ROUTES = [
  // Công khai
  ['/register', 'guest', <RegisterPage />],
  ['/otp', 'guest', <OtpPage />],
  ['/login', 'guest', <LoginPage />],
  ['/forgot', 'guest', <ForgotPage />],
  // Khách hàng
  ['/customer/new', CUSTOMER, <NewTicketPage />],
  ['/customer/history', CUSTOMER, <HistoryPage />],
  ['/customer/track', CUSTOMER, <TrackPage />],
  ['/customer/complaints/:code', CUSTOMER, <CustomerTicketPage />],
  // Nhân viên CSKH
  ['/staff/queue', STAFF, <StaffQueuePage />],
  ['/staff/complaints/:id', STAFF, <TicketDetailPage />],
  // Nhân viên bộ phận
  ['/dept/tasks', DEPT, <MyTasksPage />],
  ['/dept/tasks/:id', DEPT, <TaskDetailPage />],
  // Quản lý
  ['/manager/dashboard', MANAGER, <DashboardPage />],
  ['/manager/escalated', MANAGER, <EscalatedPage />],
  ['/manager/complaints/:id', MANAGER, <TicketDetailPage />],
  // Quản trị
  ['/admin', ADMIN, <AdminPage />],
];

function Home() {
  const { user } = useAuth();
  return user ? <Navigate to={homeFor(user.role)} replace /> : <LandingPage />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {ROUTES.map(([path, roles, el]) => <Route key={path} path={path} element={<Guard roles={roles}>{el}</Guard>} />)}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
