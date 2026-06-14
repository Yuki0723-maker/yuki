import Link from 'next/link';

export function PageHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      {action}
    </div>
  );
}

export function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
    >
      {children}
    </Link>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

const fieldClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={fieldClass} />;
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return <textarea {...props} rows={4} className={fieldClass} />;
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & {
    options: readonly string[];
  }
) {
  const { options, ...rest } = props;
  return (
    <select {...rest} className={fieldClass}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

const STATUS_COLORS: Record<string, string> = {
  面談前: 'bg-slate-100 text-slate-700',
  選考中: 'bg-blue-100 text-blue-700',
  内定: 'bg-green-100 text-green-700',
  保留: 'bg-amber-100 text-amber-700',
  見送り: 'bg-rose-100 text-rose-700',
  書類: 'bg-slate-100 text-slate-700',
  一次面接: 'bg-sky-100 text-sky-700',
  二次面接: 'bg-indigo-100 text-indigo-700',
  調整中: 'bg-amber-100 text-amber-700',
  確定: 'bg-blue-100 text-blue-700',
  完了: 'bg-green-100 text-green-700',
  契約園: 'bg-emerald-100 text-emerald-700',
  連携園: 'bg-cyan-100 text-cyan-700',
  その他: 'bg-slate-100 text-slate-600',
};

export function Badge({ value }: { value: string }) {
  const cls = STATUS_COLORS[value] ?? 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {value}
    </span>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-400">
      {message}
    </div>
  );
}
