// SC-02 Đăng ký tài khoản.
import { Link } from 'react-router-dom';
import { Page } from '@shared/ui.jsx';
import { AuthShell } from '@widgets/auth-shell.jsx';
import { RegisterForm } from '@features/auth.jsx';

export function RegisterPage() {
  return (
    <Page>
      <AuthShell title="Đăng ký tài khoản" subtitle="Tạo tài khoản cư dân để gửi phản ánh và theo dõi xử lý."
        footer={<span>Đã có tài khoản? <Link to="/login"><b>Đăng nhập</b></Link></span>}>
        <RegisterForm />
      </AuthShell>
    </Page>
  );
}
