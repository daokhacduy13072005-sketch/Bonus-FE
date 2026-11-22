// Điểm khởi động ứng dụng: nối các tầng lại với nhau (providers, header/footer, route, hiệu ứng chuyển trang).
import { Component } from 'react';
import { HashRouter, useLocation } from 'react-router-dom';
import { App as AntApp, Button, ConfigProvider, Result, message } from 'antd';
import { configureApi, defaultMessage } from '@shared/api.js';
import '@shared/styles.css';
import { AuthProvider, clearSession, getSession } from '@entities/user.jsx';
import { AppHeader } from '@widgets/app-header.jsx';
import { SiteFooter } from '@widgets/site-footer.jsx';
import { AppRoutes } from './routes.jsx';
import { locale, theme } from './theme.js';

// Tiêm phiên đăng nhập vào lớp API (shared không được tự import entities).
// Đặt ở cấp module để có hiệu lực TRƯỚC mọi lời gọi API đầu tiên.
configureApi({
  getToken: () => getSession()?.token,
  onUnauthorized: () => {
    clearSession();
    window.dispatchEvent(new Event('ccms:session-expired'));      // AuthProvider lắng nghe và xoá người dùng khỏi state
    message.error(defaultMessage(401));
    window.location.hash = '#/login';
  },
});

// Bắt lỗi khi một trang bị lỗi lúc vẽ, thay vì trắng màn hình
class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidUpdate(prev) { if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null }); }
  render() {
    return this.state.error
      ? <Result status="error" title="Trang này gặp lỗi" subTitle={String(this.state.error.message || this.state.error)} extra={<Button type="primary" onClick={() => location.reload()}>Tải lại</Button>} />
      : this.props.children;
  }
}

// Vỏ ứng dụng: thanh tiến trình + header + nội dung (có hiệu ứng vào trang) + footer
function Shell() {
  const { pathname } = useLocation();
  return (
    <>
      <div key={`p-${pathname}`} className="route-progress" />
      <AppHeader />
      <main>
        <ErrorBoundary resetKey={pathname}>
          <div key={pathname} className="page-enter"><AppRoutes /></div>
        </ErrorBoundary>
      </main>
      <SiteFooter />
    </>
  );
}

export function App() {
  return (
    <ConfigProvider theme={theme} locale={locale}>
      <AntApp>
        <HashRouter>
          <AuthProvider><Shell /></AuthProvider>
        </HashRouter>
      </AntApp>
    </ConfigProvider>
  );
}
