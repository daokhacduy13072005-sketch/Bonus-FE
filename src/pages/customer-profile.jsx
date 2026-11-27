// Trang Hồ sơ cá nhân của cư dân (GET/PUT /api/customers/me).
import { useRequest } from '@shared/lib.js';
import { ErrorState, Loading, Page, PageBar } from '@shared/ui.jsx';
import { getMyProfile } from '@entities/customer.js';
import { CustomerInfoCard, CustomerProfileForm } from '@features/customer-profile.jsx';
import './pages.css';

export function CustomerProfilePage() {
  const { data, loading, error, reload } = useRequest(getMyProfile);
  if (loading) return <Page><Loading /></Page>;
  if (error) return <Page><ErrorState error={error} onRetry={reload} /></Page>;

  return (
    <Page size="wide">
      <PageBar title="Hồ sơ cư dân" subtitle="Thông tin căn hộ, hợp đồng thuê và liên hệ của bạn" />
      <div className="stack">
        <CustomerInfoCard profile={data} />
        <CustomerProfileForm profile={data} onDone={reload} />
      </div>
    </Page>
  );
}
