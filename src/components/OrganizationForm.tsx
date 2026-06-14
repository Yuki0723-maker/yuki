import Link from 'next/link';
import { Field, TextInput, TextArea, Select } from '@/components/ui';
import { RELATION_TYPES, type Organization } from '@/lib/types';

export default function OrganizationForm({
  action,
  org,
  cancelHref,
}: {
  action: (formData: FormData) => void;
  org?: Organization;
  cancelHref: string;
}) {
  return (
    <form action={action} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
      <Field label="園・企業名 *">
        <TextInput name="name" required defaultValue={org?.name ?? ''} placeholder="例：NoBorders" />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="関係区分">
          <Select
            name="relation_type"
            options={RELATION_TYPES}
            defaultValue={org?.relation_type ?? 'その他'}
          />
        </Field>
        <Field label="国">
          <TextInput name="country" defaultValue={org?.country ?? ''} placeholder="日本 / タイ" />
        </Field>
        <Field label="所在地">
          <TextInput name="city" defaultValue={org?.city ?? ''} />
        </Field>
        <Field label="採用サイクル">
          <TextInput
            name="hiring_cycle"
            defaultValue={org?.hiring_cycle ?? ''}
            placeholder="例：4月ピーク"
          />
        </Field>
        <Field label="担当者名">
          <TextInput
            name="contact_person"
            defaultValue={org?.contact_person ?? ''}
            placeholder="例：内山様"
          />
        </Field>
        <Field label="担当者メール">
          <TextInput
            type="email"
            name="contact_email"
            defaultValue={org?.contact_email ?? ''}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="給与下限">
          <TextInput
            type="number"
            name="salary_min"
            defaultValue={org?.salary_min ?? ''}
          />
        </Field>
        <Field label="給与上限">
          <TextInput
            type="number"
            name="salary_max"
            defaultValue={org?.salary_max ?? ''}
          />
        </Field>
        <Field label="通貨">
          <TextInput
            name="salary_currency"
            defaultValue={org?.salary_currency ?? 'JPY'}
            placeholder="JPY / THB"
          />
        </Field>
      </div>

      <Field label="メモ">
        <TextArea name="notes" defaultValue={org?.notes ?? ''} />
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
