// Các trang thông báo lỗi do router sử dụng.
import { Link } from 'react-router-dom';
import { Button, Result } from 'antd';
import { Page } from '@shared/ui.jsx';
import { homeFor } from '@entities/user.jsx';

export const NotFoundPage = () => (
  <Page><Result status="404" title="404" subTitle="Trang không tồn tại." extra={<Link to="/"><Button type="primary">Về trang chủ</Button></Link>} /></Page>
);

export const ForbiddenPage = ({ user }) => (
  <Page><Result status="403" title="Không có quyền truy cập" subTitle="Vai trò của bạn không được xem trang này."
    extra={<Link to={homeFor(user.role)}><Button type="primary">Về trang của tôi</Button></Link>} /></Page>
);
