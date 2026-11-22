// SC-17 Dashboard báo cáo (Manager).
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useRequest } from '@shared/lib.js';
import { ErrorState, Loading, Page, PageBar } from '@shared/ui.jsx';
import { getDashboard } from '@entities/ticket.jsx';
import { DashboardStats } from '@widgets/ticket-stats.jsx';

export function DashboardPage() {
  const { data, loading, error, reload } = useRequest(getDashboard);
  return (
    <Page>
      <PageBar title="Dashboard báo cáo" subtitle="Tổng quan tình hình xử lý phản hồi của cư dân"
        extra={<Link to="/manager/escalated"><Button type="primary" className="btn-accent">Phiếu chuyển cấp / chờ duyệt <ArrowRightOutlined /></Button></Link>} />
      {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : <DashboardStats data={data} />}
    </Page>
  );
}
