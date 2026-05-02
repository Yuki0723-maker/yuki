"use client";

import { useRouter } from "next/navigation";
import { GenerateForm } from "@/components/x-ops/GenerateForm";

interface Props {
  ideaId: string;
}

export function IdeaDetailClient({ ideaId }: Props) {
  const router = useRouter();

  return (
    <GenerateForm
      ideaId={ideaId}
      onGenerated={() => router.refresh()}
    />
  );
}
