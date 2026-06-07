"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Trash2,
  ShoppingCart,
  ShieldCheck,
  ArrowRight,
  Building2,
  Home,
  Loader2,
  MapPin,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useAuthStore } from "@/store/useAuthStore";
import { notifyCartChanged } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const PRECAUTIONS = [
  "Fast for 1–2 hours before the test",
  "Avoid alcohol for 24 hours before the test",
  "Drink plenty of water unless specified otherwise",
];

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

type CartItem = {
  testId?: string;
  packageId?: string;
  testName: string;
  labId: string;
  labName: string;
  price: number;
};

type LabGroup = {
  labId: string;
  labName: string;
  items: CartItem[];
  total: number;
};

function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const userName = useAuthStore((s) => s.name);
  const router = useRouter();

  const [activeGroup, setActiveGroup] = useState<LabGroup | null>(null);
  const [collectionType, setCollectionType] = useState<"HOME" | "LAB_VISIT">(
    "LAB_VISIT"
  );
  const [scheduledAt, setScheduledAt] = useState("");
  const [paying, setPaying] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressId, setAddressId] = useState("");

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || '{"cartItems":[]}');
    setCartItems(cart.cartItems || []);
  };

  const groups: LabGroup[] = useMemo(() => {
    const map = new Map<string, LabGroup>();
    for (const item of cartItems) {
      const g = map.get(item.labId) || {
        labId: item.labId,
        labName: item.labName,
        items: [],
        total: 0,
      };
      g.items.push(item);
      g.total += Number(item.price);
      map.set(item.labId, g);
    }
    return [...map.values()];
  }, [cartItems]);

  const removeFromCart = (item: CartItem) => {
    const updated = {
      cartItems: cartItems.filter(
        (i) =>
          !(
            i.labId === item.labId &&
            i.testId === item.testId &&
            i.packageId === item.packageId
          )
      ),
    };
    localStorage.setItem("cart", JSON.stringify(updated));
    setCartItems(updated.cartItems);
    notifyCartChanged();
    toast.warning("Item removed from cart!");
  };

  const removeLabItems = (labId: string) => {
    const updated = { cartItems: cartItems.filter((i) => i.labId !== labId) };
    localStorage.setItem("cart", JSON.stringify(updated));
    setCartItems(updated.cartItems);
    notifyCartChanged();
  };

  const openCheckout = async (group: LabGroup) => {
    if (!isLoggedIn) {
      toast.error("Please sign in to book.");
      router.push("/signinuser");
      return;
    }
    setCollectionType("LAB_VISIT");
    setScheduledAt("");
    setAddressId("");
    setActiveGroup(group);
    // Load saved addresses for home-collection selection.
    try {
      const res = await fetch("/api/v1/users/profile", { cache: "no-store" });
      if (res.ok) {
        const d = await res.json();
        const addrs = d.addresses || [];
        setAddresses(addrs);
        const def = addrs.find((a: any) => a.is_default) || addrs[0];
        if (def) setAddressId(def.id);
      }
    } catch {
      /* ignore */
    }
  };

  const handlePay = async () => {
    if (!activeGroup) return;
    if (collectionType === "HOME" && !addressId) {
      toast.error("Please select a home-collection address.");
      return;
    }
    setPaying(true);
    try {
      const checkoutRes = await fetch("/api/v1/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          labId: activeGroup.labId,
          testIds: activeGroup.items
            .filter((i) => i.testId && !i.packageId)
            .map((i) => i.testId),
          packageIds: activeGroup.items
            .filter((i) => i.packageId)
            .map((i) => i.packageId),
          collectionType,
          scheduledAt: scheduledAt || null,
          addressId: collectionType === "HOME" ? addressId : null,
        }),
      });
      const data = await checkoutRes.json();
      if (!checkoutRes.ok) {
        toast.error(data.message || "Could not start checkout.");
        return;
      }

      const ok = await loadRazorpay();
      if (!ok) {
        toast.error("Could not load the payment gateway.");
        return;
      }

      const rzp = new (window as any).Razorpay({
        key: data.keyId,
        order_id: data.razorpayOrderId,
        amount: data.amount,
        currency: data.currency,
        name: "Labeasy",
        description: activeGroup.labName,
        prefill: { name: userName || "" },
        theme: { color: "#22d3ee" },
        handler: async (resp: any) => {
          const verifyRes = await fetch("/api/v1/orders/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: data.orderId,
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            }),
          });
          if (verifyRes.ok) {
            removeLabItems(activeGroup.labId);
            setActiveGroup(null);
            toast.success("Booking confirmed! View it under Results soon.");
          } else {
            toast.error("Payment could not be verified. Contact support.");
          }
        },
        modal: {
          ondismiss: () => toast.info("Payment cancelled."),
        },
      });
      rzp.open();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  const toaster = (
    <ToastContainer
      position="bottom-right"
      autoClose={3000}
      newestOnTop
      closeOnClick
      pauseOnHover
      theme="dark"
    />
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {toaster}

      <section className="mx-auto max-w-5xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <div className="mb-8">
          <h1 className="text-3xl font-bold sm:text-4xl">Your cart</h1>
          <p className="mt-2 text-muted-foreground">
            {cartItems.length > 0
              ? "Book and pay per lab."
              : "Review your selected tests before checkout"}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card py-20 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
              <ShoppingCart className="h-8 w-8" />
            </span>
            <div>
              <h2 className="text-xl font-semibold">Your cart is empty</h2>
              <p className="mt-1 text-muted-foreground">
                Add some tests to see them here.
              </p>
            </div>
            <Button asChild variant="gradient">
              <Link href="/tests">
                Browse tests
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <div
                key={group.labId}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="flex items-center gap-3 border-b border-border bg-secondary/20 p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <h3 className="font-semibold">{group.labName}</h3>
                </div>

                <div className="divide-y divide-border">
                  {group.items.map((item) => (
                    <div
                      key={`${item.testId || item.packageId}-${item.labId}`}
                      className="flex items-center justify-between gap-4 p-4"
                    >
                      <p className="font-medium">
                        {item.testName}
                        {item.packageId && (
                          <span className="ml-2 rounded bg-primary/15 px-1.5 py-0.5 text-xs font-medium text-primary">
                            Package
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">
                          ₹{Number(item.price).toFixed(0)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromCart(item)}
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-border p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-xl font-bold">
                      ₹{group.total.toFixed(0)}
                    </p>
                  </div>
                  <Button variant="gradient" onClick={() => openCheckout(group)}>
                    Book &amp; pay
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Checkout dialog */}
      <Dialog
        open={!!activeGroup}
        onOpenChange={(o) => !o && setActiveGroup(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm booking</DialogTitle>
            <DialogDescription>
              {activeGroup?.labName} · ₹{activeGroup?.total.toFixed(0)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium">Sample collection</p>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { key: "LAB_VISIT", label: "Lab visit", icon: Building2 },
                    { key: "HOME", label: "Home collection", icon: Home },
                  ] as const
                ).map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCollectionType(key)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border p-3 text-sm transition-colors",
                      collectionType === key
                        ? "border-primary/60 bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:bg-secondary/40"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {collectionType === "HOME" && (
              <div>
                <p className="mb-2 text-sm font-medium">
                  Home-collection address{" "}
                  <span className="text-destructive">*</span>
                </p>
                {addresses.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">
                    No saved addresses.{" "}
                    <Link href="/profile" className="text-primary hover:underline">
                      Add one in your profile
                    </Link>{" "}
                    to use home collection.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {addresses.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setAddressId(a.id)}
                        className={cn(
                          "flex w-full items-start gap-2 rounded-xl border p-3 text-left text-sm transition-colors",
                          addressId === a.id
                            ? "border-primary/60 bg-primary/10"
                            : "border-border hover:bg-secondary/40"
                        )}
                      >
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>
                          <span className="font-medium">
                            {a.label || "Address"}
                          </span>
                          <span className="block text-muted-foreground">
                            {[a.line1, a.line2, a.city, a.state, a.pincode]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </span>
                      </button>
                    ))}
                    <Link
                      href="/profile"
                      className="inline-block text-xs text-primary hover:underline"
                    >
                      + Manage addresses
                    </Link>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium">
                Preferred date &amp; time
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="flex h-10 w-full rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [color-scheme:dark]"
              />
            </div>

            <div className="rounded-xl border border-border bg-secondary/20 p-3">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Precautions
              </p>
              <ul className="space-y-1">
                {PRECAUTIONS.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-2 text-xs text-muted-foreground"
                  >
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setActiveGroup(null)}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handlePay}
              disabled={
                paying || (collectionType === "HOME" && !addressId)
              }
            >
              {paying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Starting…
                </>
              ) : (
                `Pay ₹${activeGroup?.total.toFixed(0)}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

export default Cart;
