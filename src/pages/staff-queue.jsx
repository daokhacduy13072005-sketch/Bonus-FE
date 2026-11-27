// SC-13 Hàng đợi tiếp nhận của CS Staff, tách theo loại phiếu.
import { useSearchParams } from 'react-router-dom';
import { Card, Tabs } from 'antd';
import { useRequest } from '@shared/lib.js';
import { ErrorState, Page, PageBar } from '@shared/ui.jsx';
import { TYPE_LABEL, listTickets } from '@entities/ticket.jsx';
import { TicketFilters } from '@features/filter-tickets.jsx';
import { TicketTable } from '@widgets/ticket-table.jsx';

const STAFF_TABS = ['complaint', 'suggestion', 'proposal', 'praise'];
const FILTER_KEYS = ['status', 'building', 'q', 'from', 'to'];

function applyFilters(list, type, query) {
  if (!Array.isArray(list)) return list;
  const kw = query.q?.toLowerCase();
  const fromTs = query.from ? new Date(`${query.from}T00:00:00`).getTime() : null;
  const toTs = query.to ? new Date(`${query.to}T23:59:59.999`).getTime() : null;
  return list.filter((c) => {
    if (type && c.type !== type) return false;
    if (query.status && c.status !== query.status) return false;
    if (query.building && !String(c.location || '').toLowerCase().includes(query.building.toLowerCase())) return false;
    if (kw && ![c.tracking_code, c.title, c.customer?.name].some((v) => String(v || '').toLowerCase().includes(kw))) return false;
    if ((fromTs || toTs) && c.created_at) {
      const ts = new Date(c.created_at).getTime();
      if (fromTs && ts < fromTs) return false;
      if (toTs && ts > toTs) return false;
    }
    return true;
  });
}

export function StaffQueuePage() {
  const [sp, setSp] = useSearchParams();
  const type = STAFF_TABS.includes(sp.get('type')) ? sp.get('type') : 'complaint';
  const query = Object.fromEntries(FILTER_KEYS.filter((k) => sp.get(k)).map((k) => [k, sp.get(k)]));
  const { data, loading, error, reload } = useRequest(() => listTickets({ type, ...query }), [sp.toString()]);
  const filtered = applyFilters(data, type, query);

  const setQuery = (q) => setSp({ type, ...Object.fromEntries(Object.entries(q).filter(([, v]) => v)) });
  return (
    <Page>
      <PageBar title="Hàng đợi tiếp nhận" subtitle="Phiếu mới cần phân loại và phân công" />
      <Tabs activeKey={type} onChange={(t) => setSp({ type: t })} items={STAFF_TABS.map((t) => ({ key: t, label: TYPE_LABEL[t] }))} />
      <Card styles={{ body: { padding: 16 } }}>
        <TicketFilters query={query} onChange={setQuery} />
        {error ? <ErrorState error={error} onRetry={reload} /> : <TicketTable variant="staff" list={filtered} loading={loading} />}
      </Card>
    </Page>
  );
}
