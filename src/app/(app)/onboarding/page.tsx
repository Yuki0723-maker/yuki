import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { FormatWizard } from "@/components/onboarding/FormatWizard";

export const metadata: Metadata = { title: "フォーマット設定 | ことのは" };

export default async function OnboardingPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const config = await db.userFormatConfig.findUnique({
    where: { userId: session.user.id },
  });
  if (config) redirect("/plans");

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "#FDF5E6" }}
    >
      {/* Blob decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 rounded-full" style={{ background: "rgba(255,183,178,0.1)", filter: "blur(56px)" }}/>
        <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full" style={{ background: "rgba(178,226,242,0.1)", filter: "blur(64px)" }}/>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <LeafIllustration />
          <h1
            className="font-serif-jp font-bold mt-5 mb-2"
            style={{ fontSize: "22px", color: "#4A4A4A", letterSpacing: "0.06em" }}
          >
            週案フォーマットを設定しましょう
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "#B0A090" }}>
            あなたの園・クラスに合わせた週案フォーマットを設定します。<br />
            あとからいつでも変更できます。
          </p>
        </div>

        {/* Wizard card */}
        <div className="glass rounded-3xl p-7">
          <FormatWizard />
        </div>
      </div>
    </div>
  );
}

function LeafIllustration() {
  return (
    <div className="flex justify-center">
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <circle cx="28" cy="28" r="28" fill="rgba(209,232,226,0.3)"/>
        <path
          d="M28 10 C28 10 14 20 14 32 C14 40 20.3 46 28 46 C35.7 46 42 40 42 32 C42 20 28 10 28 10Z"
          fill="#D1E8E2" stroke="#B8D8CE" strokeWidth="1.5"
        />
        <path d="M28 16 L28 43" stroke="#9EC8BC" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M28 26 L35 22" stroke="#9EC8BC" strokeWidth="1" strokeLinecap="round"/>
        <path d="M28 32 L35 28" stroke="#9EC8BC" strokeWidth="1" strokeLinecap="round"/>
        <path d="M28 26 L21 22" stroke="#9EC8BC" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
      </svg>
    </div>
  );
}
