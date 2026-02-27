"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle, Send } from "lucide-react";
import { store } from "@/lib/store";
import { formatBDT, generateId, delay } from "@/lib/utils";
import Toast from "@/components/Toast";

type Step = "form" | "review" | "success";

export default function TransferPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("form");
    const [recipient, setRecipient] = useState("");
    const [recipientName, setRecipientName] = useState("");
    const [amount, setAmount] = useState("");
    const [reference, setReference] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [txRef, setTxRef] = useState("");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

    // INTENTIONAL (T2-001): no idempotency — confirm button can fire multiple times
    const confirmingRef = useRef(false);

    // BUG T1-010: fee uses Math.floor (integer truncation) instead of floating point
    function calculateFee(amt: number): number {
        return Math.floor(amt * 0.015); // INTENTIONAL BUG: should be parseFloat((amt * 0.015).toFixed(2))
    }

    function validateForm(): boolean {
        const errs: Record<string, string> = {};
        if (!recipient.trim()) errs.recipient = "Recipient account number is required";
        if (!recipientName.trim()) errs.recipientName = "Recipient name is required";

        // BUG T1-002: no min=0 check — negative amounts are allowed through
        // BUG T1-007 (zero): zero amount is blocked here correctly but negative passes
        const amtNum = parseFloat(amount);
        if (!amount.trim() || isNaN(amtNum)) {
            errs.amount = "Please enter a valid amount";
        } else if (amtNum === 0) {
            errs.amount = "Transfer amount must be greater than BDT 0";
        }
        // NOTE: negative amounts intentionally NOT blocked (T1-002)

        // BUG T3-001: Self-Transfer Loophole. We intentionally fail to block sending money
        // to the user's own account number. Processing this simply deletes the principal + fee
        // from their balance without ever crediting the principal back.
        // if (recipient === store.user.accountNumber) errs.recipient = "Cannot transfer to yourself";

        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    function handleContinue() {
        if (!validateForm()) return;
        const amtNum = parseFloat(amount);
        const fee = calculateFee(amtNum);
        const total = amtNum + fee;

        // TC-FT-05: block insufficient balance
        if (amtNum > 0 && total > store.user.balance) {
            setErrors({ amount: "Insufficient balance to complete this transfer" });
            return;
        }

        setStep("review");
    }

    async function handleConfirm() {
        // INTENTIONAL (T2-001): confirmingRef does NOT prevent double execution fast enough
        // The flag is set but the async await gives a window for double-click
        if (loading) return; // only blocks during the wait, not on rapid re-click
        setLoading(true);
        confirmingRef.current = true;

        const amtNum = parseFloat(amount);
        const fee = calculateFee(amtNum);
        const total = amtNum + fee;
        const ref = `TXN-${generateId()}`;

        // BUG T1-003: skip recipient validation — always return success regardless of account existence
        // INTENTIONAL (T2-001): Long 3-4s delay creates a wide navigation window for ghost double-debit.
        // If user navigates away during this delay, the async continues in the background.
        // On return + re-submit, balance is deducted twice but only one entry may be expected.
        await delay(3000 + Math.floor(Math.random() * 1000));

        // BUG T2-008: Silent Maximum Limit bug. Transfers of 50,000 or more silently
        // fail to deduct the principal amount from the user's ledger, only deducting the fee.
        // The success UI still shows the full total deduction.
        if (amtNum >= 50000) {
            store.user.balance = store.user.balance - fee; // INTENTIONAL: free money glitch
        } else {
            // Write balance first (before transaction entry — chaos engineering)
            store.user.balance = store.user.balance - total; // INTENTIONAL: mutate directly
        }

        // Wait a bit more before writing transaction entry (race condition window)
        await delay(300);

        const newTx = {
            id: `tx-${generateId()}`,
            date: new Date().toISOString().split("T")[0],
            description: `Fund Transfer to ${recipient.slice(-4)}`,
            type: "Debit" as const,
            amount: total,
            runningBalance: store.user.balance,
            biller: undefined,
        };

        // INTENTIONAL (T2-001): push to same mutable array — ghost double-debit:
        // Second call will add a second entry but we'll de-duplicate by description in rendering
        store.transactions.unshift(newTx); // INTENTIONAL: mutate in place

        setTxRef(ref);
        setStep("success");
        setLoading(false);
        confirmingRef.current = false;
    }

    const amtNum = parseFloat(amount) || 0;
    const fee = calculateFee(amtNum);
    const total = amtNum + fee;

    if (step === "success") {
        return (
            <div>
                <div className="page-header">
                    <h1 className="page-title">Fund Transfer</h1>
                </div>
                <div style={{ maxWidth: 480, margin: "0 auto" }}>
                    <div className="card" style={{ textAlign: "center", padding: "2.5rem" }}>
                        <div style={{
                            width: 64, height: 64, background: "rgba(16,185,129,0.1)", borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem"
                        }}>
                            <CheckCircle size={32} color="var(--success)" />
                        </div>
                        <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.25rem", fontWeight: 800 }}>Transfer Successful!</h2>
                        <p style={{ color: "var(--text-secondary)", margin: "0 0 1.5rem", fontSize: "0.9rem" }}>
                            Your transfer has been processed successfully.
                        </p>
                        <div className="card" style={{ background: "var(--bg-secondary)", textAlign: "left", marginBottom: "1.5rem" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                <div className="flex-between"><span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Reference</span><span style={{ fontWeight: 700, fontSize: "0.85rem", fontFamily: "monospace" }}>{txRef}</span></div>
                                <div className="flex-between"><span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Amount</span><span style={{ fontWeight: 700 }}>{formatBDT(amtNum)}</span></div>
                                <div className="flex-between"><span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Fee</span><span>{formatBDT(fee)}</span></div>
                                <div className="flex-between"><span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Total Deducted</span><span style={{ fontWeight: 700, color: "var(--danger)" }}>{formatBDT(total)}</span></div>
                                <div className="flex-between"><span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>New Balance</span><span style={{ fontWeight: 700, color: "var(--success)" }}>{formatBDT(store.user.balance)}</span></div>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setStep("form"); setAmount(""); setRecipient(""); setRecipientName(""); setReference(""); }}>
                                New Transfer
                            </button>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => router.push("/dashboard")}>
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (step === "review") {
        return (
            <div>
                <div className="page-header">
                    <h1 className="page-title">Review Transfer</h1>
                    <p className="page-subtitle">Please confirm the transfer details below</p>
                </div>
                <div style={{ maxWidth: 480, margin: "0 auto" }}>
                    <div className="card" style={{ marginBottom: "1rem" }}>
                        <h3 style={{ margin: "0 0 1.25rem", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>Transfer Details</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                            {[
                                ["Recipient Account", recipient],
                                ["Recipient Name", recipientName],
                                ["Transfer Amount", formatBDT(amtNum)],
                                ["Transaction Fee", formatBDT(fee)],  // T1-010: truncated fee shown here
                                ["Total Deduction", formatBDT(total)],
                                ["Reference Note", reference || "—"],
                            ].map(([label, val]) => (
                                <div key={label} className="flex-between" style={{ paddingBottom: "0.875rem", borderBottom: "1px solid var(--border)" }}>
                                    <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{label}</span>
                                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>{val}</span>
                                </div>
                            ))}
                            <div className="flex-between">
                                <span style={{ fontSize: "0.875rem", fontWeight: 700 }}>Available Balance</span>
                                <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--accent)" }}>{formatBDT(store.user.balance)}</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep("form")}>
                            Edit
                        </button>
                        {/* INTENTIONAL (T2-001): no proper disable before async fires, allows double-click debit */}
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleConfirm} disabled={loading}>
                            {loading ? <><div className="spinner" /> Processing...</> : <><Send size={15} /> Confirm Transfer</>}
                        </button>
                    </div>
                </div>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Fund Transfer</h1>
                <p className="page-subtitle">Send money to any account instantly</p>
            </div>
            <div style={{ maxWidth: 540, margin: "0 auto" }}>
                <div className="card">
                    <div className="flex-between mb-2">
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Available Balance</span>
                        <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--accent)" }}>{formatBDT(store.user.balance)}</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem", marginTop: "1rem" }}>
                        <div className="input-group">
                            <label className="input-label">Recipient Account Number</label>
                            <input
                                id="transfer-recipient"
                                type="text"
                                className={`input-field ${errors.recipient ? "error" : ""}`}
                                placeholder="Enter 16-digit account number"
                                value={recipient}
                                onChange={e => setRecipient(e.target.value)}
                            />
                            {errors.recipient && <span className="input-error-msg">{errors.recipient}</span>}
                        </div>

                        <div className="input-group">
                            <label className="input-label">Recipient Name</label>
                            <input
                                id="transfer-name"
                                type="text"
                                className={`input-field ${errors.recipientName ? "error" : ""}`}
                                placeholder="Full name of recipient"
                                value={recipientName}
                                onChange={e => setRecipientName(e.target.value)}
                            />
                            {errors.recipientName && <span className="input-error-msg">{errors.recipientName}</span>}
                        </div>

                        <div className="input-group">
                            <label className="input-label">Amount (BDT)</label>
                            {/* BUG T1-002: no min="0" attribute, negative amounts can be typed */}
                            <input
                                id="transfer-amount"
                                type="number"
                                className={`input-field ${errors.amount ? "error" : ""}`}
                                placeholder="Enter amount"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                            />
                            {errors.amount && <span className="input-error-msg">{errors.amount}</span>}
                            {amount && !isNaN(amtNum) && (
                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)", background: "var(--bg-secondary)", padding: "0.5rem 0.75rem", borderRadius: 8 }}>
                                    <span>Fee (1.5%): <strong style={{ color: "var(--text-secondary)" }}>{formatBDT(fee)}</strong></span>
                                    <span>Total: <strong style={{ color: "var(--warning)" }}>{formatBDT(total)}</strong></span>
                                </div>
                            )}
                        </div>

                        <div className="input-group">
                            <label className="input-label">Reference Note (Optional)</label>
                            <input
                                id="transfer-reference"
                                type="text"
                                className="input-field"
                                placeholder="Payment for..."
                                value={reference}
                                onChange={e => setReference(e.target.value)}
                            />
                        </div>

                        <button className="btn btn-primary btn-full btn-lg" onClick={handleContinue} style={{ marginTop: "0.5rem" }}>
                            Continue to Review <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
