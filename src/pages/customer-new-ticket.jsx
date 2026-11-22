// SC-07 Cư dân gửi phản hồi.
import { useState } from 'react';
import { Card } from 'antd';
import { Page, PageBar } from '@shared/ui.jsx';
import { TicketForm, TicketCreated } from '@features/create-ticket.jsx';
import './pages.css';

export function NewTicketPage() {
  const [code, setCode] = useState(null);
  return (
    <Page size="wide">
      <PageBar title="Gửi phản hồi" subtitle="Sau khi gửi, hệ thống cấp ngay một mã tra cứu để bạn theo dõi tiến độ." />
      <Card className="form-card">
        {code ? <TicketCreated code={code} onAnother={() => setCode(null)} /> : <TicketForm onCreated={setCode} />}
      </Card>
    </Page>
  );
}
