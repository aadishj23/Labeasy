// Small helpers around the localStorage cart so the navbar badge stays in sync.
export const CART_EVENT = "cart:updated";

export function readCartCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const cart = JSON.parse(localStorage.getItem("cart") || '{"cartItems":[]}');
    return Array.isArray(cart.cartItems) ? cart.cartItems.length : 0;
  } catch {
    return 0;
  }
}

// localStorage writes don't fire `storage` in the same tab — emit our own event.
export function notifyCartChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CART_EVENT));
  }
}
