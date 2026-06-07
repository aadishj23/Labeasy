"use client";

import { useState } from "react";
import axios from "axios";
import { Loader2, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { isStrongPassword, PASSWORD_RULE } from "@/lib/password";

export default function ChangePasswordDialog({ open, onOpenChange }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const reset = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirm("");
    setErr("");
    setDone(false);
  };

  const handleOpenChange = (next) => {
    if (!next) reset();
    onOpenChange(next);
  };

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isStrongPassword(newPassword)) {
      setErr(PASSWORD_RULE);
      return;
    }
    if (newPassword !== confirm) {
      setErr("New passwords don't match");
      return;
    }
    setErr("");
    setIsLoading(true);
    try {
      await axios.post("/api/v1/auth/change-password", {
        oldPassword,
        newPassword,
      });
      setDone(true);
    } catch (error) {
      setErr(error?.response?.data?.message || "Could not change password.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            <p className="font-medium">Password changed successfully</p>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Current password</Label>
              <PasswordInput
                id="oldPassword"
                placeholder="Current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm new password</Label>
              <PasswordInput
                id="confirm"
                placeholder="Re-enter new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">{PASSWORD_RULE}</p>
            {err && <p className="text-sm text-destructive">{err}</p>}
            <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Change password"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
