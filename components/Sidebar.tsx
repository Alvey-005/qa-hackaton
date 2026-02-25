"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, FileText, Receipt, Settings, LogOut, TrendingUp } from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transfer", label: "Transfer Funds", icon: ArrowLeftRight },
    { href: "/transactions", label: "Transaction History", icon: FileText },
    { href: "/bills", label: "Bill Payments", icon: Receipt },
    { href: "/settings", label: "Account Settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    function handleLogout() {
        localStorage.removeItem("fintrack_session");
        router.push("/login");
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    <TrendingUp size={18} color="white" />
                </div>
                <span className="sidebar-logo-text">FinTrack</span>
            </div>

            <nav className="sidebar-nav">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`nav-item ${isActive ? "active" : ""}`}
                        >
                            <span className="nav-icon">
                                <Icon size={16} />
                            </span>
                            {label}
                        </Link>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <button className="nav-item btn-danger" onClick={handleLogout} style={{ width: "100%", border: "none" }}>
                    <span className="nav-icon">
                        <LogOut size={16} />
                    </span>
                    Logout
                </button>
            </div>
        </aside>
    );
}
