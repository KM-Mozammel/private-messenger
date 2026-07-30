export default function ChatSurface({ children }: { children: React.ReactNode }) {
  return (
    <main className="position-relative flex flex-col bg-[var(--bg-surface)] h-full">
      {children}
    </main>
  );
}
