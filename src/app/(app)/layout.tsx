import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/ui/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, avatarUrl: true, targetAge: true },
  });

  return (
    <div className="flex min-h-screen bg-[#faf8f3]">
      <Sidebar user={user!} />
      <main className="flex-1 ml-56 p-6 max-w-5xl">{children}</main>
    </div>
  );
}
