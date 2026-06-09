"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import AuthShell, { Link } from "@/components/auth-shell";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

const SignUpInsurance = () => {
  const [data, setData] = useState({ name: "", email: "", password: "", description: "" });
  const [license, setLicense] = useState<File | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onChange = (e: any) =>
    setData((p) => ({ ...p, [e.target.name]: e.target.value }));

  async function sendCode() {
    if (!license) return setError("Please upload your license.");
    if (Object.values(data).some((v) => !String(v).trim()))
      return setError("Please fill all fields.");
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, purpose: "signup", type: "insurance" }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.message || "Could not send code.");
        return;
      }
      setOtpSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function submit(e: any) {
    e.preventDefault();
    if (!otpSent) return sendCode();
    if (!license) return setError("Please upload your license.");
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, v));
      fd.append("license", license);
      fd.append("otp", otp);
      const res = await fetch("/api/v1/auth/signupinsurance", { method: "POST", body: fd });
      const d = await res.json();
      if (!res.ok) {
        setError(d.message || "Could not create account.");
        return;
      }
      setAuth({ name: d.name, type: d.type });
      router.push("/insurancedashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const field =
    "h-10 w-full rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <AuthShell
      eyebrow="Insurer registration"
      title="Join as an insurer"
      subtitle="List your plans and reach patients once approved."
      footer={
        <>
          Already registered?{" "}
          <Link href="/signininsurance" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-3" onSubmit={submit}>
        <Input name="name" placeholder="Company name *" value={data.name} onChange={onChange} required />
        <Input type="email" name="email" placeholder="Email *" value={data.email} onChange={onChange} required />
        <PasswordInput name="password" placeholder="Password *" value={data.password} onChange={onChange} required />
        <textarea name="description" placeholder="About your company *" value={data.description} onChange={onChange} required className={`${field} min-h-[80px] py-2`} />
        <div className="space-y-1.5">
          <Label htmlFor="lic">License * (PDF/JPG/PNG)</Label>
          <input id="lic" type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setLicense(e.target.files?.[0] ?? null)} required className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary/15 file:px-3 file:py-1.5 file:text-sm file:text-primary" />
        </div>
        {otpSent && (
          <div className="space-y-1.5">
            <Label htmlFor="otp">Verification code (sent to {data.email})</Label>
            <Input id="otp" inputMode="numeric" placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} required />
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> {otpSent ? "Creating..." : "Sending code..."}</>
          ) : otpSent ? (
            "Verify & register"
          ) : (
            "Send verification code"
          )}
        </Button>
        {otpSent && (
          <button type="button" onClick={sendCode} className="w-full text-xs text-muted-foreground hover:text-foreground">
            Resend code
          </button>
        )}
      </form>
    </AuthShell>
  );
};

export default SignUpInsurance;
