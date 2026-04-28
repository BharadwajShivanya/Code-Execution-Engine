import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Code2, LogIn, UserPlus, CheckCircle2, XCircle } from "lucide-react";

export interface AuthUser {
  name: string;
  email: string;
}

const AUTH_KEY = "codearena_auth_user";
const REGISTRY_KEY = "codearena_user_registry";

// Stores hashed/plain passwords for demo mock auth
interface RegisteredUser {
  name: string;
  email: string;
  password: string;
}

// ── Registry helpers ──────────────────────────────────────────────────────────
function getRegistry(): RegisteredUser[] {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    return raw ? (JSON.parse(raw) as RegisteredUser[]) : [];
  } catch {
    return [];
  }
}

function addToRegistry(user: RegisteredUser) {
  const registry = getRegistry();
  registry.push(user);
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
}

function findInRegistry(email: string): RegisteredUser | null {
  return (
    getRegistry().find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    ) ?? null
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function storeUser(user: AuthUser) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem(AUTH_KEY);
}

// ── Validation ────────────────────────────────────────────────────────────────
const VALID_EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

const KNOWN_PROVIDERS = [
  "gmail.com","yahoo.com","hotmail.com","outlook.com","icloud.com",
  "protonmail.com","live.com","msn.com","me.com","mac.com",
  "aol.com","mail.com","ymail.com","googlemail.com",
];

function validateEmail(email: string): string | null {
  if (!email) return "Email is required.";
  if (!VALID_EMAIL_REGEX.test(email))
    return "Please enter a valid email address (e.g. you@gmail.com).";
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  const tld = domain.split(".").pop() ?? "";
  if (tld.length < 2)
    return "Email domain must have a valid extension (e.g. .com, .org).";
  const domainBase = domain.split(".").slice(0, -1).join(".");
  const typo = KNOWN_PROVIDERS.some(
    (p) => p.split(".")[0] === domainBase && !KNOWN_PROVIDERS.includes(domain)
  );
  if (typo)
    return `"${domain}" doesn't look right. Did you mean "${domainBase}.com"?`;
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 6) return "Password must be at least 6 characters.";
  return null;
}

// Inline ✓/✗ icon helper
function FieldStatus({
  value,
  validate,
}: {
  value: string;
  validate: (v: string) => string | null;
}) {
  if (!value) return null;
  return validate(value) ? (
    <XCircle className="h-4 w-4 text-destructive absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
  ) : (
    <CheckCircle2 className="h-4 w-4 text-green-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
interface AuthModalProps {
  open: boolean;
  defaultTab?: "signin" | "signup";
  onClose: () => void;
  onAuth: (user: AuthUser) => void;
}

export function AuthModal({
  open,
  defaultTab = "signin",
  onClose,
  onAuth,
}: AuthModalProps) {
  const [tab, setTab] = useState<string>(defaultTab);
  const [error, setError] = useState("");

  // Sign In
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");

  // Sign Up
  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suConfirm, setSuConfirm] = useState("");

  const resetForms = () => {
    setSiEmail(""); setSiPassword("");
    setSuName(""); setSuEmail(""); setSuPassword(""); setSuConfirm("");
    setError("");
  };

  // ── Sign In: must match an existing registered account ──────────────────
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailErr = validateEmail(siEmail);
    if (emailErr) { setError(emailErr); return; }
    if (!siPassword) { setError("Please enter your password."); return; }

    const registered = findInRegistry(siEmail);
    if (!registered) {
      setError("No account found with this email. Please sign up first.");
      return;
    }
    if (registered.password !== siPassword) {
      setError("Incorrect password. Please try again.");
      return;
    }

    const user: AuthUser = { name: registered.name, email: registered.email };
    storeUser(user);
    onAuth(user);
    resetForms();
    onClose();
  };

  // ── Sign Up: register new account, reject duplicate emails ──────────────
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!suName.trim()) { setError("Please enter your full name."); return; }

    const emailErr = validateEmail(suEmail);
    if (emailErr) { setError(emailErr); return; }

    const passErr = validatePassword(suPassword);
    if (passErr) { setError(passErr); return; }

    if (suPassword !== suConfirm) { setError("Passwords do not match."); return; }

    if (findInRegistry(suEmail)) {
      setError("An account with this email already exists. Please sign in.");
      return;
    }

    const newEntry: RegisteredUser = {
      name: suName.trim(),
      email: suEmail.toLowerCase(),
      password: suPassword,
    };
    addToRegistry(newEntry);

    const user: AuthUser = { name: newEntry.name, email: newEntry.email };
    storeUser(user);
    onAuth(user);
    resetForms();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { resetForms(); onClose(); } }}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <Code2 className="h-4 w-4 text-primary-foreground" />
            </div>
            CodeArena
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => { setTab(v); setError(""); }}
          className="mt-2"
        >
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* ── Sign In ── */}
          <TabsContent value="signin" className="mt-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="si-email">Email</Label>
                <div className="relative">
                  <Input
                    id="si-email"
                    type="text"
                    placeholder="you@gmail.com"
                    value={siEmail}
                    onChange={(e) => { setSiEmail(e.target.value); setError(""); }}
                    className="bg-background border-border pr-9"
                    autoComplete="email"
                  />
                  <FieldStatus value={siEmail} validate={validateEmail} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="si-password">Password</Label>
                <Input
                  id="si-password"
                  type="password"
                  placeholder="••••••••"
                  value={siPassword}
                  onChange={(e) => { setSiPassword(e.target.value); setError(""); }}
                  className="bg-background border-border"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                  <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setError(""); setTab("signup"); }}
                  className="text-primary underline"
                >
                  Sign Up
                </button>
              </p>
            </form>
          </TabsContent>

          {/* ── Sign Up ── */}
          <TabsContent value="signup" className="mt-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="su-name">Full Name</Label>
                <Input
                  id="su-name"
                  placeholder="Jane Doe"
                  value={suName}
                  onChange={(e) => { setSuName(e.target.value); setError(""); }}
                  className="bg-background border-border"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="su-email">Email</Label>
                <div className="relative">
                  <Input
                    id="su-email"
                    type="text"
                    placeholder="you@gmail.com"
                    value={suEmail}
                    onChange={(e) => { setSuEmail(e.target.value); setError(""); }}
                    className="bg-background border-border pr-9"
                    autoComplete="email"
                  />
                  <FieldStatus value={suEmail} validate={validateEmail} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="su-password">Password</Label>
                <div className="relative">
                  <Input
                    id="su-password"
                    type="password"
                    placeholder="Min. 6 characters"
                    value={suPassword}
                    onChange={(e) => { setSuPassword(e.target.value); setError(""); }}
                    className="bg-background border-border pr-9"
                    autoComplete="new-password"
                  />
                  <FieldStatus value={suPassword} validate={validatePassword} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="su-confirm">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="su-confirm"
                    type="password"
                    placeholder="••••••••"
                    value={suConfirm}
                    onChange={(e) => { setSuConfirm(e.target.value); setError(""); }}
                    className="bg-background border-border pr-9"
                    autoComplete="new-password"
                  />
                  {suConfirm && (
                    suPassword === suConfirm
                      ? <CheckCircle2 className="h-4 w-4 text-green-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      : <XCircle className="h-4 w-4 text-destructive absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  )}
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                  <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full gap-2">
                <UserPlus className="h-4 w-4" />
                Create Account
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setError(""); setTab("signin"); }}
                  className="text-primary underline"
                >
                  Sign In
                </button>
              </p>
            </form>
          </TabsContent>
        </Tabs>

        <p className="text-center text-xs text-muted-foreground pt-2">
          By continuing, you agree to our Terms of Service.
        </p>
      </DialogContent>
    </Dialog>
  );
}
