"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    useEffect(() => {
        // TC-AUTH-05/06: check localStorage session on every route
        const session = localStorage.getItem("fintrack_session");
        if (!session) {
            router.push("/login");
        }
    }, [router]);

    return (
        <div className="app-container">
            <Sidebar />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
