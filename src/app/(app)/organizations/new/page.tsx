import { PageHeader } from '@/components/ui';
import OrganizationForm from '@/components/OrganizationForm';
import { createOrganization } from '../actions';

export default function NewOrganizationPage() {
  return (
    <div>
      <PageHeader title="園・企業を追加" />
      <OrganizationForm action={createOrganization} cancelHref="/organizations" />
    </div>
  );
}
