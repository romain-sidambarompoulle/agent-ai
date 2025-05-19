'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function NewFlowButton() {
  const router = useRouter();
  const [isPending, start] = useTransition();

  const handleClick = () =>
    start(async () => {
      const res = await fetch('/api/flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Sans titre' }),
      });
      const { id } = await res.json();
      router.push(`/flows/${id}`);
    });

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded-xl bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
    >
      {isPending ? 'Création...' : '➕ Nouveau flow'}
    </button>
  );
}
