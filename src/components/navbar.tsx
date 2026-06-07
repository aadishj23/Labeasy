"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  FlaskConical,
  ShoppingCart,
  LineChart,
  ClipboardList,
  FileText,
  Menu,
  User,
  LogOut,
  Building2,
  UserRound,
  KeyRound,
  ChevronDown,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ChangePasswordDialog from "@/components/change-password-dialog";
import { cn } from "@/lib/utils";
import { readCartCount, CART_EVENT } from "@/lib/cart";

const NAV_LINKS = [
  { label: "Tests", href: "/tests", icon: FlaskConical },
  { label: "Labs", href: "/labs", icon: Building2 },
  { label: "Bookings", href: "/bookings", icon: ClipboardList },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Results", href: "/results", icon: LineChart },
  { label: "Cart", href: "/cart", icon: ShoppingCart },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMode, setAuthMode] = useState("signin"); // "signin" | "signup"
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const userType = useAuthStore((s) => s.type);
  const displayName = useAuthStore((s) => s.name);
  const refresh = useAuthStore((s) => s.refresh);
  const clearAuth = useAuthStore((s) => s.clear);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hydrate auth state from the httpOnly session cookie.
  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    setIsMenuOpen(false);
    setCartCount(readCartCount());
  }, [pathname]);

  // Keep the cart badge in sync (same-tab event + cross-tab storage).
  useEffect(() => {
    const update = () => setCartCount(readCartCount());
    update();
    window.addEventListener(CART_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(CART_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    clearAuth();
    setIsMenuOpen(false);
    router.push("/");
  };

  const go = (href) => {
    setIsMenuOpen(false);
    router.push(href);
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowAuthDialog(true);
  };

  const isActive = (href) => pathname === href;
  const visibleLinks = userType === "lab" ? [] : NAV_LINKS;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-300",
          isScrolled
            ? "border-b border-border/70 bg-background/80 backdrop-blur-xl"
            : "border-b border-transparent bg-background/40 backdrop-blur-sm"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-2 transition-transform hover:scale-[1.02]"
            aria-label="Labeasy home"
          >
            <Image
              src="/assets/logocbs.png"
              alt="Labeasy"
              width={140}
              height={40}
              priority
              className="h-8 w-auto lg:h-9"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {visibleLinks.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  isActive(href)
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <span className="relative">
                  <Icon className="h-4 w-4" />
                  {href === "/cart" && cartCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
                      {cartCount}
                    </span>
                  )}
                </span>
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isLoggedIn && displayName ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden items-center gap-2 rounded-full border border-border bg-secondary/50 py-1.5 pl-3 pr-2 text-sm font-medium transition-colors hover:bg-secondary md:flex">
                    <span className="max-w-[10rem] truncate">{displayName}</span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <User className="h-4 w-4" />
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="text-muted-foreground">
                    <span className="block truncate font-medium text-foreground">
                      {displayName}
                    </span>
                    <span className="text-xs capitalize">{userType ?? "account"}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userType === "user" && (
                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      <UserRound className="h-4 w-4" />
                      My profile
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setShowChangePassword(true)}>
                    <KeyRound className="h-4 w-4" />
                    Change password
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Button variant="ghost" size="sm" onClick={() => openAuth("signin")}>
                  Sign in
                </Button>
                <Button variant="gradient" size="sm" onClick={() => openAuth("signup")}>
                  <User className="h-4 w-4" />
                  Sign up
                </Button>
              </div>
            )}

            {/* Mobile menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex w-[300px] flex-col border-border">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Image
                      src="/assets/logocbs.png"
                      alt="Labeasy"
                      width={120}
                      height={32}
                      className="h-7 w-auto"
                    />
                  </SheetTitle>
                </SheetHeader>

                {isLoggedIn && displayName && (
                  <div className="mt-6 flex items-center gap-3 rounded-lg border border-border bg-secondary/40 p-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <User className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{displayName}</p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {userType ?? "account"}
                      </p>
                    </div>
                  </div>
                )}

                <nav className="mt-6 flex flex-col gap-1">
                  {visibleLinks.map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "inline-flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                        isActive(href)
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <span className="relative">
                        <Icon className="h-5 w-5" />
                        {href === "/cart" && cartCount > 0 && (
                          <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
                            {cartCount}
                          </span>
                        )}
                      </span>
                      {label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto pt-6">
                  {isLoggedIn ? (
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setShowChangePassword(true);
                        }}
                      >
                        <KeyRound className="h-4 w-4" />
                        Change password
                      </Button>
                      <Button variant="ghost" className="w-full" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <p className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Sign in
                        </p>
                        <SheetClose asChild>
                          <Button variant="outline" className="w-full justify-start" onClick={() => go("/signinuser")}>
                            <UserRound className="h-4 w-4" /> Patient
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button variant="outline" className="w-full justify-start" onClick={() => go("/signinlab")}>
                            <Building2 className="h-4 w-4" /> Lab
                          </Button>
                        </SheetClose>
                      </div>
                      <div className="space-y-2">
                        <p className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Sign up
                        </p>
                        <SheetClose asChild>
                          <Button variant="gradient" className="w-full justify-start" onClick={() => go("/signupuser")}>
                            <UserRound className="h-4 w-4" /> Patient
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button variant="gradient" className="w-full justify-start" onClick={() => go("/signuplab")}>
                            <Building2 className="h-4 w-4" /> Lab
                          </Button>
                        </SheetClose>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Auth role-choice dialog (desktop, logged out) */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {authMode === "signin" ? "Sign in to Labeasy" : "Create your account"}
            </DialogTitle>
            <DialogDescription>Choose how you want to continue.</DialogDescription>
          </DialogHeader>
          <div className="mt-2 grid gap-3">
            <button
              onClick={() => {
                setShowAuthDialog(false);
                router.push(authMode === "signin" ? "/signinuser" : "/signupuser");
              }}
              className="group flex items-center gap-4 rounded-xl border border-border bg-secondary/30 p-4 text-left transition-all hover:border-primary/50 hover:bg-secondary/60"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <UserRound className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold">Patient</span>
                <span className="block text-sm text-muted-foreground">
                  Book tests &amp; view reports
                </span>
              </span>
            </button>
            <button
              onClick={() => {
                setShowAuthDialog(false);
                router.push(authMode === "signin" ? "/signinlab" : "/signuplab");
              }}
              className="group flex items-center gap-4 rounded-xl border border-border bg-secondary/30 p-4 text-left transition-all hover:border-primary/50 hover:bg-secondary/60"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Building2 className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold">Laboratory</span>
                <span className="block text-sm text-muted-foreground">
                  Manage tests &amp; pricing
                </span>
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <ChangePasswordDialog
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
      />
    </>
  );
}
