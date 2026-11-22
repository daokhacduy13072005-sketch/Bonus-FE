// SC-18 Danh sách chuyển cấp / chờ duyệt (Manager).
import { useSearchParams } from 'react-router-dom';
import { Card, Tabs } from 'antd';
import { useRequest } from '@shared/lib.js';
import { ErrorState, Page, PageBar } from '@shared/ui.jsx';
import { listTickets } from '@entities/ticket.jsx';
import { TicketTable } from '@widgets/ticket-table.jsx';

const TABS = [['escalated', 'Chuyển cấp'], ['pending', 'Chờ duyệt (Critical)'], ['all', 'Tất cả']];

export function EscalatedPage() {
  const [sp, setSp] = useSearchParams();
  const view = TABS.some(([v]) => v === sp.get('view')) ? sp.get('view') : 'escalated';
  const { data, loading, error, reload } = useRequest(() => listTickets(view === 'all' ? undefined : { view }), [view]);
  return (
    <Page>
      <PageBar title="Phiếu cần xử lý" subtitle="Các phiếu được chuyển cấp hoặc đang chờ Quản lý duyệt" />
      <Tabs activeKey={view} onChange={(v) => setSp({ view: v })} items={TABS.map(([key, label]) => ({ key, label }))} />
      <Card styles={{ body: { padding: 8 } }}>
        {error ? <ErrorState error={error} onRetry={reload} /> : <TicketTable variant="manager" list={data} loading={loading} />}
      </Card>
    </Page>
  );
}
