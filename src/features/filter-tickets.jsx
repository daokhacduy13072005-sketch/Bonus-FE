// FEATURE: Bộ lọc danh sách phiếu. Bộ lọc nằm trên URL → chia sẻ được đường dẫn, nút Back vẫn hoạt động.
import dayjs from 'dayjs';
import { Button, DatePicker, Form, Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { BUILDINGS, STATUS_LABEL } from '@entities/ticket.jsx';
import './features.css';

const DATE = 'YYYY-MM-DD';

// query: { q, status, building, from, to }; onChange(newQuery) do trang quyết định ghi lên URL
export function TicketFilters({ query, onChange }) {
  const range = query.from && query.to ? [dayjs(query.from), dayjs(query.to)] : null;
  return (
    <Form key={JSON.stringify(query)} className="filters" layout="inline"
      initialValues={{ q: query.q, status: query.status, building: query.building, range }}
      onFinish={(v) => onChange({
        q: v.q?.trim() || undefined, status: v.status || undefined, building: v.building || undefined,
        from: v.range?.[0]?.format(DATE), to: v.range?.[1]?.format(DATE),
      })}>
      <Form.Item name="q"><Input allowClear prefix={<SearchOutlined />} placeholder="Tìm theo mã, tiêu đề, người gửi" style={{ width: 260 }} /></Form.Item>
      <Form.Item name="status"><Select allowClear placeholder="Mọi trạng thái" style={{ width: 170 }} options={Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))} /></Form.Item>
      <Form.Item name="building"><Select allowClear placeholder="Mọi tòa" style={{ width: 190 }} options={BUILDINGS.map((b) => ({ value: b, label: b }))} /></Form.Item>
      <Form.Item name="range"><DatePicker.RangePicker format="DD/MM/YYYY" placeholder={['Từ ngày', 'Đến ngày']} /></Form.Item>
      <Button type="primary" htmlType="submit">Lọc</Button>
    </Form>
  );
}
