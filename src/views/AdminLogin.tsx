"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, MailCheck, ArrowLeft } from "lucide-react";
import { setAdminToken } from "@/lib/admin-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { ResendCode } from "@/components/ui/resend-code";
import { isStrongPassword, PASSWORD_RULE } from "@/lib/password";

type Mode = "login" | "request" | "reset";

export default function AdminLogin() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.message || "Invalid credentials.");
        return;
      }
      setAdminToken(data.token);
      router.replace("/admin");
    } catch {
      setErr("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function sendResetCode() {
    const res = await fetch("/api/v1/admin/forgot-password", { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Could not send code.");
  }

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setInfo("");
    setIsLoading(true);
    try {
      await sendResetCode();
      setInfo("A reset code was sent to the admin email.");
      setMode("reset");
    } catch (e2: any) {
      setErr(e2.message || "Could not send code.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!isStrongPassword(newPassword)) {
      setErr(PASSWORD_RULE);
      return;
    }
    if (newPassword !== confirm) {
      setErr("Passwords don't match.");
      return;
    }
    setErr("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.message || "Could not reset password.");
        return;
      }
      setInfo("Password reset. You can sign in now.");
      setMode("login");
      setPassword("");
    } catch {
      setErr("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 spotlight">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-2xl font-bold">Admin console</h1>
          <p className="text-sm text-muted-foreground">Restricted access</p>
        </div>

        <div className="glass rounded-2xl p-6 shadow-glow-sm sm:p-8">
          {info && (
            <p className="mb-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
              {info}
            </p>
          )}

          {mode === "login" && (
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setErr("");
                      setInfo("");
                      setMode("request");
                    }}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              {err && <p className="text-sm text-destructive">{err}</p>}
              <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
              </Button>
            </form>
          )}

          {mode === "request" && (
            <form className="space-y-4" onSubmit={handleRequest}>
              <p className="text-sm text-muted-foreground">
                We&apos;ll email a verification code to the registered admin
                address.
              </p>
              {err && <p className="text-sm text-destructive">{err}</p>}
              <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Email me a code"
                )}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setErr("");
                  setMode("login");
                }}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
              </button>
            </form>
          )}

          {mode === "reset" && (
            <form className="space-y-4" onSubmit={handleReset}>
              <div className="flex justify-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <MailCheck className="h-6 w-6" />
                </span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">Verification code</Label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="h-12 text-center text-2xl tracking-[0.5em]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <PasswordInput
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm new password</Label>
                <PasswordInput
                  id="confirm"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">{PASSWORD_RULE}</p>
              {err && <p className="text-sm text-destructive">{err}</p>}
              <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset password"}
              </Button>
              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setErr("");
                    setMode("login");
                  }}
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
                <ResendCode
                  onResend={async () => {
                    setErr("");
                    try {
                      await sendResetCode();
                    } catch (e2: any) {
                      setErr(e2.message || "Could not resend code.");
                    }
                  }}
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
