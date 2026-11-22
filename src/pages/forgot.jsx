// SC-05 Quên mật khẩu — có trong Screen Flow nhưng chưa có use case/API.
import { Link } from 'react-router-dom';
import { Alert } from 'antd';
import { Page } from '@shared/ui.jsx';
import { AuthShell } from '@widgets/auth-shell.jsx';

export function ForgotPage() {
  return (
    <Page>
      <AuthShell title="Quên mật khẩu" footer={<Link to="/login">← Về đăng nhập</Link>}>
        <Alert type="warning" showIcon message="Màn hình này có trong Screen Flow nhưng chưa có use case và API tương ứng (Security Design mục 5). Cần nhóm chốt trước khi làm." />
      </AuthShell>
    </Page>
  );
}
