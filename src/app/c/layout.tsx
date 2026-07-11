import { Sidebar } from "@/components/site/Sidebar";

export default function ShowcaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1200px] flex-col sm:flex-row">
      <Sidebar />
      <main className="min-w-0 flex-1 border-t border-[var(--line)] px-6 py-8 sm:border-l sm:border-t-0 sm:px-10 sm:py-10">
        {children}
      </main>
    </div>
  );
}
