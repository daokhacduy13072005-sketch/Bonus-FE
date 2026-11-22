// SC-08 Lịch sử phiếu của tôi.
import { Link } from 'react-router-dom';
import { Button, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRequest } from '@shared/lib.js';
import { ErrorState, Page, PageBar } from '@shared/ui.jsx';
import { listMyTickets } from '@entities/ticket.jsx';
import { TicketTable } from '@widgets/ticket-table.jsx';

export function HistoryPage() {
  const { data, loading, error, reload } = useRequest(listMyTickets);
  return (
    <Page>
      <PageBar title="Phiếu của tôi" subtitle="Các phản hồi bạn đã gửi tới Ban quản lý"
        extra={<Link to="/customer/new"><Button type="primary" className="btn-accent" icon={<PlusOutlined />}>Gửi phản hồi</Button></Link>} />
      {error ? <ErrorState error={error} onRetry={reload} /> : (
        <Card styles={{ body: { padding: 8 } }}><TicketTable variant="customer" list={data} loading={loading} emptyText="Bạn chưa gửi phản hồi nào." /></Card>
      )}
    </Page>
  );
}
