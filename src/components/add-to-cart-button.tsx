"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  testId: string;
  testName: string;
  labId: string;
  labName: string;
  price: number; // discounted price in rupees
  className?: string;
};

export default function AddToCartButton({
  testId,
  testName,
  labId,
  labName,
  price,
  className,
}: Props) {
  const [added, setAdded] = useState(false);

  useEffect(() => {
    try {
      const cart = JSON.parse(
        localStorage.getItem("cart") || '{"cartItems":[]}'
      );
      setAdded(
        cart.cartItems?.some(
          (i: any) => i.testId === testId && i.labId === labId
        )
      );
    } catch {
      /* ignore */
    }
  }, [testId, labId]);

  const add = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || '{"cartItems":[]}');
    if (
      !cart.cartItems.some(
        (i: any) => i.testId === testId && i.labId === labId
      )
    ) {
      cart.cartItems.push({ testId, testName, labId, labName, price });
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
