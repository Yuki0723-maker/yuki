import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

export const metadata: Metadata = { title: "クラス情報の登録" };

export default async function OnboardingPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, targetAge: true },
  });

  // すでに登録済みならホームへ
  if (user?.targetAge !== null && user?.targetAge !== undefined) {
    redirect("/plans");
  }

  return (
    <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <CupLogo />
          <h1 className="text-2xl font-bold text-[#3d2b1f] mt-4">
            ようこそ、{user?.name ?? "保育士さん"}
          </h1>
          <p className="text-sm text-[#b09070] mt-2">
            まず、担当クラスの情報を教えてください。<br />
            週案をより的確に作るために使います。
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-[#ece4d4] p-7 shadow-sm">
          <OnboardingForm />
        </div>
      </div>
    </div>
  );
}

function CupLogo() {
  return (
    <div className="flex justify-center">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M7 17 Q7 33 20 33 Q33 33 33 17 Z" stroke="#3d2b1f" strokeWidth="2.5" fill="none"/>
        <rect x="6" y="11" width="28" height="8" rx="4" stroke="#3d2b1f" strokeWidth="2.5" fill="none"/>
        <path d="M33 18 Q41 18 41 25 Q41 32 33 32" stroke="#3d2b1f" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M14 6 Q13 3 14 1" stroke="#d4845a" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M20 5 Q19 2 20 0" stroke="#d4845a" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M26 6 Q25 3 26 1" stroke="#d4845a" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    </div>
  );
}
