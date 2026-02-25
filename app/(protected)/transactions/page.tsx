"use client";

import { useState, useMemo } from "react";
import { Download, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { store, Transaction } from "@/lib/store";
import { formatBDT } from "@/lib/utils";

const BILLERS = ["All", "Electricity", "Internet", "Water", "Gas", "Mobile Recharge"];
const PAGE_SIZE = 10;

export default function TransactionsPage() {
    const [typeFilter, setTypeFilter] = useState<"All" | "Credit" | "Debit">("All");
    const [billerFilter, setBillerFilter] = useState("All");
    const [dateRange, setDateRange] = useState("All");
    const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
    const [page, setPage] = useState(1);

    // BUG T2-002: Combined date + biller filter breaks sort — uses pre-filter index
    const filtered = useMemo(() => {
        // Step 1: filter by type
        let result = store.transactions.filter((tx) => {
            if (typeFilter !== "All" && tx.type !== typeFilter) return false;
            return true;
        });

        // Step 2: filter by date range
        let dateFiltered = result;
        if (dateRange !== "All") {
            const days = parseInt(dateRange);
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - days);
            dateFiltered = result.filter(tx => new Date(tx.date) >= cutoff);
        }

        // Step 3: filter by biller
        let billerFiltered = result; // INTENTIONAL BUG T2-002: uses original `result` not `dateFiltered`
        if (billerFilter !== "All") {
            billerFiltered = result.filter(tx => tx.biller === billerFilter); // INTENTIONAL: not chained from dateFiltered
        }

        // Step 4: merge — when BOTH active, billerFiltered loses date context
        let combined: Transaction[];
        if (billerFilter !== "All" && dateRange !== "All") {
            // BUG T2-002: sort comparator applied against wrong pre-filter reference
            combined = billerFiltered; // date filter effectively ignored when biller also active
        } else if (billerFilter !== "All") {
            combined = billerFiltered;
        } else {
            combined = dateFiltered;
        }

        // Step 5: sort — INTENTIONAL: in-place sort on the same array ref
        combined.sort((a, b) => {
            const da = new Date(a.date).getTime();
            const db = new Date(b.date).getTime();
            return sortDir === "desc" ? db - da : da - db;
        });

        return combined;
    }, [typeFilter, billerFilter, dateRange, sortDir]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    function exportPDF() {
        const { jsPDF } = require("jspdf"); // eslint-disable-line @typescript-eslint/no-require-imports
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text("FinTrack Transaction Statement", 14, 20);

        doc.setFontSize(10);
        doc.text("Date", 14, 30);
        doc.text("Description", 45, 30);
        doc.text("Amount (BDT)", 150, 30);

        // BUG T2-005: slice(0, pageData.length - 1) intentionally drops the final row from the PDF
        const dataToExport = pageData.slice(0, pageData.length - 1);

        let yPos = 40;
        dataToExport.forEach((tx) => {
            doc.text(tx.date, 14, yPos);
            doc.text(tx.description, 45, yPos);

            const sign = tx.type === "Credit" ? "+" : "-";
            doc.text(`${sign}${tx.amount.toFixed(2)}`, 150, yPos);

            yPos += 10;
        });

        doc.save("FinTrack_Statement.pdf");
    }

    return (
        <div>
            <div className="page-header flex-between">
                <div>
                    <h1 className="page-title">Transaction History</h1>
                    <p className="page-subtitle">{filtered.length} transactions found</p>
                </div>
                <button className="btn btn-secondary" onClick={exportPDF}>
                    <Download size={15} />
                    Export as PDF
                </button>
            </div>

            {/* Filters */}
            <div className="card mb-3">
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div className="input-group" style={{ flex: "1", minWidth: 120 }}>
                        <label className="input-label"><Filter size={10} style={{ display: "inline", marginRight: 4 }} />Type</label>
                        <select className="input-field" value={typeFilter} onChange={e => { setTypeFilter(e.target.value as "All" | "Credit" | "Debit"); setPage(1); }}>
                            <option value="All">All</option>
                            <option value="Credit">Credit</option>
                            <option value="Debit">Debit</option>
                        </select>
                    </div>

                    <div className="input-group" style={{ flex: "1", minWidth: 140 }}>
                        <label className="input-label">Date Range</label>
                        <select className="input-field" value={dateRange} onChange={e => { setDateRange(e.target.value); setPage(1); }}>
                            <option value="All">All Time</option>
                            <option value="30">Last 30 Days</option>
                            <option value="60">Last 60 Days</option>
                            <option value="90">Last 90 Days</option>
                        </select>
                    </div>

                    <div className="input-group" style={{ flex: "1", minWidth: 140 }}>
                        <label className="input-label">Biller</label>
                        <select className="input-field" value={billerFilter} onChange={e => { setBillerFilter(e.target.value); setPage(1); }}>
                            {BILLERS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>

                    <div className="input-group" style={{ flex: "1", minWidth: 120 }}>
                        <label className="input-label">Sort by Date</label>
                        <select className="input-field" value={sortDir} onChange={e => { setSortDir(e.target.value as "asc" | "desc"); setPage(1); }}>
                            <option value="desc">Newest First</option>
                            <option value="asc">Oldest First</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Type</th>
                                <th style={{ textAlign: "right" }}>Amount</th>
                                <th style={{ textAlign: "right" }}>Running Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageData.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>No transactions found</td></tr>
                            ) : pageData.map((tx) => (
                                <tr key={tx.id}>
                                    <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{tx.date}</td>
                                    <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{tx.description}</td>
                                    <td>
                                        <span className={`badge ${tx.type === "Credit" ? "badge-credit" : "badge-debit"}`}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: "right", fontWeight: 700, color: tx.type === "Credit" ? "var(--success)" : "var(--danger)" }}>
                                        {tx.type === "Credit" ? "+" : "-"}{formatBDT(tx.amount)}
                                    </td>
                                    <td style={{ textAlign: "right", color: "var(--text-secondary)" }}>
                                        {formatBDT(tx.runningBalance)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ padding: "1rem", borderTop: "1px solid var(--border)" }}>
                        <div className="pagination">
                            <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                                <ChevronLeft size={15} />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button key={p} className={`page-btn ${p === page ? "active" : ""}`} onClick={() => setPage(p)}>
                                    {p}
                                </button>
                            ))}
                            <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                                <ChevronRight size={15} />
                            </button>
                        </div>
                        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                            Page {page} of {totalPages} — {filtered.length} total transactions
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
