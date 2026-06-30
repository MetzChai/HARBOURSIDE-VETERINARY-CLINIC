"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, PawPrint, Heart, Stethoscope, Loader2 } from "lucide-react";
import { authClient, db } from "@/lib/db-client";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { refreshSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data, error: signInError } = await authClient.signInWithPassword({ email, password });
    if (signInError || !data.user) {
      setError(signInError?.message ?? "Invalid email or password.");
      setLoading(false);
      return;
    }
    const { data: roles } = await db.from("user_roles").select("role").eq("user_id", data.user.id);
    const isAdmin = ((roles as { role: string }[]) ?? []).some((r) => r.role === "admin");
    await refreshSession();
    router.push(isAdmin ? "/admin" : "/user");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden flex-col items-center justify-center p-12 text-primary-foreground">
        {/* Subtle, minimal background accent */}
        <div className="absolute inset-0 opacity-[0.06]">
          <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full border border-primary-foreground/40" />
          <div className="absolute -bottom-32 -right-20 w-[32rem] h-[32rem] rounded-full border border-primary-foreground/30" />
        </div>

        <div className="relative z-10 max-w-md space-y-10">
          <div className="flex items-center gap-4">
            <div className="bg-primary-foreground/10 border border-primary-foreground/15 p-4 rounded-lg">
              <Image src="/logo.png" alt="Harbourside Veterinary Clinic" width={56} height={56} />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">Harbourside Veterinary</h1>
              <p className="text-primary-foreground/70 text-sm">Clinic Management System</p>
            </div>
          </div>

          <div className="h-px bg-primary-foreground/15" />

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <PawPrint className="w-5 h-5 mt-0.5 shrink-0 text-primary-foreground/80" />
              <div>
                <p className="font-medium text-sm">Pet Management</p>
                <p className="text-primary-foreground/65 text-sm">Complete records for all your patients</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Stethoscope className="w-5 h-5 mt-0.5 shrink-0 text-primary-foreground/80" />
              <div>
                <p className="font-medium text-sm">Health Tracking</p>
                <p className="text-primary-foreground/65 text-sm">Vaccinations, treatments & care history</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Heart className="w-5 h-5 mt-0.5 shrink-0 text-primary-foreground/80" />
              <div>
                <p className="font-medium text-sm">Owner Portal</p>
                <p className="text-primary-foreground/65 text-sm">Easy access for pet owners anytime</p>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <Image src="/logo.png" alt="Harbourside Veterinary Clinic" width={64} height={64} className="mb-3" />
            <h1 className="font-heading text-2xl font-bold text-foreground">Harbourside Veterinary</h1>
            <p className="text-muted-foreground text-sm mt-1">Clinic Management System</p>
          </div>

          <div className="mb-8 hidden lg:block">
            <h2 className="font-heading text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground text-sm mt-1">Sign in to your account to continue</p>
          </div>

          <Card className="border border-border shadow-sm">
            <CardContent className="p-6">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@harbourside.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      className="pl-10 h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      className="pl-10 pr-10 h-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3 text-center font-medium">{error}</p>
                )}

                <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login"}
                </Button>

                <div className="text-left">
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline font-medium">
                    Forgot password?
                  </Link>
                </div>

                <p className="text-sm text-center text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-primary hover:underline font-medium">
                    Sign up
                  </Link>
                </p>

              </form>
            </CardContent>
          </Card>

          <div className="mt-6 bg-muted/50 rounded-xl p-4 text-xs text-muted-foreground space-y-1.5">
            <p className="font-semibold text-foreground/70 mb-2">Getting started</p>
            <p>Staff: sign up with an <span className="font-medium text-foreground/70">@harbourside.com</span> email for admin access.</p>
            <p>Pet owners: sign up with any email to access the owner portal.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
