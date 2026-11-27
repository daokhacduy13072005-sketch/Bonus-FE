// FEATURE: Upload bổ sung tệp đính kèm cho phiếu đã tạo (POST /api/feedbacks/{id}/attachments).
import { Button, Card, Form, Upload, App } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { sizeText } from '@shared/lib.js';
import { useAction } from '@shared/ui.jsx';
import { uploadTicketAttachment } from '@entities/ticket.jsx';
import './features.css';

const MAX_FILES = 5;
const MAX_BYTES = 10 * 1024 * 1024;
const EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'];
const FINAL_STATUSES = ['Closed', 'Rejected', 'Merged'];

export function UploadAttachmentCard({ ticket: c, onDone }) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const existing = c.attachments?.length || 0;
  const remaining = Math.max(0, MAX_FILES - existing);

  const [submit, loading] = useAction(async (v) => {
    const files = (v.files || []).map((f) => f.originFileObj).filter(Boolean);
    if (!files.length) return;
    let uploaded = 0;
    for (const file of files) {
      await uploadTicketAttachment(c.id, file);
      uploaded++;
    }
    if (uploaded) message.success(`Đã tải lên ${uploaded} tệp đính kèm.`);
    form.resetFields();
    await onDone?.();
  }, { form });

  if (FINAL_STATUSES.includes(c.status) || remaining === 0) return null;

  return (
    <Card title="Bổ sung ảnh / tệp đính kèm" className="lift">
      <Form form={form} layout="vertical" onFinish={submit} initialValues={{ files: [] }}>
        <Form.Item name="files" valuePropName="fileList" getValueFromEvent={(e) => e?.fileList}
          extra={`Còn có thể thêm tối đa ${remaining} tệp (tối đa ${MAX_FILES} tệp/phiếu, ≤ ${sizeText(MAX_BYTES)}/tệp: ${EXTS.join(', ')}).`}
          rules={[{
            validator: (_, list) => {
              const files = (list || []).map((f) => f.originFileObj || f);
              if (!files.length) return Promise.reject(new Error('Vui lòng chọn ít nhất 1 tệp.'));
              if (files.length > remaining) return Promise.reject(new Error(`Chỉ có thể thêm tối đa ${remaining} tệp nữa.`));
              for (const f of files) {
                const parts = f.name.split('.');
                const ext = parts.length > 1 ? parts.pop().toLowerCase() : '';
                if (!EXTS.includes(ext)) return Promise.reject(new Error(`“${f.name}”: định dạng không hỗ trợ.`));
                if (f.size > MAX_BYTES) return Promise.reject(new Error(`“${f.name}” vượt quá ${sizeText(MAX_BYTES)}.`));
              }
              return Promise.resolve();
            },
          }]}>
          <Upload.Dragger multiple beforeUpload={() => false} accept={`.${EXTS.join(',.')}`}>
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">Kéo thả tệp vào đây hoặc bấm để chọn</p>
          </Upload.Dragger>
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>Tải tệp lên</Button>
      </Form>
    </Card>
  );
}
