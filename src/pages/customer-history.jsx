// SC-08 Lịch sử phiếu của tôi (hỗ trợ phân trang từ BE).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRequest } from '@shared/lib.js';
import { ErrorState, Page, PageBar } from '@shared/ui.jsx';
import { listMyTickets } from '@entities/ticket.jsx';
import { TicketTable } from '@widgets/ticket-table.jsx';

export function HistoryPage() {
  const [pager, setPager] = useState({ page: 0, size: 10 });
  const { data, loading, error, reload } = useRequest(() => listMyTickets(pager), [pager.page, pager.size]);
  const pagination = data
    ? {
      current: pager.page + 1,
      pageSize: pager.size,
      total: data.total,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '50'],
      onChange: (p, ps) => setPager({ page: ps !== pager.size ? 0 : p - 1, size: ps }),
    }
    : false;

  return (
    <Page>
      <PageBar title="Phiếu của tôi" subtitle="Các phản hồi bạn đã gửi tới Ban quản lý"
        extra={<Link to="/customer/new"><Button type="primary" className="btn-accent" icon={<PlusOutlined />}>Gửi phản hồi</Button></Link>} />
      {error ? <ErrorState error={error} onRetry={reload} /> : (
        <Card styles={{ body: { padding: 8 } }}>
          <TicketTable variant="customer" list={data?.items} loading={loading} pagination={pagination} emptyText="Bạn chưa gửi phản hồi nào." />
        </Card>
      )}
    </Page>
  );
}
