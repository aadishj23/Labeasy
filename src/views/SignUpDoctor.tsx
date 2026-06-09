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
import { SPECIALTIES } from "@/lib/doctor-suggestions";

const EMPTY = {
  name: "", email: "", password: "", specialty: "", pincode: "",
  city: "", clinic: "", phone: "", fee: "", description: "",
};

const SignUpDoctor = () => {
  const [data, setData] = useState({ ...EMPTY });
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
    if (!license) return setError("Please upload your medical license.");
    if (Object.values(data).some((v) => !String(v).trim()))
      return setError("Please fill all fields.");
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, purpose: "signup", type: "doctor" }),
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
    if (!license) return setError("Please upload your medical license.");
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, v));
      fd.append("license", license);
      fd.append("otp", otp);
      const res = await fetch("/api/v1/auth/signupdoctor", { method: "POST", body: fd });
      const d = await res.json();
      if (!res.ok) {
        setError(d.message || "Could not create account.");
        return;
      }
      setAuth({ name: d.name, type: d.type });
      router.push("/doctordashboard");
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
      eyebrow="Doctor registration"
      title="Join as a doctor"
      subtitle="Get listed and accept consultations once approved."
      footer={
        <>
          Already registered?{" "}
          <Link href="/signindoctor" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-3" onSubmit={submit}>
        <div className="grid grid-cols-2 gap-3">
          <Input name="name" placeholder="Full name *" value={data.name} onChange={onChange} required />
          <Input name="phone" placeholder="Phone *" value={data.phone} onChange={onChange} required />
        </div>
        <Input type="email" name="email" placeholder="Email *" value={data.email} onChange={onChange} required />
        <PasswordInput name="password" placeholder="Password *" value={data.password} onChange={onChange} required />
        <select name="specialty" value={data.specialty} onChange={onChange} required className={field}>
          <option value="">Specialty *</option>
          {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <Input name="city" placeholder="City *" value={data.city} onChange={onChange} required />
          <Input name="pincode" inputMode="numeric" maxLength={6} placeholder="Pincode *" value={data.pincode} onChange={(e: any) => setData((p) => ({ ...p, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input name="clinic" placeholder="Clinic / hospital *" value={data.clinic} onChange={onChange} required />
          <Input name="fee" type="number" min={0} placeholder="Consult fee ₹ *" value={data.fee} onChange={onChange} required />
        </div>
        <textarea name="description" placeholder="Short description *" value={data.description} onChange={onChange} required className={`${field} min-h-[64px] py-2`} />
        <div className="space-y-1.5">
          <Label htmlFor="lic">Medical license * (PDF/JPG/PNG)</Label>
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

export default SignUpDoctor;
