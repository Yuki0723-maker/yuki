import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <PageHeader title="設定" />

      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-base font-bold text-slate-800">アカウント</h2>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-slate-400">メールアドレス</dt>
              <dd className="mt-1 text-sm text-slate-800">{user?.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-400">ユーザー ID</dt>
              <dd className="mt-1 break-all text-sm text-slate-800">{user?.id ?? '—'}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-2 text-base font-bold text-slate-800">Google スプレッドシート連携</h2>
          <p className="text-sm text-slate-500">
            アプリ → Sheets へのミラー書き出し（Phase 4）は今後実装予定です。
            サービスアカウントの発行と対象シートの共有設定が必要になります。
          </p>
        </section>
      </div>
    </div>
  );
}
