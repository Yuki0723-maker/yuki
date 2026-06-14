import Link from 'next/link';
import { Field, TextInput, TextArea, Select } from '@/components/ui';
import {
  PLACEMENT_STAGES,
  PLACEMENT_STATUSES,
  type Placement,
  type Candidate,
  type Organization,
} from '@/lib/types';

const fieldClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

export default function PlacementForm({
  action,
  placement,
  candidates,
  organizations,
  cancelHref,
}: {
  action: (formData: FormData) => void;
  placement?: Placement;
  candidates: Pick<Candidate, 'id' | 'name'>[];
  organizations: Pick<Organization, 'id' | 'name'>[];
  cancelHref: string;
}) {
  return (
    <form action={action} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="候補者 *">
          <select
            name="candidate_id"
            required
            defaultValue={placement?.candidate_id ?? ''}
            className={fieldClass}
          >
            <option value="" disabled>
              選択してください
            </option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="園・企業 *">
          <select
            name="organization_id"
            required
            defaultValue={placement?.organization_id ?? ''}
            className={fieldClass}
          >
            <option value="" disabled>
              選択してください
            </option>
            {organizations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="ステージ">
          <Select
            name="stage"
            options={PLACEMENT_STAGES}
            defaultValue={placement?.stage ?? '書類'}
          />
        </Field>
        <Field label="状況">
          <Select
            name="stage_status"
            options={PLACEMENT_STATUSES}
            defaultValue={placement?.stage_status ?? '調整中'}
          />
        </Field>
        <Field label="次の予定日">
          <TextInput
            type="date"
            name="next_date"
            defaultValue={placement?.next_date ?? ''}
          />
        </Field>
      </div>

      <Field label="次にやること">
        <TextInput
          name="next_action"
          defaultValue={placement?.next_action ?? ''}
          placeholder="例：日程を内山様へ送付済・返信待ち"
        />
      </Field>

      <Field label="メモ">
        <TextArea name="notes" defaultValue={placement?.notes ?? ''} />
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
