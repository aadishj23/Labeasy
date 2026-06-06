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

const SigninLab = () => {
  const [signInData, setSignInData] = useState({ Email: "", Password: "" });
  const setLoggedIn = useAuthStore((s) => s.setLoggedIn);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function handleChangeSignIn(event) {
    const { name, value } = event.target;
    setSignInData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmitSignIn(event) {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios({
        url: `/api/v1/auth/signinlab`,
        method: "POST",
        data: JSON.stringify({
          email: signInData.Email,
          password: signInData.Password,
        }),
        headers: { "Content-Type": "application/json" },
      });
      localStorage.setItem("token", JSON.stringify(response.data.token));
      localStorage.setItem("type", JSON.stringify(response.data.type));
      localStorage.setItem("lab_name", JSON.stringify(response.data.labName));
      setLoggedIn(true);
      router.push("/labsdashboard");
    } catch (err) {
      console.error(err);
      setError("Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Lab sign in"
      title="Welcome back"
      subtitle="Sign in to manage your tests and pricing."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signuplab" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmitSignIn}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            name="Email"
            placeholder="lab@example.com"
            value={signInData.Email}
            onChange={handleChangeSignIn}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="pswd">Password</Label>
            <Link
              href="/forgot-password?type=lab"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="pswd"
            name="Password"
            placeholder="Enter your password"
            value={signInData.Password}
            onChange={handleChangeSignIn}
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          type="submit"
          variant="gradient"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in as Lab"
          )}
        </Button>
      </form>
    </AuthShell>
  );
};

export default SigninLab;
