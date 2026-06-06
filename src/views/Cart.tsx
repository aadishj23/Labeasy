"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Trash2,
  ShoppingCart,
  ShieldCheck,
  ArrowRight,
  Building2,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useAuthStore } from "@/store/useAuthStore";
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

const PRECAUTIONS = [
  "Fast for 1–2 hours before the test",
  "Avoid alcohol for 24 hours before the test",
  "Drink plenty of water unless specified otherwise",
  "Inform us about any medications you are taking",
];

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [total, setTotal] = useState(0);
  const [showPrecautions, setShowPrecautions] = useState(false);

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || { cartItems: [] };
    setCartItems(cart.cartItems);
    calculateTotal(cart.cartItems);
  };

  const calculateTotal = (items) => {
    setTotal(items.reduce((acc, item) => acc + Number(item.price), 0));
  };

  const removeFromCart = (testId, labId) => {
    const updatedCart = {
      cartItems: cartItems.filter(
        (item) => !(item.testId === testId && item.labId === labId)
      ),
    };
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCartItems(updatedCart.cartItems);
    calculateTotal(updatedCart.cartItems);
    toast.warning("Item removed from cart!");
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      toast.error("Please login to proceed with checkout!");
      return;
    }
    setShowPrecautions(true);
  };

  const confirmCheckout = () => {
    localStorage.setItem("cart", JSON.stringify({ cartItems: [] }));
    setCartItems([]);
    setTotal(0);
    setShowPrecautions(false);
    toast.success("Booking confirmed! Thank you for your order.");
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
              ? `${cartItems.length} test${cartItems.length > 1 ? "s" : ""} ready to book`
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
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* Items */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={`${item.testId}-${item.labId}`}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Building2 className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-semibold leading-snug">
                        {item.testName}
                      </h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        at {item.labName}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-lg font-bold">₹{Number(item.price).toFixed(0)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(item.testId, item.labId)}
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:sticky lg:top-24 lg:h-fit">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold">Order summary</h2>
                <Separator className="my-4" />
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{total.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Discount</span>
                    <span className="text-emerald-400">Applied</span>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold">₹{total.toFixed(0)}</span>
                </div>
                <Button
                  variant="gradient"
                  className="mt-6 w-full"
                  onClick={handleCheckout}
                >
                  Proceed to checkout
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  Secure booking
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Precautions / schedule dialog */}
      <Dialog open={showPrecautions} onOpenChange={setShowPrecautions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test precautions</DialogTitle>
            <DialogDescription>
              Please review before confirming your booking.
            </DialogDescription>
          </DialogHeader>

          <ul className="space-y-2">
            {PRECAUTIONS.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-2">
            <h3 className="mb-3 text-sm font-semibold">Schedule your test</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Date
                </label>
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [color-scheme:dark]"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Time
                </label>
                <input
                  type="time"
                  className="flex h-10 w-full rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowPrecautions(false);
                toast.error("Checkout cancelled");
              }}
            >
              Cancel
            </Button>
            <Button variant="gradient" onClick={confirmCheckout}>
              Confirm booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

export default Cart;
