import { PageHeader } from '@/components/ui';
import CandidateForm from '@/components/CandidateForm';
import { createCandidate } from '../actions';

export default function NewCandidatePage() {
  return (
    <div>
      <PageHeader title="候補者を追加" />
      <CandidateForm action={createCandidate} cancelHref="/candidates" />
    </div>
  );
}
