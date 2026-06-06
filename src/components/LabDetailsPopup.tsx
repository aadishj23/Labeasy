"use client";

import { useState, useEffect, useMemo } from "react";
import { Star, ShoppingCart, Check, Clock, MapPin, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Lab } from "@/lib/types";

interface LabDetailsPopupProps {
  testId: string;
  testName: string;
  onClose: () => void;
  labsdata: Lab[];
  loading?: boolean;
}

function LabDetailsPopup({
  testId,
  testName,
  onClose,
  labsdata,
  loading,
}: LabDetailsPopupProps) {
  const [selectedLabs, setSelectedLabs] = useState<string[]>([]);

  useEffect(() => {
    const existingCart =
      JSON.parse(localStorage.getItem("cart")) || { cartItems: [] };
    const labIdsInCart = existingCart.cartItems
      .filter((item) => item.testId === testId)
      .map((item) => item.labId);
    setSelectedLabs(labIdsInCart);
  }, [testId]);

  // Stable pseudo-ratings per lab so they don't reshuffle on re-render.
  const meta = useMemo(() => {
    const map = {};
    (labsdata || []).forEach((lab, i) => {
      map[lab.lab_id] = {
        rating: (((i * 7 + 39) % 10) + 39) / 10,
        reviews: ((i * 13 + 75) % 51) + 75,
      };
    });
    return map;
  }, [labsdata]);

  const handleAddToCart = (lab) => {
    const cartItem = {
      testId,
      testName,
      labId: lab.lab_id,
      labName: lab.lab_name,
      price: 0.8 * Number(lab.test_price),
    };
    const existingCart =
      JSON.parse(localStorage.getItem("cart")) || { cartItems: [] };
    if (
      !existingCart.cartItems.some(
        (item) => item.testId === testId && item.labId === lab.lab_id
      )
    ) {
      existingCart.cartItems.push(cartItem);
      localStorage.setItem("cart", JSON.stringify(existingCart));
      setSelectedLabs((prev) => [...prev, lab.lab_id]);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{testName}</DialogTitle>
          <DialogDescription>Compare prices from different labs</DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-3">
          {loading ? (
            [0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-border p-4"
              >
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-9 w-28" />
              </div>
            ))
          ) : labsdata && labsdata.length > 0 ? (
            labsdata.map((lab) => {
              const added = selectedLabs.includes(lab.lab_id);
              const { rating, reviews } = meta[lab.lab_id] || {
                rating: 4.5,
                reviews: 100,
              };
              return (
                <div
                  key={lab.lab_id}
                  className="rounded-xl border border-border bg-secondary/20 p-4 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold">
                        {lab.lab_name}
                      </h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" /> Delhi
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="success" className="gap-1">
                          {rating.toFixed(1)}
                          <Star className="h-3 w-3 fill-current" />
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          ({reviews} reviews)
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">
                        ₹{(0.8 * Number(lab.test_price)).toFixed(0)}
                      </div>
                      <div className="text-sm text-muted-foreground line-through">
                        ₹{lab.test_price}
                      </div>
                      <div className="text-xs font-semibold text-emerald-400">
                        20% off
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" /> Report in 12 hours
                    </span>
                    <Button
                      size="sm"
                      variant={added ? "secondary" : "default"}
                      disabled={added}
                      onClick={() => handleAddToCart(lab)}
                    >
                      {added ? (
                        <>
                          <Check className="h-4 w-4" /> Added
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4" /> Add to cart
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                <Building2 className="h-6 w-6" />
              </span>
              <p className="text-sm text-muted-foreground">
                No labs offer this test yet. Please check back later.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LabDetailsPopup;
