import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, PawPrint, Heart, Stethoscope } from "lucide-react";
import logo from "@/assets/logo.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "admin@harbourside.com" && password === "admin123") {
      navigate("/admin");
    } else if (email === "user@harbourside.com" && password === "user123") {
      navigate("/user");
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden flex-col items-center justify-center p-12 text-primary-foreground">
        {/* Decorative shapes */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary-foreground/20 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-primary-foreground/15 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-primary-foreground/10 blur-2xl" />
        </div>

        <div className="relative z-10 max-w-md text-center space-y-8">
          <div className="flex justify-center">
            <div className="bg-primary-foreground/15 backdrop-blur-sm p-5 rounded-2xl">
              <img src={logo} alt="Harbourside Veterinary Clinic" width={80} height={80} />
            </div>
          </div>
          <div>
            <h1 className="font-heading text-4xl font-bold tracking-tight">Harbourside Veterinary</h1>
            <p className="text-primary-foreground/80 text-lg mt-2">Clinic Management System</p>
          </div>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4 bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4">
              <div className="bg-primary-foreground/15 p-2.5 rounded-lg shrink-0">
                <PawPrint className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">Pet Management</p>
                <p className="text-primary-foreground/70 text-xs">Complete records for all your patients</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4">
              <div className="bg-primary-foreground/15 p-2.5 rounded-lg shrink-0">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">Health Tracking</p>
                <p className="text-primary-foreground/70 text-xs">Vaccinations, treatments & care history</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4">
              <div className="bg-primary-foreground/15 p-2.5 rounded-lg shrink-0">
                <Heart className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">Owner Portal</p>
                <p className="text-primary-foreground/70 text-xs">Easy access for pet owners anytime</p>
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
            <img src={logo} alt="Harbourside Veterinary Clinic" width={64} height={64} className="mb-3" />
            <h1 className="font-heading text-2xl font-bold text-foreground">Harbourside Veterinary</h1>
            <p className="text-muted-foreground text-sm mt-1">Clinic Management System</p>
          </div>

          <div className="mb-8 hidden lg:block">
            <h2 className="font-heading text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground text-sm mt-1">Sign in to your account to continue</p>
          </div>

          <Card className="border-0 shadow-xl shadow-primary/5">
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

                <Button type="submit" className="w-full h-11 text-sm font-semibold">
                  Sign In
                </Button>

                <Button type="button" variant="ghost" className="w-full text-sm text-muted-foreground">
                  Forgot Password?
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 bg-muted/50 rounded-xl p-4 text-xs text-muted-foreground space-y-1.5">
            <p className="font-semibold text-foreground/70 mb-2">Demo Credentials</p>
            <p><span className="inline-block w-12 font-medium text-foreground/60">Admin</span> admin@harbourside.com / admin123</p>
            <p><span className="inline-block w-12 font-medium text-foreground/60">User</span> user@harbourside.com / user123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
