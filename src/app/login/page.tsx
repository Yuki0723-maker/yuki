import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">ホイクペディア管理</h1>
          <p className="mt-1 text-sm text-slate-500">
            候補者・園・選考状況の一元管理
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
