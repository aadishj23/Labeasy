"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Loader2 } from "lucide-react";
import AuthShell, { Link } from "@/components/auth-shell";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

const SigninInsurance = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onChange = (e: any) =>
    setData((p) => ({ ...p, [e.target.name]: e.target.value }));

  async function submit(e: any) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/v1/auth/signininsurance", data);
      setAuth({ name: res.data.name, type: res.data.type });
      router.push("/insurancedashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Insurer sign in"
      title="Welcome back"
      subtitle="Sign in to manage your plans and leads."
      footer={
        <>
          New here?{" "}
          <Link href="/signupinsurance" className="font-medium text-primary hover:underline">
            Register your company
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={submit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" name="email" placeholder="company@example.com" value={data.email} onChange={onChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pswd">Password</Label>
          <PasswordInput id="pswd" name="password" placeholder="Enter your password" value={data.password} onChange={onChange} required />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
          {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : "Sign in as Insurer"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default SigninInsurance;
