export default function ChatLayout ({children}: {children: React.ReactNode}) {
    return (
        <div className="
            h-screen
            grid
            grid-cols-1
            md:grid-cols-[280px_1fr]
            lg:grid-cols-[280px_1fr_260px]
            bg-[var(--bg-main)]
        ">
            {children}
        </div>
    );
}