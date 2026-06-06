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

const SigninPatient = () => {
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
        url: `/api/v1/auth/signinuser`,
        method: "POST",
        data: JSON.stringify({
          email: signInData.Email,
          password: signInData.Password,
        }),
        headers: { "Content-Type": "application/json" },
      });
      localStorage.setItem("token", JSON.stringify(response.data.token));
      localStorage.setItem("name", JSON.stringify(response.data.name));
      localStorage.setItem("type", JSON.stringify(response.data.type));
      setLoggedIn(true);
      router.push("/");
    } catch (err) {
      console.error(err);
      setError("Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Patient sign in"
      title="Welcome back"
      subtitle="Sign in to book tests and view your reports."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signupuser" className="font-medium text-primary hover:underline">
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
            placeholder="you@example.com"
            value={signInData.Email}
            onChange={handleChangeSignIn}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="pswd">Password</Label>
            <Link
              href="/forgot-password?type=user"
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
            "Sign in as Patient"
          )}
        </Button>
      </form>
    </AuthShell>
  );
};

export default SigninPatient;
