// SC-13 Hàng đợi tiếp nhận của CS Staff, tách theo loại phiếu.
import { useSearchParams } from 'react-router-dom';
import { Card, Tabs } from 'antd';
import { useRequest } from '@shared/lib.js';
import { ErrorState, Page, PageBar } from '@shared/ui.jsx';
import { TYPE_LABEL, listTickets } from '@entities/ticket.jsx';
import { TicketFilters } from '@features/filter-tickets.jsx';
import { TicketTable } from '@widgets/ticket-table.jsx';

const STAFF_TABS = ['complaint', 'suggestion', 'praise'];       // phản hồi về nhân viên do Manager xử lý
const FILTER_KEYS = ['status', 'building', 'q', 'from', 'to'];

export function StaffQueuePage() {
  const [sp, setSp] = useSearchParams();
  const type = STAFF_TABS.includes(sp.get('type')) ? sp.get('type') : 'complaint';
  const query = Object.fromEntries(FILTER_KEYS.filter((k) => sp.get(k)).map((k) => [k, sp.get(k)]));
  const { data, loading, error, reload } = useRequest(() => listTickets({ type, ...query }), [sp.toString()]);

  const setQuery = (q) => setSp({ type, ...Object.fromEntries(Object.entries(q).filter(([, v]) => v)) });
  return (
    <Page>
      <PageBar title="Hàng đợi tiếp nhận" subtitle="Phiếu mới cần phân loại và phân công" />
      <Tabs activeKey={type} onChange={(t) => setSp({ type: t })} items={STAFF_TABS.map((t) => ({ key: t, label: TYPE_LABEL[t] }))} />
      <Card styles={{ body: { padding: 16 } }}>
        <TicketFilters query={query} onChange={setQuery} />
        {error ? <ErrorState error={error} onRetry={reload} /> : <TicketTable variant="staff" list={data} loading={loading} />}
      </Card>
    </Page>
  );
}
