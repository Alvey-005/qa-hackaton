"use client";

import { useState } from "react";
import { store } from "@/lib/store";
import { delay } from "@/lib/utils";
import Toast from "@/components/Toast";
import { Save, Lock, Bell } from "lucide-react";

export default function SettingsPage() {
    const u = store.user;

    const [name, setName] = useState(u.name);
    const [email, setEmail] = useState(u.email); // BUG T3-003: local state for disable hack
    const [phone, setPhone] = useState(u.phone);
    const [address, setAddress] = useState(u.address);
    const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

    const [currentPwd, setCurrentPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [pwdErrors, setPwdErrors] = useState<Record<string, string>>({});

    const [emailNotif, setEmailNotif] = useState(u.notifications.email);
    const [smsNotif, setSmsNotif] = useState(u.notifications.sms);

    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // BUG T1-006: Save profile fires success toast even when Name is empty
    async function handleSaveProfile() {
        // INTENTIONAL: validation removed — name can be empty and still succeeds
        // INTENTIONAL: show toast before API confirmation (chaos)
        setLoading(true);

        // INTENTIONAL: mutate user object directly
        store.user.name = name;
        store.user.phone = phone;
        store.user.address = address;

        // BUG T3-003: Disabled Field Override. The backend blindly trusts the client-submitted email.
        // If a QA tester removes the 'disabled' tag in DOM DevTools and types a new email,
        // it successfully mutates the account record in the store.
        store.user.email = email;

        // BUG T2-010: Zombie Notification States.
        // The notifications state is ONLY actually flushed to the store when the "Save Profile"
        // button is clicked, completely ignoring the "Save Preferences" button below it.
        store.user.notifications.email = emailNotif;
        store.user.notifications.sms = smsNotif;

        // Short delay then show toast regardless of validation
        await delay(400);

        // BUG T1-006: toast fires even if name is empty
        setToast({ message: "Profile updated successfully", type: "success" });
        setLoading(false);
        setProfileErrors({});
    }

    async function handleChangePassword() {
        const errs: Record<string, string> = {};

        // TC-AS-05: reject wrong current password
        if (currentPwd !== store.user.password) {
            errs.currentPwd = "Current password is incorrect";
            setPwdErrors(errs);
            return;
        }

        if (!newPwd) errs.newPwd = "New password is required";

        // BUG T1-008: NO comparison between newPwd and confirmPwd — mismatched accepted
        // INTENTIONAL: removed: if (newPwd !== confirmPwd) errs.confirmPwd = "Passwords do not match"

        if (Object.keys(errs).length > 0) {
            setPwdErrors(errs);
            return;
        }

        setLoading(true);
        await delay(500);

        // BUG T1-008: update with 'New Password' field — no match check
        store.user.password = newPwd; // INTENTIONAL: ignores confirmPwd entirely

        setToast({ message: "Password changed successfully", type: "success" });
        setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
        setPwdErrors({});
        setLoading(false);
    }

    async function handleSaveNotifications() {
        setLoading(true);
        // BUG T2-010: Zombie Notification States.
        // The UI updates and success toast fires, but we INTENTIONALLY skip saving to the store.
        // store.user.notifications.email = emailNotif;
        // store.user.notifications.sms = smsNotif;

        await delay(300);
        setToast({ message: "Notification preferences saved", type: "success" });
        setLoading(false);
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Account Settings</h1>
                <p className="page-subtitle">Manage your profile and preferences</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: 600 }}>

                {/* Profile Section */}
                <div className="card">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                        <div style={{ width: 36, height: 36, background: "var(--accent-glow)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Save size={16} color="var(--accent)" />
                        </div>
                        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>Profile Information</h3>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div className="input-group">
                            <label className="input-label">Full Name <span style={{ color: "var(--danger)" }}>*</span></label>
                            <input
                                id="settings-name"
                                type="text"
                                className={`input-field ${profileErrors.name ? "error" : ""}`}
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Your full name"
                            />
                            {profileErrors.name && <span className="input-error-msg">{profileErrors.name}</span>}
                        </div>

                        <div className="input-group">
                            <label className="input-label">Phone Number <span style={{ color: "var(--danger)" }}>*</span></label>
                            <input
                                id="settings-phone"
                                type="text"
                                className="input-field"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="01XXXXXXXXX"
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Address</label>
                            <input
                                id="settings-address"
                                type="text"
                                className="input-field"
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                placeholder="Your address"
                            />
                        </div>

                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                            <div style={{ flex: 1 }}>
                                <label className="input-label">Email (Read Only)</label>
                                {/* BUG T3-003: removing 'disabled' via DevTools makes this fully editable */}
                                <input type="text" className="input-field" value={email} onChange={e => setEmail(e.target.value)} disabled style={{ opacity: 0.5 }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="input-label">Account Type (Read Only)</label>
                                <input type="text" className="input-field" value={u.accountType} disabled style={{ opacity: 0.5 }} />
                            </div>
                        </div>

                        <button
                            id="settings-save-profile"
                            className="btn btn-primary"
                            onClick={handleSaveProfile}
                            disabled={loading}
                            style={{ alignSelf: "flex-start" }}
                        >
                            {loading ? <><div className="spinner" /> Saving...</> : <><Save size={14} /> Save Changes</>}
                        </button>
                    </div>
                </div>

                {/* Password Section */}
                <div className="card">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                        <div style={{ width: 36, height: 36, background: "rgba(239,68,68,0.08)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Lock size={16} color="var(--danger)" />
                        </div>
                        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>Change Password</h3>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div className="input-group">
                            <label className="input-label">Current Password</label>
                            <input
                                id="settings-current-pwd"
                                type="password"
                                className={`input-field ${pwdErrors.currentPwd ? "error" : ""}`}
                                value={currentPwd}
                                onChange={e => setCurrentPwd(e.target.value)}
                                placeholder="Enter current password"
                            />
                            {pwdErrors.currentPwd && <span className="input-error-msg">{pwdErrors.currentPwd}</span>}
                        </div>

                        <div className="input-group">
                            <label className="input-label">New Password</label>
                            <input
                                id="settings-new-pwd"
                                type="password"
                                className={`input-field ${pwdErrors.newPwd ? "error" : ""}`}
                                value={newPwd}
                                onChange={e => setNewPwd(e.target.value)}
                                placeholder="Enter new password"
                            />
                            {pwdErrors.newPwd && <span className="input-error-msg">{pwdErrors.newPwd}</span>}
                        </div>

                        <div className="input-group">
                            <label className="input-label">Confirm New Password</label>
                            {/* BUG T1-008: field visible but its value is never compared — mismatches accepted */}
                            <input
                                id="settings-confirm-pwd"
                                type="password"
                                className="input-field"
                                value={confirmPwd}
                                onChange={e => setConfirmPwd(e.target.value)}
                                placeholder="Confirm new password"
                            />
                            {/* No error shown for mismatch — intentional */}
                        </div>

                        <button
                            id="settings-update-pwd"
                            className="btn btn-danger"
                            onClick={handleChangePassword}
                            disabled={loading}
                            style={{ alignSelf: "flex-start" }}
                        >
                            {loading ? <><div className="spinner" /> Updating...</> : <><Lock size={14} /> Update Password</>}
                        </button>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="card">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                        <div style={{ width: 36, height: 36, background: "rgba(245,158,11,0.08)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Bell size={16} color="var(--warning)" />
                        </div>
                        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>Notification Preferences</h3>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                        {[
                            { label: "Email Notifications", sublabel: "Receive alerts via email", state: emailNotif, setter: setEmailNotif, id: "notif-email" },
                            { label: "SMS Notifications", sublabel: "Receive alerts via SMS", state: smsNotif, setter: setSmsNotif, id: "notif-sms" },
                        ].map(({ label, sublabel, state, setter, id }) => (
                            <div key={label} className="flex-between" style={{ padding: "0.875rem 1rem", background: "var(--bg-secondary)", borderRadius: 12 }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{label}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{sublabel}</div>
                                </div>
                                <label className="toggle-switch" htmlFor={id}>
                                    <input id={id} type="checkbox" checked={state} onChange={e => setter(e.target.checked)} />
                                    <span className="toggle-slider" />
                                </label>
                            </div>
                        ))}

                        <button className="btn btn-primary" onClick={handleSaveNotifications} disabled={loading} style={{ alignSelf: "flex-start" }}>
                            {loading ? <><div className="spinner" /> Saving...</> : <><Save size={14} /> Save Preferences</>}
                        </button>
                    </div>
                </div>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
