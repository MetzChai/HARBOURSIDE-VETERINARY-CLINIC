import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, PawPrint, Heart, Stethoscope } from "lucide-react";
import logo from "@/assets/logo.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupForm, setSignupForm] = useState({
    fullName: "",
    email: "",
    contact: "",
    password: "",
    confirmPassword: "",
  });
  const [signupError, setSignupError] = useState("");

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");
    const { fullName, email, contact, password, confirmPassword } = signupForm;
    if (!fullName || !email || !contact || !password) {
      setSignupError("Please fill in all required fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSignupError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setSignupError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setSignupError("Passwords do not match.");
      return;
    }
    toast({
      title: "Account created",
      description: `Welcome, ${fullName}! You can now sign in.`,
    });
    setShowSignup(false);
    setSignupForm({ fullName: "", email: "", contact: "", password: "", confirmPassword: "" });
  };

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
                  Login
                </Button>

                <div className="text-left">
                  <button type="button" className="text-sm text-primary hover:underline font-medium">
                    Forgot password?
                  </button>
                </div>

                <p className="text-sm text-center text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-primary hover:underline font-medium">
                    Sign up
                  </Link>
                </p>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">OR</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 text-sm font-medium gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
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
