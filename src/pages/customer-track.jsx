// SC-09 Tra cứu phiếu theo mã.
import { Card } from 'antd';
import { Page, PageBar } from '@shared/ui.jsx';
import { TrackForm } from '@features/track-ticket.jsx';
import './pages.css';

export function TrackPage() {
  return (
    <Page size="narrow">
      <PageBar title="Tra cứu phiếu theo mã" subtitle="Bạn chỉ xem được phiếu do chính mình gửi (BR-13)." />
      <Card className="form-card"><TrackForm /></Card>
    </Page>
  );
}
