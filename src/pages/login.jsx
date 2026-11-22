// SC-04 Đăng nhập.
import { Link, useSearchParams } from 'react-router-dom';
import { Page } from '@shared/ui.jsx';
import { AuthShell } from '@widgets/auth-shell.jsx';
import { LoginForm } from '@features/auth.jsx';

export function LoginPage() {
  const [params] = useSearchParams();
  return (
    <Page>
      <AuthShell title="Đăng nhập" subtitle="Chào mừng bạn quay lại Cổng thông tin phản hồi & khiếu nại."
        footer={<><Link to="/forgot">Quên mật khẩu?</Link><span>Chưa có tài khoản? <Link to="/register"><b>Đăng ký ngay</b></Link></span></>}>
        <LoginForm next={params.get('next')} />
      </AuthShell>
    </Page>
  );
}
