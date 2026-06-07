"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  User,
  MapPin,
  Plus,
  Trash2,
  Check,
  Star,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import DateTimePicker from "@/components/datetime-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Addr = {
  id: string;
  label?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

const EMPTY_ADDR = {
  label: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [addresses, setAddresses] = useState<Addr[]>([]);

  // profile form
  const [form, setForm] = useState({ name: "", phone: "", dob: "", gender: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");

  // address dialog
  const [addrOpen, setAddrOpen] = useState(false);
  const [addr, setAddr] = useState({ ...EMPTY_ADDR });
  const [savingAddr, setSavingAddr] = useState(false);
  const [addrErr, setAddrErr] = useState("");

  const load = async () => {
    const res = await fetch("/api/v1/users/profile", { cache: "no-store" });
    if (res.ok) {
      const d = await res.json();
      setUser(d.user);
      setAddresses(d.addresses || []);
      setForm({
        name: d.user.name || "",
        phone: d.user.phone || "",
        dob: d.user.dob ? String(d.user.dob).slice(0, 10) : "",
        gender: d.user.gender || "",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg("");
    setProfileErr("");
    try {
      const res = await fetch("/api/v1/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) {
        setProfileErr(d.message || "Could not save.");
        return;
      }
      setProfileMsg("Profile updated.");
    } finally {
      setSavingProfile(false);
    }
  };

  const addAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddr(true);
    setAddrErr("");
    try {
      const res = await fetch("/api/v1/users/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addr),
      });
      const d = await res.json();
      if (!res.ok) {
        setAddrErr(d.message || "Could not add address.");
        return;
      }
      setAddrOpen(false);
      setAddr({ ...EMPTY_ADDR });
      load();
    } finally {
      setSavingAddr(false);
    }
  };

  const setDefault = async (id: string) => {
    await fetch(`/api/v1/users/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_default: true }),
    });
    load();
  };

  const removeAddress = async (id: string) => {
    await fetch(`/api/v1/users/addresses/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <User className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">My profile</h1>
            <p className="text-muted-foreground">
              Manage your details and saved addresses.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !user ? (
          <p className="text-muted-foreground">Please sign in to view your profile.</p>
        ) : (
          <div className="space-y-8">
            {/* Basic details */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Basic details</h2>
              <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={saveProfile}>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="10-digit number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of birth</Label>
                  <DateTimePicker
                    value={form.dob}
                    onChange={(v) => setForm({ ...form, dob: v })}
                    variant="past"
                    placeholder="Select date of birth"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="flex h-11 w-full rounded-md border border-input bg-secondary/40 px-3.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Email</Label>
                  <Input value={user.email} disabled />
                </div>
                <div className="sm:col-span-2">
                  {profileErr && (
                    <p className="mb-2 text-sm text-destructive">{profileErr}</p>
                  )}
                  {profileMsg && (
                    <p className="mb-2 text-sm text-emerald-400">{profileMsg}</p>
                  )}
                  <Button type="submit" variant="gradient" disabled={savingProfile}>
                    {savingProfile ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save changes"
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Addresses */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Saved addresses{" "}
                  <span className="text-muted-foreground">({addresses.length})</span>
                </h2>
                <Button size="sm" variant="outline" onClick={() => setAddrOpen(true)}>
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>

              {addresses.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No addresses yet. Add one for faster home-collection checkout.
                </p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-start justify-between gap-4 rounded-xl border border-border bg-secondary/20 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                        <div className="text-sm">
                          <p className="font-medium">
                            {a.label || "Address"}{" "}
                            {a.is_default && (
                              <Badge variant="success" className="ml-1 gap-1">
                                <Star className="h-3 w-3 fill-current" /> Default
                              </Badge>
                            )}
                          </p>
                          <p className="text-muted-foreground">
                            {[a.line1, a.line2, a.city, a.state, a.pincode]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        {!a.is_default && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDefault(a.id)}
                          >
                            <Check className="h-4 w-4" /> Default
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 text-muted-foreground hover:text-destructive"
                          onClick={() => removeAddress(a.id)}
                          aria-label="Delete address"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Add address dialog */}
      <Dialog open={addrOpen} onOpenChange={setAddrOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add address</DialogTitle>
          </DialogHeader>
          <form className="space-y-3" onSubmit={addAddress}>
            <Input
              placeholder="Label (Home, Work…)"
              value={addr.label}
              onChange={(e) => setAddr({ ...addr, label: e.target.value })}
            />
            <Input
              placeholder="Address line 1"
              value={addr.line1}
              onChange={(e) => setAddr({ ...addr, line1: e.target.value })}
              required
            />
            <Input
              placeholder="Address line 2 (optional)"
              value={addr.line2}
              onChange={(e) => setAddr({ ...addr, line2: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="City"
                value={addr.city}
                onChange={(e) => setAddr({ ...addr, city: e.target.value })}
                required
              />
              <Input
                placeholder="State"
                value={addr.state}
                onChange={(e) => setAddr({ ...addr, state: e.target.value })}
                required
              />
            </div>
            <Input
              placeholder="Pincode"
              value={addr.pincode}
              onChange={(e) => setAddr({ ...addr, pincode: e.target.value })}
              required
            />
            {addrErr && <p className="text-sm text-destructive">{addrErr}</p>}
            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              disabled={savingAddr}
            >
              {savingAddr ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save address"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
