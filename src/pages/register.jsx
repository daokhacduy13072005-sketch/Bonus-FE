// SC-02 Đăng ký (BR-04: xác thực OTP trước khi tạo tài khoản).
import { Link } from 'react-router-dom';
import { Page } from '@shared/ui.jsx';
import { AuthShell } from '@widgets/auth-shell.jsx';
import { RegisterForm } from '@features/auth.jsx';

export function RegisterPage() {
  return (
    <Page>
      <AuthShell title="Đăng ký tài khoản" subtitle="Xác thực bằng mã OTP trước khi tạo tài khoản."
        footer={<span>Đã có tài khoản? <Link to="/login"><b>Đăng nhập</b></Link></span>}>
        <RegisterForm />
      </AuthShell>
    </Page>
  );
}
