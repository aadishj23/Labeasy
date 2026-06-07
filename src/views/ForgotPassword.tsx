"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Loader2, MailCheck, ArrowLeft, KeyRound } from "lucide-react";
import AuthShell, { Link } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { ResendCode } from "@/components/ui/resend-code";
import { isStrongPassword, PASSWORD_RULE } from "@/lib/password";

function ForgotPassword() {
  const [step, setStep] = useState("email"); // "email" | "reset"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();

  async function sendOtp() {
    await axios.post("/api/v1/auth/send-otp", { email, purpose: "reset" });
  }

  async function handleEmailSubmit(event) {
    event.preventDefault();
    setErr("");
    setIsLoading(true);
    try {
      await sendOtp();
      setStep("reset");
    } catch (error) {
      setErr(error?.response?.data?.message || "Could not send verification code.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResetSubmit(event) {
    event.preventDefault();
    if (!isStrongPassword(newPassword)) {
      setErr(PASSWORD_RULE);
      return;
    }
    if (newPassword !== confirm) {
      setErr("Passwords don't match");
      return;
    }
    setErr("");
    setIsLoading(true);
    try {
      await axios.post("/api/v1/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      router.push("/signinuser");
    } catch (error) {
      setErr(error?.response?.data?.message || "Could not reset password.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    setErr("");
    try {
      await sendOtp();
    } catch (error) {
      setErr(error?.response?.data?.message || "Could not resend code.");
    }
  }

  if (step === "reset") {
    return (
      <AuthShell
        eyebrow="Reset password"
        title="Set a new password"
        subtitle={`Enter the code sent to ${email} and your new password.`}
      >
        <form className="space-y-4" onSubmit={handleResetSubmit}>
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
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="h-12 text-center text-2xl tracking-[0.5em]"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <PasswordInput
              id="newPassword"
              placeholder="Min 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">{PASSWORD_RULE}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm new password</Label>
            <PasswordInput
              id="confirm"
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset password"
            )}
          </Button>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => setStep("email")}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <ResendCode onResend={handleResend} />
          </div>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Forgot password"
      title="Reset your password"
      subtitle="Enter your email and we'll send you a verification code."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/signinuser" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleEmailSubmit}>
        <div className="flex justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <KeyRound className="h-6 w-6" />
          </span>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending code...
            </>
          ) : (
            "Send code"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}

export default ForgotPassword;
