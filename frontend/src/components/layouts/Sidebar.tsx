import type { SidebarProps } from "../../types/props";

export default function Sidebar({
    title,
    children,
    hiddenOnMobile,
    logOut,
}: SidebarProps) {
    return (
        <aside
            className={`
        bg-[var(--bg-sidebar)]
        border-r border-[var(--border)]
        p-4
        ${hiddenOnMobile ? "hidden md:block" : ""}
      `}
        >
            {/* HEADER */}
            <div className="flex items-center justify-between pb-2">
                <h2 className="text-2xl font-bold tracking-tight">
                    {title}
                </h2>

                {logOut && (
                    <div className="text-sm font-medium cursor-pointer text-red-500 hover:text-red-600">
                        {logOut}
                    </div>
                )}
            </div>

            {/* BODY */}
            {children}
        </aside>
    );
}
