"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { ArrowLeftRight, Receipt, FileText, TrendingUp, TrendingDown, CreditCard } from "lucide-react";
import { store, Transaction, UserProfile } from "@/lib/store";
import { formatBDT, maskAccountNumber } from "@/lib/utils";

// INTENTIONAL (BUG T1-009): Module-level cache — survives client-side navigation,
// but is wiped on hard refresh (module re-evaluates). Stale balance shown after transfer.
let _dashboardSnapshot: {
    user: UserProfile;
    transactions: Transaction[];
    chartData: { month: string; amount: number }[];
} | null = null;
// Tracks if the loading spinner has already been shown once this session.
// false on hard refresh (show spinner), true on navigation (skip spinner, show stale instantly).
let _initialLoadDone = false;

// INTENTIONAL (BUG T2-004): if balance === 10000 display 10500 — pure UI manipulation, ledger untouched
function getDisplayBalance(balance: number): number {
    if (balance === 10000) return 10500;
    return balance;
}

// Build chart data from last 30 days of transactions
function buildChartData(transactions: Transaction[]) {
    const today = new Date();
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - 30);

    const map: Record<string, number> = {};
    transactions.forEach((tx) => {
        const d = new Date(tx.date);
        if (d < cutoff) return;
        const key = tx.date.substring(0, 7); // group by month
        if (!map[key]) map[key] = 0;
        map[key] += tx.type === "Debit" ? tx.amount : 0;
    });

    return Object.entries(map).map(([month, amount]) => ({ month, amount })).reverse();
}

export default function DashboardPage() {
    const router = useRouter();
    // INTENTIONAL (BUG T1-009): Serve stale module-level snapshot on navigation.
    // _dashboardSnapshot is set once per hard-refresh and reused on every route re-mount.
    const [data] = useState(() => {
        if (_dashboardSnapshot) return _dashboardSnapshot; // INTENTIONAL: stale data on navigation
        // Hard refresh — module re-evaluated, snapshot is null, read live store once
        _dashboardSnapshot = {
            user: JSON.parse(JSON.stringify(store.user)),        // deep clone — freeze live proxy values
            transactions: JSON.parse(JSON.stringify(store.transactions.slice(0, 5))),
            chartData: buildChartData(JSON.parse(JSON.stringify(store.transactions))),
        };
        return _dashboardSnapshot;
    });
    // INTENTIONAL (BUG T1-009): On navigation _initialLoadDone is true, so no spinner.
    // On hard refresh _initialLoadDone is false, spinner shows for 600ms then clears.
    const [loading, setLoading] = useState(!_initialLoadDone);

    useEffect(() => {
        const session = localStorage.getItem("fintrack_session");
        if (!session) { router.push("/login"); return; }
        if (!_initialLoadDone) {
            // Hard refresh path — simulate fetch delay, then mark as done
            setTimeout(() => {
                setLoading(false);
                _initialLoadDone = true;
            }, 600);
        }
        // INTENTIONAL: no dependency that would trigger re-fetch when returning to this route
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "1rem" }}>
                <div className="spinner spinner-lg" />
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Loading dashboard...</p>
            </div>
        );
    }

    const displayBalance = getDisplayBalance(data.user.balance);
    const chartData = data.chartData;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Welcome back, {data.user.name} 👋</h1>
                <p className="page-subtitle">Here&apos;s your financial overview for today</p>
            </div>

            {/* Account Summary Cards */}
            <div className="grid-4 mb-3">
                <div className="stat-card" style={{ background: "linear-gradient(135deg, #1a2a4a, #0f1f36)", borderColor: "rgba(59,130,246,0.3)" }}>
                    <span className="stat-label">Current Balance</span>
                    <span className="stat-value" style={{ fontSize: "1.4rem", color: "var(--accent)" }}>
                        {formatBDT(displayBalance)}
                    </span>
                    <span className="stat-meta">{data.user.accountType} Account</span>
                </div>

                <div className="stat-card">
                    <span className="stat-label">Account Number</span>
                    <span className="stat-value" style={{ fontSize: "1rem", letterSpacing: "0.05em" }}>
                        {maskAccountNumber(data.user.accountNumber)}
                    </span>
                    <span className="stat-meta">Primary Account</span>
                </div>

                <div className="stat-card">
                    <span className="stat-label">Total Credits (30d)</span>
                    <span className="stat-value" style={{ fontSize: "1.2rem", color: "var(--success)" }}>
                        {formatBDT(data.transactions.filter(t => t.type === "Credit").reduce((s, t) => s + t.amount, 0))}
                    </span>
                    <span className="stat-meta flex-center gap-1" style={{ justifyContent: "flex-start" }}>
                        <TrendingUp size={12} color="var(--success)" /> Incoming
                    </span>
                </div>

                <div className="stat-card">
                    <span className="stat-label">Total Debits (30d)</span>
                    <span className="stat-value" style={{ fontSize: "1.2rem", color: "var(--danger)" }}>
                        {formatBDT(data.transactions.filter(t => t.type === "Debit").reduce((s, t) => s + t.amount, 0))}
                    </span>
                    <span className="stat-meta flex-center gap-1" style={{ justifyContent: "flex-start" }}>
                        <TrendingDown size={12} color="var(--danger)" /> Outgoing
                    </span>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card mb-3">
                <h3 style={{
                    margin: "0 0 1rem", fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.05em", color: "var(--text-muted)"
                }}>Quick Actions</h3>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <Link href="/transfer" className="btn btn-primary" style={{ flex: 1, padding: "0.875rem" }}>
                        <ArrowLeftRight size={16} />
                        Transfer Funds
                    </Link>
                    <Link href="/bills" className="btn btn-secondary" style={{ flex: 1, padding: "0.875rem" }}>
                        <Receipt size={16} />
                        Pay Bills
                    </Link>
                    <Link href="/transactions" className="btn btn-secondary" style={{ flex: 1, padding: "0.875rem" }}>
                        <FileText size={16} />
                        View Statement
                    </Link>
                </div>
            </div>

            {/* Chart + Recent Transactions */}
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1.25rem" }}>
                {/* Spending Chart */}
                <div className="card">
                    <div className="flex-between mb-2">
                        <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                            Transaction Overview — Last 30 Days
                        </h3>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                            {/* BUG T1-004: Y-axis label hardcoded to "Units" instead of "BDT" or "Amount (BDT)" */}
                            <YAxis
                                label={{ value: "Units", angle: -90, position: "insideLeft", fill: "var(--text-muted)", fontSize: 11 }}
                                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                            />
                            <Tooltip
                                contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}
                                formatter={(val: number) => [formatBDT(val), "Spending"]}
                            />
                            <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} fill="url(#colorAmt)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Recent Transactions */}
                <div className="card">
                    <div className="flex-between mb-2">
                        <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                            Recent Transactions
                        </h3>
                        <Link href="/transactions" style={{ fontSize: "0.75rem", color: "var(--accent)", textDecoration: "none" }}>
                            View all →
                        </Link>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
                        {data.transactions.map((tx) => (
                            <div key={tx.id} style={{
                                display: "flex", alignItems: "center", gap: "0.75rem",
                                padding: "0.625rem 0.5rem", borderRadius: 10,
                                transition: "background 0.15s",
                            }}
                                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-card-hover)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            >
                                <div style={{
                                    width: 34, height: 34, borderRadius: 10,
                                    background: tx.type === "Credit" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                                }}>
                                    {tx.type === "Credit"
                                        ? <TrendingUp size={14} color="var(--success)" />
                                        : <TrendingDown size={14} color="var(--danger)" />
                                    }
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {tx.description}
                                    </div>
                                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{tx.date}</div>
                                </div>
                                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: tx.type === "Credit" ? "var(--success)" : "var(--danger)", flexShrink: 0 }}>
                                    {tx.type === "Credit" ? "+" : "-"}{formatBDT(tx.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Account Card */}
            <div className="card mt-3" style={{
                background: "linear-gradient(135deg, #1a1f3a 0%, #0d1428 100%)",
                border: "1px solid rgba(99,102,241,0.3)",
                borderRadius: 20, padding: "1.75rem"
            }}>
                <div className="flex-between">
                    <div>
                        <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                            {data.user.accountType} Account
                        </div>
                        <div style={{ fontSize: "1rem", fontWeight: 600, letterSpacing: "0.15em", color: "var(--text-primary)", fontFamily: "monospace" }}>
                            {maskAccountNumber(data.user.accountNumber)}
                        </div>
                        <div style={{ marginTop: "1rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                            {data.user.name}
                        </div>
                    </div>
                    <div style={{ opacity: 0.4 }}>
                        <CreditCard size={48} color="var(--accent)" />
                    </div>
                </div>
            </div>
        </div>
    );
}
