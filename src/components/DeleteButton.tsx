'use client';

import { useTransition } from 'react';

export default function DeleteButton({
  action,
  confirmText,
}: {
  action: () => Promise<void>;
  confirmText: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(confirmText)) {
          startTransition(() => action());
        }
      }}
      className="rounded-lg border border-rose-300 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-50"
    >
      {pending ? '削除中…' : '削除'}
    </button>
  );
}
