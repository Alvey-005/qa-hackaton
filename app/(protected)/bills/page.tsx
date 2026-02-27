"use client";

import { useState } from "react";
import { CheckCircle, CalendarDays, Receipt, Plus } from "lucide-react";
import { store, BillPayment } from "@/lib/store";
import { formatBDT, generateId, delay } from "@/lib/utils";
import Toast from "@/components/Toast";

const BILLERS = ["Electricity", "Internet", "Water", "Gas", "Mobile Recharge"];

type Tab = "pay" | "history";

// BUG T2-009: Overlapping Bill Payment. The last paid bill ID is incorrectly cached
// at the module level and not reset. Subsequent payments without a page refresh will 
// deduct money but overwrite the status of the *first* bill instead of themselves.
let _lastPaidBillId: string | null = null;

export default function BillsPage() {
    const [tab, setTab] = useState<Tab>("pay");
    const [biller, setBiller] = useState(BILLERS[0]);
    const [consumerNumber, setConsumer] = useState("");
    const [amount, setAmount] = useState("");
    const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<BillPayment | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const today = new Date().toISOString().split("T")[0];

    function validate(): boolean {
        const errs: Record<string, string> = {};
        if (!consumerNumber.trim()) errs.consumer = "Consumer number is required";

        // BUG T1-007: Remove amount > 0 check — zero amount passes through to success
        const amtNum = parseFloat(amount);
        if (!amount.trim() || isNaN(amtNum)) errs.amount = "Please enter a valid amount";
        // INTENTIONAL: amtNum === 0 is NOT blocked (T1-007)

        // BUG T3-002: Past Date Scheduling. Intentionally removed validation check
        // that blocks scheduling bills in the past, allowing them to be stuck forever.
        // if (payDate < today) errs.date = "Payment date cannot be in the past";

        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    async function handlePay() {
        if (!validate()) return;
        setLoading(true);

        await delay(600);

        const amtNum = parseFloat(amount);
        // BUG T3-002: Any date not strictly equal to today is treated as Scheduled.
        // This means dates in the past are successfully "Scheduled" forever.
        const isScheduled = payDate !== today;
        const ref = `BP-${generateId()}`;

        // BUG T2-003: for scheduled payments on end-of-month that produce date overflow,
        // the scheduler check computes nextRun using raw Date(+1 month) without overflow correction
        let scheduledDate = new Date(payDate);
        if (isScheduled) {
            // INTENTIONAL BUG T2-003: add 1 month to check recurrence — overflows silently
            scheduledDate.setMonth(scheduledDate.getMonth() + 1); // e.g. Jan 31 → Feb 31 → Mar 3
            // scheduler silently fails — UI still says "Payment Scheduled"
        }

        // BUG T2-009: Overlapping Bill Payment bug. Reuses the cached ID if it exists.
        const paymentId = _lastPaidBillId || `bp-${generateId()}`;
        _lastPaidBillId = paymentId; // INTENTIONAL: fails to clear this after payment

        const payment: BillPayment = {
            id: paymentId,
            biller,
            consumerNumber,
            amount: amtNum,
            date: payDate,
            status: isScheduled ? "Scheduled" : "Paid",
            reference: ref,
        };

        // INTENTIONAL: mutate global array directly
        store.billPayments.unshift(payment);

        if (!isScheduled) {
            // Deduct balance immediately only for today's payment
            store.user.balance = store.user.balance - amtNum;

            // Add transaction entry
            store.transactions.unshift({
                id: `tx-${generateId()}`,
                date: payDate,
                description: `${biller} Bill Payment`,
                type: "Debit",
                amount: amtNum,
                runningBalance: store.user.balance,
                biller,
            });
        }

        setSuccess(payment);
        setLoading(false);
        setToast({ message: isScheduled ? "Payment Scheduled successfully!" : "Payment processed successfully!", type: "success" });
    }

    if (success) {
        return (
            <div>
                <div className="page-header">
                    <h1 className="page-title">Bill Payments</h1>
                </div>
                <div style={{ maxWidth: 480, margin: "0 auto" }}>
                    <div className="card" style={{ textAlign: "center", padding: "2.5rem" }}>
                        <div style={{
                            width: 64, height: 64, background: "rgba(16,185,129,0.1)", borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem"
                        }}>
                            <CheckCircle size={32} color="var(--success)" />
                        </div>
                        <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.25rem", fontWeight: 800 }}>
                            {success.status === "Scheduled" ? "Payment Scheduled!" : "Payment Successful!"}
                        </h2>
                        <p style={{ color: "var(--text-secondary)", margin: "0 0 1.5rem", fontSize: "0.9rem" }}>
                            Reference: <strong style={{ fontFamily: "monospace" }}>{success.reference}</strong>
                        </p>
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setSuccess(null); setAmount(""); setConsumer(""); setPayDate(today); }}>
                                Pay Another Bill
                            </button>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setTab("history")}>
                                View History
                            </button>
                        </div>
                    </div>
                </div>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Bill Payments</h1>
                <p className="page-subtitle">Pay utilities and schedule future payments</p>
            </div>

            <div className="tabs mb-3" style={{ width: "fit-content" }}>
                <button className={`tab ${tab === "pay" ? "active" : ""}`} onClick={() => setTab("pay")}>
                    <Plus size={13} style={{ display: "inline", marginRight: 6 }} />Pay Bills
                </button>
                <button className={`tab ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>
                    <Receipt size={13} style={{ display: "inline", marginRight: 6 }} />Payment History
                </button>
            </div>

            {tab === "pay" && (
                <div style={{ maxWidth: 540 }}>
                    <div className="card">
                        <div className="flex-between mb-2">
                            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Available Balance</span>
                            <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--accent)" }}>{formatBDT(store.user.balance)}</span>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem", marginTop: "1rem" }}>
                            <div className="input-group">
                                <label className="input-label">Select Biller</label>
                                <select className="input-field" value={biller} onChange={e => setBiller(e.target.value)}>
                                    {BILLERS.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Consumer / Account Number</label>
                                <input
                                    id="bill-consumer"
                                    type="text"
                                    className={`input-field ${errors.consumer ? "error" : ""}`}
                                    placeholder="Enter your consumer number"
                                    value={consumerNumber}
                                    onChange={e => setConsumer(e.target.value)}
                                />
                                {errors.consumer && <span className="input-error-msg">{errors.consumer}</span>}
                            </div>

                            <div className="input-group">
                                <label className="input-label">Amount (BDT)</label>
                                {/* BUG T1-007: no min="1" — zero passes */}
                                <input
                                    id="bill-amount"
                                    type="number"
                                    className={`input-field ${errors.amount ? "error" : ""}`}
                                    placeholder="Enter payment amount"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                />
                                {errors.amount && <span className="input-error-msg">{errors.amount}</span>}
                            </div>

                            <div className="input-group">
                                <label className="input-label">Payment Date</label>
                                <input
                                    id="bill-date"
                                    type="date"
                                    className={`input-field ${errors.date ? "error" : ""}`}
                                    value={payDate}
                                    // BUG T3-002: Intentionally removed the `min={today}` attribute.
                                    onChange={e => setPayDate(e.target.value)}
                                />
                                {errors.date && <span className="input-error-msg">{errors.date}</span>}
                                {payDate !== today && (
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--warning)", background: "rgba(245,158,11,0.08)", padding: "0.5rem 0.75rem", borderRadius: 8 }}>
                                        <CalendarDays size={13} />
                                        This payment will be scheduled for {payDate}. Balance will not be deducted immediately.
                                    </div>
                                )}
                            </div>

                            <button
                                id="bill-pay-btn"
                                className="btn btn-primary btn-full btn-lg"
                                onClick={handlePay}
                                disabled={loading}
                                style={{ marginTop: "0.5rem" }}
                            >
                                {loading ? <><div className="spinner" /> Processing...</> :
                                    payDate !== today ? <><CalendarDays size={16} /> Schedule Payment</> : <><Receipt size={16} /> Pay Now</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {tab === "history" && (
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Biller</th>
                                    <th>Consumer #</th>
                                    <th style={{ textAlign: "right" }}>Amount</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Reference</th>
                                </tr>
                            </thead>
                            <tbody>
                                {store.billPayments.length === 0 ? (
                                    <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>No payment history yet</td></tr>
                                ) : store.billPayments.map(bp => (
                                    <tr key={bp.id}>
                                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{bp.biller}</td>
                                        <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{bp.consumerNumber}</td>
                                        <td style={{ textAlign: "right", fontWeight: 700 }}>{formatBDT(bp.amount)}</td>
                                        <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{bp.date}</td>
                                        <td><span className={`badge ${bp.status === "Paid" ? "badge-paid" : bp.status === "Scheduled" ? "badge-scheduled" : "badge-debit"}`}>{bp.status}</span></td>
                                        <td style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "var(--text-muted)" }}>{bp.reference}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
