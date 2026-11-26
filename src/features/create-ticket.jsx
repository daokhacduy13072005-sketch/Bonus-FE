// FEATURE: Cư dân gửi phản hồi / khiếu nại (SC-07).
import { Link } from 'react-router-dom';
import { Button, Card, Divider, Form, Input, Result, Select, Upload, App } from 'antd';
import { EnvironmentOutlined, InboxOutlined } from '@ant-design/icons';
import { api } from '@shared/api.js';
import { sizeText } from '@shared/lib.js';
import { useAction } from '@shared/ui.jsx';
import { BUILDINGS, FLOOR_RE, ROOM_RE, SERVICES, TYPE_LABEL } from '@entities/ticket.jsx';
import './features.css';

/* ---------- Luật nghiệp vụ ---------- */
// Quy tắc tệp đính kèm (SecRS IA-CF04). ⚠ Tài liệu CHƯA nêu số cụ thể — giá trị tạm, hỏi nhóm backend để chốt.
export const FILE_RULES = { maxFiles: 5, maxBytes: 5 * 1024 * 1024, exts: ['jpg', 'jpeg', 'png', 'pdf'] };

// Trả về chuỗi lỗi, hoặc null nếu hợp lệ
export function checkFiles(files) {
  if (files.length > FILE_RULES.maxFiles) return `Tối đa ${FILE_RULES.maxFiles} tệp.`;
  for (const f of files) {
    const ext = f.name.split('.').pop().toLowerCase();
    if (!FILE_RULES.exts.includes(ext)) return `“${f.name}”: loại tệp không được hỗ trợ (chỉ ${FILE_RULES.exts.join(', ')}).`;
    if (f.size > FILE_RULES.maxBytes) return `“${f.name}” (${sizeText(f.size)}) vượt giới hạn ${sizeText(FILE_RULES.maxBytes)}.`;
  }
  return null;
}

const createTicket = (formData) => api('/api/feedbacks', { method: 'POST', form: formData });   // multipart
const opt = (arr) => arr.map((v) => ({ value: v, label: v }));

/* ---------- Form tạo phiếu ---------- */
export function TicketForm({ onCreated }) {
  const [form] = Form.useForm();
  const [submit, loading] = useAction(async (v) => {
    const fd = new FormData();
    ['type', 'service', 'building', 'floor', 'room', 'location_note', 'title', 'description']
      .forEach((k) => fd.append(k, String(v[k] ?? '').trim()));
    (v.files || []).forEach((f) => fd.append('files', f.originFileObj));
    const res = await createTicket(fd);
    onCreated(res.tracking_code);
  }, { form });

  return (
    <Form form={form} layout="vertical" size="large" requiredMark={false} onFinish={submit}
      initialValues={{ type: 'complaint', service: SERVICES[0], files: [] }}>
      <div className="row2">
        <Form.Item name="type" label="Loại phản hồi"><Select options={Object.entries(TYPE_LABEL).map(([value, label]) => ({ value, label }))} /></Form.Item>
        <Form.Item name="service" label="Dịch vụ liên quan"><Select options={opt(SERVICES)} /></Form.Item>
      </div>

      <Card size="small" className="loc-card" title={<><EnvironmentOutlined /> Vị trí xảy ra sự cố</>}>
        <div className="row2">
          <Form.Item name="building" label="Tòa / khu vực" rules={[{ required: true, message: 'Vui lòng chọn tòa / khu vực.' }]}>
            <Select placeholder="— Chọn —" options={opt(BUILDINGS)} />
          </Form.Item>
          <Form.Item name="floor" label="Tầng" rules={[{ required: true, pattern: FLOOR_RE, message: 'Nhập số tầng (1–99) hoặc hầm B1–B3.' }]}>
            <Input placeholder="Ví dụ: 3 hoặc B1" maxLength={3} autoComplete="off" />
          </Form.Item>
        </div>
        <div className="row2">
          <Form.Item name="room" label="Số phòng / căn hộ (nếu có)" rules={[{ pattern: ROOM_RE, message: 'Chỉ gồm chữ, số, dấu “-” (tối đa 10 ký tự).' }]}>
            <Input placeholder="Ví dụ: 302" maxLength={10} autoComplete="off" />
          </Form.Item>
          <Form.Item name="location_note" label="Mô tả thêm vị trí (nếu có)">
            <Input placeholder="Ví dụ: hành lang, cạnh thang máy" maxLength={100} showCount autoComplete="off" />
          </Form.Item>
        </div>
      </Card>

      <Form.Item name="title" label="Tiêu đề" style={{ marginTop: 20 }} rules={[{ required: true, min: 5, message: 'Tiêu đề tối thiểu 5 ký tự.' }]}>
        <Input maxLength={150} showCount placeholder="Tóm tắt vấn đề trong một câu" autoComplete="off" />
      </Form.Item>
      <Form.Item name="description" label="Mô tả chi tiết" rules={[{ required: true, min: 10, message: 'Mô tả tối thiểu 10 ký tự.' }]}>
        <Input.TextArea rows={5} maxLength={2000} showCount />
      </Form.Item>

      <Form.Item name="files" label="Ảnh / bằng chứng (không bắt buộc)" valuePropName="fileList" getValueFromEvent={(e) => e?.fileList}
        extra={`Tối đa ${FILE_RULES.maxFiles} tệp, mỗi tệp ≤ ${sizeText(FILE_RULES.maxBytes)}; định dạng: ${FILE_RULES.exts.join(', ')}.`}
        rules={[{ validator: (_, list) => { const e = checkFiles((list || []).map((f) => f.originFileObj || f)); return e ? Promise.reject(new Error(e)) : Promise.resolve(); } }]}>
        <Upload.Dragger multiple beforeUpload={() => false} accept={`.${FILE_RULES.exts.join(',.')}`}>
          <p className="ant-upload-drag-icon"><InboxOutlined /></p>
          <p className="ant-upload-text">Kéo thả tệp vào đây hoặc bấm để chọn</p>
        </Upload.Dragger>
      </Form.Item>

      <Divider style={{ margin: '8px 0 20px' }} />
      <Button type="primary" htmlType="submit" size="large" block loading={loading} className="btn-accent">Gửi phản hồi</Button>
    </Form>
  );
}

/* ---------- Màn hình sau khi gửi thành công ---------- */
export function TicketCreated({ code, onAnother }) {
  const { message } = App.useApp();
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); message.success('Đã sao chép mã.'); }
    catch { message.error('Không sao chép được, hãy chọn và copy thủ công.'); }
  };
  return (
    <Result status="success" title="Đã gửi phản hồi" subTitle="Hãy lưu lại mã tra cứu này để theo dõi tiến độ."
      extra={[
        <div key="code" className="big-code">{code}</div>,
        <Button key="copy" type="primary" className="btn-accent" onClick={copy}>Sao chép mã</Button>,
        <Link key="view" to={`/customer/complaints/${code}`}><Button>Xem trạng thái</Button></Link>,
        <Button key="more" onClick={onAnother}>Gửi phản hồi khác</Button>,
      ]} />
  );
}
