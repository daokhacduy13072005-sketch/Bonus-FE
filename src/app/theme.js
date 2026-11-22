// Giao diện Ant Design: đổi màu thương hiệu / bo góc / font ở MỘT chỗ duy nhất.
import viVN from 'antd/locale/vi_VN';

export const locale = viVN;

export const theme = {
  token: {
    colorPrimary: '#0b5ed7',
    colorInfo: '#0b5ed7',
    colorSuccess: '#16a34a',
    colorWarning: '#f59e0b',
    colorError: '#dc2626',
    colorBgLayout: '#f3f5f9',
    colorTextBase: '#0f172a',
    borderRadius: 10,
    fontFamily: '"Be Vietnam Pro", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    fontSize: 14.5,
  },
  components: {
    Card: { borderRadiusLG: 16, boxShadowTertiary: '0 2px 8px -2px rgba(15,23,42,.08)' },
    Table: { headerBg: '#f8fafc', headerColor: '#64748b', borderColor: '#e5e9f0' },
    Button: { fontWeight: 600, controlHeight: 38, controlHeightLG: 46 },
    Menu: { itemBorderRadius: 99, horizontalItemSelectedBg: '#e8f1ff', horizontalItemSelectedColor: '#0b5ed7' },
  },
};
