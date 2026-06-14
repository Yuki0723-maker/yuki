import Link from 'next/link';
import { Field, TextInput, TextArea, Select } from '@/components/ui';
import { CANDIDATE_STATUSES, type Candidate } from '@/lib/types';

export default function CandidateForm({
  action,
  candidate,
  cancelHref,
}: {
  action: (formData: FormData) => void;
  candidate?: Candidate;
  cancelHref: string;
}) {
  return (
    <form action={action} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
      <Field label="候補者名 *">
        <TextInput name="name" required defaultValue={candidate?.name ?? ''} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="ステータス">
          <Select
            name="status"
            options={CANDIDATE_STATUSES}
            defaultValue={candidate?.status ?? '面談前'}
          />
        </Field>
        <Field label="希望勤務地">
          <TextInput
            name="desired_region"
            defaultValue={candidate?.desired_region ?? ''}
          />
        </Field>
      </div>

      <Field label="保育士試験の状況">
        <TextInput
          name="hoikushi_exam_status"
          defaultValue={candidate?.hoikushi_exam_status ?? ''}
          placeholder="例：資格審査結果6月末見込み"
        />
      </Field>

      <Field label="メモ">
        <TextArea name="notes" defaultValue={candidate?.notes ?? ''} />
      </Field>

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          保存
        </button>
        <Link
          href={cancelHref}
          className="rounded-lg border border-slate-300 px-5 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          キャンセル
        </Link>
      </div>
    </form>
  );
}
