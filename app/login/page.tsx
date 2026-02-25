"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TrendingUp, Eye, EyeOff, Loader2 } from "lucide-react";
import { store } from "@/lib/store";
import { randomDelay } from "@/lib/utils";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
    const [loading, setLoading] = useState(false);
    const submitRef = useRef(false); // INTENTIONAL: not blocking double-click properly

    async function handleLogin() {
        const newErrors: typeof errors = {};

        // TC-AUTH-03: inline validation for empty fields
        if (!email.trim()) newErrors.email = "Email is required";
        if (!password.trim()) newErrors.password = "Password is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        // INTENTIONAL: 400–900ms async delay, no debounce = double-click causes duplicate calls
        await randomDelay(400, 900);

        // TC-AUTH-01/02: validate credentials
        if (email === store.user.email && password === store.user.password) {
            store.isLoggedIn = true;
            localStorage.setItem("fintrack_session", JSON.stringify({ email, name: store.user.name }));
            router.push("/dashboard");
        } else {
            // TC-AUTH-02: generic error, clear password field
            setPassword("");
            setErrors({ general: "Invalid email or password" });
            setLoading(false);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter") handleLogin();
    }

    return (
        <div className="login-page">
            <div className="login-bg-glow" />

            <div className="login-card">
                {/* Logo */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2rem", gap: "0.75rem" }}>
                    <div className="sidebar-logo-icon" style={{ width: 52, height: 52, borderRadius: 16 }}>
                        <TrendingUp size={26} color="white" />
                    </div>
                    <div>
                        <h1 style={{
                            fontSize: "1.6rem", fontWeight: 800, margin: 0, textAlign: "center",
                            background: "linear-gradient(90deg, #fff, var(--accent))",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
                        }}>
                            FinTrack
                        </h1>
                        <p style={{ margin: "0.25rem 0 0", textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                            Digital Banking Platform
                        </p>
                    </div>
                </div>

                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 1.5rem", color: "var(--text-primary)" }}>
                    Welcome back
                </h2>

                {/* General error */}
                {errors.general && (
                    <div style={{
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        borderRadius: 10,
                        padding: "0.75rem 1rem",
                        marginBottom: "1rem",
                        fontSize: "0.875rem",
                        color: "var(--danger)"
                    }}>
                        {errors.general}
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {/* Email */}
                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <input
                            id="login-email"
                            type="email"
                            className={`input-field ${errors.email ? "error" : ""}`}
                            placeholder="user@fintrack.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoComplete="email"
                        />
                        {errors.email && <span className="input-error-msg">{errors.email}</span>}
                    </div>

                    {/* Password */}
                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <div style={{ position: "relative" }}>
                            <input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                className={`input-field ${errors.password ? "error" : ""}`}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoComplete="current-password"
                                style={{ paddingRight: "2.75rem" }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)",
                                    background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)"
                                }}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password && <span className="input-error-msg">{errors.password}</span>}
                    </div>

                    {/* Forgot Password — BUG T1-001: navigates to non-existent /password-reset (404) */}
                    <div style={{ textAlign: "right" }}>
                        <Link
                            href="/password-reset"
                            style={{ fontSize: "0.8rem", color: "var(--accent)", textDecoration: "none" }}
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Login Button — INTENTIONAL: no debounce, double-click allowed */}
                    <button
                        id="login-btn"
                        className="btn btn-primary btn-full btn-lg"
                        onClick={handleLogin}
                        style={{ marginTop: "0.5rem" }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="spinner" style={{ animation: "spin 0.7s linear infinite" }} />
                                Authenticating...
                            </>
                        ) : (
                            "Login"
                        )}
                    </button>
                </div>

                <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <p style={{ margin: 0 }}>
                        Demo credentials: <span style={{ color: "var(--text-secondary)" }}>user@fintrack.com / Pass1234</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
