import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";

export const metadata: Metadata = { title: "ログイン" };

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/plans");

  return (
    <div className="min-h-screen flex" style={{ background: "#FDF5E6" }}>
      {/* Left illustration panel */}
      <div
        className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #D1E8E2 0%, #B2E2F2 50%, #FFB7B2 100%)" }}
      >
        {/* Soft blob decorations */}
        <div className="absolute top-12 left-12 w-48 h-48 rounded-full" style={{ background: "rgba(255,255,255,0.18)", filter: "blur(32px)" }}/>
        <div className="absolute bottom-16 right-8 w-64 h-64 rounded-full" style={{ background: "rgba(255,255,255,0.12)", filter: "blur(40px)" }}/>

        <div className="relative z-10 flex flex-col items-center gap-8 px-12">
          {/* Floating illustration */}
          <div className="float-anim">
            <LoginIllustration />
          </div>
          <div className="text-center glass rounded-3xl px-8 py-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <LeafLogo />
              <span className="font-serif-jp text-xl font-bold tracking-widest" style={{ color: "#4A4A4A", letterSpacing: "0.14em" }}>
                ことのは
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#6A8A7A" }}>
              子どもの今を、言葉に。<br/>
              保育士さんのためのAI週案アシスタント
            </p>
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <LeafLogo />
              <span className="font-serif-jp text-xl font-bold tracking-widest" style={{ color: "#4A4A4A", letterSpacing: "0.14em" }}>
                ことのは
              </span>
            </Link>
            <p className="mt-2 text-sm" style={{ color: "#A09080" }}>子どもの今を、言葉に。</p>
          </div>

          <div className="glass rounded-3xl p-8 shadow-sm">
            <LoginForm />
          </div>

          <p className="text-center text-xs mt-6" style={{ color: "#B0A090" }}>
            © 2025 ことのは
          </p>
        </div>
      </div>
    </div>
  );
}

function LeafLogo() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M12 3 C12 3 5 8 5 14 C5 18 8.1 21 12 21 C15.9 21 19 18 19 14 C19 8 12 3 12 3Z" fill="#D1E8E2" stroke="#B8D8CE" strokeWidth="1"/>
      <path d="M12 6 L12 19" stroke="#9EC8BC" strokeWidth="1" strokeLinecap="round"/>
      <path d="M12 11 L15.5 9" stroke="#9EC8BC" strokeWidth="0.8" strokeLinecap="round"/>
      <path d="M12 14 L15.5 12" stroke="#9EC8BC" strokeWidth="0.8" strokeLinecap="round"/>
    </svg>
  );
}

function LoginIllustration() {
  return (
    <svg width="260" height="200" viewBox="0 0 260 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="130" cy="188" rx="100" ry="8" fill="rgba(255,255,255,0.25)"/>

      {/* Blocks */}
      <rect x="68" y="148" width="30" height="30" rx="7" fill="rgba(255,255,255,0.7)" stroke="rgba(255,183,178,0.6)" strokeWidth="1.2"/>
      <rect x="100" y="155" width="26" height="23" rx="6" fill="rgba(255,255,255,0.65)" stroke="rgba(178,226,242,0.6)" strokeWidth="1.2"/>
      <rect x="68" y="122" width="30" height="28" rx="6" fill="rgba(255,255,255,0.65)" stroke="rgba(209,232,226,0.6)" strokeWidth="1.2"/>
      <rect x="130" y="160" width="20" height="18" rx="5" fill="rgba(255,255,255,0.6)" stroke="rgba(255,183,178,0.5)" strokeWidth="1.2"/>

      {/* Child */}
      <circle cx="96" cy="110" r="18" fill="rgba(255,255,255,0.8)" stroke="rgba(255,183,178,0.4)" strokeWidth="1"/>
      <path d="M79 105 Q83 91 96 89 Q109 91 113 105" fill="rgba(200,149,108,0.3)"/>
      <circle cx="88" cy="114" r="4.5" fill="rgba(255,183,178,0.3)"/>
      <circle cx="104" cy="114" r="4.5" fill="rgba(255,183,178,0.3)"/>
      <circle cx="90" cy="108" r="2.2" fill="#4A4A4A"/>
      <circle cx="102" cy="108" r="2.2" fill="#4A4A4A"/>
      <circle cx="91" cy="107" r="0.9" fill="white"/>
      <circle cx="103" cy="107" r="0.9" fill="white"/>
      <path d="M91 117 Q96 122 101 117" stroke="rgba(192,130,106,0.8)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="96" cy="134" rx="14" ry="12" fill="rgba(255,255,255,0.75)"/>
      <path d="M83 138 Q76 150 80 158" stroke="rgba(255,255,255,0.8)" strokeWidth="9" strokeLinecap="round"/>
      <path d="M110 138 Q117 150 113 158" stroke="rgba(255,255,255,0.8)" strokeWidth="9" strokeLinecap="round"/>
      <path d="M83 136 Q83 148 96 148 Q109 148 109 136 Z" fill="rgba(255,183,178,0.3)"/>

      {/* Teacher */}
      <path d="M162 190 L159 148 Q168 142 177 148 L174 190 Z" fill="rgba(209,232,226,0.55)"/>
      <ellipse cx="168" cy="145" rx="13" ry="12" fill="rgba(255,255,255,0.8)"/>
      <circle cx="168" cy="119" r="20" fill="rgba(255,255,255,0.82)" stroke="rgba(209,232,226,0.5)" strokeWidth="1"/>
      <path d="M149 113 Q153 96 168 94 Q183 96 187 113" fill="rgba(122,85,64,0.3)"/>
      <circle cx="185" cy="100" r="7" fill="rgba(122,85,64,0.22)"/>
      <circle cx="159" cy="122" r="5.5" fill="rgba(255,183,178,0.25)"/>
      <circle cx="177" cy="122" r="5.5" fill="rgba(255,183,178,0.25)"/>
      <path d="M161 114 Q164 112 166 114" stroke="#4A4A4A" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M170 114 Q173 112 176 114" stroke="#4A4A4A" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M161 125 Q168 131 175 125" stroke="rgba(192,130,106,0.8)" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      <path d="M156 146 Q144 155 133 162" stroke="rgba(255,255,255,0.85)" strokeWidth="10" strokeLinecap="round"/>
      <path d="M156 146 Q144 155 133 162" stroke="rgba(209,232,226,0.6)" strokeWidth="2" strokeLinecap="round" fill="none"/>

      {/* Decorations */}
      <circle cx="220" cy="40" r="12" fill="rgba(255,220,128,0.45)"/>
      <circle cx="220" cy="40" r="7" fill="rgba(255,220,128,0.55)"/>
      <path d="M220 21 L220 14" stroke="rgba(255,220,128,0.6)" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M232 28 L237 23" stroke="rgba(255,220,128,0.6)" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M208 28 L203 23" stroke="rgba(255,220,128,0.6)" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
