// SC-10 + SC-11 Chi tiết phiếu, đánh giá, mở lại.
import { Link, useParams } from 'react-router-dom';
import { Button, Card, Descriptions, Result } from 'antd';
import { fmt, useRequest } from '@shared/lib.js';
import { ApiError } from '@shared/api.js';
import { EmptyState, ErrorState, Loading, Page, PageBar } from '@shared/ui.jsx';
import { AttachmentList, PriorityTag, ReplyBlock, SIMPLE_TYPES, StatusTag, StatusTimeline, TYPE_LABEL, TicketSteps, getTicket, locationText } from '@entities/ticket.jsx';
import { RateForm, RatingView } from '@features/rate-ticket.jsx';
import { ReopenForm } from '@features/reopen-ticket.jsx';
import './pages.css';

export function CustomerTicketPage() {
  const { code } = useParams();
  const { data: c, loading, error, reload } = useRequest(() => getTicket(code), [code]);

  if (loading) return <Page><Loading /></Page>;
  if (error instanceof ApiError && error.status === 404) {
    return <Page><Result status="404" title="Không tìm thấy phiếu" subTitle="Mã không tồn tại hoặc không thuộc tài khoản của bạn."
      extra={<Link to="/customer/track"><Button type="primary">← Tra cứu lại</Button></Link>} /></Page>;
  }
  if (error) return <Page><ErrorState error={error} onRetry={reload} /></Page>;

  return (
    <Page size="wide">
      <PageBar title={c.title} extra={<Link to="/customer/history"><Button>← Danh sách</Button></Link>} />
      <div className="stack">
        <Card className="lift">
          <TicketSteps status={c.status} simple={SIMPLE_TYPES.includes(c.type)} />
          <Descriptions style={{ marginTop: 24 }} size="small" column={{ xs: 1, sm: 2 }} items={[
            { key: 'c', label: 'Mã', children: <b>{c.tracking_code}</b> },
            { key: 't', label: 'Loại', children: TYPE_LABEL[c.type] },
            { key: 's', label: 'Dịch vụ', children: c.service },
            { key: 'st', label: 'Trạng thái', children: <StatusTag status={c.status} /> },
            { key: 'p', label: 'Ưu tiên', children: <PriorityTag priority={c.priority} /> },
            { key: 'd', label: 'Gửi lúc', children: fmt(c.created_at) },
            { key: 'l', label: '📍 Vị trí', span: 2, children: locationText(c.location) },
          ]} />
          <h3 className="sec-title">Nội dung bạn đã gửi</h3>
          <p className="pre">{c.description}</p>
          <AttachmentList items={c.attachments} />
        </Card>

        <Card title="Tiến trình" className="lift"><StatusTimeline history={c.history} /></Card>

        <Card title="Phản hồi từ ban quản lý" className="lift">
          {c.responses.length ? c.responses.map((r, i) => <ReplyBlock key={i} reply={r} />) : <EmptyState text="Chưa có phản hồi." />}
        </Card>

        {c.rating && <Card title="Đánh giá của bạn" className="lift"><RatingView rating={c.rating} /></Card>}
        {c.can_rate && <Card title="Bạn có hài lòng với kết quả?" className="lift"><RateForm ticket={c} onDone={reload} /></Card>}
        {c.can_reopen && <Card className="lift"><ReopenForm ticket={c} onDone={reload} /></Card>}
      </div>
    </Page>
  );
}
