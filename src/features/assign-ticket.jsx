// FEATURE: Phân công bộ phận xử lý + hạn SLA (UC-08).
import dayjs from 'dayjs';
import { Button, Card, DatePicker, Form, Select, Table, Tag } from 'antd';
import { api } from '@shared/api.js';
import { fmt } from '@shared/lib.js';
import { useAction } from '@shared/ui.jsx';
import { ASSIGN_LABEL } from '@entities/assignment.js';
import { SIMPLE_TYPES } from '@entities/ticket.jsx';
import './features.css';

export function AssignCard({ ticket: c, departments, onDone }) {
  const [form] = Form.useForm();
  const [submit, loading] = useAction(
    (v) => api(`/api/feedbacks/${c.id}/assignments`, { method: 'POST', body: { department_id: v.department_id, due_at: v.due_at ? v.due_at.toISOString() : '' } }),
    { form, success: 'Đã giao việc.', onDone: async () => { form.resetFields(); await onDone(); } });

  if (SIMPLE_TYPES.includes(c.type)) return null;          // góp ý / khen ngợi không cần phân công (BR-09)
  const canAssign = !['Resolved', 'Closed'].includes(c.status);

  return (
    <Card title={<>Phân công bộ phận <span className="uc">UC-08</span></>} className="lift">
      {c.assignments.length ? (
        <Table size="small" pagination={false} rowKey={(a, i) => a.id ?? i} style={{ marginBottom: 16 }} dataSource={c.assignments} scroll={{ x: 520 }}
          columns={[
            { title: 'Bộ phận', dataIndex: 'department_name' },
            { title: 'Hạn xử lý', dataIndex: 'due_at', render: fmt },
            { title: 'Trạng thái', dataIndex: 'status', render: (s) => <Tag color={s === 'Done' ? 'green' : 'blue'}>{ASSIGN_LABEL[s] || s}</Tag> },
            { title: 'Kết quả', render: (_, a) => <>{a.result_note || '–'}{a.solution ? <div className="mu">Giải pháp: {a.solution}</div> : null}</> },
          ]} />
      ) : <p className="mu" style={{ marginTop: 0 }}>Chưa phân công.</p>}
      {canAssign && (
        <Form form={form} layout="vertical" onFinish={submit}>
          <div className="row3">
            <Form.Item name="department_id" label="Bộ phận" rules={[{ required: true, message: 'Chọn bộ phận.' }]}>
              <Select placeholder="— Chọn —" options={departments.map((d) => ({ value: d.id, label: d.name }))} />
            </Form.Item>
            <Form.Item name="due_at" label="Hạn xử lý (SLA)" rules={[{ required: true, message: 'Chọn hạn xử lý.' }]}>
              <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} disabledDate={(d) => d && d < dayjs().startOf('day')} />
            </Form.Item>
          </div>
          <Button type="primary" htmlType="submit" loading={loading}>Giao việc</Button>
        </Form>
      )}
    </Card>
  );
}
