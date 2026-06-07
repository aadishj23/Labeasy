"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Loader2, MailCheck, ArrowLeft } from "lucide-react";
import AuthShell, { Link } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { ResendCode } from "@/components/ui/resend-code";
import { isStrongPassword, PASSWORD_RULE } from "@/lib/password";

function SignupPatient() {
  const [signUpData, setSignUpData] = useState({
    Name: "",
    Email: "",
    Phone: "",
    Password: "",
    ConfirmPassword: "",
  });
  const [step, setStep] = useState("details"); // "details" | "otp"
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();

  function handleChange(event) {
    const { name, value } = event.target;
    setSignUpData((prev) => ({ ...prev, [name]: value }));
  }

  async function sendOtp() {
    await axios.post("/api/v1/auth/send-otp", {
      email: signUpData.Email,
      phone: signUpData.Phone,
      purpose: "signup",
      type: "user",
    });
  }

  async function handleDetailsSubmit(event) {
    event.preventDefault();
    if (!isStrongPassword(signUpData.Password)) {
      setErr(PASSWORD_RULE);
      return;
    }
    if (signUpData.Password !== signUpData.ConfirmPassword) {
      setErr("Password and Confirm Password don't match");
      return;
    }
    setErr("");
    setIsLoading(true);
    try {
      await sendOtp();
      setStep("otp");
    } catch (error) {
      setErr(error?.response?.data?.message || "Could not send verification code.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifySubmit(event) {
    event.preventDefault();
    setErr("");
    setIsLoading(true);
    try {
      await axios({
        url: `/api/v1/auth/signupuser`,
        method: "POST",
        data: JSON.stringify({
          name: signUpData.Name,
          email: signUpData.Email,
          phone: signUpData.Phone,
          password: signUpData.Password,
          otp,
        }),
        headers: { "Content-Type": "application/json" },
      });
      router.push("/signinuser");
    } catch (error) {
      setErr(error?.response?.data?.message || "Invalid or expired code.");
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

  if (step === "otp") {
    return (
      <AuthShell
        eyebrow="Verify email"
        title="Enter the code"
        subtitle={`We sent a 6-digit code to ${signUpData.Email}.`}
      >
        <form className="space-y-4" onSubmit={handleVerifySubmit}>
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
          {err && <p className="text-sm text-destructive">{err}</p>}
          <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Verify & create account"
            )}
          </Button>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => setStep("details")}
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
      eyebrow="Patient sign up"
      title="Create your account"
      subtitle="Book tests and track your health in one place."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/signinuser" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleDetailsSubmit}>
        <div className="space-y-2">
          <Label htmlFor="Name">Full name</Label>
          <Input id="Name" name="Name" placeholder="John Doe" value={signUpData.Name} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="Email">Email</Label>
          <Input id="Email" type="email" name="Email" placeholder="you@example.com" value={signUpData.Email} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="Phone">Phone</Label>
          <Input id="Phone" type="tel" name="Phone" placeholder="10-digit number" value={signUpData.Phone} onChange={handleChange} required />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="Password">Password</Label>
            <PasswordInput id="Password" name="Password" placeholder="Min 8 characters" value={signUpData.Password} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ConfirmPassword">Confirm</Label>
            <PasswordInput id="ConfirmPassword" name="ConfirmPassword" placeholder="Re-enter password" value={signUpData.ConfirmPassword} onChange={handleChange} required />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{PASSWORD_RULE}</p>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending code...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}

export default SignupPatient;
