// SC-03 Nhập mã OTP.
import { Link, Navigate } from 'react-router-dom';
import { Page } from '@shared/ui.jsx';
import { AuthShell } from '@widgets/auth-shell.jsx';
import { OtpForm, getPendingEmail } from '@features/auth.jsx';

export function OtpPage() {
  const email = getPendingEmail();
  if (!email) return <Navigate to="/register" replace />;
  return (
    <Page>
      <AuthShell title="Nhập mã OTP" subtitle={<>Mã gồm 6 chữ số đã được gửi tới <b>{email}</b>.</>}
        footer={<Link to="/register">← Quay lại đăng ký</Link>}>
        <OtpForm email={email} />
      </AuthShell>
    </Page>
  );
}
