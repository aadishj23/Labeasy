"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  testId?: string;
  packageId?: string;
  testName: string; // also used as the package name
  labId: string;
  labName: string;
  price: number; // rupees (discounted for tests, bundle price for packages)
  className?: string;
};

export default function AddToCartButton({
  testId,
  packageId,
  testName,
  labId,
  labName,
  price,
  className,
}: Props) {
  const [added, setAdded] = useState(false);

  const matches = (i: any) =>
    i.labId === labId && i.testId === testId && i.packageId === packageId;

  useEffect(() => {
    try {
      const cart = JSON.parse(
        localStorage.getItem("cart") || '{"cartItems":[]}'
      );
      setAdded(cart.cartItems?.some(matches));
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId, packageId, labId]);

  const add = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || '{"cartItems":[]}');
    if (!cart.cartItems.some(matches)) {
      cart.cartItems.push({
        ...(packageId ? { packageId } : { testId }),
        testName,
        labId,
        labName,
        price,
      });
      localStorage.setItem("cart", JSON.stringify(cart));
    }
    setAdded(true);
  };

  return (
    <Button
      onClick={add}
      disabled={added}
      size="sm"
      variant={added ? "secondary" : "default"}
      className={className}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" /> Added
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" /> Add
        </>
      )}
    </Button>
  );
}
