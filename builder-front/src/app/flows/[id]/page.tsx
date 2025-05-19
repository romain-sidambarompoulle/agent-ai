// src/app/flows/[id]/page.tsx
import FlowPage from '@/components/FlowPage';

export default async function FlowServerPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;   // ← Next n’affiche plus le warning
  return <FlowPage id={id} />;
}