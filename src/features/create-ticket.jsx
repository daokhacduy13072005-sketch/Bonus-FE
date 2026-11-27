// FEATURE: Cư dân gửi phản hồi / khiếu nại (SC-07).
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Card, Divider, Form, Input, Result, Select, Upload, App } from 'antd';
import { EnvironmentOutlined, InboxOutlined } from '@ant-design/icons';
import { ApiError, api } from '@shared/api.js';
import { sizeText } from '@shared/lib.js';
import { useAction } from '@shared/ui.jsx';
import { BUILDINGS, FLOOR_RE, ROOM_RE, SERVICES, TYPE_LABEL, locationText, uploadTicketAttachment } from '@entities/ticket.jsx';
import { useAuth } from '@entities/user.jsx';
import { listCategories } from '@entities/category.js';
import { listStaff } from '@entities/staff.js';
import './features.css';

/* ---------- Luật nghiệp vụ ---------- */
// Khớp cấu hình backend: tối đa 5 tệp, 10MB/tệp, định dạng JPG/PNG/WEBP/GIF/PDF.
export const FILE_RULES = { maxFiles: 5, maxBytes: 10 * 1024 * 1024, exts: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'] };

const TYPE_TO_API = {
  complaint: 'COMPLAINT',
  suggestion: 'SUGGESTION',
  proposal: 'PROPOSAL',
  praise: 'PRAISE',
  staff_feedback: 'COMPLAINT',
};

// Trả về chuỗi lỗi, hoặc null nếu hợp lệ
export function checkFiles(files) {
  if (files.length > FILE_RULES.maxFiles) return `Tối đa ${FILE_RULES.maxFiles} tệp.`;
  for (const f of files) {
    const parts = f.name.split('.');
    const ext = parts.length > 1 ? parts.pop().toLowerCase() : '';
    if (!FILE_RULES.exts.includes(ext)) return `“${f.name}”: loại tệp không được hỗ trợ (chỉ ${FILE_RULES.exts.join(', ')}).`;
    if (f.size > FILE_RULES.maxBytes) return `“${f.name}” (${sizeText(f.size)}) vượt giới hạn ${sizeText(FILE_RULES.maxBytes)}.`;
  }
  return null;
}

const createTicket = (body) => api('/api/feedbacks', { method: 'POST', body });
const opt = (arr) => arr.map((v) => ({ value: v, label: v }));

/* ---------- Form tạo phiếu ---------- */
export function TicketForm({ onCreated }) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { user } = useAuth();
  const typeValue = Form.useWatch('type', form);
  const [categories, setCategories] = useState([]);
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    listCategories().then((list) => setCategories(Array.isArray(list) ? list.filter((c) => c.active) : [])).catch(() => {});
    listStaff().then((list) => setStaffList(Array.isArray(list) ? list.filter((s) => s.active) : [])).catch(() => {});
  }, []);

  const [submit, loading] = useAction(async (v) => {
    const customerId = user?.customer_id ?? user?.customerId;
    if (!customerId) {
      throw new ApiError(400, 'Không xác định được tài khoản cư dân. Vui lòng đăng nhập lại.');
    }
    const payload = {
      customerId,
      type: TYPE_TO_API[v.type] || 'COMPLAINT',
      title: v.title.trim(),
      content: v.description.trim(),
      categoryId: v.categoryId || undefined,
      serviceName: v.service,
      location: locationText({
        building: v.building,
        floor: v.floor?.trim(),
        room: v.room?.trim(),
        note: v.location_note?.trim(),
      }),
      apartmentCode: v.room?.trim() || user?.apartment_code || user?.apartmentCode || undefined,
      aboutStaffId: v.aboutStaffId || undefined,
    };
    const res = await createTicket(payload);
    const files = (v.files || []).map((f) => f.originFileObj).filter(Boolean);
    if (files.length && res?.id) {
      let failed = 0;
      for (const file of files) {
        try { await uploadTicketAttachment(res.id, file); }
        catch { failed++; }
      }
      if (failed) {
        message.warning(`Đã gửi phiếu nhưng ${failed}/${files.length} tệp đính kèm tải lên thất bại.`);
      }
    }
    onCreated(res.code || res.tracking_code);
  }, { form });

  return (
    <Form form={form} layout="vertical" size="large" requiredMark={false} onFinish={submit}
      disabled={Boolean(user?.blocked)}
      initialValues={{ type: 'complaint', service: SERVICES[0], files: [] }}>
      {user?.blocked && (
        <Alert type="error" showIcon style={{ marginBottom: 16 }}
          message="Tài khoản cư dân của bạn đang bị khóa quyền gửi phản hồi. Vui lòng liên hệ Ban quản lý." />
      )}
      <div className="row2">
        <Form.Item name="type" label="Loại phản hồi"><Select options={Object.entries(TYPE_LABEL).map(([value, label]) => ({ value, label }))} /></Form.Item>
        <Form.Item name="service" label="Dịch vụ liên quan"><Select options={opt(SERVICES)} /></Form.Item>
      </div>
      {(categories.length > 0 || staffList.length > 0) && (
        <div className="row2">
          {categories.length > 0 && (
            <Form.Item name="categoryId" label="Danh mục sự cố (tùy chọn)">
              <Select allowClear placeholder="Để hệ thống tự phân loại theo nội dung"
                options={categories.map((c) => ({ value: c.id, label: `${c.name} (${c.code})` }))} />
            </Form.Item>
          )}
          {staffList.length > 0 && (
            <Form.Item name="aboutStaffId" label={typeValue === 'staff_feedback' ? 'Nhân viên được phản ánh' : 'Nhân viên liên quan (nếu có)'}>
              <Select allowClear showSearch optionFilterProp="label" placeholder="— Chọn nhân viên (nếu có) —"
                options={staffList.map((s) => ({ value: s.id, label: `${s.fullName} · ${s.department || s.role}` }))} />
            </Form.Item>
          )}
        </div>
      )}

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
