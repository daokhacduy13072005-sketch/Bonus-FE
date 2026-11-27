// SC-10 + SC-11 Chi tiết phiếu, đánh giá, mở lại, bổ sung tệp đính kèm.
import { Link, useParams } from 'react-router-dom';
import { Button, Card, Descriptions, Result, Space, Tag } from 'antd';
import { fmt, useRequest } from '@shared/lib.js';
import { ApiError } from '@shared/api.js';
import { EmptyState, ErrorState, Loading, Page, PageBar } from '@shared/ui.jsx';
import { AttachmentList, PriorityTag, ReplyBlock, SIMPLE_TYPES, StatusTag, StatusTimeline, TYPE_LABEL, TicketSteps, getTicket, locationText } from '@entities/ticket.jsx';
import { listCategories } from '@entities/category.js';
import { RateForm, RatingView } from '@features/rate-ticket.jsx';
import { ReopenForm } from '@features/reopen-ticket.jsx';
import { UploadAttachmentCard } from '@features/upload-attachment.jsx';
import './pages.css';

export function CustomerTicketPage() {
  const { code } = useParams();
  const { data, loading, error, reload } = useRequest(async () => {
    const [ticket, categories] = await Promise.all([getTicket(code), listCategories().catch(() => [])]);
    return { ticket, categories };
  }, [code]);

  if (loading) return <Page><Loading /></Page>;
  if (error instanceof ApiError && error.status === 404) {
    return <Page><Result status="404" title="Không tìm thấy phiếu" subTitle="Mã không tồn tại hoặc không thuộc tài khoản của bạn."
      extra={<Link to="/customer/track"><Button type="primary">← Tra cứu lại</Button></Link>} /></Page>;
  }
  if (error) return <Page><ErrorState error={error} onRetry={reload} /></Page>;

  const { ticket: c, categories } = data;
  const catId = c.categoryId ?? c.autoCategoryId;
  const categoryName = categories.find((x) => x.id === catId)?.name;

  return (
    <Page size="wide">
      <PageBar title={c.title} extra={<Link to="/customer/history"><Button>← Danh sách</Button></Link>} />
      <div className="stack">
        <Card className="lift">
          <TicketSteps status={c.status} simple={SIMPLE_TYPES.includes(c.type)} />
          <Descriptions style={{ marginTop: 24 }} size="small" column={{ xs: 1, sm: 2 }} items={[
            { key: 'c', label: 'Mã', children: <b>{c.tracking_code}</b> },
            { key: 't', label: 'Loại', children: TYPE_LABEL[c.type] || c.type },
            { key: 's', label: 'Dịch vụ', children: c.service },
            { key: 'cat', label: 'Danh mục', children: categoryName || (catId ? `#${catId}` : 'Chưa phân loại') },
            {
              key: 'st',
              label: 'Trạng thái',
              children: (
                <Space wrap size={[4, 4]}>
                  <StatusTag status={c.status} />
                  {c.afterHours && <Tag color="purple">Ngoài giờ</Tag>}
                  {c.requiresManagerApproval && <Tag color="orange">Cần Quản lý duyệt</Tag>}
                  {c.duplicateOfId && <Tag>Trùng phiếu #{c.duplicateOfId}</Tag>}
                </Space>
              ),
            },
            { key: 'p', label: 'Ưu tiên', children: <PriorityTag priority={c.priority} /> },
            { key: 'd', label: 'Gửi lúc', children: fmt(c.created_at) },
            ...(c.responseDueAt || c.resolveDueAt ? [{
              key: 'sla',
              label: 'Hạn SLA',
              children: `Phản hồi: ${fmt(c.responseDueAt)} · Xử lý: ${fmt(c.resolveDueAt)}`,
            }] : []),
            { key: 'l', label: '📍 Vị trí', span: 2, children: locationText(c.location) },
          ]} />
          <h3 className="sec-title">Nội dung bạn đã gửi</h3>
          <p className="pre">{c.description}</p>
          <AttachmentList items={c.attachments} />
        </Card>

        <UploadAttachmentCard ticket={c} onDone={reload} />

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
